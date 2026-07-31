import {Pressable, Text, TextInput, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SilhouetteCard} from '../ui/SilhouetteCard';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';
import type {FlashcardDraft} from '../../types/api';

type PreviewCardEditorProps = {
  card: FlashcardDraft;
  index: number;
  onChange: (index: number, field: keyof FlashcardDraft, value: string) => void;
  onDelete?: () => void;
};

const INPUT_BG = '#F7F8F5';
const BADGE_BG = 'rgba(199, 243, 55, 0.3)';
const BADGE_TEXT = '#3C4D00';

export function PreviewCardEditor({
  card,
  index,
  onChange,
  onDelete,
}: PreviewCardEditorProps) {
  const labelStyle = {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.55,
    textTransform: 'uppercase' as const,
    color: colors.muted,
    marginBottom: 8,
  };

  const inputStyle = {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: libraryTokens.border,
    backgroundColor: INPUT_BG,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurface,
    minHeight: 96,
    textAlignVertical: 'top' as const,
  };

  return (
    <SilhouetteCard variant="review">
      <View
        style={{
          borderRadius: reviewTokens.cardRadius,
          borderWidth: 1,
          borderColor: reviewTokens.border,
          backgroundColor: reviewTokens.card,
          padding: 20,
        }}>
        <View className="flex-row items-center justify-between mb-6">
          <View
            style={{
              backgroundColor: BADGE_BG,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 12,
                color: BADGE_TEXT,
              }}>
              CARD {index + 1}
            </Text>
          </View>
          {onDelete ? (
            <Pressable
              onPress={onDelete}
              hitSlop={10}
              accessibilityLabel={`Delete card ${index + 1}`}
              accessibilityRole="button"
              className="active:scale-90"
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons name="delete" size={24} color={colors.danger} />
            </Pressable>
          ) : null}
        </View>

        <View style={{gap: 16}}>
          <View>
            <Text style={labelStyle}>Question</Text>
            <TextInput
              style={inputStyle}
              value={card.question}
              onChangeText={value => onChange(index, 'question', value)}
              multiline
              placeholder="Enter the question..."
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View>
            <Text style={labelStyle}>Answer</Text>
            <TextInput
              style={inputStyle}
              value={card.answer}
              onChangeText={value => onChange(index, 'answer', value)}
              multiline
              placeholder="Enter the answer..."
              placeholderTextColor={colors.placeholder}
            />
          </View>
        </View>
      </View>
    </SilhouetteCard>
  );
}
