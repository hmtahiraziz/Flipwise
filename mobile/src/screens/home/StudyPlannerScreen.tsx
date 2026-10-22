import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useMemo, useState} from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ExamDatePickerModal} from '../../components/home/ExamDatePickerModal';
import {ProfileScreenHeader} from '../../components/profile/ProfileScreenHeader';
import {keyboardScrollProps} from '../../components/ui/KeyboardSafeView';
import {toast} from '../../components/ui/Toast';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useDecks} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {useProfileStackBack} from '../../hooks/useProfileStackBack';
import {
  daysUntilExam,
  examPlanDueCount,
  formatExamDateLabel,
  resolveExamPlanDecks,
  suggestedExamCardsPerDay,
  toIsoDate,
} from '../../lib/examPlan';
import type {HomeStackParamList} from '../../navigation/types';
import {
  localDataStorage,
  type StudyPlan,
} from '../../storage/localDataStorage';
import {preferencesStorage} from '../../storage/preferencesStorage';

type Props = NativeStackScreenProps<HomeStackParamList, 'StudyPlanner'>;

export function StudyPlannerScreen({navigation}: Props) {
  const layout = useLibraryLayout();
  const onBack = useProfileStackBack(navigation);
  const {data: decks = []} = useDecks();
  const existing = localDataStorage.getStudyPlan();
  const prefExam = preferencesStorage.get().examDate;

  const [examDate, setExamDate] = useState(
    existing?.examDate ?? prefExam ?? '',
  );
  const [minutesPerDay, setMinutesPerDay] = useState(
    String(existing?.minutesPerDay ?? 30),
  );
  const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>(
    () => existing?.deckIds ?? [],
  );
  const [hasPlan, setHasPlan] = useState(Boolean(existing || prefExam));
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const activeDecks = useMemo(
    () => decks.filter(d => !d.isArchived),
    [decks],
  );

  const preview = useMemo(() => {
    const days = examDate ? daysUntilExam(examDate) : null;
    const mins = Number.parseInt(minutesPerDay, 10);
    if (days == null || !Number.isFinite(mins) || mins < 1) return null;
    const planPreview: StudyPlan = {
      examDate,
      deckIds: selectedDeckIds,
      minutesPerDay: mins,
      availableDays: [1, 2, 3, 4, 5, 6, 0],
      dailyTarget: Math.max(10, Math.round(mins / 2)),
    };
    const planDecks = resolveExamPlanDecks(activeDecks, planPreview);
    const due = examPlanDueCount(planDecks);
    const cardsPerDay = suggestedExamCardsPerDay(due, days, planPreview.dailyTarget);
    return {
      days,
      mins,
      due,
      cardsPerDay,
      deckCount:
        selectedDeckIds.length > 0
          ? planDecks.length
          : activeDecks.length,
      allDecks: selectedDeckIds.length === 0,
    };
  }, [examDate, minutesPerDay, selectedDeckIds, activeDecks]);

  const toggleDeck = useCallback((deckId: string) => {
    setSelectedDeckIds(prev =>
      prev.includes(deckId)
        ? prev.filter(id => id !== deckId)
        : [...prev, deckId],
    );
  }, []);

  const handleSave = useCallback(() => {
    const days = examDate ? daysUntilExam(examDate) : null;
    const mins = Number.parseInt(minutesPerDay, 10);
    if (!examDate || days == null) {
      toast.error('Pick an exam date', 'Open the calendar and choose a day.');
      return;
    }
    if (days < 0) {
      toast.error('Past date', 'Pick today or a future exam date.');
      return;
    }
    if (!Number.isFinite(mins) || mins < 5 || mins > 240) {
      toast.error('Invalid minutes', 'Choose between 5 and 240 minutes per day.');
      return;
    }

    const validDeckIds = selectedDeckIds.filter(id =>
      activeDecks.some(d => d.id === id),
    );
    const planDecks = resolveExamPlanDecks(activeDecks, {
      examDate,
      deckIds: validDeckIds,
      minutesPerDay: mins,
      availableDays: existing?.availableDays ?? [1, 2, 3, 4, 5, 6, 0],
      dailyTarget: 10,
    });
    const due = examPlanDueCount(planDecks);
    const dailyTarget =
      suggestedExamCardsPerDay(due, Math.max(1, days), Math.max(10, Math.round(mins / 2))) ??
      Math.max(10, Math.round(mins / 2));

    const plan: StudyPlan = {
      examDate,
      deckIds: validDeckIds,
      minutesPerDay: mins,
      availableDays: existing?.availableDays ?? [1, 2, 3, 4, 5, 6, 0],
      dailyTarget,
    };
    localDataStorage.setStudyPlan(plan);
    preferencesStorage.set({examDate});
    setHasPlan(true);
    toast.success(
      'Exam plan saved',
      days === 0
        ? `Exam is today · ${mins} min/day`
        : `${days} day${days === 1 ? '' : 's'} left · ${dailyTarget} cards/day`,
    );
    navigation.goBack();
  }, [
    examDate,
    minutesPerDay,
    selectedDeckIds,
    activeDecks,
    existing?.availableDays,
    navigation,
  ]);

  const handleClear = useCallback(() => {
    localDataStorage.setStudyPlan(null);
    preferencesStorage.set({examDate: null});
    setExamDate('');
    setMinutesPerDay('30');
    setSelectedDeckIds([]);
    setHasPlan(false);
    toast.info('Exam plan cleared');
  }, []);

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      <ProfileScreenHeader title="Exam planner" onBack={onBack} />

      <KeyboardAwareScrollView
        bottomOffset={24}
        {...keyboardScrollProps}
        contentContainerStyle={{
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: 24,
          paddingBottom: layout.tabScrollBottomPadding + 24,
          gap: 20,
          maxWidth: libraryTokens.contentMaxWidthWide,
          width: '100%',
          alignSelf: 'center',
        }}>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 15,
            lineHeight: 22,
            color: libraryTokens.muted,
          }}>
          Pick your exam date and decks. Home shows a countdown and can start a
          focused review for this plan.
        </Text>

        <View style={{gap: 8}}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 13,
              color: libraryTokens.muted,
            }}>
            Exam date
          </Text>
          <Pressable
            onPress={() => setDatePickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Choose exam date"
            className="active:opacity-95"
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: libraryTokens.border,
              backgroundColor: libraryTokens.surface,
              paddingHorizontal: 16,
              minHeight: 52,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}>
            <MaterialIcons name="event" size={22} color={libraryTokens.ink} />
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.bodySemiBold,
                fontSize: 16,
                color: examDate ? libraryTokens.ink : libraryTokens.muted,
              }}>
              {examDate ? formatExamDateLabel(examDate) : 'Choose a date'}
            </Text>
            <MaterialIcons name="expand-more" size={22} color={libraryTokens.muted} />
          </Pressable>
        </View>

        <View style={{gap: 8}}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 13,
              color: libraryTokens.muted,
            }}>
            Minutes per day
          </Text>
          <View className="flex-row items-center" style={{gap: 12}}>
            <Pressable
              onPress={() =>
                setMinutesPerDay(v =>
                  String(Math.max(5, (Number.parseInt(v, 10) || 30) - 5)),
                )
              }
              accessibilityLabel="Decrease minutes"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: libraryTokens.border,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: libraryTokens.surface,
              }}>
              <MaterialIcons name="remove" size={20} color={libraryTokens.ink} />
            </Pressable>
            <TextInput
              value={minutesPerDay}
              onChangeText={setMinutesPerDay}
              keyboardType="number-pad"
              style={{
                flex: 1,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: libraryTokens.border,
                backgroundColor: libraryTokens.surface,
                paddingHorizontal: 16,
                height: 52,
                fontFamily: fonts.bodySemiBold,
                fontSize: 18,
                textAlign: 'center',
                color: libraryTokens.ink,
              }}
            />
            <Pressable
              onPress={() =>
                setMinutesPerDay(v =>
                  String(Math.min(240, (Number.parseInt(v, 10) || 30) + 5)),
                )
              }
              accessibilityLabel="Increase minutes"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: libraryTokens.border,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: libraryTokens.surface,
              }}>
              <MaterialIcons name="add" size={20} color={libraryTokens.ink} />
            </Pressable>
          </View>
        </View>

        <View style={{gap: 10}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 13,
                color: libraryTokens.muted,
              }}>
              Exam decks
            </Text>
            <Pressable
              onPress={() =>
                setSelectedDeckIds(prev =>
                  prev.length === activeDecks.length
                    ? []
                    : activeDecks.map(d => d.id),
                )
              }
              hitSlop={6}
              accessibilityRole="button">
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 12,
                  color: libraryTokens.primary,
                }}>
                {selectedDeckIds.length === activeDecks.length &&
                activeDecks.length > 0
                  ? 'Clear all'
                  : 'Select all'}
              </Text>
            </Pressable>
          </View>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: libraryTokens.muted,
            }}>
            {selectedDeckIds.length === 0
              ? 'None selected — plan uses all decks.'
              : `${selectedDeckIds.length} deck${selectedDeckIds.length === 1 ? '' : 's'} selected`}
          </Text>

          {activeDecks.length === 0 ? (
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: libraryTokens.muted,
              }}>
              Create a deck first, then add it to your exam plan.
            </Text>
          ) : (
            <View style={{gap: 8}}>
              {activeDecks.map(deck => {
                const selected = selectedDeckIds.includes(deck.id);
                const due =
                  (deck.dueTodayCount ?? 0) + (deck.lateCount ?? 0);
                return (
                  <Pressable
                    key={deck.id}
                    onPress={() => toggleDeck(deck.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{checked: selected}}
                    className="active:opacity-95"
                    style={{
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: selected
                        ? libraryTokens.primaryContainer
                        : libraryTokens.border,
                      backgroundColor: selected
                        ? libraryTokens.primaryContainer
                        : libraryTokens.surface,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                    <MaterialIcons
                      name={selected ? 'check-box' : 'check-box-outline-blank'}
                      size={22}
                      color={libraryTokens.ink}
                    />
                    <View style={{flex: 1, minWidth: 0}}>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: fonts.bodySemiBold,
                          fontSize: 15,
                          color: libraryTokens.ink,
                        }}>
                        {deck.title}
                      </Text>
                      <Text
                        style={{
                          fontFamily: fonts.body,
                          fontSize: 12,
                          color: libraryTokens.muted,
                          marginTop: 2,
                        }}>
                        {deck.cardCount} cards
                        {due > 0 ? ` · ${due} due` : ''}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {preview ? (
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: libraryTokens.border,
              backgroundColor: libraryTokens.surface,
              padding: 16,
              gap: 4,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 14,
                color: libraryTokens.ink,
              }}>
              {preview.days === 0
                ? 'Exam is today'
                : `${preview.days} day${preview.days === 1 ? '' : 's'} until exam`}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: libraryTokens.muted,
              }}>
              {preview.cardsPerDay
                ? `~${preview.cardsPerDay} cards/day`
                : `${preview.mins} min/day`}
              {' · '}
              {preview.allDecks
                ? `All ${preview.deckCount} decks`
                : `${preview.deckCount} selected deck${preview.deckCount === 1 ? '' : 's'}`}
              {preview.due > 0 ? ` · ${preview.due} due now` : ''}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleSave}
          accessibilityRole="button"
          className="active:opacity-90"
          style={{
            height: 52,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: libraryTokens.primaryContainer,
          }}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              color: libraryTokens.onPrimaryContainer,
            }}>
            Save plan
          </Text>
        </Pressable>

        {hasPlan ? (
          <Pressable
            onPress={handleClear}
            accessibilityRole="button"
            className="active:opacity-80"
            style={{alignItems: 'center', paddingVertical: 8}}>
            <Text
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 14,
                color: libraryTokens.error,
              }}>
              Clear plan
            </Text>
          </Pressable>
        ) : null}
      </KeyboardAwareScrollView>

      <ExamDatePickerModal
        visible={datePickerOpen}
        value={examDate || toIsoDate(new Date())}
        onClose={() => setDatePickerOpen(false)}
        onSelect={iso => {
          setExamDate(iso);
          setDatePickerOpen(false);
        }}
      />
    </View>
  );
}
