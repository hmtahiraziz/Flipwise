import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {SilhouetteCard} from '../ui/SilhouetteCard';

type DeckStatTileProps = {
  icon: string;
  iconColor: string;
  value: string | number;
  label: string;
};

export function DeckStatTile({icon, iconColor, value, label}: DeckStatTileProps) {
  return (
    <SilhouetteCard style={{flex: 1}} borderRadius={20}>
      <View
        className="items-center p-4"
        style={{
          backgroundColor: libraryTokens.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: libraryTokens.border,
          minHeight: 108,
          justifyContent: 'center',
        }}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
        <Text
          style={{
            fontFamily: fonts.displayMedium,
            fontSize: 18,
            lineHeight: 24,
            color: libraryTokens.ink,
            marginTop: 4,
          }}>
          {value}
        </Text>
        <Text
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize: 11,
            lineHeight: 14,
            color: libraryTokens.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            marginTop: 2,
            textAlign: 'center',
          }}>
          {label}
        </Text>
      </View>
    </SilhouetteCard>
  );
}
