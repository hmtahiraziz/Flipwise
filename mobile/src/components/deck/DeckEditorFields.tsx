import {useState} from 'react';
import {Pressable, Text, TextInput, View} from 'react-native';
import {createDeckTokens, type DeckAccentColor} from '../../config/createDeckTokens';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';
import {SilhouetteCard} from '../ui/SilhouetteCard';

type FieldKey = 'title' | 'subject' | 'description';

type DeckEditorFieldsProps = {
  title: string;
  subject: string;
  description: string;
  onTitleChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  titleError?: string;
  subjectError?: string;
  descriptionError?: string;
  variant?: 'default' | 'create';
  accentColor?: DeckAccentColor;
  onAccentColorChange?: (color: DeckAccentColor) => void;
};

export function DeckEditorFields({
  title,
  subject,
  description,
  onTitleChange,
  onSubjectChange,
  onDescriptionChange,
  titleError,
  subjectError,
  descriptionError,
  variant = 'default',
  accentColor = createDeckTokens.accentSwatches[0],
  onAccentColorChange,
}: DeckEditorFieldsProps) {
  const [focusedField, setFocusedField] = useState<FieldKey | null>(null);
  const isCreate = variant === 'create';

  const labelStyle = {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.55,
    textTransform: 'uppercase' as const,
    color: isCreate ? createDeckTokens.helperText : colors.muted,
    marginBottom: 0,
  };

  const inputBorder = (field: FieldKey, hasError?: string) => {
    if (hasError) return libraryTokens.error;
    if (isCreate && focusedField === field) return createDeckTokens.focusBorder;
    return libraryTokens.border;
  };

  const singleLineStyle = (field: FieldKey, hasError?: string) => ({
    borderRadius: 12,
    borderWidth: 1,
    borderColor: inputBorder(field, hasError),
    backgroundColor: createDeckTokens.inputBg,
    paddingHorizontal: 16,
    height: 52,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurface,
  });

  const multilineStyle = (field: FieldKey, hasError?: string) => ({
    ...singleLineStyle(field, hasError),
    height: undefined as unknown as number,
    minHeight: 96,
    paddingVertical: 16,
    textAlignVertical: 'top' as const,
  });

  const fieldError = (message?: string) =>
    message ? (
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 13,
          color: libraryTokens.error,
          marginTop: 6,
        }}>
        {message}
      </Text>
    ) : null;

  const formBody = (
    <View style={{padding: 20, gap: 16}}>
      <View style={{gap: 8}}>
        <Text style={labelStyle}>Title</Text>
        <TextInput
          style={singleLineStyle('title', titleError)}
          value={title}
          onChangeText={onTitleChange}
          placeholder="e.g. Biology midterm"
          placeholderTextColor={`${createDeckTokens.helperText}80`}
          autoCapitalize="sentences"
          onFocus={() => setFocusedField('title')}
          onBlur={() => setFocusedField(current => (current === 'title' ? null : current))}
        />
        {fieldError(titleError)}
      </View>

      <View style={{gap: 8}}>
        <Text style={labelStyle}>Subject</Text>
        <TextInput
          style={singleLineStyle('subject', subjectError)}
          value={subject}
          onChangeText={onSubjectChange}
          placeholder="e.g. React Native, Biology"
          placeholderTextColor={`${createDeckTokens.helperText}80`}
          autoCapitalize="words"
          onFocus={() => setFocusedField('subject')}
          onBlur={() => setFocusedField(current => (current === 'subject' ? null : current))}
        />
        {fieldError(subjectError)}

        {isCreate && onAccentColorChange ? (
          <View className="flex-row" style={{gap: 12, marginTop: 4, paddingHorizontal: 4}}>
            {createDeckTokens.accentSwatches.map(color => {
              const selected = accentColor === color;
              return (
                <Pressable
                  key={color}
                  onPress={() => onAccentColorChange(color)}
                  accessibilityRole="button"
                  accessibilityLabel="Accent color"
                  accessibilityState={{selected}}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: selected ? 2 : 0,
                    borderColor: selected ? color : 'transparent',
                  }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: color,
                      borderWidth: 2,
                      borderColor: libraryTokens.surface,
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <View style={{gap: 8}}>
        <Text style={labelStyle}>Description (optional)</Text>
        <TextInput
          style={multilineStyle('description', descriptionError)}
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="What does this deck cover?"
          placeholderTextColor={`${createDeckTokens.helperText}80`}
          multiline
          onFocus={() => setFocusedField('description')}
          onBlur={() =>
            setFocusedField(current => (current === 'description' ? null : current))
          }
        />
        {fieldError(descriptionError)}
      </View>
    </View>
  );

  if (isCreate) {
    return (
      <View style={{position: 'relative'}}>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            right: -4,
            bottom: -4,
            borderRadius: createDeckTokens.cardRadius,
            backgroundColor: createDeckTokens.inputBg,
            zIndex: 0,
          }}
        />
        <View
          style={{
            position: 'relative',
            zIndex: 1,
            borderRadius: createDeckTokens.cardRadius,
            backgroundColor: libraryTokens.surface,
            overflow: 'hidden',
            ...createDeckTokens.cardShadow,
          }}>
          {formBody}
        </View>
      </View>
    );
  }

  return (
    <SilhouetteCard variant="review">
      <View
        style={{
          borderRadius: reviewTokens.cardRadius,
          borderWidth: 1,
          borderColor: reviewTokens.border,
          backgroundColor: reviewTokens.card,
        }}>
        {formBody}
      </View>
    </SilhouetteCard>
  );
}
