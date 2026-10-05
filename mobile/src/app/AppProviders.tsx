import type {ReactNode} from 'react';
import {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {ClerkProvider, useAuth} from '@clerk/clerk-expo';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ClerkTokenBridge} from '../auth/ClerkTokenBridge';
import {tokenCache} from '../auth/clerkTokenCache';
import {ErrorBoundary} from '../components/ui/ErrorBoundary';
import {AppToast} from '../components/ui/Toast';
import {clerkPublishableKey, isClerkConfigured} from '../config/clerk';
import {ConfigErrorScreen} from '../screens/auth/ConfigErrorScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

type AppProvidersProps = {
  children: ReactNode;
};

/** Logs Clerk load progress even before navigators mount. */
function ClerkBootProbe() {
  const {isLoaded, isSignedIn} = useAuth();

  useEffect(() => {
    console.log('[Boot] ClerkProvider auth state', {
      isLoaded,
      isSignedIn: isSignedIn ?? null,
      clerkConfigured: isClerkConfigured,
      publishableKeyPrefix: clerkPublishableKey.slice(0, 10),
    });
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      return;
    }
    const timer = setTimeout(() => {
      console.warn(
        '[Boot] Clerk still not loaded after 8s — check network, publishable key, SecureStore/tokenCache',
      );
    }, 8_000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  return null;
}

export function AppProviders({children}: AppProvidersProps) {
  if (!isClerkConfigured) {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <ConfigErrorScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <ErrorBoundary title="Flipwise ran into a problem">
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          {/*
            Do NOT wrap the whole tree in ClerkLoaded/ClerkLoading.
            Those previously rendered a blank white View forever when Clerk
            hung — and blocked RootNavigator (and its logs) from mounting.
          */}
          <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <QueryClientProvider client={queryClient}>
              <ClerkBootProbe />
              <ClerkTokenBridge />
              {children}
              <AppToast />
            </QueryClientProvider>
          </ClerkProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
