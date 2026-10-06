import type {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fonts} from '../../config/theme';
import {deckDetailTokens} from '../../config/deckDetailTokens';
import {BlurSurface} from '../ui/BlurSurface';

type DeckDetailScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onMore?: () => void;
  right?: ReactNode;
  compact?: boolean;
};

export function DeckDetailScreenHeader({
  title,
  subtitle,
  onBack,
  onMore,
  right,
  compact,
}: DeckDetailScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurSurface
      fallbackOpacity={0.92}
      style={{
        paddingTop: Math.max(insets.top, 8),
        backgroundColor: 'rgba(247, 248, 244, 0.88)',
        borderBottomWidth: 1,
        borderBottomColor: deckDetailTokens.borderSubtle,
      }}>
      <View
        style={{
          minHeight: 64,
          paddingHorizontal: deckDetailTokens.containerPadding,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
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
            backgroundColor: deckDetailTokens.surfaceWarm,
          }}>
          <MaterialIcons name="arrow-back" size={22} color={deckDetailTokens.ink} />
        </Pressable>

        <View style={{flex: 1, minWidth: 0}}>
          <Text
            style={{
              fontFamily: fonts.displaySemiBold,
              fontSize: compact ? 18 : 20,
              lineHeight: compact ? 24 : 26,
              color: deckDetailTokens.ink,
            }}
            numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: deckDetailTokens.primary,
                marginTop: 1,
              }}
              numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {onMore ? (
          <Pressable
            onPress={onMore}
            hitSlop={8}
            accessibilityLabel="Deck options"
            accessibilityRole="button"
            className="active:opacity-70"
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              backgroundColor: deckDetailTokens.surfaceWarm,
            }}>
            <MaterialIcons name="more-vert" size={22} color={deckDetailTokens.ink} />
          </Pressable>
        ) : null}

        {right ? <View style={{marginLeft: 2}}>{right}</View> : null}
      </View>
    </BlurSurface>
  );
}
