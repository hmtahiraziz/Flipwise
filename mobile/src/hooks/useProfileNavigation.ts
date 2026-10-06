import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {useCallback} from 'react';
import type {
  MainTabParamList,
  ProfileRoutesParamList,
} from '../navigation/types';

type ProfileRoute = keyof ProfileRoutesParamList;

export function useProfileNavigation() {
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const openProfileRoute = useCallback(
    (screen: ProfileRoute) => {
      const state = tabNav.getState();
      const currentTab = state.routes[state.index]?.name;

      if (currentTab === 'Home') {
        tabNav.navigate('Home', {screen});
        return;
      }

      tabNav.navigate('Library', {screen});
    },
    [tabNav],
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
