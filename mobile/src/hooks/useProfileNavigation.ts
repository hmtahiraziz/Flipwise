import {useNavigation} from '@react-navigation/native';
import {useCallback} from 'react';
import type {
  MainTabParamList,
  ProfileRoutesParamList,
} from '../navigation/types';

type ProfileRoute = keyof ProfileRoutesParamList;

const TAB_NAMES = new Set<keyof MainTabParamList>([
  'Home',
  'Library',
  'Review',
  'Progress',
]);

/**
 * Opens profile/settings routes on the current tab stack.
 * Prefer a direct stack push when already inside Home/Library/Review/Progress —
 * tab-level navigate(currentTab, {screen}) breaks when the focused route is
 * already Settings (currentTab becomes "Settings" and nested screens never open).
 */
export function useProfileNavigation() {
  const navigation = useNavigation();

  const openProfileRoute = useCallback(
    (screen: ProfileRoute) => {
      const state = navigation.getState();
      if (state?.routeNames?.includes(screen)) {
        navigation.navigate(screen as never);
        return;
      }

      // Climb to the tab navigator when called from a non-profile stack screen.
      let parent = navigation.getParent();
      while (parent) {
        const parentState = parent.getState();
        const routeNames = parentState?.routeNames ?? [];
        if (routeNames.some(name => TAB_NAMES.has(name as keyof MainTabParamList))) {
          const currentTab = (parentState.routes[parentState.index]?.name ??
            'Home') as keyof MainTabParamList;
          parent.navigate(currentTab, {
            screen,
            initial: false,
          } as never);
          return;
        }
        parent = parent.getParent();
      }

      // Last resort — try a direct navigate (same stack / sibling).
      navigation.navigate(screen as never);
    },
    [navigation],
  );

  return {
    openProfile: () => openProfileRoute('ProfileHome'),
    openSettings: () => openProfileRoute('Settings'),
    openEditProfile: () => openProfileRoute('EditProfile'),
    openPrivacyPolicy: () => openProfileRoute('PrivacyPolicy'),
    openTermsOfService: () => openProfileRoute('TermsOfService'),
    openDataHandling: () => openProfileRoute('DataHandling'),
  };
}
