import type {ReactNode} from 'react';
import {Text, View} from 'react-native';

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'default' | 'danger' | 'success';
};

const accentClasses = {
  default: 'text-text',
  danger: 'text-danger',
  success: 'text-success',
} as const;

export function StatCard({label, value, hint, accent = 'default'}: StatCardProps) {
  return (
    <View className="flex-1 bg-card rounded-huge border border-border p-4 min-h-[96px]">
      <Text className="text-label-md text-on-surface-variant uppercase mb-2">{label}</Text>
      <Text className={`text-headline-md font-display ${accentClasses[accent]}`}>
        {value}
      </Text>
      {hint ? <Text className="text-caption text-muted mt-1">{hint}</Text> : null}
    </View>
  );
}

type StatCardRowProps = {
  children: ReactNode;
};

export function StatCardRow({children}: StatCardRowProps) {
  return <View className="flex-row gap-3">{children}</View>;
}
