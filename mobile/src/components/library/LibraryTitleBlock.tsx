import {Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

export function LibraryTitleBlock() {
  return (
    <View>
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: 32,
          lineHeight: 40,
          letterSpacing: -0.64,
          color: libraryTokens.ink,
        }}>
        My Library
      </Text>
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 16,
          lineHeight: 24,
          color: libraryTokens.muted,
        }}>
        Continue your learning journey.
      </Text>
    </View>
  );
}
