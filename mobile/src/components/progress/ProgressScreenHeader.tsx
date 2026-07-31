import type {ReactNode} from 'react';
import {Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fonts} from '../../config/theme';
import {progressTokens} from '../../config/progressTokens';

type ProgressScreenHeaderProps = {
  title?: string;
  right?: ReactNode;
};

export function ProgressScreenHeader({
  title = 'Progress',
  right,
}: ProgressScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: progressTokens.borderWarm,
        backgroundColor: progressTokens.background,
      }}>
      <View
        className="flex-row items-center justify-between"
        style={{
          height: 64,
          paddingHorizontal: 20,
        }}>
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 24,
            lineHeight: 32,
            letterSpacing: -0.24,
            fontWeight: '700',
            color: progressTokens.ink,
          }}>
          {title}
        </Text>
        {right ? <View className="shrink-0">{right}</View> : null}
      </View>
    </View>
  );
}
