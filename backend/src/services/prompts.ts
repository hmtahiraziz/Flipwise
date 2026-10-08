export type GenerationTone =
  | "concise"
  | "detailed"
  | "child-friendly"
  | "critical";

export type GenerationDifficulty = "easy" | "medium" | "hard";
export type GenerationCardFormat = "qa" | "cloze";
export type GenerationDetailMode = "concise" | "examples";

export type DeckPromptContext = {
  title: string;
  subject: string;
  description?: string | null;
};

export type GenerationOptions = {
  tone?: GenerationTone;
  difficulty?: GenerationDifficulty;
  cardFormat?: GenerationCardFormat;
  detailMode?: GenerationDetailMode;
  language?: string;
};

const TONE_RULES: Record<GenerationTone, string> = {
  concise:
    "Keep answers to one clear sentence (max ~25 words). Fronts must be specific and testable.",
  detailed:
    "Answers may use 2–3 short sentences with one concrete detail. Prefer understanding over trivia.",
  "child-friendly":
    "Use plain vocabulary suitable for younger learners. Avoid jargon; explain ideas simply and warmly.",
  critical:
    "Prefer why / how / compare / evaluate stems. Answers must explain reasoning, not only name a fact.",
};

const DIFFICULTY_RULES: Record<GenerationDifficulty, string> = {
  easy:
    "Focus on core definitions, key terms, and foundational recall. Keep wording clear and approachable.",
  medium:
    "Mix definitions with application and cause/effect. Include a few scenario-style checks.",
  hard:
    "Probe nuance, comparisons, edge cases, and exam-style reasoning. Avoid trivial one-word recall.",
};

const FORMAT_RULES: Record<GenerationCardFormat, string> = {
  qa: `Use standard active-recall Q&A:
- "question": a clear question or prompt (no leading numbering).
- "answer": the complete target response.`,
  cloze: `Use cloze-deletion style cards that still fit Q&A fields:
- "question": a full sentence with ONE blank marked as ____ (four underscores).
- "answer": only the missing word or short phrase that fills the blank.
- Never blank more than one key idea per card.`,
};

const DETAIL_RULES: Record<GenerationDetailMode, string> = {
  concise: "Prefer terse, high-signal answers. No filler or restating the question.",
  examples:
    "When helpful, end the answer with a brief concrete example after an em dash (e.g. \"… — e.g. photosynthesis in leaves\").",
};

const LANGUAGE_NAMES: Record<string, string> = {
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "es-ES": "Spanish",
  "fr-FR": "French",
  "de-DE": "German",
  "pt-BR": "Portuguese (Brazil)",
  "hi-IN": "Hindi",
};

const FEW_SHOT_QA = `Examples (Q&A):
{"question":"What organelle produces ATP in eukaryotic cells?","answer":"Mitochondria"}
{"question":"Why does active transport require ATP?","answer":"It moves molecules against their concentration gradient — e.g. the sodium-potassium pump"}`;

const FEW_SHOT_CLOZE = `Examples (cloze):
{"question":"The ____ produces ATP in eukaryotic cells.","answer":"mitochondria"}
{"question":"Active transport moves molecules ____ their concentration gradient.","answer":"against"}`;

function languageInstruction(language?: string): string {
  if (!language) {
    return "Write all question and answer text in clear English.";
  }
  const label = LANGUAGE_NAMES[language] ?? language;
  return `Write all question and answer text in ${label}. Keep technical terms accurate for that locale.`;
}

export function flashcardGenerationSystemPrompt(
  options: GenerationOptions = {},
  sourceType: "topic" | "notes" = "topic",
  deck?: DeckPromptContext,
): string {
  const tone = options.tone ?? "concise";
  const difficulty = options.difficulty ?? "medium";
  const cardFormat = options.cardFormat ?? "qa";
  const detailMode = options.detailMode ?? "concise";

  const deckLines =
    sourceType === "notes" && deck
      ? [
          `Deck subject: ${deck.subject}`,
          `Deck title: ${deck.title}`,
          deck.description ? `Deck description: ${deck.description}` : null,
        ]
          .filter(Boolean)
          .join("\n")
      : sourceType === "topic" && deck?.title
        ? `Deck title (background only): ${deck.title}`
        : "";

  const topicPriorityRule =
    sourceType === "topic"
      ? `- The user's topic in the next message is the PRIMARY and ONLY subject. Never substitute deck metadata or an unrelated subject.\n`
      : "";

  const fewShot = cardFormat === "cloze" ? FEW_SHOT_CLOZE : FEW_SHOT_QA;

  return `You are Flipwise, a professional study coach that writes flashcards for spaced repetition — the quality bar of top Play Store study apps (clear fronts, atomic facts, active recall).

${deckLines ? `${deckLines}\n` : ""}Tone: ${tone} — ${TONE_RULES[tone]}
Difficulty: ${difficulty} — ${DIFFICULTY_RULES[difficulty]}
Detail: ${detailMode} — ${DETAIL_RULES[detailMode]}
Format: ${cardFormat}
${FORMAT_RULES[cardFormat]}
Language: ${languageInstruction(options.language)}

Quality bar:
${topicPriorityRule}- Return ONLY valid JSON: { "cards": [ { "question": "...", "answer": "..." } ] }.
- No markdown fences, commentary, numbering, or extra keys.
- One atomic idea per card. Never pack multiple facts into one answer.
- Prefer active recall: the learner should retrieve, not recognize a vague prompt.
- Vary stems (define, why, how, compare, apply, cause/effect). Do not spam "What is X?".
- Fronts must be specific and self-contained; backs must be complete for the chosen tone/detail.
- No duplicates or near-duplicates (same fact rephrased).
- No meta text ("As an AI…"), tips, or refusals inside cards.
- Stay factual. If the source is thin, return fewer excellent cards instead of inventing content.
- Avoid yes/no questions, trick questions, and spoilers that put the answer in the question.

${fewShot}`;
}

