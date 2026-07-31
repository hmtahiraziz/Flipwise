import type {ReactNode} from 'react';
import {Pressable, Switch, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../../config/theme';

type SettingsRowProps = {
  label: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  destructive?: boolean;
  showChevron?: boolean;
  right?: ReactNode;
};

export function SettingsRow({
  label,
  subtitle,
  icon,
  onPress,
  value,
  onValueChange,
  destructive = false,
  showChevron = true,
  right,
}: SettingsRowProps) {
  const isSwitch = typeof value === 'boolean' && !!onValueChange;
  const content = (
    <View className="flex-row items-center px-4 py-4 min-h-[52px]">
      {icon ? (
        <MaterialIcons
          name={icon}
          size={20}
          color={destructive ? colors.danger : colors.muted}
          style={{marginRight: 12}}
        />
      ) : null}
      <View className="flex-1 pr-3">
        <Text
          className={`text-body-md font-medium ${destructive ? 'text-danger' : 'text-text'}`}>
          {label}
        </Text>
        {subtitle ? (
          <Text className="text-caption text-muted mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
      {right ??
        (isSwitch ? (
          <Switch value={value} onValueChange={onValueChange} />
        ) : showChevron && onPress ? (
          <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
        ) : null)}
    </View>
  );

  if (onPress && !isSwitch) {
    return (
      <Pressable className="active:opacity-70" onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}
