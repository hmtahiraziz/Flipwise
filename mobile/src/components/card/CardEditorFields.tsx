import {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {toast} from '../ui/Toast';

type CardEditorFieldsProps = {
  question: string;
  answer: string;
  explanation?: string;
  hint?: string;
  cardType?: 'basic' | 'cloze';
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onExplanationChange?: (value: string) => void;
  onHintChange?: (value: string) => void;
  onCardTypeChange?: (value: 'basic' | 'cloze') => void;
  questionError?: string;
  answerError?: string;
  showPreview?: boolean;
  /** Shown in the Card Architecture row (edit existing card only). */
  onDelete?: () => void;
  deleting?: boolean;
};

const FRONT_MAX = 250;
const BACK_MAX = 500;
const CLOZE_BLANK = '____';

const ARCHITECTURE: Array<{
  value: 'basic' | 'cloze';
  label: string;
  icon: string;
  hint: string;
}> = [
  {
    value: 'basic',
    label: 'Basic Q&A',
    icon: 'view-carousel',
    hint: 'Question on the front, answer on the back',
  },
  {
    value: 'cloze',
    label: 'Fill-in-the-Blank',
    icon: 'subtitles',
    hint: 'Sentence with ____ — type the missing word on the back',
  },
];

/** Convert Anki-style {{c1::term}} into Cardweave ____ + answer. */
function convertAnkiCloze(front: string): {question: string; answer: string} | null {
  const match = front.match(/\{\{c\d+::([^}]+)\}\}/i);
  if (!match?.[1]) return null;
  const hidden = match[1].trim();
  if (!hidden) return null;
  return {
    question: front.replace(/\{\{c\d+::[^}]+\}\}/gi, CLOZE_BLANK).slice(0, FRONT_MAX),
    answer: hidden.slice(0, BACK_MAX),
  };
}

function fillBlankPreview(sentence: string, answer: string): string {
  const filled = answer.trim() || '…';
  if (sentence.includes(CLOZE_BLANK)) {
    return sentence.replace(CLOZE_BLANK, filled);
  }
  if (/_{3,}/.test(sentence)) {
    return sentence.replace(/_{3,}/, filled);
  }
  return sentence;
}

/** Tighten answer text for recall — keeps the user's meaning, no canned topic text. */
function polishAnswerLocally(raw: string): string {
  const normalized = raw
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!normalized) return normalized;

  const lines = normalized
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const looksListed = lines.some(line => /^([•\-\*]|\d+[.)])\s+/.test(line));

  if (looksListed) {
    return lines
      .map(line => {
        const body = line.replace(/^([•\-\*]|\d+[.)])\s+/, '').trim();
        if (!body) return '';
        const capped = body.charAt(0).toUpperCase() + body.slice(1);
        return `• ${capped}`;
      })
      .filter(Boolean)
      .join('\n');
  }

  const sentences = normalized
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const capped = s.charAt(0).toUpperCase() + s.slice(1);
      return /[.!?]$/.test(capped) ? capped : `${capped}.`;
    });

  if (sentences.length <= 1) {
    return sentences[0] ?? normalized;
  }

  if (sentences.length <= 4) {
    return sentences.map(s => `• ${s}`).join('\n');
  }

  return sentences.slice(0, 5).map(s => `• ${s}`).join('\n');
}

