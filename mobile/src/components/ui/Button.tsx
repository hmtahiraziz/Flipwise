import type {ReactNode} from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from 'react-native';
import {colors} from '../../config/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-container border border-primary border-b-2',
  secondary: 'bg-card border border-border',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-on-primary-container',
  secondary: 'text-text',
  ghost: 'text-muted',
  danger: 'text-white',
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  className,
  ...props
}: ButtonProps & {className?: string}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={`rounded-button py-4 px-5 flex-row items-center justify-center active:opacity-90 ${variantClasses[variant]} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      disabled={isDisabled}
      {...props}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'secondary' || variant === 'ghost'
              ? colors.text
              : colors.onPrimaryContainer
          }
        />
      ) : (
        <>
          {icon}
          <Text className={`font-semibold text-body ${labelClasses[variant]}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
