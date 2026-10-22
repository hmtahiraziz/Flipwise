import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {EmailAuthScreen} from '../screens/auth/EmailAuthScreen';
import {EmailVerificationScreen} from '../screens/auth/EmailVerificationScreen';
import {ForgotPasswordScreen} from '../screens/auth/ForgotPasswordScreen';
import {
  PrivacyPolicyScreen,
  TermsOfServiceScreen,
} from '../screens/profile/LegalDocumentScreen';
import type {AuthStackParamList} from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="EmailAuth">
      <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
    </Stack.Navigator>
  );
}
