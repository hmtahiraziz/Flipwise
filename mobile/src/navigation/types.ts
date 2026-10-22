export type OnboardingStackParamList = {
  Onboarding: undefined;
};

export type AuthStackParamList = {
  EmailAuth: {mode?: 'signIn' | 'signUp'};
  EmailVerification: {email: string; flow: 'signIn' | 'signUp'};
  ForgotPassword: {email?: string};
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

export type GenerateSourceType = 'topic' | 'notes' | 'pdf' | 'scan';

/** Shared profile / settings route names used by Library and Home stacks. */
export type ProfileRoutesParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DataHandling: undefined;
};

/** Shared review-session params (Library / Home / Review stacks). */
export type ReviewSessionParams = {
  deckId?: string;
  /** Skip resume prompt — start a fresh session (deck Study CTA). */
  forceFresh?: boolean;
};

export type HomeStackParamList = {
  HomeHome: undefined;
  StudyPlanner: undefined;
  QuizSession: {deckId: string};
  ReviewSession: ReviewSessionParams;
  ProfileHome: undefined;
  Settings: undefined;
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DataHandling: undefined;
};

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
  ReviewSession: ReviewSessionParams;
  ProfileHome: undefined;
  Settings: undefined;
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DataHandling: undefined;
};

export type ReviewStackParamList = {
  ReviewHome: undefined;
  ReviewSession: ReviewSessionParams;
  ProfileHome: undefined;
  Settings: undefined;
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DataHandling: undefined;
};

export type ProgressStackParamList = {
  ProgressHome: undefined;
  ProfileHome: undefined;
  Settings: undefined;
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DataHandling: undefined;
};

export type MainTabParamList = {
  Home: undefined | {screen?: keyof HomeStackParamList; params?: object};
  Library: undefined | {screen?: keyof LibraryStackParamList; params?: object};
  Review: undefined | {screen?: keyof ReviewStackParamList; params?: object};
  Progress: undefined | {screen?: keyof ProgressStackParamList; params?: object};
};

/** @deprecated Use LibraryStackParamList — kept for migration */
export type MainStackParamList = LibraryStackParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends OnboardingStackParamList,
        AuthStackParamList,
        HomeStackParamList,
        LibraryStackParamList,
        ReviewStackParamList,
        ProgressStackParamList,
        MainTabParamList {}
  }
}
