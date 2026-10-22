import {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {createDeckTokens, type DeckAccentColor} from '../../config/createDeckTokens';
import {brandColors, colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';

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
  /** Shown inside the edit form card (not create). */
  onDelete?: () => void;
  deleting?: boolean;
  autoFocusTitle?: boolean;
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
  onDelete,
  deleting = false,
  autoFocusTitle = false,
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
      {onDelete && !isCreate ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={labelStyle}>Deck details</Text>
          <Pressable
            accessibilityLabel="Delete deck"
            accessibilityRole="button"
            onPress={onDelete}
            disabled={deleting}
            hitSlop={6}
            className="active:opacity-80"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: brandColors.dangerBg,
              opacity: deleting ? 0.6 : 1,
            }}>
            {deleting ? (
              <ActivityIndicator size="small" color={brandColors.dangerIcon} />
            ) : (
              <MaterialIcons
                name="delete-outline"
                size={18}
                color={brandColors.dangerIcon}
              />
            )}
          </Pressable>
        </View>
      ) : null}

      <View style={{gap: 8}}>
        <Text style={labelStyle}>Title</Text>
        <TextInput
          style={singleLineStyle('title', titleError)}
          value={title}
          onChangeText={onTitleChange}
          placeholder="e.g. Biology midterm"
          placeholderTextColor={`${createDeckTokens.helperText}80`}
          autoCapitalize="sentences"
          autoFocus={autoFocusTitle}
          returnKeyType="next"
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
          placeholder="e.g. Chemistry, History"
          placeholderTextColor={`${createDeckTokens.helperText}80`}
          autoCapitalize="words"
          returnKeyType="next"
          onFocus={() => setFocusedField('subject')}
          onBlur={() => setFocusedField(current => (current === 'subject' ? null : current))}
        />
        {fieldError(subjectError)}
      </View>

      {isCreate && onAccentColorChange ? (
        <View style={{gap: 8}}>
          <Text style={labelStyle}>Accent color</Text>
          <View className="flex-row" style={{gap: 12, paddingHorizontal: 2}}>
            {createDeckTokens.accentSwatches.map(color => {
              const selected = accentColor === color;
              return (
                <Pressable
                  key={color}
                  onPress={() => onAccentColorChange(color)}
                  accessibilityRole="button"
                  accessibilityLabel={`Accent ${color}`}
                  accessibilityState={{selected}}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: selected ? 2 : 0,
                    borderColor: brandColors.charcoal,
                  }}>
                  <View
                    style={{
                      width: selected ? 22 : 26,
                      height: selected ? 22 : 26,
                      borderRadius: 13,
                      backgroundColor: color,
                      borderWidth: color === '#F7F8F5' ? 1 : 0,
                      borderColor: libraryTokens.border,
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

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

  // Flat surface card — no outer border / drop shadow (matches Edit Card / Generate).
  return (
    <View
      style={{
        borderRadius: isCreate
          ? createDeckTokens.cardRadius
          : reviewTokens.cardRadius,
        backgroundColor: libraryTokens.surface,
        overflow: 'hidden',
      }}>
      {formBody}
    </View>
  );
}
