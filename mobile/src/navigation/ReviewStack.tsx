import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {navigationTheme} from '../config/theme';
import {EditProfileScreen} from '../screens/profile/EditProfileScreen';
import {
  DataHandlingScreen,
  PrivacyPolicyScreen,
  TermsOfServiceScreen,
} from '../screens/profile/LegalDocumentScreen';
import {ProfileScreen} from '../screens/profile/ProfileScreen';
import {SettingsScreen} from '../screens/profile/SettingsScreen';
import {ReviewHomeScreen} from '../screens/reviews/ReviewHomeScreen';
import {ReviewSessionScreen} from '../screens/reviews/ReviewSessionScreen';
import type {ReviewStackParamList} from './types';

const Stack = createNativeStackNavigator<ReviewStackParamList>();

export function ReviewStack() {
  return (
    <Stack.Navigator screenOptions={navigationTheme}>
      <Stack.Screen
        name="ReviewHome"
        component={ReviewHomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ReviewSession"
        component={ReviewSessionScreen}
        options={{title: 'Review', headerShown: false}}
      />
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DataHandling"
        component={DataHandlingScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
