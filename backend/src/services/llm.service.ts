import OpenAI from "openai";
import { z } from "zod";
import { getEnv } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { validateGeneratedCards } from "./cardValidation.service";
import {
  explainFlashcardSystemPrompt,
  explainFlashcardUserPrompt,
  flashcardGenerationSystemPrompt,
  flashcardGenerationUserPrompt,
  flashcardRetryUserPrompt,
  truncateContent,
  type DeckPromptContext,
  type ExplainFlashcardContext,
  type GenerationCardFormat,
  type GenerationDetailMode,
  type GenerationDifficulty,
  type GenerationOptions,
  type GenerationTone,
} from "./prompts";

const generatedCardSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const generatedCardsSchema = z.array(generatedCardSchema).min(1);

export type GeneratedCard = z.infer<typeof generatedCardSchema>;

export type GenerateCardsInput = {
  sourceType: "topic" | "notes";
  content: string;
  count: number;
  tone?: GenerationTone;
  difficulty?: GenerationDifficulty;
  cardFormat?: GenerationCardFormat;
  detailMode?: GenerationDetailMode;
  language?: string;
  deck?: DeckPromptContext;
};

const OPENAI_TIMEOUT_MS = 90_000;
const MAX_ATTEMPTS = 3;

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const env = getEnv();
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      timeout: OPENAI_TIMEOUT_MS,
    });
  }
  return openaiClient;
}

/** OpenAI auth / missing-key failures — do not retry; surface a clear 503. */
function throwIfOpenAiConfigError(error: unknown): void {
  if (!error || typeof error !== "object") return;
  const status =
    "status" in error && typeof (error as { status: unknown }).status === "number"
      ? (error as { status: number }).status
      : undefined;
  const message =
    "message" in error && typeof (error as { message: unknown }).message === "string"
      ? (error as { message: string }).message.toLowerCase()
      : "";
  if (
    status === 401 ||
    status === 403 ||
    message.includes("incorrect api key") ||
    message.includes("invalid api key") ||
    (message.includes("api key") && message.includes("invalid"))
  ) {
    throw new AppError(
      503,
      "AI is unavailable (OpenAI API key missing or invalid). Try again later.",
    );
  }
}

function extractJsonPayload(raw: string): unknown {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const objStart = candidate.indexOf("{");
    const objEnd = candidate.lastIndexOf("}");
    if (objStart >= 0 && objEnd > objStart) {
      try {
        return JSON.parse(candidate.slice(objStart, objEnd + 1));
      } catch {
        // fall through to array extract
      }
    }
    const start = candidate.indexOf("[");
    const end = candidate.lastIndexOf("]");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new AppError(502, "AI returned invalid JSON. Please try again.");
  }
}

function coerceCard(raw: unknown): GeneratedCard | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const question = String(
    row.question ?? row.front ?? row.q ?? row.prompt ?? "",
  ).trim();
  const answer = String(
    row.answer ?? row.back ?? row.a ?? row.response ?? "",
  ).trim();
  if (!question || !answer) return null;
  return { question, answer };
}

function parseCardsFromMessage(message: string): GeneratedCard[] {
  const parsed = extractJsonPayload(message);
  const record =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  const payload = Array.isArray(parsed)
    ? parsed
    : Array.isArray(record?.cards)
      ? record.cards
      : Array.isArray(record?.flashcards)
        ? record.flashcards
        : Array.isArray(record?.items)
          ? record.items
          : null;

  if (!Array.isArray(payload) || payload.length === 0) {
    throw new AppError(502, "AI returned no cards. Please try again.");
  }

  const cards = payload
    .map(coerceCard)
    .filter((card): card is GeneratedCard => card !== null);

  if (cards.length === 0) {
    throw new AppError(502, "AI returned invalid cards. Please try again.");
  }

  try {
    return generatedCardsSchema.parse(cards);
  } catch {
    throw new AppError(502, "AI returned invalid cards. Please try again.");
  }
}

function normalizeGeneratedCard(
  card: GeneratedCard,
  format: GenerationCardFormat,
): GeneratedCard {
  let question = card.question.replace(/\s+/g, " ").trim();
  let answer = card.answer.replace(/\s+/g, " ").trim();

  // Strip accidental numbering / labels models sometimes add.
  question = question.replace(/^(?:card\s*)?\d+[\).:\-]\s*/i, "");
  answer = answer.replace(/^(?:answer\s*[:\-]\s*)/i, "");

  if (format === "cloze" && !question.includes("____")) {
    // Soft normalize common cloze markers into our blank style.
    question = question
      .replace(/\{\{c\d+::([^}]+)\}\}/gi, "____")
      .replace(/\{{2,}([^}]+)\}{2,}/g, "____")
      .replace(/_{3,}/g, "____")
      .replace(/\[blank\]/gi, "____")
      .replace(/\.{3,}/g, "____");
  }

  return { question, answer };
}

