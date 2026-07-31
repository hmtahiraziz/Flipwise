import {APP_NAME, APP_TAGLINE, brandColors} from './brand';
import {
  LEGAL_ENTITY,
  PLAY_STORE_PACKAGE,
  PRIVACY_EMAIL,
  SUPPORT_EMAIL,
} from './app';

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: LegalSection[];
};

const LAST_UPDATED = 'July 30, 2026';

export const privacyPolicy: LegalDocument = {
  title: 'Privacy Policy',
  lastUpdated: LAST_UPDATED,
  intro: `${LEGAL_ENTITY} ("we", "us", or "our") operates the ${APP_NAME} mobile application (package: ${PLAY_STORE_PACKAGE}). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our app.`,
  sections: [
    {
      title: 'Information we collect',
      paragraphs: [
        'Account information: When you create an account, we collect your email address, display name, and profile photo through our authentication provider, Clerk. If you sign in with Google, we receive basic profile information permitted by your Google account settings.',
        'Study content: We store flashcards, decks, review history, spaced-repetition scheduling data, and progress statistics that you create or generate in the app.',
        'Usage data: We collect technical information necessary to operate the service, such as device type, app version, and error logs when something fails.',
        'AI-generated content: If you use AI card generation, the text you submit is sent to our backend and processed by a language-model provider solely to produce flashcards. We do not use your study content to train public AI models.',
      ],
    },
    {
      title: 'How we use your information',
      paragraphs: [
        'Provide and maintain the app, including syncing your decks and review progress across sessions.',
        'Authenticate you and secure your account.',
        'Improve reliability, fix bugs, and understand aggregate usage patterns.',
        'Respond to support requests and legal obligations.',
        'We do not sell your personal information.',
      ],
    },
    {
      title: 'Third-party services',
      paragraphs: [
        'Clerk — authentication and account management (https://clerk.com/privacy).',
        'Google — optional OAuth sign-in, subject to Google\'s Privacy Policy when you choose that sign-in method.',
        'Cloud hosting and database providers — store encrypted data needed to run the service.',
        'AI providers — process prompts you submit for card generation under our instructions and data-processing terms.',
        'These providers process data only as needed to deliver the service on our behalf.',
      ],
    },
    {
      title: 'Data retention',
      paragraphs: [
        'We retain your account and study data while your account is active. If you delete your account, we delete or anonymize associated personal data within a reasonable period, except where retention is required by law or for legitimate security purposes.',
      ],
    },
    {
      title: 'Your rights and choices',
      paragraphs: [
        'Access and update your profile information in Settings or through the Clerk account portal.',
        'Export your study data by contacting us at the email below.',
        'Delete your account from Settings → Delete account, which opens the secure account management portal.',
        'Opt out of non-essential communications by contacting support.',
        'Depending on your region (EEA, UK, California, and others), you may have additional rights to access, correct, delete, or restrict processing of your personal data.',
      ],
    },
    {
      title: 'Children\'s privacy',
      paragraphs: [
        `${APP_NAME} is not directed to children under 13 (or the minimum age required in your country). We do not knowingly collect personal information from children. Contact us if you believe a child has provided personal data and we will delete it.`,
      ],
    },
    {
      title: 'Security',
      paragraphs: [
        'We use industry-standard measures including encrypted transport (HTTPS), secure authentication tokens, and access controls. No method of transmission or storage is 100% secure; please use a strong, unique password and keep your device secure.',
      ],
    },
    {
      title: 'International transfers',
      paragraphs: [
        'Your information may be processed in countries other than your own. Where required, we rely on appropriate safeguards for cross-border data transfers.',
      ],
    },
    {
      title: 'Changes to this policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. We will post the revised policy in the app and update the "Last updated" date. Material changes will be communicated through the app or by email where appropriate.',
      ],
    },
    {
      title: 'Contact us',
      paragraphs: [
        `Privacy inquiries: ${PRIVACY_EMAIL}`,
        `General support: ${SUPPORT_EMAIL}`,
      ],
    },
  ],
};

