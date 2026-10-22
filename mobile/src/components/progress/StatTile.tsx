import {Pressable, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {progressTokens} from '../../config/progressTokens';

type StatTileProps = {
  label: string;
  value: number;
  hint?: string;
  onPress?: () => void;
};

export function StatTile({label, value, hint, onPress}: StatTileProps) {
  const content = (
    <View
      className="flex-1 items-center justify-center"
      style={{
        backgroundColor: progressTokens.background,
        borderRadius: progressTokens.tileRadius,
        borderWidth: 1,
        borderColor: progressTokens.borderWarm,
        paddingVertical: 14,
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
      {hint ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 11,
            lineHeight: 14,
            color: progressTokens.mutedWarm,
            marginTop: 2,
            textAlign: 'center',
          }}
          numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
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
