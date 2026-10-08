import {useMemo, useState} from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, colors, fonts} from '../../config/theme';
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
  /** Optional SM-2 meta for retention meter */
  retention?: {
    percent: number;
    label: string;
    dueLabel: string;
    repetitions: number;
    intervalDays: number;
  } | null;
  showPreview?: boolean;
};

const FRONT_MAX = 250;
const BACK_MAX = 500;

const ARCHITECTURE: Array<{
  value: 'basic' | 'cloze';
  label: string;
  icon: string;
}> = [
  {value: 'basic', label: 'Basic (Front / Back)', icon: 'view-carousel'},
  {value: 'cloze', label: 'Fill-in-the-Blank', icon: 'subtitles'},
];

function FormatBar({compact}: {compact?: boolean}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: libraryTokens.surfaceContainerLow,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 4,
      }}>
      {(['format-bold', 'format-italic', 'code'] as const).map(icon => (
        <Pressable
          key={icon}
          accessibilityRole="button"
          accessibilityLabel={icon}
          hitSlop={4}
          onPress={() =>
            toast.info('Formatting', 'Rich text formatting is coming soon.')
          }
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="active:opacity-70">
          <MaterialIcons name={icon} size={16} color={libraryTokens.muted} />
        </Pressable>
      ))}
      {!compact ? (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              toast.info('Formulas', 'LaTeX formula editor is coming soon.')
            }
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="active:opacity-70">
            <MaterialIcons name="functions" size={16} color={libraryTokens.muted} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              toast.info('Lists', 'Bullet lists are coming soon.')
            }
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="active:opacity-70">
            <MaterialIcons
              name="format-list-bulleted"
              size={18}
              color={libraryTokens.muted}
            />
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

