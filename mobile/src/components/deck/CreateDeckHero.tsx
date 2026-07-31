import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {createDeckTokens} from '../../config/createDeckTokens';
import {fonts} from '../../config/theme';

type CreateDeckHeroProps = {
  subtitle: string;
};

export function CreateDeckHero({subtitle}: CreateDeckHeroProps) {
  return (
    <View style={{gap: 16, marginBottom: 32}}>
      <View style={{width: 48, height: 48}}>
        <View
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: 'rgba(198, 241, 53, 0.2)',
          }}
        />
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: createDeckTokens.previewDot,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MaterialIcons name="library-add" size={24} color={createDeckTokens.ink} />
        </View>
      </View>

      <Text
        style={{
          fontFamily: fonts.bodyMedium,
          fontSize: 15,
          lineHeight: 24,
          color: createDeckTokens.helperText,
        }}>
        {subtitle}
      </Text>
    </View>
  );
}
