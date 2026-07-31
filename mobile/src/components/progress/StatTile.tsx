import {Pressable, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {progressTokens} from '../../config/progressTokens';

type StatTileProps = {
  label: string;
  value: number;
  onPress?: () => void;
};

export function StatTile({label, value, onPress}: StatTileProps) {
  const content = (
    <View
      className="flex-1 items-center justify-center"
      style={{
        backgroundColor: progressTokens.surfaceWarm,
        borderRadius: progressTokens.tileRadius,
        paddingVertical: 16,
        paddingHorizontal: 8,
        minHeight: 88,
      }}>
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: 10,
          lineHeight: 14,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: progressTokens.mutedWarm,
          marginBottom: 4,
          textAlign: 'center',
        }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: 24,
          lineHeight: 32,
          letterSpacing: -0.48,
          color: progressTokens.ink,
        }}>
        {value}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable className="flex-1 active:opacity-90" onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}
