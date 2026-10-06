export type OnboardingStackParamList = {
  Onboarding: undefined;
};

export type AuthStackParamList = {
  AuthWelcome: undefined;
  EmailAuth: {mode?: 'signIn' | 'signUp'};
  EmailVerification: {email: string; flow: 'signIn' | 'signUp'};
  ForgotPassword: {email?: string};
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

export type HomeStackParamList = {
  HomeHome: undefined;
  StudyPlanner: undefined;
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
  StudyPlanner: undefined;
  QuizSession: {deckId: string};
};

export type MainTabParamList = {
  Home: undefined | {screen?: keyof HomeStackParamList; params?: object};
  Library: undefined | {screen?: keyof LibraryStackParamList; params?: object};
  Review: undefined | {screen?: keyof ReviewStackParamList; params?: object};
  Progress: undefined | {screen?: keyof ProgressStackParamList; params?: object};
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
        HomeStackParamList,
        LibraryStackParamList,
        ReviewStackParamList,
        ProgressStackParamList,
        MainTabParamList {}
  }
}
