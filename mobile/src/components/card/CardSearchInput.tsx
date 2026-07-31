import {TextInput, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type CardSearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function CardSearchInput({
  value,
  onChangeText,
  placeholder = 'Search cards...',
}: CardSearchInputProps) {
  return (
    <View className="relative">
      <View
        className="absolute left-4 top-0 bottom-0 justify-center"
        pointerEvents="none">
        <MaterialIcons name="search" size={20} color={libraryTokens.muted} />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={libraryTokens.muted}
        className="h-12 pl-11 pr-4 rounded-xl border"
        style={{
          fontFamily: fonts.body,
          fontSize: 16,
          color: libraryTokens.ink,
          backgroundColor: '#F7F8F5',
          borderColor: libraryTokens.border,
        }}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}
