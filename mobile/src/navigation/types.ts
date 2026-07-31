export type OnboardingStackParamList = {
  Onboarding: undefined;
};

export type AuthStackParamList = {
  AuthWelcome: undefined;
  EmailAuth: {mode?: 'signIn' | 'signUp'};
  EmailVerification: {email: string; flow: 'signIn' | 'signUp'};
  ForgotPassword: {email?: string};
};

export type GenerateSourceType = 'topic' | 'notes';

export type LibraryStackParamList = {
  DeckList: undefined;
  CreateDeck:
    | {
        redirectTo?: 'GenerateCards';
        initialSource?: GenerateSourceType;
      }
    | undefined;
  DeckDetail: {deckId: string};
  CardList: {deckId: string};
  GenerateCards: {deckId: string; initialSource?: GenerateSourceType};
  EditCard: {deckId: string; cardId?: string};
  EditDeck: {deckId: string};
  ProfileHome: undefined;
  Settings: undefined;
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DataHandling: undefined;
};

export type ReviewStackParamList = {
  ReviewHome: undefined;
  ReviewSession: {deckId?: string};
};

export type ProgressStackParamList = {
  ProgressHome: undefined;
};

export type MainTabParamList = {
  Library: undefined | {screen?: keyof LibraryStackParamList; params?: object};
  Review: undefined | {screen?: keyof ReviewStackParamList; params?: object};
  Progress: undefined;
};

/** @deprecated Use LibraryStackParamList — kept for migration */
export type MainStackParamList = LibraryStackParamList & {
  ReviewSession: {deckId?: string};
};

declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends OnboardingStackParamList,
        AuthStackParamList,
        LibraryStackParamList,
        ReviewStackParamList,
        ProgressStackParamList,
        MainTabParamList {}
  }
}
