import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {BlurSurface} from '../../components/ui/BlurSurface';
import {quizTokens} from '../../config/quizTokens';
import {fonts} from '../../config/theme';
import {useCards} from '../../hooks/useCards';
import {useDeck} from '../../hooks/useDecks';
import {useScreenLayout} from '../../hooks/useScreenLayout';
import type {ProgressStackParamList} from '../../navigation/types';
import type {Flashcard} from '../../types/api';

type Props = NativeStackScreenProps<ProgressStackParamList, 'QuizSession'>;

type QuizMode = 'mcq' | 'typed';
type Phase = 'ready' | 'active' | 'results';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildChoices(card: Flashcard, pool: Flashcard[]): string[] {
  const distractors = shuffle(
    pool.filter(c => c.id !== card.id).map(c => c.answer),
  ).slice(0, 3);
  return shuffle([card.answer, ...distractors]);
}

const CHOICE_LETTERS = ['A', 'B', 'C', 'D'] as const;

export function QuizSessionScreen({navigation, route}: Props) {
  const {deckId} = route.params;
  const insets = useSafeAreaInsets();
  const layout = useScreenLayout();
  const {data: deck} = useDeck(deckId);
  const {data: cards = [], isLoading} = useCards(deckId);

  const [phase, setPhase] = useState<Phase>('ready');
  const [mode, setMode] = useState<QuizMode>('mcq');
  const [questionCount, setQuestionCount] = useState(10);
  const [quizCards, setQuizCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [finishedAt, setFinishedAt] = useState(0);

  const deckTitle = deck?.title?.trim() || 'Practice Quiz';
  const maxAvailable = Math.min(20, cards.length);
  const countOptions = useMemo(() => {
    const opts = [5, 10, 15, 20].filter(n => n <= maxAvailable);
    if (maxAvailable >= 2 && !opts.includes(maxAvailable) && maxAvailable < 5) {
      return [maxAvailable];
    }
    return opts.length ? opts : maxAvailable >= 2 ? [maxAvailable] : [];
  }, [maxAvailable]);

  const current = quizCards[index];
  const choices = useMemo(
    () => (current && mode === 'mcq' ? buildChoices(current, cards) : []),
    [current, cards, mode],
  );

  const progress =
    quizCards.length > 0 ? (index + (revealed ? 1 : 0)) / quizCards.length : 0;

  const startQuiz = useCallback(() => {
    const size = Math.min(questionCount, cards.length);
    const selectedCards = shuffle(cards).slice(0, size);
    setQuizCards(selectedCards);
    setIndex(0);
    setTyped('');
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
    setStartedAt(Date.now());
    setFinishedAt(0);
    setPhase('active');
  }, [cards, questionCount]);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!current || revealed) return;
      const ok = normalize(answer) === normalize(current.answer);
      setSelected(answer);
      setRevealed(true);
      if (ok) setCorrectCount(c => c + 1);
    },
    [current, revealed],
  );

  const next = useCallback(() => {
    if (index + 1 >= quizCards.length) {
      setFinishedAt(Date.now());
      setPhase('results');
      return;
    }
    setIndex(i => i + 1);
    setTyped('');
    setSelected(null);
    setRevealed(false);
  }, [index, quizCards.length]);

  const elapsedSec = Math.max(
    1,
    Math.round(((finishedAt || Date.now()) - (startedAt || Date.now())) / 1000),
  );

  const header = (
    <BlurSurface
      fallbackOpacity={0.92}
      style={{
        paddingTop: Math.max(insets.top, 8),
        backgroundColor: 'rgba(247, 248, 244, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: quizTokens.borderSubtle,
      }}>
      <View
        style={{
          minHeight: 56,
          paddingHorizontal: 16,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="active:opacity-70"
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: quizTokens.surfaceLow,
          }}>
          <MaterialIcons name="arrow-back" size={22} color={quizTokens.ink} />
        </Pressable>
        <View style={{flex: 1, minWidth: 0}}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fonts.displaySemiBold,
              fontSize: 18,
              color: quizTokens.ink,
            }}>
            {phase === 'results' ? 'Session Results' : 'Practice Quiz'}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 11,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: quizTokens.primary,
            }}>
            {deckTitle}
          </Text>
        </View>
        {phase === 'active' ? (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: quizTokens.brand,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 12,
                color: quizTokens.ink,
              }}>
              {index + 1}/{quizCards.length}
            </Text>
          </View>
        ) : null}
      </View>
      {phase === 'active' ? (
        <View
          style={{
            height: 4,
            backgroundColor: quizTokens.surfaceLow,
          }}>
          <View
            style={{
              height: '100%',
              width: `${Math.max(4, Math.round(progress * 100))}%`,
              backgroundColor: quizTokens.brand,
            }}
          />
        </View>
      ) : null}
    </BlurSurface>
  );

  if (isLoading) {
    return (
      <View style={{flex: 1, backgroundColor: quizTokens.background}}>
        {header}
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color={quizTokens.primary} />
        </View>
      </View>
    );
  }

  if (cards.length < 2) {
    return (
      <View style={{flex: 1, backgroundColor: quizTokens.background}}>
        {header}
        <View
          style={{
            padding: 24,
            gap: 16,
            maxWidth: 480,
            width: '100%',
            alignSelf: 'center',
          }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: quizTokens.surfaceLow,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons name="quiz" size={28} color={quizTokens.muted} />
          </View>
          <Text
            style={{
              fontFamily: fonts.displaySemiBold,
              fontSize: 24,
              color: quizTokens.ink,
            }}>
            Not enough cards
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              lineHeight: 20,
              color: quizTokens.muted,
            }}>
            Add at least 2 cards to this deck to unlock multiple-choice practice.
          </Text>
          <Pressable
            onPress={() => navigation.goBack()}
            className="active:opacity-90"
            style={{
              height: 52,
              borderRadius: 16,
              backgroundColor: quizTokens.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 15,
                color: quizTokens.ink,
              }}>
              Go back
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === 'results') {
    const accuracy = Math.round((correctCount / quizCards.length) * 100);
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    const grade =
      accuracy >= 90
        ? 'Excellent'
        : accuracy >= 70
          ? 'Strong'
          : accuracy >= 50
            ? 'Building'
            : 'Keep practicing';

    return (
      <View style={{flex: 1, backgroundColor: quizTokens.background}}>
        {header}
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: 24,
            paddingBottom: insets.bottom + 32,
            gap: 16,
            maxWidth: 560,
            width: '100%',
            alignSelf: 'center',
          }}>
          <View
            style={{
              backgroundColor: quizTokens.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: quizTokens.borderSubtle,
              padding: 24,
              alignItems: 'center',
              gap: 12,
            }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 999,
                backgroundColor: quizTokens.brand,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons
                name={accuracy >= 70 ? 'emoji-events' : 'school'}
                size={34}
                color={quizTokens.ink}
              />
            </View>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 12,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: quizTokens.primary,
              }}>
              {grade}
            </Text>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 40,
                lineHeight: 44,
                fontWeight: '800',
                color: quizTokens.ink,
              }}>
              {accuracy}%
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: quizTokens.muted,
                textAlign: 'center',
              }}>
              {correctCount} of {quizCards.length} correct ·{' '}
              {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
            </Text>
          </View>

          <View style={{flexDirection: 'row', gap: 10}}>
            {[
              {
                label: 'Correct',
                value: String(correctCount),
                icon: 'check-circle',
              },
              {
                label: 'Missed',
                value: String(quizCards.length - correctCount),
                icon: 'cancel',
              },
              {
                label: 'Mode',
                value: mode === 'mcq' ? 'MCQ' : 'Typed',
                icon: mode === 'mcq' ? 'list' : 'keyboard',
              },
            ].map(tile => (
              <View
                key={tile.label}
                style={{
                  flex: 1,
                  backgroundColor: quizTokens.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: quizTokens.borderSubtle,
                  padding: 14,
                  gap: 6,
                }}>
                <MaterialIcons
                  name={tile.icon}
                  size={18}
                  color={quizTokens.primary}
                />
                <Text
                  style={{
                    fontFamily: fonts.displaySemiBold,
                    fontSize: 20,
                    color: quizTokens.ink,
                  }}>
                  {tile.value}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 11,
                    color: quizTokens.muted,
                  }}>
                  {tile.label}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={{
              backgroundColor: quizTokens.paleLime,
              borderRadius: 16,
              padding: 16,
              gap: 6,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 14,
                color: quizTokens.ink,
              }}>
              Mastery tip
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 13,
                lineHeight: 18,
                color: quizTokens.olive,
              }}>
              {accuracy >= 80
                ? 'Great recall — schedule a short review tomorrow to lock it in.'
                : 'Missed items benefit from spaced review. Try a short SM-2 session next.'}
            </Text>
          </View>

          <Pressable
            onPress={startQuiz}
            className="active:opacity-95"
            style={{
              height: 52,
              borderRadius: 16,
              backgroundColor: quizTokens.brand,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
            <MaterialIcons name="refresh" size={20} color={quizTokens.ink} />
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 15,
                color: quizTokens.ink,
              }}>
              Retake quiz
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.goBack()}
            className="active:opacity-90"
            style={{
              height: 48,
              borderRadius: 16,
              backgroundColor: quizTokens.surface,
              borderWidth: 1,
              borderColor: quizTokens.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 14,
                color: quizTokens.ink,
              }}>
              Done
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'ready') {
    return (
      <View style={{flex: 1, backgroundColor: quizTokens.background}}>
        {header}
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: 20,
            paddingBottom: insets.bottom + 32,
            gap: 18,
            maxWidth: 560,
            width: '100%',
            alignSelf: 'center',
          }}>
          <View
            style={{
              backgroundColor: quizTokens.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: quizTokens.borderSubtle,
              padding: 20,
              gap: 12,
            }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: quizTokens.brand,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons name="psychology" size={26} color={quizTokens.ink} />
            </View>
            <Text
              style={{
                fontFamily: fonts.displaySemiBold,
                fontSize: 24,
                color: quizTokens.ink,
              }}>
              Interactive AI Quiz
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                lineHeight: 20,
                color: quizTokens.muted,
              }}>
              Test recall for {deckTitle} with multiple choice or typed answers.
              Cards are shuffled each run.
            </Text>
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                flexWrap: 'wrap',
                marginTop: 4,
              }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 999,
                  backgroundColor: quizTokens.surfaceLow,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 11,
                    color: quizTokens.muted,
                  }}>
                  {cards.length} cards available
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 999,
                  backgroundColor: quizTokens.secondaryContainer,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 11,
                    color: quizTokens.onSecondaryContainer,
                  }}>
                  Adaptive
                </Text>
              </View>
            </View>
          </View>

          <View style={{gap: 10}}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: quizTokens.muted,
              }}>
              Question format
            </Text>
            <View
              style={{
                flexDirection: 'row',
                padding: 4,
                borderRadius: 16,
                backgroundColor: quizTokens.surfaceLow,
                gap: 4,
              }}>
              {(
                [
                  {value: 'mcq' as const, label: 'Multiple choice', icon: 'list'},
                  {value: 'typed' as const, label: 'Typed answer', icon: 'keyboard'},
                ] as const
              ).map(option => {
                const selectedMode = mode === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setMode(option.value)}
                    className="active:opacity-90"
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: selectedMode
                        ? quizTokens.surface
                        : 'transparent',
                    }}>
                    <MaterialIcons
                      name={option.icon}
                      size={16}
                      color={selectedMode ? quizTokens.ink : quizTokens.muted}
                    />
                    <Text
                      style={{
                        fontFamily: selectedMode
                          ? fonts.bodyBold
                          : fonts.bodySemiBold,
                        fontSize: 12,
                        color: selectedMode ? quizTokens.ink : quizTokens.muted,
                      }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{gap: 10}}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: quizTokens.muted,
              }}>
              Length
            </Text>
            <View style={{flexDirection: 'row', gap: 8}}>
              {countOptions.map(n => {
                const selectedCount = questionCount === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setQuestionCount(n)}
                    className="active:opacity-90"
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 14,
                      alignItems: 'center',
                      backgroundColor: selectedCount
                        ? quizTokens.brand
                        : quizTokens.surface,
                      borderWidth: selectedCount ? 0 : 1,
                      borderColor: quizTokens.border,
                    }}>
                    <Text
                      style={{
                        fontFamily: selectedCount
                          ? fonts.bodyBold
                          : fonts.bodySemiBold,
                        fontSize: 14,
                        color: quizTokens.ink,
                      }}>
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={startQuiz}
            accessibilityRole="button"
            className="active:opacity-95"
            style={{
              height: 56,
              borderRadius: 999,
              backgroundColor: quizTokens.brand,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 8,
            }}>
            <MaterialIcons name="play-arrow" size={24} color={quizTokens.ink} />
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 16,
                color: quizTokens.ink,
              }}>
              Start {Math.min(questionCount, cards.length)}-question quiz
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Active phase
  const lastWasCorrect =
    revealed &&
    selected != null &&
    normalize(selected) === normalize(current.answer);

  return (
    <View style={{flex: 1, backgroundColor: quizTokens.background}}>
      {header}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: 16,
          paddingBottom: insets.bottom + 32,
          gap: 14,
          maxWidth: 560,
          width: '100%',
          alignSelf: 'center',
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
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: quizTokens.muted,
            }}>
            {mode === 'mcq' ? 'Multiple choice' : 'Typed recall'}
          </Text>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: quizTokens.primary,
            }}>
            Score {correctCount}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: quizTokens.surface,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: quizTokens.borderSubtle,
            padding: 20,
            gap: 12,
            minHeight: 140,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: quizTokens.brand,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: quizTokens.ink,
                }}>
                Q{index + 1}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: quizTokens.muted,
              }}>
              Prompt
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 18,
              lineHeight: 26,
              color: quizTokens.ink,
            }}>
            {current.question}
          </Text>
        </View>

        {mode === 'mcq' ? (
          <View style={{gap: 10}}>
            {choices.map((choice, choiceIndex) => {
              const isSel = selected === choice;
              const isCorrect =
                revealed && normalize(choice) === normalize(current.answer);
              const isWrong = revealed && isSel && !isCorrect;
              return (
                <Pressable
                  key={`${choiceIndex}-${choice.slice(0, 24)}`}
                  disabled={revealed}
                  onPress={() => submitAnswer(choice)}
                  className="active:opacity-95"
                  style={{
                    minHeight: 56,
                    borderRadius: quizTokens.choiceRadius,
                    borderWidth: 1.5,
                    borderColor: isCorrect
                      ? quizTokens.correctBorder
                      : isWrong
                        ? quizTokens.wrongBorder
                        : isSel
                          ? quizTokens.brand
                          : quizTokens.border,
                    backgroundColor: isCorrect
                      ? quizTokens.correctBg
                      : isWrong
                        ? quizTokens.wrongBg
                        : quizTokens.surface,
                    paddingHorizontal: 14,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: isCorrect
                        ? quizTokens.brand
                        : isWrong
                          ? quizTokens.wrongBorder
                          : quizTokens.surfaceLow,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    {isCorrect ? (
                      <MaterialIcons name="check" size={16} color={quizTokens.ink} />
                    ) : isWrong ? (
                      <MaterialIcons
                        name="close"
                        size={16}
                        color={quizTokens.wrongText}
                      />
                    ) : (
                      <Text
                        style={{
                          fontFamily: fonts.bodyBold,
                          fontSize: 12,
                          color: quizTokens.muted,
                        }}>
                        {CHOICE_LETTERS[choiceIndex] ?? String(choiceIndex + 1)}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: fonts.body,
                      fontSize: 15,
                      lineHeight: 22,
                      color: isWrong ? quizTokens.wrongText : quizTokens.ink,
                    }}>
                    {choice}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={{gap: 12}}>
            <TextInput
              value={typed}
              onChangeText={setTyped}
              editable={!revealed}
              placeholder="Type your answer…"
              placeholderTextColor={`${quizTokens.muted}99`}
              style={{
                minHeight: 56,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: revealed
                  ? lastWasCorrect
                    ? quizTokens.correctBorder
                    : quizTokens.wrongBorder
                  : quizTokens.border,
                backgroundColor: quizTokens.surface,
                paddingHorizontal: 16,
                fontFamily: fonts.body,
                fontSize: 16,
                color: quizTokens.ink,
              }}
            />
            {!revealed ? (
              <Pressable
                onPress={() => submitAnswer(typed)}
                disabled={!typed.trim()}
                className="active:opacity-95"
                style={{
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: quizTokens.brand,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: typed.trim() ? 1 : 0.5,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 15,
                    color: quizTokens.ink,
                  }}>
                  Check answer
                </Text>
              </Pressable>
            ) : (
              <View
                style={{
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: lastWasCorrect
                    ? quizTokens.correctBg
                    : quizTokens.wrongBg,
                  gap: 4,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 13,
                    color: lastWasCorrect
                      ? quizTokens.correctText
                      : quizTokens.wrongText,
                  }}>
                  {lastWasCorrect ? 'Correct' : 'Not quite'}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    color: quizTokens.ink,
                  }}>
                  {current.answer}
                </Text>
              </View>
            )}
          </View>
        )}

        {revealed ? (
          <Pressable
            onPress={next}
            className="active:opacity-95"
            style={{
              height: 56,
              borderRadius: 16,
              backgroundColor: quizTokens.brand,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 16,
                color: quizTokens.ink,
              }}>
              {index + 1 >= quizCards.length ? 'See results' : 'Next question'}
            </Text>
            <MaterialIcons
              name={index + 1 >= quizCards.length ? 'emoji-events' : 'arrow-forward'}
              size={20}
              color={quizTokens.ink}
            />
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}