export const termsOfService: LegalDocument = {
  title: 'Terms of Service',
  lastUpdated: LAST_UPDATED,
  intro: `These Terms of Service ("Terms") govern your use of the ${APP_NAME} mobile application operated by ${LEGAL_ENTITY}. By creating an account or using the app, you agree to these Terms.`,
  sections: [
    {
      title: 'Eligibility',
      paragraphs: [
        'You must be at least 13 years old (or the minimum age in your jurisdiction) and able to form a binding contract. You are responsible for ensuring your use complies with applicable laws.',
      ],
    },
    {
      title: 'Your account',
      paragraphs: [
        'You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.',
        'Provide accurate registration information and keep your profile up to date.',
        'Notify us immediately at support@flipwise.app if you suspect unauthorized access.',
      ],
    },
    {
      title: 'Acceptable use',
      paragraphs: [
        'You may use the app for personal, non-commercial study purposes unless we agree otherwise in writing.',
        'You may not reverse engineer, scrape, overload, or misuse the service; upload unlawful, harmful, or infringing content; or attempt to access other users\' data.',
        'We may suspend or terminate accounts that violate these Terms or pose a security risk.',
      ],
    },
    {
      title: 'Your content',
      paragraphs: [
        'You retain ownership of flashcards, decks, and other content you create. You grant us a limited license to host, process, and display your content solely to operate and improve the service.',
        'You represent that you have the rights to any material you upload or submit for AI generation.',
      ],
    },
    {
      title: 'AI features',
      paragraphs: [
        'AI-generated flashcards are provided for study assistance. Outputs may contain errors; always review cards before relying on them for exams or professional use.',
        'Do not submit sensitive personal data, credentials, or confidential third-party information to AI features.',
      ],
    },
    {
      title: 'Subscriptions and payments',
      paragraphs: [
        'If paid features are offered in the future, pricing and billing terms will be presented in the app and through the Google Play billing flow before purchase.',
      ],
    },
    {
      title: 'Disclaimer',
      paragraphs: [
        `THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. ${APP_NAME.toUpperCase()} DOES NOT GUARANTEE UNINTERRUPTED SERVICE, ERROR-FREE OPERATION, OR SPECIFIC LEARNING OUTCOMES.`,
      ],
    },
    {
      title: 'Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, we are not liable for indirect, incidental, special, or consequential damages arising from your use of the app. Our total liability for any claim related to the service is limited to the amount you paid us in the twelve months before the claim, or USD $50 if you use the free tier.',
      ],
    },
    {
      title: 'Termination',
      paragraphs: [
        'You may stop using the app and delete your account at any time through Settings. We may terminate or suspend access if you breach these Terms or if we discontinue the service with reasonable notice where practicable.',
      ],
    },
    {
      title: 'Governing law',
      paragraphs: [
        'These Terms are governed by the laws applicable in your place of residence unless mandatory local consumer protections require otherwise. Disputes should first be raised with support@flipwise.app.',
      ],
    },
    {
      title: 'Contact',
      paragraphs: [`Questions about these Terms: ${SUPPORT_EMAIL}`],
    },
  ],
};

export const dataHandlingSummary: LegalDocument = {
  title: 'Data & Privacy Summary',
  lastUpdated: LAST_UPDATED,
  intro: `This summary helps you understand what ${APP_NAME} collects and why — aligned with Google Play Data safety disclosures.`,
  sections: [
    {
      title: 'Data collected',
      paragraphs: [
        'Personal info: email, name, profile photo (via Clerk authentication).',
        'App activity: decks, flashcards, review history, streaks, and progress metrics.',
        'Optional: Google account identifier if you choose Google sign-in.',
        'Diagnostics: crash and error logs to keep the app stable.',
      ],
    },
    {
      title: 'Data shared',
      paragraphs: [
        'Authentication data is processed by Clerk.',
        'Optional Google sign-in data is processed by Google.',
        'Study content is stored on our secure backend to sync your progress.',
        'AI prompts are sent to our AI provider only when you use card generation.',
        'We do not sell personal data to advertisers or data brokers.',
      ],
    },
    {
      title: 'Security practices',
      paragraphs: [
        'Data is encrypted in transit (HTTPS/TLS).',
        'Access to production systems is restricted and audited.',
        'Authentication tokens are stored securely on your device.',
      ],
    },
    {
      title: 'Data deletion',
      paragraphs: [
        'Delete your account from Settings → Delete account to start permanent removal of your profile and associated study data.',
        'You can also email privacy@flipwise.app for deletion or export requests.',
      ],
    },
    {
      title: 'Permissions',
      paragraphs: [
        'Internet — required to sync decks and authenticate.',
        'Storage (when used) — only for importing study files you choose; we do not access unrelated files on your device.',
      ],
    },
    {
      title: 'Full policy',
      paragraphs: [
        `For complete details, read our Privacy Policy and Terms of Service in Settings → Legal.`,
      ],
    },
  ],
};

export const legalDocuments = {
  privacy: privacyPolicy,
  terms: termsOfService,
  data: dataHandlingSummary,
} as const;

export type LegalDocumentKey = keyof typeof legalDocuments;
