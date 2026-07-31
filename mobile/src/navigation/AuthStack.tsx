import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {EmailAuthScreen} from '../screens/auth/EmailAuthScreen';
import {EmailVerificationScreen} from '../screens/auth/EmailVerificationScreen';
import {ForgotPasswordScreen} from '../screens/auth/ForgotPasswordScreen';
import type {AuthStackParamList} from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="EmailAuth">
      <Stack.Screen
        name="EmailAuth"
        component={EmailAuthScreen}
        initialParams={{mode: 'signIn'}}
      />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
