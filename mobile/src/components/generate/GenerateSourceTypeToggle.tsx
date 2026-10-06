import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import type {GenerateSourceType} from '../../navigation/types';

const SOURCE_OPTIONS: Array<{
  value: GenerateSourceType;
  label: string;
  icon: string;
}> = [
  {value: 'topic', label: 'Topic', icon: 'auto-awesome'},
  {value: 'notes', label: 'Paste', icon: 'edit-note'},
  {value: 'pdf', label: 'PDF & Docs', icon: 'description'},
  {value: 'scan', label: 'Camera', icon: 'document-scanner'},
];

type GenerateSourceTypeToggleProps = {
  value: GenerateSourceType;
  onChange: (value: GenerateSourceType) => void;
};

export function GenerateSourceTypeToggle({
  value,
  onChange,
}: GenerateSourceTypeToggleProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6,
        padding: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: libraryTokens.border,
        backgroundColor: brandColors.surface,
      }}>
      {SOURCE_OPTIONS.map(option => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{selected}}
            className="active:opacity-90"
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
              paddingHorizontal: 4,
              borderRadius: 12,
              backgroundColor: selected ? brandColors.lime : 'transparent',
              gap: 2,
            }}>
            <MaterialIcons
              name={option.icon}
              size={16}
              color={selected ? brandColors.charcoal : '#70757D'}
            />
            <Text
              numberOfLines={1}
              style={{
                fontFamily: selected ? fonts.bodyBold : fonts.bodyMedium,
                fontSize: 11,
                color: selected ? brandColors.charcoal : '#70757D',
              }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
