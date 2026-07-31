import {Pressable, Text, TextInput, View} from 'react-native';
import {SilhouetteCard} from '../ui/SilhouetteCard';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';

type CardEditorFieldsProps = {
  question: string;
  answer: string;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  questionError?: string;
  answerError?: string;
};

const INPUT_BG = '#F7F8F5';

export function CardEditorFields({
  question,
  answer,
  onQuestionChange,
  onAnswerChange,
  questionError,
  answerError,
}: CardEditorFieldsProps) {
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
    borderColor: questionError || answerError ? libraryTokens.error : libraryTokens.border,
    backgroundColor: INPUT_BG,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurface,
    minHeight: 120,
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
          gap: 16,
        }}>
        <View>
          <Text style={labelStyle}>Question</Text>
          <TextInput
            style={inputStyle}
            value={question}
            onChangeText={onQuestionChange}
            multiline
            placeholder="What should you recall?"
            placeholderTextColor={colors.placeholder}
          />
          {questionError ? (
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: libraryTokens.error,
                marginTop: 6,
              }}>
              {questionError}
            </Text>
          ) : null}
        </View>

        <View>
          <Text style={labelStyle}>Answer</Text>
          <TextInput
            style={[
              inputStyle,
              {borderColor: answerError ? libraryTokens.error : libraryTokens.border},
            ]}
            value={answer}
            onChangeText={onAnswerChange}
            multiline
            placeholder="The correct answer"
            placeholderTextColor={colors.placeholder}
          />
          {answerError ? (
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: libraryTokens.error,
                marginTop: 6,
              }}>
              {answerError}
            </Text>
          ) : null}
        </View>
      </View>
    </SilhouetteCard>
  );
}
