export type Sm2Input = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  quality: number;
};

export type Sm2Result = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

/** SM-2 spaced repetition (quality 0–5). */
export function calculateSm2(input: Sm2Input): Sm2Result {
  let { easeFactor, intervalDays, repetitions } = input;
  const q = input.quality;

  if (q < 3) {
    return { easeFactor, intervalDays: 0, repetitions: 0 };
  }

  let nextEase =
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (nextEase < 1.3) nextEase = 1.3;

  let nextInterval: number;
  let nextRepetitions: number;

  if (repetitions === 0) {
    nextInterval = 1;
    nextRepetitions = 1;
  } else if (repetitions === 1) {
    nextInterval = 6;
    nextRepetitions = 2;
  } else {
    nextInterval = Math.round(intervalDays * nextEase);
    nextRepetitions = repetitions + 1;
  }

  return {
    easeFactor: nextEase,
    intervalDays: nextInterval,
    repetitions: nextRepetitions,
  };
}

export const easeRatingToQuality: Record<string, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};
