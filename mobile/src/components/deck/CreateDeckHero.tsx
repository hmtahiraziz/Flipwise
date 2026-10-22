import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {createDeckTokens} from '../../config/createDeckTokens';
import {brandColors, fonts} from '../../config/theme';

type CreateDeckHeroProps = {
  title?: string;
  subtitle: string;
  aiFlow?: boolean;
};

export function CreateDeckHero({
  title = 'Create a deck',
  subtitle,
  aiFlow = false,
}: CreateDeckHeroProps) {
  return (
    <View style={{gap: 14, marginBottom: 24}}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: brandColors.lime,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <MaterialIcons
          name={aiFlow ? 'auto-awesome' : 'library-add'}
          size={24}
          color={createDeckTokens.ink}
        />
      </View>

      <View style={{gap: 6}}>
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 26,
            lineHeight: 32,
            letterSpacing: -0.4,
            color: createDeckTokens.ink,
          }}>
          {title}
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 15,
            lineHeight: 22,
            color: createDeckTokens.helperText,
          }}>
          {subtitle}
        </Text>
      </View>

      {aiFlow ? (
        <View
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: 'rgba(198, 241, 53, 0.28)',
          }}>
          <MaterialIcons name="bolt" size={14} color={createDeckTokens.ink} />
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 11,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              color: createDeckTokens.ink,
            }}>
            AI cards next
          </Text>
        </View>
      ) : null}
    </View>
  );
}
