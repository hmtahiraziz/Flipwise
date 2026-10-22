import {Pressable} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {libraryTokens} from '../../config/libraryTokens';

export function LibraryBackButton({
  onPress,
  iconColor = libraryTokens.primary,
}: {
  onPress: () => void;
  iconColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel="Go back"
      accessibilityRole="button"
      className="items-center justify-center rounded-full active:opacity-70"
      style={{
        width: libraryTokens.minTapTarget,
        height: libraryTokens.minTapTarget,
      }}>
      <MaterialIcons name="arrow-back" size={24} color={iconColor} />
    </Pressable>
  );
}
