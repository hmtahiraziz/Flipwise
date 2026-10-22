import {clearStudyReminderNudge} from '../lib/studyReminders';
import {localDataStorage} from './localDataStorage';
import {preferencesStorage} from './preferencesStorage';

/**
 * Clears on-device study caches after account deletion.
 * Does not reset onboarding — that is a device preference, not account data.
 */
export function clearLocalUserData(): void {
  localDataStorage.clearAll();
  clearStudyReminderNudge();

  preferencesStorage.set({
    theme: 'system',
    dailyGoal: 40,
    textScale: 1,
    reducedMotion: false,
    haptics: true,
    sound: true,
    ttsSpeed: 1,
    language: 'en-US',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    subjects: [],
    examDate: null,
    remindersEnabled: false,
    aiProcessingConsent: false,
  });
}
