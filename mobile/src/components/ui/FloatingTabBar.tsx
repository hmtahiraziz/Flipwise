import {Pressable, Text, View, useWindowDimensions} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fonts} from '../../config/theme';
import {progressTokens} from '../../config/progressTokens';
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
  const barWidth = Math.min(width * 0.9, 448);

  return (
    <View
      className="absolute left-0 right-0 items-center"
      style={{
        bottom: Math.max(insets.bottom, 0) + libraryTokens.navBarBottomInset,
        paddingTop: libraryTokens.navBarTopInset,
      }}>
      <View
        className="flex-row items-center justify-between rounded-full"
        style={{
          width: barWidth,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderWidth: 1,
          borderColor: progressTokens.borderWarm,
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
              className="flex-1 flex-col items-center justify-center rounded-full active:scale-95"
              style={{
                paddingHorizontal: libraryTokens.navTabPaddingX,
                paddingVertical: libraryTokens.navTabPaddingY,
                backgroundColor: isActive ? progressTokens.brandGreen : 'transparent',
              }}
              onPress={() => onTabPress(tab.key)}>
              <MaterialIcons
                name={tab.icon}
                size={libraryTokens.navIconSize}
                color={isActive ? progressTokens.ink : progressTokens.mutedWarm}
              />
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: libraryTokens.navLabelSize,
                  lineHeight: 14,
                  letterSpacing: 0.5,
                  marginTop: 2,
                  textTransform: 'uppercase',
                  color: isActive ? progressTokens.ink : progressTokens.mutedWarm,
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
