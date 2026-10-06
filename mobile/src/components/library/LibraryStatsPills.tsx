import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type LibraryStatsPillsProps = {
  streak: number;
  minutesToday: number;
  decksInProgress: number;
};

const SUBTEXT = '#70757D';

export function LibraryStatsPills({
  streak,
  minutesToday,
  decksInProgress,
}: LibraryStatsPillsProps) {
  return (
    <View
      accessibilityRole="summary"
      className="flex-row items-center justify-between"
      style={{
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderWidth: 1,
        borderColor: 'rgba(229,231,226,0.6)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}>
      <View className="flex-row items-center" style={{gap: 6}}>
        <Text style={{fontSize: 14}}>🔥</Text>
        <Text style={{fontFamily: fonts.body, fontSize: 12, color: SUBTEXT}}>
          Streak:
        </Text>
        <Text
          style={{
            fontFamily: fonts.bodyBold,
            fontSize: 12,
            color: libraryTokens.ink,
          }}>
          {streak} day{streak === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={{width: 1, height: 12, backgroundColor: libraryTokens.border}} />

      <View className="flex-row items-center" style={{gap: 6}}>
        <MaterialIcons name="schedule" size={14} color={SUBTEXT} />
        <Text
          style={{
            fontFamily: fonts.bodyBold,
            fontSize: 12,
            color: libraryTokens.ink,
          }}>
          {minutesToday} min today
        </Text>
      </View>

      <View style={{width: 1, height: 12, backgroundColor: libraryTokens.border}} />

      <View className="flex-row items-center" style={{gap: 6}}>
        <Text style={{fontSize: 14}}>🎯</Text>
        <Text
          style={{
            fontFamily: fonts.bodyBold,
            fontSize: 12,
            color: libraryTokens.ink,
          }}>
          {decksInProgress}
        </Text>
      </View>
    </View>
  );
}
