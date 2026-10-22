import {Platform} from 'react-native';

/** Standard ScrollView / KeyboardAwareScrollView tap + dismiss props. */
export const keyboardScrollProps = {
  keyboardShouldPersistTaps: 'handled' as const,
  keyboardDismissMode: Platform.OS === 'ios' ? ('interactive' as const) : ('on-drag' as const),
};
