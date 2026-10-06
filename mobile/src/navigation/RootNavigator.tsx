import {useAuth} from '@clerk/clerk-expo';
import {NavigationContainer} from '@react-navigation/native';
import {useEffect, useRef, type MutableRefObject} from 'react';
import {BootLoading} from '../components/ui/BootLoading';
import {usePendingReviewSync} from '../hooks/usePendingReviewSync';
import {
  selectHasCompletedOnboarding,
  selectOnboardingHydrated,
  useOnboardingStore,
} from '../store/onboardingStore';
import {useTheme} from '../theme/ThemeProvider';
import {AuthStack} from './AuthStack';
import {MainTabs} from './MainTabs';
import {OnboardingStack} from './OnboardingStack';

function PendingReviewSyncBridge({
  flushRef,
}: {
  flushRef: MutableRefObject<(() => void) | null>;
}) {
  const flush = usePendingReviewSync();

  useEffect(() => {
    flushRef.current = () => {
      void flush();
    };
    return () => {
      flushRef.current = null;
    };
  }, [flush, flushRef]);

  return null;
}

export function RootNavigator() {
  const {isLoaded, isSignedIn} = useAuth();
  const isHydrated = useOnboardingStore(selectOnboardingHydrated);
  const hasCompletedOnboarding = useOnboardingStore(selectHasCompletedOnboarding);
  const pendingFlushRef = useRef<(() => void) | null>(null);
  const {navigationTheme} = useTheme();

  useEffect(() => {
    console.log('[Boot] RootNavigator mounted — calling hydrate()');
    useOnboardingStore.getState().hydrate();
  }, []);

  useEffect(() => {
    console.log('[Boot] gate state', {
      isLoaded,
      isSignedIn: isSignedIn ?? null,
      isHydrated,
      hasCompletedOnboarding,
    });
  }, [isLoaded, isSignedIn, isHydrated, hasCompletedOnboarding]);

  if (!isLoaded || !isHydrated) {
    return <BootLoading />;
  }

  if (__DEV__) {
    const stack = !hasCompletedOnboarding
      ? 'OnboardingStack'
      : isSignedIn
        ? 'MainTabs'
        : 'AuthStack';
    console.log('[Boot] rendering navigator stack:', stack);
  }

  return (
    <NavigationContainer
      theme={navigationTheme}
      onStateChange={() => {
        pendingFlushRef.current?.();
      }}>
      {!hasCompletedOnboarding ? (
        <OnboardingStack />
      ) : isSignedIn ? (
        <>
          <PendingReviewSyncBridge flushRef={pendingFlushRef} />
          <MainTabs />
        </>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
