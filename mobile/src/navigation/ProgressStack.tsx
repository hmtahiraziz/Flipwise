import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {EditProfileScreen} from '../screens/profile/EditProfileScreen';
import {
  DataHandlingScreen,
  PrivacyPolicyScreen,
  TermsOfServiceScreen,
} from '../screens/profile/LegalDocumentScreen';
import {ProfileScreen} from '../screens/profile/ProfileScreen';
import {SettingsScreen} from '../screens/profile/SettingsScreen';
import {ProgressScreen} from '../screens/progress/ProgressScreen';
import type {ProgressStackParamList} from './types';

const Stack = createNativeStackNavigator<ProgressStackParamList>();

export function ProgressStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ProgressHome" component={ProgressScreen} />
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="DataHandling" component={DataHandlingScreen} />
    </Stack.Navigator>
  );
}
