import {Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type ProfileStatTileProps = {
  label: string;
  value: string | number;
  accent?: 'default' | 'danger' | 'brand';
};

export function ProfileStatTile({label, value, accent = 'default'}: ProfileStatTileProps) {
  const valueColor =
    accent === 'danger'
      ? libraryTokens.error
      : accent === 'brand'
        ? libraryTokens.primary
        : libraryTokens.ink;

  return (
    <View className="flex-1 items-center" style={{paddingVertical: 4}}>
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: 11,
          letterSpacing: 0.55,
          textTransform: 'uppercase',
          color: libraryTokens.muted,
          marginBottom: 8,
          textAlign: 'center',
        }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: 28,
          lineHeight: 36,
          letterSpacing: -0.56,
          fontWeight: '700',
          color: valueColor,
        }}>
        {value}
      </Text>
    </View>
  );
}
