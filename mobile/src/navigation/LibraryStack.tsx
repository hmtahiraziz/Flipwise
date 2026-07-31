import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {navigationTheme} from '../config/theme';
import {CardListScreen} from '../screens/cards/CardListScreen';
import {EditCardScreen} from '../screens/cards/EditCardScreen';
import {GenerateCardsScreen} from '../screens/cards/GenerateCardsScreen';
import {CreateDeckScreen} from '../screens/decks/CreateDeckScreen';
import {DeckDetailScreen} from '../screens/decks/DeckDetailScreen';
import {DeckListScreen} from '../screens/decks/DeckListScreen';
import {EditDeckScreen} from '../screens/decks/EditDeckScreen';
import {EditProfileScreen} from '../screens/profile/EditProfileScreen';
import {
  DataHandlingScreen,
  PrivacyPolicyScreen,
  TermsOfServiceScreen,
} from '../screens/profile/LegalDocumentScreen';
import {ProfileScreen} from '../screens/profile/ProfileScreen';
import {SettingsScreen} from '../screens/profile/SettingsScreen';
import type {LibraryStackParamList} from './types';

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={navigationTheme}>
      <Stack.Screen
        name="DeckList"
        component={DeckListScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CreateDeck"
        component={CreateDeckScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DeckDetail"
        component={DeckDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditDeck"
        component={EditDeckScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CardList"
        component={CardListScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="GenerateCards"
        component={GenerateCardsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditCard"
        component={EditCardScreen}
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
