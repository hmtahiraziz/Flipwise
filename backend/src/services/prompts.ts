export type GenerationTone =
  | "concise"
  | "detailed"
  | "child-friendly"
  | "critical";

export type DeckPromptContext = {
  title: string;
  subject: string;
  description?: string | null;
};

const TONE_RULES: Record<GenerationTone, string> = {
  concise:
    "Keep answers to one short sentence (max ~20 words). Questions must be specific and direct.",
  detailed:
    "Answers may use 2–3 sentences with brief context or one example. Questions should probe understanding.",
  "child-friendly":
    "Use simple vocabulary suitable for ages 8–12. Avoid jargon; use plain explanations and friendly wording.",
  critical:
    "Prefer why/how/compare/evaluate question stems. Answers should explain reasoning, not just facts.",
};

const FEW_SHOT_EXAMPLE = `Example card:
{"question": "What organelle produces ATP in eukaryotic cells?", "answer": "Mitochondria"}`;

export function flashcardGenerationSystemPrompt(
  tone: GenerationTone = "concise",
  sourceType: "topic" | "notes" = "topic",
  deck?: DeckPromptContext,
): string {
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

  return `You are Flipwise, a study assistant that creates high-quality flashcards for spaced repetition.

${deckLines ? `${deckLines}\n` : ""}Tone: ${tone} — ${TONE_RULES[tone]}

Rules:
${topicPriorityRule}- Return ONLY valid JSON in the shape { "cards": [ { "question": "...", "answer": "..." } ] }.
- No markdown fences, commentary, or extra keys.
- One clear concept per card; avoid multi-part questions.
- Vary question types (define, compare, apply, cause/effect) — do not repeat "What is X?" for every card.
- Questions must be specific; answers must be complete but appropriately sized for the tone.
- No duplicate or near-duplicate cards (same fact rephrased).
- Do not include phrases like "As an AI" or refusal text.
- Stay factual; if the source is insufficient, return fewer high-quality cards rather than inventing details.

${FEW_SHOT_EXAMPLE}`;
}

export function flashcardGenerationUserPrompt(
  sourceType: "topic" | "notes",
  content: string,
  count: number,
  deck?: DeckPromptContext,
): string {
  const subjectHint =
    sourceType === "notes" && deck?.subject
      ? ` Focus on ${deck.subject}.`
      : "";

  if (sourceType === "topic") {
    return `Create exactly ${count} foundational recall flashcards for the topic below.
The topic is authoritative — generate cards ONLY about this topic, even if deck metadata suggests another subject.
Cover the core concepts a student should know before detailed study.

Topic:
"""
${content}
"""

Return JSON: { "cards": [ ... exactly ${count} items ] }`;
  }

  return `Create exactly ${count} flashcards from the study notes below.${subjectHint}
Use ONLY information supported by the notes. Do not invent facts not present in the text.
If the notes are sparse, return fewer cards rather than guessing.

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
): string {
  return `${flashcardGenerationUserPrompt(sourceType, content, count, deck)}

Your previous response had quality issues:
${issues.map((issue) => `- ${issue}`).join("\n")}

Fix these issues and return exactly ${count} distinct, high-quality cards.`;
}

/** Rough token guard — truncate very long pasted notes before sending to the LLM. */
export function truncateContent(content: string, maxChars = 12000): string {
  if (content.length <= maxChars) return content;
  return `${content.slice(0, maxChars)}\n\n[Content truncated for length]`;
}
