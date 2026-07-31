import {ScrollView, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type LibraryStatsPillsProps = {
  streak: number;
  minutesToday: number;
  decksInProgress: number;
};

export function LibraryStatsPills({
  streak,
  minutesToday,
  decksInProgress,
}: LibraryStatsPillsProps) {
  const pills = [
    {emoji: '🔥', label: `${streak}-day streak`},
    {emoji: '⏱', label: `${minutesToday} min today`},
    {emoji: '🎯', label: `${decksInProgress} decks in progress`},
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: libraryTokens.elementGap,
        paddingBottom: 8,
        paddingRight: libraryTokens.containerPadding,
      }}>
      {pills.map(pill => (
        <View
          key={pill.label}
          accessibilityRole="text"
          className="flex-row items-center shrink-0 rounded-full"
          style={{
            backgroundColor: libraryTokens.surfaceContainerLow,
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 8,
          }}>
          <Text style={{fontSize: 14}}>{pill.emoji}</Text>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              lineHeight: 16,
              letterSpacing: 0.6,
              color: libraryTokens.ink,
            }}>
            {pill.label}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
