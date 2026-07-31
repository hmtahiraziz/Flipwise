import {colors} from '../config/theme';

export type SubjectColorKey =
  | 'science'
  | 'languages'
  | 'history'
  | 'art'
  | 'math'
  | 'default';

type SubjectColorSet = {
  background: string;
  text: string;
};

const SUBJECT_MAP: Record<SubjectColorKey, SubjectColorSet> = {
  science: {background: colors.brandMint, text: colors.text},
  languages: {background: colors.brandSky, text: colors.text},
  history: {background: colors.brandYellow, text: colors.text},
  art: {background: colors.brandPink, text: colors.text},
  math: {background: colors.brandLavender, text: colors.text},
  default: {background: colors.accentMuted, text: colors.text},
};

const SUBJECT_ALIASES: Record<string, SubjectColorKey> = {
  science: 'science',
  biology: 'science',
  chemistry: 'science',
  physics: 'science',
  languages: 'languages',
  language: 'languages',
  english: 'languages',
  spanish: 'languages',
  french: 'languages',
  history: 'history',
  art: 'art',
  arts: 'art',
  math: 'math',
  mathematics: 'math',
};

export function resolveSubjectColorKey(subject?: string | null): SubjectColorKey {
  if (!subject?.trim()) {
    return 'default';
  }
  const normalized = subject.trim().toLowerCase();
  return SUBJECT_ALIASES[normalized] ?? 'default';
}

export function getSubjectColors(subject?: string | null): SubjectColorSet {
  return SUBJECT_MAP[resolveSubjectColorKey(subject)];
}
