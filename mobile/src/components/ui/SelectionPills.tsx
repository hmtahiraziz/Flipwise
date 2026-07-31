import {Pressable, Text, View} from 'react-native';

type SelectionPillsProps<T extends string | number> = {
  options: Array<{value: T; label: string}>;
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
};

export function SelectionPills<T extends string | number>({
  options,
  value,
  onChange,
  size = 'sm',
}: SelectionPillsProps<T>) {
  const padding = size === 'md' ? 'px-6 py-2' : 'px-4 py-2';

  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map(option => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            className={`rounded-full border ${padding} active:scale-95 ${
              isActive
                ? 'bg-text border-text'
                : 'bg-silhouette border-border'
            }`}
            onPress={() => onChange(option.value)}>
            <Text
              className={`text-caption font-body-md ${
                isActive ? 'text-white' : 'text-muted'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