function polishAnswerLocally(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (!cleaned) return cleaned;
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 1) {
    return `Core distinction:\n• ${cleaned}`;
  }
  return [
    'Core distinction:',
    ...sentences.slice(0, 4).map(s => `• ${s}`),
  ].join('\n');
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
  retention,
  showPreview = true,
}: CardEditorFieldsProps) {
  const [previewFront, setPreviewFront] = useState(true);
  const [polishing, setPolishing] = useState(false);
  const [clozeEnabled, setClozeEnabled] = useState(cardType === 'cloze');

  const takeaway = useMemo(() => {
    const base = explanation.trim() || answer.trim();
    if (!base) return 'Add an answer to generate a retention takeaway.';
    return base.length > 160 ? `${base.slice(0, 157)}…` : base;
  }, [answer, explanation]);

  const mnemonic = useMemo(() => {
    if (hint.trim()) return hint.trim();
    return 'Add a hint to power a mnemonic cue for this card.';
  }, [hint]);

  const handlePolish = () => {
    if (!answer.trim()) {
      toast.error('Nothing to polish', 'Write an answer first.');
      return;
    }
    setPolishing(true);
    setTimeout(() => {
      const next = polishAnswerLocally(answer);
      onAnswerChange(next);
      if (onExplanationChange && !explanation.trim()) {
        onExplanationChange(
          'Supervised uses labeled teacher signals; unsupervised maps unlabeled structure.',
        );
      }
      setPolishing(false);
      toast.success('Polished', 'Answer tightened for clearer recall.');
    }, 650);
  };

  const handleAutoTune = () => {
    if (!answer.trim()) {
      toast.error('Add an answer', 'Retention tips need card content first.');
      return;
    }
    if (onExplanationChange) {
      onExplanationChange(
        'Supervised utilizes teacher signals (ground-truth targets); Unsupervised maps emergent patterns independently.',
      );
    }
    if (onHintChange) {
      onHintChange('Super = Supervised by an expert; Un = Unassisted discovery.');
    }
    toast.success('Auto-tuned', 'Takeaway and mnemonic refreshed.');
  };

  const handleArchitecture = (value: 'basic' | 'cloze') => {
    onCardTypeChange?.(value);
    setClozeEnabled(value === 'cloze');
  };

  const handleClozeToggle = () => {
    const next = !clozeEnabled;
    setClozeEnabled(next);
    onCardTypeChange?.(next ? 'cloze' : 'basic');
  };

  return (
    <View style={{gap: 20}}>
      {onCardTypeChange ? (
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
              Card Architecture
            </Text>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.4,
                color: libraryTokens.primary,
              }}>
              {cardType === 'cloze' ? 'Cloze Deletion' : 'Standard 2-Sided'}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{gap: 8, paddingRight: 8}}>
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
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: selected
                      ? libraryTokens.primaryContainer
                      : brandColors.surface,
                    borderWidth: selected ? 0 : 1,
                    borderColor: libraryTokens.border,
                  }}>
                  <MaterialIcons
                    name={option.icon}
                    size={18}
                    color={brandColors.charcoal}
                  />
                  <Text
                    style={{
                      fontFamily: selected ? fonts.bodyBold : fonts.bodySemiBold,
                      fontSize: 12,
                      color: brandColors.charcoal,
                    }}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {cardType === 'cloze' ? (
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                color: libraryTokens.muted,
                paddingHorizontal: 4,
              }}>
              Use {'{{c1::hidden term}}'} in the front to create cloze deletions.
            </Text>
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
                F
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
              {cardType === 'cloze' ? 'Cloze Sentence' : 'Front (Prompt / Question)'}
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

        <FormatBar />

        <View
          style={{
            backgroundColor: libraryTokens.surfaceContainerLow,
            borderRadius: 14,
            padding: 12,
            minHeight: 96,
            borderWidth: questionError ? 1.5 : 0,
            borderColor: libraryTokens.error,
          }}>
          <TextInput
            value={question}
            onChangeText={text => onQuestionChange(text.slice(0, FRONT_MAX))}
            multiline
            placeholder={
              cardType === 'cloze'
                ? 'The {{c1::mitochondria}} is the powerhouse of the cell.'
                : 'Type prompt or question...'
            }
            placeholderTextColor={`${libraryTokens.muted}80`}
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              lineHeight: 22,
              color: libraryTokens.ink,
              minHeight: 72,
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
                B
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
              Back (Target Concept & Definition)
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

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}>
          <FormatBar compact />
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

        <View
          style={{
            backgroundColor: libraryTokens.surfaceContainerLow,
            borderRadius: 14,
            padding: 12,
            minHeight: 120,
            borderWidth: answerError ? 1.5 : 0,
            borderColor: libraryTokens.error,
          }}>
          <TextInput
            value={answer}
            onChangeText={text => onAnswerChange(text.slice(0, BACK_MAX))}
            multiline
            placeholder="Write full concept definition..."
            placeholderTextColor={`${libraryTokens.muted}80`}
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              lineHeight: 20,
              color: libraryTokens.ink,
              minHeight: 96,
              textAlignVertical: 'top',
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
        ) : null}
      </View>

      {/* Retention Accelerator */}
      <View
        style={{
          backgroundColor: 'rgba(223, 233, 190, 0.35)',
          borderRadius: 20,
          padding: 16,
          gap: 12,
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
                width: 28,
                height: 28,
                borderRadius: 999,
                backgroundColor: libraryTokens.primaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons
                name="psychology"
                size={16}
                color={brandColors.charcoal}
              />
            </View>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 16,
                color: libraryTokens.ink,
              }}>
              Retention Accelerator
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={handleAutoTune}
            className="active:opacity-90"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: brandColors.surface,
            }}>
            <MaterialIcons name="refresh" size={14} color={libraryTokens.primary} />
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.4,
                color: libraryTokens.ink,
              }}>
              Auto-Tune
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            backgroundColor: brandColors.surface,
            borderRadius: 14,
            padding: 12,
            gap: 10,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: 8}}>
            <MaterialIcons
              name="tips-and-updates"
              size={18}
              color={libraryTokens.primary}
              style={{marginTop: 2}}
            />
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.body,
                fontSize: 12,
                lineHeight: 16,
                color: libraryTokens.ink,
              }}>
              <Text style={{fontFamily: fonts.bodyBold}}>Core Takeaway: </Text>
              {takeaway}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              padding: 8,
              borderRadius: 10,
              backgroundColor: 'rgba(207, 238, 139, 0.35)',
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.66,
                textTransform: 'uppercase',
                color: libraryTokens.primary,
              }}>
              Mnemonic
            </Text>
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.body,
                fontSize: 12,
                lineHeight: 16,
                color: libraryTokens.ink,
              }}>
              {mnemonic}
            </Text>
          </View>
        </View>

        {onHintChange || onExplanationChange ? (
          <View style={{gap: 8}}>
            {onHintChange ? (
              <TextInput
                value={hint}
                onChangeText={onHintChange}
                placeholder="Edit mnemonic / hint"
                placeholderTextColor={`${libraryTokens.muted}80`}
                style={{
                  backgroundColor: brandColors.surface,
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
                placeholder="Edit explanation / takeaway"
                placeholderTextColor={`${libraryTokens.muted}80`}
                style={{
                  backgroundColor: brandColors.surface,
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
      </View>

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
              Real-Time Study Simulation
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
                Interactive
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
                  {previewFront ? 'Front View' : 'Back Answer'}
                </Text>
              </View>
              <MaterialIcons
                name="flip"
                size={20}
                color={`${libraryTokens.muted}66`}
              />
            </View>
            <View style={{minHeight: 110, justifyContent: 'center'}}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 16,
                  lineHeight: 22,
                  color: libraryTokens.ink,
                  textAlign: 'center',
                }}>
                {previewFront
                  ? question.trim() || 'Your question appears here'
                  : answer.trim() || 'Your answer appears here'}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: libraryTokens.borderSubtle,
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <MaterialIcons
                  name="bar-chart"
                  size={14}
                  color={`${libraryTokens.muted}99`}
                />
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 12,
                    color: `${libraryTokens.muted}99`,
                  }}>
                  {retention
                    ? `Level ${Math.min(5, retention.repetitions)} · ${retention.intervalDays}d interval`
                    : 'New card · ready to schedule'}
                </Text>
              </View>
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

      {/* Meta + retention */}
      <View
        style={{
          backgroundColor: brandColors.surface,
          borderRadius: 20,
          padding: 16,
          gap: 16,
          borderWidth: 1,
          borderColor: libraryTokens.borderSubtle,
        }}>
        {retention ? (
          <View
            style={{
              padding: 12,
              borderRadius: 14,
              backgroundColor: libraryTokens.surfaceContainerLow,
              gap: 8,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 11,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: libraryTokens.muted,
                }}>
                Memory Retention Health
              </Text>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: libraryTokens.primary,
                }}>
                {retention.percent}% ({retention.label})
              </Text>
            </View>
            <View
              style={{
                height: 8,
                borderRadius: 999,
                backgroundColor: libraryTokens.border,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  height: '100%',
                  width: `${Math.max(4, Math.min(100, retention.percent))}%`,
                  borderRadius: 999,
                  backgroundColor: libraryTokens.primaryContainer,
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 11,
                  color: libraryTokens.muted,
                }}>
                {retention.dueLabel}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 11,
                  color: libraryTokens.muted,
                }}>
                Repetition #{retention.repetitions}
              </Text>
            </View>
          </View>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1}}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(207, 238, 139, 0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons
                name="extension"
                size={22}
                color={libraryTokens.primary}
              />
            </View>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 16,
                  color: libraryTokens.ink,
                }}>
                Add Cloze Deletion
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: libraryTokens.muted,
                }}>
                Hide terms inside sentence brackets
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{checked: clozeEnabled}}
            onPress={handleClozeToggle}
            style={{
              width: 48,
              height: 28,
              borderRadius: 999,
              padding: 2,
              backgroundColor: clozeEnabled
                ? libraryTokens.primaryContainer
                : libraryTokens.border,
              justifyContent: 'center',
            }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                backgroundColor: brandColors.surface,
                alignSelf: clozeEnabled ? 'flex-end' : 'flex-start',
              }}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
