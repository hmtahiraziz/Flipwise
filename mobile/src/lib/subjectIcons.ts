import {resolveSubjectColorKey, type SubjectColorKey} from './subjectColors';

const SUBJECT_ICONS: Record<SubjectColorKey, string> = {
  science: 'biotech',
  languages: 'translate',
  history: 'history-edu',
  art: 'palette',
  math: 'calculate',
  default: 'menu-book',
};

export function getSubjectIcon(subject?: string | null): string {
  const key = resolveSubjectColorKey(subject);
  return SUBJECT_ICONS[key];
}
