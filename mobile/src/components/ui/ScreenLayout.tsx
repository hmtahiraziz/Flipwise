import type {ReactNode} from 'react';
import {
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {SafeAreaView} from 'react-native-safe-area-context';
import {fonts, layout, typography} from '../../config/theme';
import {contentContainerStyle, useScreenLayout} from '../../hooks/useScreenLayout';
import {keyboardScrollProps} from './KeyboardSafeView';
import {useThemeColors} from '../../theme/ThemeProvider';

type ScreenLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  stickyFooter?: ReactNode;
  variant?: 'default' | 'card';
  scroll?: boolean;
  keyboard?: boolean;
  tabBarInset?: boolean;
  maxWidth?: number;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  contentStyle?: StyleProp<ViewStyle>;
  className?: string;
};

export function ScreenLayout({
  children,
  title,
  subtitle,
  footer,
  stickyFooter,
  variant = 'default',
  scroll = false,
  keyboard = false,
  tabBarInset = false,
  maxWidth,
  edges = ['top', 'left', 'right'],
  contentStyle,
  className,
}: ScreenLayoutProps) {
  const colors = useThemeColors();
  const screen = useScreenLayout(maxWidth ?? layout.contentMaxWidthTablet);

  const bottomPad = tabBarInset
    ? screen.tabScrollBottomPadding
    : stickyFooter
      ? screen.scrollBottomPadding
      : screen.footerBottom;

  const containerPad = contentContainerStyle(screen, bottomPad);

  const titleBlock =
    title || subtitle ? (
      <View className="mb-6">
        {title ? (
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: fonts.displayMedium,
              fontSize: typography.headlineLg.fontSize,
              lineHeight: typography.headlineLg.lineHeight,
              color: colors.onSurface,
            }}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: typography.bodyMd.fontSize,
              lineHeight: typography.bodyMd.lineHeight,
              color: colors.muted,
              marginTop: 8,
            }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    ) : null;

  const body = (
    <View
      className={`flex-1 ${variant === 'card' ? 'bg-card rounded-huge border border-border p-4' : ''}`}
      style={contentStyle}>
      {children}
    </View>
  );

  const scrollBody = (
    <>
      {titleBlock}
      {body}
      {footer ? <View className="pt-5">{footer}</View> : null}
    </>
  );

  const main = scroll ? (
    keyboard ? (
      <KeyboardAwareScrollView
        className="flex-1"
        bottomOffset={24}
        {...keyboardScrollProps}
        contentContainerStyle={containerPad}
        showsVerticalScrollIndicator={false}>
        {scrollBody}
      </KeyboardAwareScrollView>
    ) : (
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={containerPad}
        showsVerticalScrollIndicator={false}>
        {scrollBody}
      </ScrollView>
    )
  ) : (
    <View className="flex-1" style={containerPad}>
      {titleBlock}
      {body}
      {footer ? <View className="pt-5">{footer}</View> : null}
    </View>
  );

  const sticky = stickyFooter ? (
    <View
      style={{
        paddingBottom: Math.max(screen.insets.bottom, 12),
        paddingHorizontal: screen.horizontalPadding,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
      {stickyFooter}
    </View>
  ) : null;

  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 ${className ?? ''}`}
      style={{backgroundColor: colors.background}}>
      <View className="flex-1">
        {main}
        {sticky}
      </View>
    </SafeAreaView>
  );
}
