import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StudyPlannerScreen} from '../screens/home/StudyPlannerScreen';
import {ProgressScreen} from '../screens/progress/ProgressScreen';
import {QuizSessionScreen} from '../screens/progress/QuizSessionScreen';
import type {ProgressStackParamList} from './types';

const Stack = createNativeStackNavigator<ProgressStackParamList>();

export function ProgressStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ProgressHome" component={ProgressScreen} />
      <Stack.Screen name="StudyPlanner" component={StudyPlannerScreen} />
      <Stack.Screen name="QuizSession" component={QuizSessionScreen} />
    </Stack.Navigator>
  );
}
