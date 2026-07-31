import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {progressTokens} from '../../config/progressTokens';

type DeckBreakdownRowProps = {
  icon: string;
  name: string;
  masteryPercent: number;
};

export function DeckBreakdownRow({icon, name, masteryPercent}: DeckBreakdownRowProps) {
  const clampedMastery = Math.min(100, Math.max(0, masteryPercent));

  return (
    <View
      className="flex-row items-center"
      style={{
        backgroundColor: progressTokens.background,
        borderWidth: 1,
        borderColor: progressTokens.borderWarm,
        borderRadius: progressTokens.tileRadius,
        padding: 16,
        gap: 12,
      }}>
      <View className="flex-row items-center flex-1 min-w-0" style={{gap: 16}}>
        <View
          className="items-center justify-center shrink-0"
          style={{
            width: 48,
            height: 48,
            borderRadius: progressTokens.tileRadius,
            backgroundColor: progressTokens.surfaceWarm,
          }}>
          <MaterialIcons name={icon} size={24} color={progressTokens.ink} />
        </View>
        <View className="flex-1 min-w-0">
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              lineHeight: 24,
              color: progressTokens.ink,
            }}
            numberOfLines={1}>
            {name}
          </Text>
          <Text
            style={{
              fontFamily: fonts.bodyMedium,
              fontSize: 12,
              lineHeight: 16,
              color: progressTokens.mutedWarm,
              marginTop: 2,
            }}>
            {clampedMastery}% Mastered
          </Text>
        </View>
      </View>

      <View
        style={{
          width: 96,
          height: 6,
          borderRadius: 999,
          backgroundColor: progressTokens.borderWarm,
          overflow: 'hidden',
          flexShrink: 0,
        }}>
        <View
          style={{
            height: '100%',
            width: `${clampedMastery}%`,
            backgroundColor: progressTokens.brandGreen,
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}
