import {Pressable, Text, TextInput, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, elevation, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import type {FlashcardDraft} from '../../types/api';

type PreviewCardEditorProps = {
  card: FlashcardDraft;
  index: number;
  total?: number;
  onChange: (index: number, field: keyof FlashcardDraft, value: string) => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
  cardType?: string;
};

const SUBTEXT = '#70757D';

export function PreviewCardEditor({
  card,
  index,
  total,
  onChange,
  onDelete,
  onRegenerate,
  cardType = 'Concept Check',
}: PreviewCardEditorProps) {
  const labelStyle = {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    color: SUBTEXT,
    marginBottom: 6,
  };

  const inputStyle = {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: libraryTokens.border,
    backgroundColor: 'rgba(247,248,244,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: brandColors.charcoal,
    minHeight: 48,
    textAlignVertical: 'top' as const,
  };

  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: libraryTokens.border,
        backgroundColor: brandColors.surface,
        padding: 16,
        ...elevation.tier1,
      }}>
      <View className="flex-row items-center justify-between" style={{marginBottom: 14}}>
        <View className="flex-row items-center flex-1" style={{gap: 8, paddingRight: 8}}>
          <View
            style={{
              backgroundColor: brandColors.paleLime,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                color: brandColors.olive,
              }}>
              CARD {index + 1}
              {total != null ? ` OF ${total}` : ''}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: libraryTokens.background,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 11,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                color: SUBTEXT,
              }}>
              {cardType}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center" style={{gap: 2}}>
          {onRegenerate ? (
            <Pressable
              onPress={onRegenerate}
              hitSlop={8}
              accessibilityLabel={`Regenerate card ${index + 1}`}
              className="active:opacity-70"
              style={{
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}>
              <MaterialIcons name="refresh" size={16} color={SUBTEXT} />
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              accessibilityLabel={`Delete card ${index + 1}`}
              className="active:opacity-70"
              style={{
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}>
              <MaterialIcons name="delete" size={16} color="#DC2626" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={{gap: 14}}>
        <View>
          <Text style={labelStyle}>Question</Text>
          <TextInput
            style={inputStyle}
            value={card.question}
            onChangeText={value => onChange(index, 'question', value)}
            multiline
            placeholder="Enter the question..."
            placeholderTextColor={SUBTEXT}
          />
        </View>

        <View>
          <Text style={labelStyle}>Answer & Key takeaways</Text>
          <TextInput
            style={{...inputStyle, fontFamily: fonts.body, minHeight: 88}}
            value={card.answer}
            onChangeText={value => onChange(index, 'answer', value)}
            multiline
            placeholder="Enter the answer..."
            placeholderTextColor={SUBTEXT}
          />
        </View>
      </View>
    </View>
  );
}
