import {Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

export function LibraryTitleBlock() {
  return (
    <View>
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: 26,
          lineHeight: 32,
          letterSpacing: -0.4,
          color: libraryTokens.ink,
        }}>
        My Library
      </Text>
      <Text
        style={{
          fontFamily: fonts.bodyMedium,
          fontSize: 12,
          lineHeight: 16,
          color: libraryTokens.muted,
          marginTop: 2,
        }}>
        Organize, memorize, and create decks
      </Text>
    </View>
  );
}
