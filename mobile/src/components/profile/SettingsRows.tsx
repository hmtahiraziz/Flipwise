import type {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SettingsToggle} from './SettingsToggle';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type SettingsDetailRowProps = {
  label: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  right?: ReactNode;
};

export function SettingsDetailRow({
  label,
  subtitle,
  onPress,
  showChevron = true,
  right,
}: SettingsDetailRowProps) {
  const content = (
    <View
      className="flex-row items-center justify-between"
      style={{paddingHorizontal: 20, paddingVertical: 20, gap: 12}}>
      <View className="flex-1 min-w-0">
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 16,
            lineHeight: 24,
            color: libraryTokens.ink,
          }}>
          {label}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontFamily: fonts.bodyMedium,
              fontSize: 13,
              lineHeight: 18,
              color: libraryTokens.muted,
              marginTop: 2,
            }}
            numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ??
        (showChevron && onPress ? (
          <MaterialIcons name="chevron-right" size={22} color={libraryTokens.muted} />
        ) : null)}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {content}
      </Pressable>
    );
  }

  return content;
}

type SettingsLinkRowProps = {
  label: string;
  icon: string;
  onPress?: () => void;
  trailingIcon?: 'chevron-right' | 'open-in-new';
  disabled?: boolean;
};

export function SettingsLinkRow({
  label,
  icon,
  onPress,
  trailingIcon = 'chevron-right',
  disabled,
}: SettingsLinkRowProps) {
  const content = (
    <View
      className="flex-row items-center justify-between"
      style={{
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
        opacity: disabled ? 0.5 : 1,
      }}>
      <View className="flex-row items-center flex-1 min-w-0" style={{gap: 12}}>
        <MaterialIcons name={icon} size={22} color={libraryTokens.muted} />
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 16,
            lineHeight: 24,
            color: libraryTokens.ink,
          }}>
          {label}
        </Text>
      </View>
      {onPress ? (
        <MaterialIcons name={trailingIcon} size={22} color={libraryTokens.muted} />
      ) : null}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {content}
      </Pressable>
    );
  }

  return content;
}

type SettingsToggleRowProps = {
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function SettingsToggleRow({
  label,
  subtitle,
  value,
  onValueChange,
  disabled,
}: SettingsToggleRowProps) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{paddingHorizontal: 20, paddingVertical: 20, gap: 12}}>
      <View className="flex-1 min-w-0 pr-2">
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 16,
            lineHeight: 24,
            color: libraryTokens.ink,
          }}>
          {label}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontFamily: fonts.bodyMedium,
              fontSize: 13,
              lineHeight: 18,
              color: libraryTokens.muted,
              marginTop: 2,
            }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <SettingsToggle value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  );
}

type SettingsComingSoonRowProps = {
  label: string;
  icon: string;
};

export function SettingsComingSoonRow({label, icon}: SettingsComingSoonRowProps) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{paddingHorizontal: 20, paddingVertical: 20, gap: 12, opacity: 0.5}}>
      <View className="flex-row items-center flex-1 min-w-0" style={{gap: 12}}>
        <MaterialIcons name={icon} size={22} color={libraryTokens.muted} />
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 16,
            lineHeight: 24,
            color: libraryTokens.ink,
          }}>
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: fonts.bodyMedium,
          fontSize: 13,
          lineHeight: 18,
          fontStyle: 'italic',
          color: libraryTokens.muted,
        }}>
        Coming soon
      </Text>
    </View>
  );
}
