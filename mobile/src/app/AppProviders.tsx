import type {ReactNode} from 'react';
import {StatusBar, View} from 'react-native';
import {ClerkLoaded, ClerkLoading, ClerkProvider} from '@clerk/clerk-expo';
import {tokenCache} from '@clerk/clerk-expo/token-cache';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ClerkTokenBridge} from '../auth/ClerkTokenBridge';
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
          <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <ClerkLoading>
              <View style={{flex: 1, backgroundColor: '#FFFFFF'}} />
            </ClerkLoading>
            <ClerkLoaded>
              <QueryClientProvider client={queryClient}>
                <ClerkTokenBridge />
                {children}
                <AppToast />
              </QueryClientProvider>
            </ClerkLoaded>
          </ClerkProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
