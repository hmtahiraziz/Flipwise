import {Text, View} from 'react-native';
import {createDeckTokens} from '../../config/createDeckTokens';
import {libraryTokens} from '../../config/libraryTokens';
import {fonts} from '../../config/theme';

type DeckLivePreviewBadgeProps = {
  label: string;
};

export function DeckLivePreviewBadge({label}: DeckLivePreviewBadgeProps) {
  return (
    <View className="items-center" style={{marginTop: 24}}>
      <View
        className="flex-row items-center"
        style={{
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: createDeckTokens.previewBadgeBg,
          borderWidth: 1,
          borderColor: 'rgba(229, 231, 235, 0.4)',
        }}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: createDeckTokens.previewDot,
          }}
        />
        <Text
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize: 12,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: createDeckTokens.helperText,
          }}
          numberOfLines={1}>
          Live Preview: {label}
        </Text>
      </View>
    </View>
  );
}
