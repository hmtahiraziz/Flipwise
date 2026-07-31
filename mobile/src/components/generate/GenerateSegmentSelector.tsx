import {Pressable, ScrollView, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {libraryTokens, libraryCardShadow} from '../../config/libraryTokens';
import {GenerateFieldLabel} from './GenerateFieldLabel';

type Option<T> = {value: T; label: string};

type GenerateSegmentSelectorProps<T extends string | number> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  scrollable?: boolean;
};

/** Tone / quantity row — white surface container, lime selected pill (mockup). */
export function GenerateSegmentSelector<T extends string | number>({
  label,
  options,
  value,
  onChange,
  scrollable,
}: GenerateSegmentSelectorProps<T>) {
  const row = (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        padding: 8,
      }}>
      {options.map(option => {
        const selected = value === option.value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{selected}}
            className="active:opacity-90"
            style={{
              flex: scrollable ? 0 : 1,
              minWidth: scrollable ? 108 : undefined,
              minHeight: 40,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: selected
                ? libraryTokens.primaryContainer
                : 'transparent',
            }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: selected ? fonts.bodySemiBold : fonts.bodyMedium,
                fontSize: 14,
                lineHeight: 20,
                color: selected ? '#161E00' : libraryTokens.muted,
                textAlign: 'center',
              }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={{gap: 8}}>
      <GenerateFieldLabel>{label}</GenerateFieldLabel>
      <View
        style={{
          borderRadius: 20,
          borderWidth: 1,
          borderColor: libraryTokens.border,
          backgroundColor: libraryTokens.surface,
          overflow: 'hidden',
          ...libraryCardShadow,
          shadowOpacity: 0.06,
        }}>
        {scrollable ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{flexGrow: 1}}>
            {row}
          </ScrollView>
        ) : (
          row
        )}
      </View>
    </View>
  );
}
