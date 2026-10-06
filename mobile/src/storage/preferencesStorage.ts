import {createSafeMMKV} from './createSafeMMKV';

const storage = createSafeMMKV('flipwise-prefs');

export type ThemePreference = 'light' | 'dark' | 'system';

export type AppPreferences = {
  theme: ThemePreference;
  dailyGoal: number;
  textScale: number;
  reducedMotion: boolean;
  haptics: boolean;
  sound: boolean;
  ttsSpeed: number;
  language: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  subjects: string[];
  examDate: string | null;
  remindersEnabled: boolean;
};

const DEFAULTS: AppPreferences = {
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
};

const KEY = 'preferences_v1';

function readAll(): AppPreferences {
  try {
    const raw = storage.getString(KEY);
    if (!raw) return {...DEFAULTS};
    return {...DEFAULTS, ...JSON.parse(raw)};
  } catch {
    return {...DEFAULTS};
  }
}

function writeAll(prefs: AppPreferences) {
  try {
    storage.set(KEY, JSON.stringify(prefs));
  } catch (error) {
    console.warn('[PreferencesStorage] write failed:', error);
  }
}

export const preferencesStorage = {
  get(): AppPreferences {
    return readAll();
  },

  set(partial: Partial<AppPreferences>) {
    const next = {...readAll(), ...partial};
    writeAll(next);
    return next;
  },

  getTheme(): ThemePreference {
    return readAll().theme;
  },

  setTheme(theme: ThemePreference) {
    return this.set({theme});
  },

  getDailyGoal(): number {
    return readAll().dailyGoal;
  },

  setDailyGoal(dailyGoal: number) {
    return this.set({dailyGoal: Math.max(1, Math.min(500, dailyGoal))});
  },
};