export function flashcardGenerationUserPrompt(
  sourceType: "topic" | "notes",
  content: string,
  count: number,
  deck?: DeckPromptContext,
  options?: GenerationOptions,
): string {
  const subjectHint =
    sourceType === "notes" && deck?.subject
      ? ` Focus on ${deck.subject}.`
      : "";
  const format = options?.cardFormat ?? "qa";
  const formatHint =
    format === "cloze"
      ? "Use cloze style: one ____ blank in each question; answer is only the missing phrase."
      : "Use clear question → answer pairs optimized for active recall.";
  const difficulty = options?.difficulty ?? "medium";

  if (sourceType === "topic") {
    return `Create exactly ${count} high-quality flashcards for the topic below (${difficulty} difficulty).
The topic is authoritative — generate cards ONLY about this topic, even if deck metadata suggests another subject.
Cover the core concepts a serious student should master, ordered from foundational → deeper.
${formatHint}

Topic:
"""
${content}
"""

Return JSON: { "cards": [ ... exactly ${count} items ] }`;
  }

  return `Create exactly ${count} high-quality flashcards from the study notes below (${difficulty} difficulty).${subjectHint}
Use ONLY information supported by the notes. Do not invent facts not present in the text.
If the notes are sparse, return fewer cards rather than guessing.
${formatHint}

Study notes:
"""
${content}
"""

Return JSON: { "cards": [ ... exactly ${count} items ] }`;
}

export function flashcardRetryUserPrompt(
  sourceType: "topic" | "notes",
  content: string,
  count: number,
  issues: string[],
  deck?: DeckPromptContext,
  options?: GenerationOptions,
): string {
  return `${flashcardGenerationUserPrompt(sourceType, content, count, deck, options)}

Your previous response had quality issues:
${issues.map((issue) => `- ${issue}`).join("\n")}

Fix these issues and return exactly ${count} distinct, Play-Store-quality cards.`;
}

/** Rough token guard — truncate very long pasted notes before sending to the LLM. */
export function truncateContent(content: string, maxChars = 12000): string {
  if (content.length <= maxChars) return content;
  return `${content.slice(0, maxChars)}\n\n[Content truncated for length]`;
}

export type ExplainFlashcardContext = {
  question: string;
  answer: string;
  explanation?: string | null;
  hint?: string | null;
  subject?: string;
  deckTitle?: string;
};

export function explainFlashcardSystemPrompt(): string {
  return `You are Flipwise, a clear and encouraging study coach. Explain flashcard answers so a student understands why the answer is correct and how to remember it.

Rules:
- Return ONLY valid JSON: { "explanation": "...", "keyPoints": ["...", "..."], "analogy": "..." }.
- "explanation": 2–4 short sentences in plain language. No markdown fences.
- "keyPoints": 2–4 bullet-ready phrases (max ~12 words each) that aid recall.
- "analogy": one optional everyday analogy (1 sentence), or "" if none fits.
- Stay faithful to the card. Do not invent unrelated facts.
- No meta text ("As an AI…"), spoilers beyond the given answer, or exam cheating tips.`;
}

export function explainFlashcardUserPrompt(
  input: ExplainFlashcardContext,
): string {
  const deckLine =
    input.deckTitle || input.subject
      ? `Deck: ${[input.deckTitle, input.subject].filter(Boolean).join(" · ")}\n`
      : "";
  const hintLine = input.hint?.trim() ? `Hint: ${input.hint.trim()}\n` : "";
  const extraLine = input.explanation?.trim()
    ? `Saved takeaway: ${input.explanation.trim()}\n`
    : "";

  return `${deckLine}Explain this flashcard for active recall practice.

Question: ${input.question}
Answer: ${input.answer}
${hintLine}${extraLine}
Return JSON: { "explanation": "...", "keyPoints": [...], "analogy": "..." }`;
}
