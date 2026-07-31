import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {navigationTheme} from '../config/theme';
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
    </Stack.Navigator>
  );
}
