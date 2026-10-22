import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import {useCallback} from 'react';

/**
 * Back from profile/settings screens. Prefer popping the stack; if Settings
 * was opened as the only route (`initial: true`), fall back to this stack's
 * root so we never bubble to the previous tab (often Library).
 */
export function useProfileStackBack(
  navigation: NavigationProp<ParamListBase>,
) {
  return useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    const state = navigation.getState();
    const root = state?.routeNames?.[0];
    if (root) {
      navigation.navigate(root as never);
    }
  }, [navigation]);
}
