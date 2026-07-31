import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {useCallback} from 'react';
import type {LibraryStackParamList, MainTabParamList} from '../navigation/types';

type ProfileRoute = keyof Pick<
  LibraryStackParamList,
  | 'ProfileHome'
  | 'Settings'
  | 'EditProfile'
  | 'PrivacyPolicy'
  | 'TermsOfService'
  | 'DataHandling'
>;

export function useProfileNavigation() {
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const openProfileRoute = useCallback(
    (screen: ProfileRoute) => {
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