async function callOpenAI(
  sourceType: "topic" | "notes",
  content: string,
  count: number,
  options: GenerationOptions,
  deck?: DeckPromptContext,
  retryIssues?: string[],
): Promise<GeneratedCard[]> {
  const env = getEnv();
  const openai = getOpenAI();
  const format = options.cardFormat ?? "qa";

  const userContent = retryIssues?.length
    ? flashcardRetryUserPrompt(
        sourceType,
        content,
        count,
        retryIssues,
        deck,
        options,
      )
    : `${flashcardGenerationUserPrompt(sourceType, content, count, deck, options)}

Return JSON: { "cards": [ ... ] }`;

  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: retryIssues?.length ? 0.25 : 0.45,
    max_tokens: env.OPENAI_MAX_TOKENS_GENERATE,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: flashcardGenerationSystemPrompt(options, sourceType, deck),
      },
      { role: "user", content: userContent },
    ],
  });

  const message = completion.choices[0]?.message?.content;
  if (!message) {
    throw new AppError(502, "AI returned an empty response. Please try again.");
  }

  return parseCardsFromMessage(message).map((card) =>
    normalizeGeneratedCard(card, format),
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateFlashcards(
  input: GenerateCardsInput,
): Promise<GeneratedCard[]> {
  const content = truncateContent(input.content.trim());
  if (!content) {
    throw new AppError(400, "Content is required");
  }

  if (input.sourceType === "notes" && content.length < 80) {
    throw new AppError(
      400,
      "Notes are too short to generate quality flashcards. Add more content or try a topic instead.",
    );
  }

  const options: GenerationOptions = {
    tone: input.tone ?? "concise",
    difficulty: input.difficulty ?? "medium",
    cardFormat: input.cardFormat ?? "qa",
    detailMode: input.detailMode ?? "concise",
    language: input.language,
  };

  let lastError: unknown;
  let lastIssues: string[] = [];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const rawCards = await callOpenAI(
        input.sourceType,
        content,
        input.count,
        options,
        input.deck,
        attempt > 1 ? lastIssues : undefined,
      );

      const validation = validateGeneratedCards(rawCards, input.count, {
        sourceContent: content,
        sourceType: input.sourceType,
      });
      if (validation.ok) {
        return validation.cards;
      }

      lastIssues = validation.issues;

      const hasOffTopicIssue = validation.issues.some((issue) =>
        issue.includes("off-topic"),
      );
      if (
        validation.cards.length >= 3 &&
        attempt === MAX_ATTEMPTS &&
        !hasOffTopicIssue
      ) {
        return validation.cards;
      }

      if (attempt < MAX_ATTEMPTS) {
        await sleep(400 * attempt);
        continue;
      }

      throw new AppError(
        502,
        "Could not generate enough quality flashcards. Try fewer cards or add more detail.",
      );
    } catch (error) {
      lastError = error;
      if (error instanceof AppError && error.statusCode < 500) {
        throw error;
      }
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * attempt);
        continue;
      }
    }
  }

  console.error("Flashcard generation failed:", lastError);
  throw new AppError(
    502,
    "Could not generate flashcards. Please try again in a moment.",
  );
}

const explainResultSchema = z.object({
  explanation: z.string().trim().min(1).max(4000),
  keyPoints: z.array(z.string().trim().min(1).max(200)).max(6).optional(),
  analogy: z.string().trim().max(500).optional(),
});

export type ExplainFlashcardResult = z.infer<typeof explainResultSchema>;

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new AppError(502, "AI returned invalid JSON. Please try again.");
  }
}

export async function explainFlashcard(
  input: ExplainFlashcardContext,
): Promise<ExplainFlashcardResult> {
  const question = input.question.trim();
  const answer = input.answer.trim();
  if (!question || !answer) {
    throw new AppError(400, "Question and answer are required");
  }

  const env = getEnv();
  const openai = getOpenAI();

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: env.OPENAI_MODEL,
        temperature: 0.4,
        max_tokens: env.OPENAI_MAX_TOKENS_EXPLAIN,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: explainFlashcardSystemPrompt() },
          {
            role: "user",
            content: explainFlashcardUserPrompt({
              ...input,
              question,
              answer,
            }),
          },
        ],
      });

      const message = completion.choices[0]?.message?.content;
      if (!message) {
        throw new AppError(502, "AI returned an empty response. Please try again.");
      }

      const parsed = explainResultSchema.parse(extractJsonObject(message));
      return {
        explanation: parsed.explanation.replace(/\s+/g, " ").trim(),
        keyPoints: (parsed.keyPoints ?? [])
          .map((point) => point.replace(/\s+/g, " ").trim())
          .filter(Boolean)
          .slice(0, 4),
        analogy: parsed.analogy?.replace(/\s+/g, " ").trim() || undefined,
      };
    } catch (error) {
      lastError = error;
      if (error instanceof AppError) {
        throw error;
      }
      throwIfOpenAiConfigError(error);
      if (error instanceof z.ZodError) {
        lastError = error;
      }
      if (attempt < MAX_ATTEMPTS) {
        await sleep(400 * attempt);
        continue;
      }
    }
  }

  console.error("Flashcard explain failed:", lastError);
  throwIfOpenAiConfigError(lastError);
  throw new AppError(
    502,
    "Could not generate an explanation. Please try again in a moment.",
  );
}
