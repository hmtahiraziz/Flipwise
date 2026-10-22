import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {progressTokens} from '../../config/progressTokens';

type StreakCardProps = {
  streakDays: number;
  longestStreak?: number;
  message: string;
};

export function StreakCard({
  streakDays,
  longestStreak,
  message,
}: StreakCardProps) {
  const best = Math.max(longestStreak ?? 0, streakDays);

  return (
    <View
      className="flex-row items-center"
      style={{
        backgroundColor: progressTokens.background,
        borderRadius: progressTokens.cardRadius,
        borderWidth: 1,
        borderColor: progressTokens.borderWarm,
        padding: 20,
        gap: 18,
      }}>
      <View
        className="items-center justify-center shrink-0"
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: progressTokens.brandGreen,
        }}>
        <MaterialIcons
          name="local-fire-department"
          size={30}
          color={progressTokens.ink}
        />
      </View>
      <View className="flex-1 min-w-0">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 8,
          }}>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 24,
              lineHeight: 32,
              letterSpacing: -0.48,
              color: progressTokens.ink,
              flexShrink: 1,
            }}>
            {streakDays} day streak
          </Text>
          {best > 0 ? (
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 12,
                color: progressTokens.mutedWarm,
              }}>
              Best {best}
            </Text>
          ) : null}
        </View>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            lineHeight: 20,
            color: progressTokens.mutedWarm,
            marginTop: 4,
          }}>
          {message}
        </Text>
      </View>
    </View>
  );
}
