import type {ReactNode} from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from 'react-native';
import {colors, fonts, layout, typography} from '../../config/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-container',
  secondary: 'bg-card border border-border',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
};

const labelColor: Record<ButtonVariant, string> = {
  primary: colors.onPrimaryContainer,
  secondary: colors.onSurface,
  ghost: colors.muted,
  danger: colors.white,
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  className,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-button px-5 flex-row items-center justify-center ${variantClasses[variant]} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      style={({pressed}) => [
        {
          minHeight: layout.ctaHeight,
          transform: [{scale: pressed && !isDisabled ? 0.98 : 1}],
        },
        typeof style === 'function' ? style({pressed}) : style,
      ]}
      disabled={isDisabled}
      {...props}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'secondary' || variant === 'ghost'
              ? colors.onSurface
              : colors.onPrimaryContainer
          }
        />
      ) : (
        <>
          {icon}
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: typography.labelLg.fontSize,
              lineHeight: typography.labelLg.lineHeight,
              color: labelColor[variant],
              marginLeft: icon ? 8 : 0,
            }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