export function CardEditorFields({
  question,
  answer,
  explanation = '',
  hint = '',
  cardType = 'basic',
  onQuestionChange,
  onAnswerChange,
  onExplanationChange,
  onHintChange,
  onCardTypeChange,
  questionError,
  answerError,
  showPreview = true,
  onDelete,
  deleting = false,
}: CardEditorFieldsProps) {
  const isCloze = cardType === 'cloze';
  const [previewFront, setPreviewFront] = useState(true);
  const [polishing, setPolishing] = useState(false);
  const [selection, setSelection] = useState({start: 0, end: 0});
  const questionRef = useRef<TextInput>(null);

  const hasBlank =
    question.includes(CLOZE_BLANK) || /_{3,}/.test(question);

  const handlePolish = () => {
    if (!answer.trim()) {
      toast.error('Nothing to polish', 'Write an answer first.');
      return;
    }
    setPolishing(true);
    setTimeout(() => {
      const next = polishAnswerLocally(answer);
      if (next === answer.trim() || next === answer) {
        toast.info('Already clear', 'No polish changes were needed.');
      } else {
        onAnswerChange(next.slice(0, BACK_MAX));
        toast.success('Polished', 'Answer tightened for clearer recall.');
      }
      setPolishing(false);
    }, 280);
  };

  const handleArchitecture = (value: 'basic' | 'cloze') => {
    if (value === 'cloze') {
      const converted = convertAnkiCloze(question);
      if (converted) {
        onQuestionChange(converted.question);
        if (!answer.trim()) {
          onAnswerChange(converted.answer);
        }
        toast.info('Converted', 'Anki cloze syntax → Cardweave blank.');
      }
    }
    onCardTypeChange?.(value);
  };

  const onSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    setSelection(event.nativeEvent.selection);
  };

  /** Insert ____ at cursor, or turn the selected word into the blank + answer. */
  const insertOrHideBlank = () => {
    const start = selection.start;
    const end = selection.end;
    const selected = question.slice(start, end).trim();

    if (selected) {
      const nextQuestion = `${question.slice(0, start)}${CLOZE_BLANK}${question.slice(end)}`.slice(
        0,
        FRONT_MAX,
      );
      onQuestionChange(nextQuestion);
      if (!answer.trim()) {
        onAnswerChange(selected.slice(0, BACK_MAX));
      }
      toast.success('Blank set', `Hidden: “${selected}”`);
      return;
    }

    if (hasBlank) {
      toast.info('Blank already set', 'Select a word to replace it with the blank.');
      return;
    }

    const insertAt = start;
    const next = `${question.slice(0, insertAt)}${CLOZE_BLANK}${question.slice(insertAt)}`.slice(
      0,
      FRONT_MAX,
    );
    onQuestionChange(next);
    const caret = Math.min(insertAt + CLOZE_BLANK.length, next.length);
    setSelection({start: caret, end: caret});
  };

  const previewFrontText = isCloze
    ? question.trim() || `The ${CLOZE_BLANK} is the powerhouse of the cell.`
    : question.trim() || 'Your question appears here';

  const previewBackText = isCloze
    ? fillBlankPreview(
        question.trim() || `The ${CLOZE_BLANK} is the powerhouse of the cell.`,
        answer.trim() || 'mitochondria',
      )
    : answer.trim() || 'Your answer appears here';

  return (
    <View style={{gap: 20}}>
      {onCardTypeChange ? (
        <View style={{gap: 10}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 4,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.66,
                textTransform: 'uppercase',
                color: libraryTokens.muted,
              }}>
              Card type
            </Text>
            {onDelete ? (
              <Pressable
                accessibilityLabel="Delete card"
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
                  <ActivityIndicator
                    size="small"
                    color={brandColors.dangerIcon}
                  />
                ) : (
                  <MaterialIcons
                    name="delete-outline"
                    size={18}
                    color={brandColors.dangerIcon}
                  />
                )}
              </Pressable>
            ) : null}
          </View>

          <View style={{flexDirection: 'row', gap: 8}}>
            {ARCHITECTURE.map(option => {
              const selected = cardType === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{selected}}
                  onPress={() => handleArchitecture(option.value)}
                  className="active:opacity-90"
                  style={{
                    flex: 1,
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    borderRadius: 16,
                    backgroundColor: selected
                      ? libraryTokens.primaryContainer
                      : brandColors.surface,
                    borderWidth: selected ? 0 : 1,
                    borderColor: libraryTokens.border,
                  }}>
                  <View
                    style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <MaterialIcons
                      name={option.icon}
                      size={18}
                      color={brandColors.charcoal}
                    />
                    <Text
                      style={{
                        fontFamily: selected
                          ? fonts.bodyBold
                          : fonts.bodySemiBold,
                        fontSize: 13,
                        color: brandColors.charcoal,
                      }}>
                      {option.label}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 11,
                      lineHeight: 15,
                      color: libraryTokens.muted,
                    }}>
                    {option.hint}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {isCloze ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
                padding: 12,
                borderRadius: 14,
                backgroundColor: brandColors.paleLime,
              }}>
              <MaterialIcons
                name="lightbulb-outline"
                size={18}
                color={brandColors.olive}
                style={{marginTop: 1}}
              />
              <Text
                style={{
                  flex: 1,
                  fontFamily: fonts.body,
                  fontSize: 13,
                  lineHeight: 18,
                  color: brandColors.charcoal,
                }}>
                Write a full sentence, mark the gap with{' '}
                <Text style={{fontFamily: fonts.bodyBold}}>{CLOZE_BLANK}</Text>,
                then put only the missing word on the back.
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* FRONT */}
      <View
        style={{
          backgroundColor: brandColors.surface,
          borderRadius: 20,
          padding: 16,
          gap: 12,
          borderWidth: 1,
          borderColor: libraryTokens.borderSubtle,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                backgroundColor: libraryTokens.secondaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 11,
                  color: libraryTokens.onSecondaryContainer,
                }}>
                {isCloze ? 'S' : 'F'}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.66,
                textTransform: 'uppercase',
                color: libraryTokens.muted,
              }}>
              {isCloze ? 'Sentence with blank' : 'Front (Prompt / Question)'}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: libraryTokens.muted,
            }}>
            {Math.min(question.length, FRONT_MAX)} / {FRONT_MAX}
          </Text>
        </View>

        {isCloze ? (
          <View style={{flexDirection: 'row', gap: 8}}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                selection.start !== selection.end
                  ? 'Hide selected word as blank'
                  : 'Insert blank'
              }
              onPress={insertOrHideBlank}
              className="active:opacity-90"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: libraryTokens.primaryContainer,
              }}>
              <MaterialIcons
                name="space-bar"
                size={16}
                color={brandColors.charcoal}
              />
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: brandColors.charcoal,
                }}>
                {selection.start !== selection.end
                  ? 'Hide selection'
                  : `Insert ${CLOZE_BLANK}`}
              </Text>
            </Pressable>
            {hasBlank ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  backgroundColor: libraryTokens.surfaceContainerLow,
                }}>
                <MaterialIcons
                  name="check-circle"
                  size={14}
                  color={brandColors.olive}
                />
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 11,
                    color: brandColors.olive,
                  }}>
                  Blank ready
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View
          style={{
            backgroundColor: libraryTokens.surfaceContainerLow,
            borderRadius: 14,
            padding: 12,
            minHeight: isCloze ? 110 : 96,
            borderWidth: questionError ? 1.5 : 0,
            borderColor: libraryTokens.error,
          }}>
          <TextInput
            ref={questionRef}
            value={question}
            onChangeText={text => {
              let next = text.slice(0, FRONT_MAX);
              if (isCloze && /\{\{c\d+::/i.test(next)) {
                const converted = convertAnkiCloze(next);
                if (converted) {
                  onQuestionChange(converted.question);
                  if (!answer.trim()) onAnswerChange(converted.answer);
                  return;
                }
              }
              onQuestionChange(next);
            }}
            onSelectionChange={onSelectionChange}
            multiline
            placeholder={
              isCloze
                ? `The ${CLOZE_BLANK} is the powerhouse of the cell.`
                : 'Type prompt or question...'
            }
            placeholderTextColor={`${libraryTokens.muted}80`}
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              lineHeight: 22,
              color: libraryTokens.ink,
              minHeight: isCloze ? 86 : 72,
              textAlignVertical: 'top',
              padding: 0,
            }}
          />
        </View>
        {questionError ? (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: libraryTokens.error,
            }}>
            {questionError}
          </Text>
        ) : isCloze && question.trim() && !hasBlank ? (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: libraryTokens.muted,
            }}>
            Tip: select the word to hide, then tap Hide selection — or insert{' '}
            {CLOZE_BLANK} manually.
          </Text>
        ) : null}
      </View>

      {/* BACK */}
      <View
        style={{
          backgroundColor: brandColors.surface,
          borderRadius: 20,
          padding: 16,
          gap: 12,
          borderWidth: 1,
          borderColor: libraryTokens.borderSubtle,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                backgroundColor: libraryTokens.tertiaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 11,
                  color: libraryTokens.tertiary,
                }}>
                {isCloze ? 'A' : 'B'}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.66,
                textTransform: 'uppercase',
                color: libraryTokens.muted,
              }}>
              {isCloze
                ? 'Answer (missing word / phrase)'
                : 'Back (Target Concept & Definition)'}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: libraryTokens.muted,
            }}>
            {Math.min(answer.length, BACK_MAX)} / {BACK_MAX}
          </Text>
        </View>

        {!isCloze ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 8,
            }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Polish with AI"
              disabled={polishing}
              onPress={handlePolish}
              className="active:opacity-90"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: libraryTokens.secondaryContainer,
                opacity: polishing ? 0.7 : 1,
              }}>
              <MaterialIcons
                name={polishing ? 'sync' : 'auto-fix-high'}
                size={16}
                color={libraryTokens.onSecondaryContainer}
              />
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: libraryTokens.onSecondaryContainer,
                }}>
                {polishing ? 'Polishing…' : 'Polish with AI'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View
          style={{
            backgroundColor: libraryTokens.surfaceContainerLow,
            borderRadius: 14,
            padding: 12,
            minHeight: isCloze ? 72 : 120,
            borderWidth: answerError ? 1.5 : 0,
            borderColor: libraryTokens.error,
          }}>
          <TextInput
            value={answer}
            onChangeText={text => onAnswerChange(text.slice(0, BACK_MAX))}
            multiline={!isCloze}
            placeholder={
              isCloze
                ? 'e.g. mitochondria'
                : 'Write full concept definition...'
            }
            placeholderTextColor={`${libraryTokens.muted}80`}
            style={{
              fontFamily: isCloze ? fonts.bodySemiBold : fonts.body,
              fontSize: isCloze ? 18 : 14,
              lineHeight: isCloze ? 24 : 20,
              color: libraryTokens.ink,
              minHeight: isCloze ? 48 : 96,
              textAlignVertical: isCloze ? 'center' : 'top',
              padding: 0,
            }}
          />
        </View>
        {answerError ? (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: libraryTokens.error,
            }}>
            {answerError}
          </Text>
        ) : isCloze ? (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: libraryTokens.muted,
            }}>
            Keep this short — only what fills the blank during review.
          </Text>
        ) : null}
      </View>

      {onHintChange || onExplanationChange ? (
        <View
          style={{
            backgroundColor: brandColors.surface,
            borderRadius: 20,
            padding: 16,
            gap: 12,
            borderWidth: 1,
            borderColor: libraryTokens.borderSubtle,
          }}>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 11,
              letterSpacing: 0.66,
              textTransform: 'uppercase',
              color: libraryTokens.muted,
            }}>
            Optional extras
          </Text>
          {onHintChange ? (
            <TextInput
              value={hint}
              onChangeText={onHintChange}
              placeholder="Hint (shown during review)"
              placeholderTextColor={`${libraryTokens.muted}80`}
              style={{
                backgroundColor: libraryTokens.surfaceContainerLow,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontFamily: fonts.body,
                fontSize: 13,
                color: libraryTokens.ink,
              }}
            />
          ) : null}
          {onExplanationChange ? (
            <TextInput
              value={explanation}
              onChangeText={onExplanationChange}
              multiline
              placeholder="Explanation / takeaway"
              placeholderTextColor={`${libraryTokens.muted}80`}
              style={{
                backgroundColor: libraryTokens.surfaceContainerLow,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                minHeight: 64,
                fontFamily: fonts.body,
                fontSize: 13,
                color: libraryTokens.ink,
                textAlignVertical: 'top',
              }}
            />
          ) : null}
        </View>
      ) : null}

      {/* Live preview */}
      {showPreview ? (
        <View style={{gap: 8}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 4,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.66,
                textTransform: 'uppercase',
                color: libraryTokens.muted,
              }}>
              {isCloze ? 'Blank preview' : 'Real-Time Study Simulation'}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <MaterialIcons
                name="touch-app"
                size={14}
                color={libraryTokens.primary}
              />
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 11,
                  color: libraryTokens.primary,
                }}>
                Tap to flip
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Flip preview card"
            onPress={() => setPreviewFront(v => !v)}
            className="active:opacity-95"
            style={{
              backgroundColor: brandColors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: libraryTokens.borderSubtle,
              gap: 12,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: previewFront
                    ? libraryTokens.secondaryContainer
                    : libraryTokens.primaryContainer,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 11,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    color: brandColors.charcoal,
                  }}>
                  {previewFront
                    ? isCloze
                      ? 'Prompt (blank)'
                      : 'Front View'
                    : isCloze
                      ? 'Revealed'
                      : 'Back Answer'}
                </Text>
              </View>
              <MaterialIcons
                name="flip"
                size={20}
                color={`${libraryTokens.muted}66`}
              />
            </View>
            <View style={{minHeight: 110, justifyContent: 'center', gap: 10}}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 16,
                  lineHeight: 22,
                  color: libraryTokens.ink,
                  textAlign: 'center',
                }}>
                {previewFront ? previewFrontText : previewBackText}
              </Text>
              {!previewFront && isCloze && answer.trim() ? (
                <View
                  style={{
                    alignSelf: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: brandColors.paleLime,
                  }}>
                  <Text
                    style={{
                      fontFamily: fonts.bodyBold,
                      fontSize: 13,
                      color: brandColors.olive,
                    }}>
                    {answer.trim()}
                  </Text>
                </View>
              ) : null}
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: libraryTokens.borderSubtle,
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 11,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: `${libraryTokens.muted}99`,
                }}>
                Tap to Flip
              </Text>
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
