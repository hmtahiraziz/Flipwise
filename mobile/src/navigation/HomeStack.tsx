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
import {HomeScreen} from '../screens/home/HomeScreen';
import {StudyPlannerScreen} from '../screens/home/StudyPlannerScreen';
import type {HomeStackParamList} from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={navigationTheme}>
      <Stack.Screen
        name="HomeHome"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StudyPlanner"
        component={StudyPlannerScreen}
        options={{headerShown: false}}
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
