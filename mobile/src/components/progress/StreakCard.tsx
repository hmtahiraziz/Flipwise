import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {progressTokens} from '../../config/progressTokens';

type StreakCardProps = {
  streakDays: number;
  message: string;
};

export function StreakCard({streakDays, message}: StreakCardProps) {
  return (
    <View
      className="flex-row items-center"
      style={{
        backgroundColor: progressTokens.surfaceWarm,
        borderRadius: progressTokens.cardRadius,
        padding: 24,
        gap: 24,
      }}>
      <View
        className="items-center justify-center shrink-0"
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: progressTokens.brandGreen,
        }}>
        <MaterialIcons
          name="local-fire-department"
          size={30}
          color={progressTokens.ink}
        />
      </View>
      <View className="flex-1 min-w-0">
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 24,
            lineHeight: 32,
            letterSpacing: -0.48,
            color: progressTokens.ink,
          }}>
          {streakDays} day streak
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 16,
            lineHeight: 22,
            color: progressTokens.mutedWarm,
            marginTop: 4,
          }}>
          {message}
        </Text>
      </View>
    </View>
  );
}
