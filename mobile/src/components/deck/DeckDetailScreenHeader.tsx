import type {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fonts} from '../../config/theme';
import {deckDetailTokens} from '../../config/deckDetailTokens';

type DeckDetailScreenHeaderProps = {
  title: string;
  onBack: () => void;
  right?: ReactNode;
  onTitleLongPress?: () => void;
  compact?: boolean;
};

export function DeckDetailScreenHeader({
  title,
  onBack,
  right,
  onTitleLongPress,
  compact,
}: DeckDetailScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 8) + 8,
        paddingBottom: 16,
        paddingHorizontal: deckDetailTokens.containerPadding,
        backgroundColor: deckDetailTokens.surface,
      }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 min-w-0" style={{gap: 16}}>
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="active:opacity-70"
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
            }}>
            <MaterialIcons name="arrow-back" size={24} color={deckDetailTokens.ink} />
          </Pressable>
          <Pressable
            onLongPress={onTitleLongPress}
            disabled={!onTitleLongPress}
            className="flex-1 min-w-0">
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: compact ? 22 : 24,
                lineHeight: compact ? 28 : 32,
                fontWeight: '800',
                letterSpacing: -0.48,
                color: deckDetailTokens.ink,
              }}
              numberOfLines={1}>
              {title}
            </Text>
          </Pressable>
        </View>
        {right ? (
          <View
            className="shrink-0 items-center justify-center"
            style={{width: 40, marginLeft: 12}}>
            {right}
          </View>
        ) : null}
      </View>
    </View>
  );
}
