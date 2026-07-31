import {Text, TextInput, View, type TextInputProps} from 'react-native';
import {colors} from '../../config/theme';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({label, error, className, ...props}: InputProps & {className?: string}) {
  return (
    <View className="mb-5">
      <Text className="text-label font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
        {label}
      </Text>
      <TextInput
        className={`bg-surface-muted border rounded-input px-4 h-12 text-body text-text ${error ? 'border-danger' : 'border-border'} ${className ?? ''}`}
        placeholderTextColor={colors.placeholder}
        {...props}
      />
      {error ? <Text className="text-caption text-danger mt-1.5">{error}</Text> : null}
    </View>
  );
}
