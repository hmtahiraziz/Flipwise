import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {
  GenerateSourceType,
  LibraryStackParamList,
} from '../navigation/types';

type LibraryNavigation = NativeStackNavigationProp<LibraryStackParamList>;

export function navigateToGenerateCards(
  navigation: LibraryNavigation,
  deckId: string,
  initialSource: GenerateSourceType,
) {
  navigation.navigate('GenerateCards', {deckId, initialSource});
}

export function navigateToCreateDeckForGenerate(
  navigation: LibraryNavigation,
  initialSource: GenerateSourceType,
) {
  navigation.navigate('CreateDeck', {
    redirectTo: 'GenerateCards',
    initialSource,
  });
}
