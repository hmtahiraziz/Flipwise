import { describe, expect, it } from "vitest";
import {
  cardSimilarity,
  dedupeCards,
  filterRelevantCards,
  isCardRelevant,
  validateGeneratedCards,
} from "../services/cardValidation.service";

describe("cardValidation.service", () => {
  it("scores identical questions as duplicates", () => {
    const score = cardSimilarity(
      "What organelle produces ATP in cells?",
      "What organelle produces ATP in cells?",
    );
    expect(score).toBe(1);
  });

  it("removes duplicate cards", () => {
    const cards = dedupeCards([
      { question: "What is ATP?", answer: "Cellular energy currency" },
      { question: "What is ATP?", answer: "Energy molecule in cells" },
    ]);
    expect(cards).toHaveLength(1);
  });

  it("accepts a full valid batch", () => {
    const topics = [
      "mitochondria",
      "chloroplasts",
      "ribosomes",
      "nucleus",
      "membrane",
      "cytoplasm",
      "vacuole",
      "lysosomes",
      "golgi",
      "endoplasmic reticulum",
    ];
    const cards = topics.map((topic) => ({
      question: `What is the role of ${topic} in a cell?`,
      answer: `${topic} performs a distinct function inside the cell.`,
    }));

    const result = validateGeneratedCards(cards, 10);
    expect(result.ok).toBe(true);
    expect(result.cards).toHaveLength(10);
  });

  it("flags operating system cards as off-topic for a React Native topic", () => {
    const osCards = [
      {
        question: "What is a kernel in an operating system?",
        answer: "The core component that manages system resources and hardware.",
      },
      {
        question: "What is process scheduling?",
        answer: "The OS method of deciding which process runs on the CPU.",
      },
    ];

    const { relevant, offTopicCount } = filterRelevantCards(
      osCards,
      "React Native",
    );
    expect(relevant).toHaveLength(0);
    expect(offTopicCount).toBe(2);
  });

  it("accepts cards that match the requested topic", () => {
    const reactNativeCards = [
      {
        question: "What is React Native used for?",
        answer: "Building cross-platform mobile apps with JavaScript and React.",
      },
      {
        question: "What does the React Native bridge do?",
        answer: "It connects JavaScript code with native platform APIs.",
      },
      {
        question: "How do React Native components render UI?",
        answer: "They use a virtual tree mapped to native views on each platform.",
      },
    ];

    for (const card of reactNativeCards) {
      expect(isCardRelevant(card, "React Native")).toBe(true);
    }

    const result = validateGeneratedCards(reactNativeCards, 3, {
      sourceContent: "React Native",
      sourceType: "topic",
    });
    expect(result.ok).toBe(true);
    expect(result.cards).toHaveLength(3);
  });

  it("rejects batches with too few acceptable cards", () => {
    const cards = [
      { question: "Short?", answer: "No" },
      { question: "As an AI I cannot help", answer: "Refusal text here" },
    ];

    const result = validateGeneratedCards(cards, 10);
    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
