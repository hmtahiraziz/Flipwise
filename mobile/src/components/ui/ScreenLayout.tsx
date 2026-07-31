import type {ReactNode} from 'react';
import {Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

type ScreenLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  variant?: 'default' | 'card';
};

export function ScreenLayout({
  children,
  title,
  subtitle,
  footer,
  variant = 'default',
}: ScreenLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 py-5">
        {(title || subtitle) && (
          <View className="mb-8">
            {title ? (
              <Text className="text-headline-md font-display text-text tracking-tight">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text className="text-body text-muted mt-2 leading-6">{subtitle}</Text>
            ) : null}
          </View>
        )}
        <View className={`flex-1 ${variant === 'card' ? 'bg-card rounded-huge border border-border p-6' : ''}`}>
          {children}
        </View>
        {footer ? <View className="pt-5">{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}
