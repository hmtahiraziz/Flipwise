import {useEffect, useState} from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {brandColors, fonts} from '../../config/theme';
import {libraryNavShadow, libraryTokens} from '../../config/libraryTokens';

export type TabItem = {
  key: string;
  label: string;
  icon: string;
};

type FloatingTabBarProps = {
  tabs: TabItem[];
  activeKey: string;
  onTabPress: (key: string) => void;
  onSettingsPress?: () => void;
  settingsActive?: boolean;
  /** Keep mounted; animate out instead of unmounting (avoids layout jump). */
  visible?: boolean;
};

const TAB_HEIGHT = 52;
const PILL_INSET = 2;
const HIDE_MS = 200;
const SPRING = {damping: 22, stiffness: 280, mass: 0.8};

type TabLayout = {x: number; width: number};

function TabButton({
  label,
  icon,
  active,
  onPress,
  onLayout,
  accessibilityRole = 'tab',
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
  accessibilityRole?: 'tab' | 'button';
}) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={{selected: active}}
      accessibilityLabel={label}
      onPress={onPress}
      onLayout={onLayout}
      style={{
        flex: 1,
        minWidth: 0,
        height: TAB_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 2,
        }}>
        <MaterialIcons
          name={icon}
          size={libraryTokens.navIconSize}
          color={active ? brandColors.charcoal : brandColors.muted}
        />
        <Text
          numberOfLines={1}
          style={{
            marginTop: 2,
            maxWidth: '100%',
            textAlign: 'center',
            fontFamily: fonts.bodySemiBold,
            fontSize: libraryTokens.navLabelSize,
            lineHeight: 12,
            letterSpacing: 0.15,
            includeFontPadding: false,
            textTransform: 'uppercase',
            color: active ? brandColors.charcoal : brandColors.muted,
          }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function FloatingTabBar({
  tabs,
  activeKey,
  onTabPress,
  onSettingsPress,
  settingsActive = false,
  visible = true,
}: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const barWidth = Math.min(width - 32, 448);

  const items: TabItem[] = onSettingsPress
    ? [...tabs, {key: '__settings', label: 'Settings', icon: 'settings'}]
    : tabs;

  const selectedKey = settingsActive ? '__settings' : activeKey;

  const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});
  const pillX = useSharedValue(0);
  const pillW = useSharedValue(0);
  const pillReady = useSharedValue(0);
  const visibility = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    visibility.value = withTiming(visible ? 1 : 0, {
      duration: HIDE_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, visibility]);

  useEffect(() => {
    const layout = layouts[selectedKey];
    if (!layout || layout.width <= 0) return;

    const targetX = layout.x + PILL_INSET;
    const targetW = Math.max(layout.width - PILL_INSET * 2, 0);

    if (pillReady.value === 0) {
      pillX.value = targetX;
      pillW.value = targetW;
      pillReady.value = 1;
      return;
    }

    pillX.value = withSpring(targetX, SPRING);
    pillW.value = withSpring(targetW, SPRING);
  }, [layouts, selectedKey, pillReady, pillW, pillX]);

  const setTabLayout = (key: string, e: LayoutChangeEvent) => {
    const {x, width: w} = e.nativeEvent.layout;
    setLayouts(prev => {
      const existing = prev[key];
      if (existing && existing.x === x && existing.width === w) return prev;
      return {...prev, [key]: {x, width: w}};
    });
  };

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillReady.value,
    transform: [{translateX: pillX.value}],
    width: pillW.value,
  }));

  const barContainerStyle = useAnimatedStyle(() => ({
    opacity: visibility.value,
    transform: [
      {
        translateY: interpolate(visibility.value, [0, 1], [24, 0]),
      },
    ],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          alignItems: 'center',
          bottom: Math.max(insets.bottom, 0) + libraryTokens.navBarBottomInset,
          paddingTop: libraryTokens.navBarTopInset,
        },
        barContainerStyle,
      ]}>
      <View
        style={{
          width: barWidth,
          backgroundColor: brandColors.surface,
          borderWidth: 1,
          borderColor: brandColors.border,
          borderRadius: libraryTokens.navBarRadius,
          paddingHorizontal: libraryTokens.navBarPadding,
          paddingVertical: libraryTokens.navBarPadding,
          ...libraryNavShadow,
        }}>
        {/* Inner row: pill + tabs share the same coordinate space */}
        <View
          style={{
            height: TAB_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            overflow: 'hidden',
            borderRadius: libraryTokens.navTabRadius,
          }}>
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: PILL_INSET,
                bottom: PILL_INSET,
                left: 0,
                borderRadius: libraryTokens.navTabRadius,
                backgroundColor: brandColors.lime,
              },
              pillStyle,
            ]}
          />

          {items.map(tab => {
            const isSettings = tab.key === '__settings';
            const active = tab.key === selectedKey;
            return (
              <TabButton
                key={tab.key}
                label={tab.label}
                icon={tab.icon}
                active={active}
                accessibilityRole={isSettings ? 'button' : 'tab'}
                onLayout={e => setTabLayout(tab.key, e)}
                onPress={() => {
                  if (isSettings) {
                    onSettingsPress?.();
                    return;
                  }
                  onTabPress(tab.key);
                }}
              />
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}
