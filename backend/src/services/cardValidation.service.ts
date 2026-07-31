type CardDraft = {
  question: string;
  answer: string;
};

const MIN_QUESTION_LENGTH = 10;
const MIN_ANSWER_LENGTH = 5;
const DUPLICATE_SIMILARITY = 0.82;
const MIN_ACCEPTABLE_RATIO = 0.6;

const BANNED_PATTERNS = [
  /^as an ai\b/i,
  /^i cannot\b/i,
  /^i can't\b/i,
  /^i'm unable\b/i,
  /^sorry,? i\b/i,
];

const STOP_WORDS = new Set([
  "about",
  "also",
  "and",
  "are",
  "for",
  "from",
  "has",
  "have",
  "how",
  "into",
  "that",
  "the",
  "this",
  "what",
  "when",
  "where",
  "which",
  "with",
  "your",
]);

const MIN_RELEVANCE_SIMILARITY = 0.12;

export function normalizeCardText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(text: string): Set<string> {
  return new Set(
    normalizeCardText(text)
      .split(" ")
      .filter((token) => token.length > 2),
  );
}

export function cardSimilarity(a: string, b: string): number {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function isBannedCard(card: CardDraft): boolean {
  const combined = `${card.question} ${card.answer}`;
  return BANNED_PATTERNS.some((pattern) => pattern.test(combined.trim()));
}

function isTooShort(card: CardDraft): boolean {
  return (
    card.question.trim().length < MIN_QUESTION_LENGTH ||
    card.answer.trim().length < MIN_ANSWER_LENGTH
  );
}

export function extractSourceKeywords(content: string): Set<string> {
  return new Set(
    normalizeCardText(content)
      .split(" ")
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );
}

export function cardRelevanceToSource(
  card: CardDraft,
  sourceContent: string,
): number {
  const sourceKeywords = extractSourceKeywords(sourceContent);
  if (sourceKeywords.size === 0) return 1;

  const cardText = normalizeCardText(`${card.question} ${card.answer}`);
  const cardTokens = new Set(
    cardText.split(" ").filter((token) => token.length > 2),
  );

  let matched = 0;
  for (const keyword of sourceKeywords) {
    if (cardTokens.has(keyword)) matched += 1;
  }

  return matched / sourceKeywords.size;
}

export function isCardRelevant(card: CardDraft, sourceContent: string): boolean {
  const combined = `${card.question} ${card.answer}`;
  const normalizedCard = normalizeCardText(combined);
  const sourceKeywords = extractSourceKeywords(sourceContent);

  if (sourceKeywords.size === 0) return true;

  if (cardSimilarity(combined, sourceContent) >= MIN_RELEVANCE_SIMILARITY) {
    return true;
  }

  const keywordScore = cardRelevanceToSource(card, sourceContent);
  const minKeywordRatio =
    sourceKeywords.size <= 2 ? 1 : Math.max(0.25, 2 / sourceKeywords.size);

  if (keywordScore >= minKeywordRatio) return true;

  if (sourceKeywords.size === 1) {
    const [keyword] = sourceKeywords;
    if (keyword && normalizedCard.includes(keyword)) {
      return true;
    }
  }

  return false;
}

export function filterRelevantCards(
  cards: CardDraft[],
  sourceContent: string,
): { relevant: CardDraft[]; offTopicCount: number } {
  const relevant = cards.filter((card) => isCardRelevant(card, sourceContent));
  return {
    relevant,
    offTopicCount: cards.length - relevant.length,
  };
}

export function dedupeCards(cards: CardDraft[]): CardDraft[] {
  const kept: CardDraft[] = [];

  for (const card of cards) {
    const duplicate = kept.some(
      (existing) =>
        cardSimilarity(existing.question, card.question) >=
          DUPLICATE_SIMILARITY ||
        cardSimilarity(existing.answer, card.answer) >= DUPLICATE_SIMILARITY,
    );
    if (!duplicate) {
      kept.push(card);
    }
  }

  return kept;
}

export type CardValidationOptions = {
  sourceContent?: string;
  sourceType?: "topic" | "notes";
};

export type CardValidationOutcome = {
  cards: CardDraft[];
  ok: boolean;
  issues: string[];
};

export function validateGeneratedCards(
  cards: CardDraft[],
  requestedCount: number,
  options?: CardValidationOptions,
): CardValidationOutcome {
  const issues: string[] = [];

  const withoutBanned = cards.filter((card) => !isBannedCard(card));
  if (withoutBanned.length < cards.length) {
    issues.push("Removed generic or refusal-style cards");
  }

  const longEnough = withoutBanned.filter((card) => !isTooShort(card));
  if (longEnough.length < withoutBanned.length) {
    issues.push("Some cards were too short or vague");
  }

  let onTopic = longEnough;
  if (options?.sourceContent?.trim()) {
    const { relevant, offTopicCount } = filterRelevantCards(
      longEnough,
      options.sourceContent,
    );
    onTopic = relevant;
    if (offTopicCount > 0) {
      const sourceLabel =
        options.sourceType === "topic" ? "topic" : "source material";
      issues.push(
        `${offTopicCount} card(s) were off-topic and did not match the ${sourceLabel}`,
      );
    }
  }

  const unique = dedupeCards(onTopic);
  if (unique.length < onTopic.length) {
    issues.push("Duplicate or near-duplicate cards were removed");
  }

  const minAcceptable = Math.max(
    3,
    Math.ceil(requestedCount * MIN_ACCEPTABLE_RATIO),
  );

  if (unique.length < minAcceptable) {
    issues.push(
      `Expected at least ${minAcceptable} distinct cards but got ${unique.length}`,
    );
  }

  if (unique.length < requestedCount) {
    issues.push(
      `Expected ${requestedCount} cards but only ${unique.length} passed validation`,
    );
  }

  const trimmed = unique.slice(0, requestedCount);
  const ok =
    trimmed.length >= minAcceptable &&
    trimmed.length >= Math.min(requestedCount, minAcceptable);

  return { cards: trimmed, ok, issues };
}
