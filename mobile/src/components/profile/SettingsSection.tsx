import type {ReactNode} from 'react';
import {Text, View} from 'react-native';

type SettingsSectionProps = {
  title?: string;
  children: ReactNode;
};

export function SettingsSection({title, children}: SettingsSectionProps) {
  return (
    <View className="mb-6">
      {title ? (
        <Text className="text-label-md text-on-surface-variant uppercase mb-3 px-1">
          {title}
        </Text>
      ) : null}
      <View className="bg-card rounded-huge border border-border overflow-hidden">
        {children}
      </View>
    </View>
  );
}

export function SettingsDivider() {
  return <View className="h-px bg-border ml-4" />;
}
