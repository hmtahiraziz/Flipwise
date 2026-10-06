import {Pressable, Text, View, useWindowDimensions} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {brandColors, fonts, layout} from '../../config/theme';
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
};

export function FloatingTabBar({tabs, activeKey, onTabPress}: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const barWidth = Math.min(width - 32, 448);

  return (
    <View
      className="absolute left-0 right-0 items-center"
      pointerEvents="box-none"
      style={{
        bottom: Math.max(insets.bottom, 0) + libraryTokens.navBarBottomInset,
        paddingTop: libraryTokens.navBarTopInset,
      }}>
      <View
        className="flex-row items-center justify-between rounded-full"
        style={{
          width: barWidth,
          backgroundColor: brandColors.surface,
          borderWidth: 1,
          borderColor: brandColors.border,
          paddingHorizontal: libraryTokens.navBarPadding,
          paddingVertical: libraryTokens.navBarPadding,
          ...libraryNavShadow,
        }}>
        {tabs.map(tab => {
          const isActive = tab.key === activeKey;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{selected: isActive}}
              accessibilityLabel={tab.label}
              className="flex-1 flex-col items-center justify-center rounded-full"
              style={{
                minHeight: layout.minTouchTarget,
                paddingHorizontal: 8,
                paddingVertical: libraryTokens.navTabPaddingY,
                backgroundColor: isActive ? brandColors.lime : 'transparent',
              }}
              onPress={() => onTabPress(tab.key)}>
              <MaterialIcons
                name={tab.icon}
                size={libraryTokens.navIconSize}
                color={isActive ? brandColors.charcoal : brandColors.muted}
              />
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: libraryTokens.navLabelSize,
                  lineHeight: 14,
                  letterSpacing: 0.5,
                  marginTop: 2,
                  textTransform: 'uppercase',
                  color: isActive ? brandColors.charcoal : brandColors.muted,
                }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
