import {toast} from '../components/ui/Toast';
import {createSafeMMKV} from '../storage/createSafeMMKV';
import {preferencesStorage} from '../storage/preferencesStorage';

const storage = createSafeMMKV('cardweave-reminders');
const LAST_NUDGE_KEY = 'last_nudge_date';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Once per day in-app nudge when study reminders are on and cards are due. */
export function maybeShowStudyReminder(dueCount: number) {
  if (!preferencesStorage.get().remindersEnabled) {
    return;
  }
  if (dueCount <= 0) {
    return;
  }

  const today = todayKey();
  if (storage.getString(LAST_NUDGE_KEY) === today) {
    return;
  }

  storage.set(LAST_NUDGE_KEY, today);
  toast.info(
    'Time to review',
    dueCount === 1
      ? '1 card is waiting for you.'
      : `${dueCount} cards are waiting for you.`,
  );
}

export function clearStudyReminderNudge() {
  try {
    storage.remove(LAST_NUDGE_KEY);
  } catch {
    // ignore
  }
}
