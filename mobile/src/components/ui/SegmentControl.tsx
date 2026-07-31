import {Pressable, Text, View} from 'react-native';

type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentControlProps<T>) {
  return (
    <View className="flex-row p-1 bg-silhouette rounded-button border border-border">
      {options.map(option => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            className={`flex-1 py-2 px-4 rounded-button items-center active:opacity-90 ${
              isActive ? 'bg-card border border-border shadow-sm' : ''
            }`}
            onPress={() => onChange(option.value)}>
            <Text
              className={`text-body-md font-semibold ${
                isActive ? 'text-text' : 'text-muted'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
