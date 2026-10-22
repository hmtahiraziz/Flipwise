import {appAlert} from '../components/ui/AppAlert';
import {preferencesStorage} from '../storage/preferencesStorage';

/**
 * Ensures the user has consented to sending content to our AI provider.
 * Shows a one-time confirm dialog; persists acceptance in preferences.
 * Full privacy text lives in Settings → Privacy (in-app).
 */
export function ensureAiProcessingConsent(): Promise<boolean> {
  if (preferencesStorage.get().aiProcessingConsent) {
    return Promise.resolve(true);
  }

  return new Promise(resolve => {
    appAlert(
      'Send content to AI?',
      'Cardweave will send the topic, notes, or scanned text you provide to our AI provider (OpenAI) to generate flashcards or extract text. Do not submit passwords, secrets, or highly sensitive personal data. See Privacy in Settings for details.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Agree & continue',
          style: 'default',
          onPress: () => {
            preferencesStorage.set({aiProcessingConsent: true});
            resolve(true);
          },
        },
      ],
      {cancelable: true, onDismiss: () => resolve(false)},
    );
  });
}

export function hasAiProcessingConsent(): boolean {
  return preferencesStorage.get().aiProcessingConsent;
}

export function setAiProcessingConsent(value: boolean): void {
  preferencesStorage.set({aiProcessingConsent: value});
}
