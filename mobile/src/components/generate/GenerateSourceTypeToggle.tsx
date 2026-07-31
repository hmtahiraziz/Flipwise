import {Pressable, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {libraryTokens, libraryCardShadow} from '../../config/libraryTokens';

type SourceType = 'topic' | 'notes';

type GenerateSourceTypeToggleProps = {
  value: SourceType;
  onChange: (value: SourceType) => void;
};

export function GenerateSourceTypeToggle({
  value,
  onChange,
}: GenerateSourceTypeToggleProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: libraryTokens.border,
        backgroundColor: libraryTokens.surface,
        ...libraryCardShadow,
      }}>
      {(['topic', 'notes'] as const).map(type => {
        const selected = value === type;
        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            accessibilityRole="button"
            accessibilityState={{selected}}
            className="active:opacity-90"
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
              backgroundColor: selected
                ? libraryTokens.primaryContainer
                : 'transparent',
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 14,
                color: selected ? '#161E00' : libraryTokens.muted,
              }}>
              {type === 'topic' ? 'Topic' : 'Notes'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
