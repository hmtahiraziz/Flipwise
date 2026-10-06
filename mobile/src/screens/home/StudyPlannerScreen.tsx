import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ProfileScreenHeader} from '../../components/profile/ProfileScreenHeader';
import {toast} from '../../components/ui/Toast';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import type {HomeStackParamList, ProgressStackParamList} from '../../navigation/types';
import {
  localDataStorage,
  type StudyPlan,
} from '../../storage/localDataStorage';
import {preferencesStorage} from '../../storage/preferencesStorage';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'StudyPlanner'>
  | NativeStackScreenProps<ProgressStackParamList, 'StudyPlanner'>;

function isoDateOnly(value: string): string | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const d = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return trimmed;
}

export function StudyPlannerScreen({navigation}: Props) {
  const layout = useLibraryLayout();
  const existing = localDataStorage.getStudyPlan();
  const prefExam = preferencesStorage.get().examDate;

  const [examDate, setExamDate] = useState(
    existing?.examDate ?? prefExam ?? '',
  );
  const [minutesPerDay, setMinutesPerDay] = useState(
    String(existing?.minutesPerDay ?? 30),
  );

  const preview = useMemo(() => {
    const date = isoDateOnly(examDate);
    const mins = Number.parseInt(minutesPerDay, 10);
    if (!date || !Number.isFinite(mins) || mins < 1) return null;
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(`${date}T12:00:00`).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    return {days, mins};
  }, [examDate, minutesPerDay]);

  const handleSave = useCallback(() => {
    const date = isoDateOnly(examDate);
    const mins = Number.parseInt(minutesPerDay, 10);
    if (!date) {
      toast.error('Invalid date', 'Use YYYY-MM-DD for your exam date.');
      return;
    }
    if (!Number.isFinite(mins) || mins < 5 || mins > 240) {
      toast.error('Invalid minutes', 'Choose between 5 and 240 minutes per day.');
      return;
    }

    const plan: StudyPlan = {
      examDate: date,
      deckIds: existing?.deckIds ?? [],
      minutesPerDay: mins,
      availableDays: existing?.availableDays ?? [1, 2, 3, 4, 5, 6, 0],
      dailyTarget: existing?.dailyTarget ?? Math.max(10, Math.round(mins / 2)),
    };
    localDataStorage.setStudyPlan(plan);
    preferencesStorage.set({examDate: date});
    toast.success('Study plan saved');
    navigation.goBack();
  }, [examDate, minutesPerDay, existing, navigation]);

  const handleClear = useCallback(() => {
    localDataStorage.setStudyPlan(null);
    preferencesStorage.set({examDate: null});
    setExamDate('');
    setMinutesPerDay('30');
    toast.info('Study plan cleared');
  }, []);

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      <ProfileScreenHeader
        title="Study planner"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
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
          Set an exam date and daily study minutes. Flipwise uses this for home
          reminders — not an AI schedule.
        </Text>

        <View style={{gap: 8}}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 13,
              color: libraryTokens.muted,
            }}>
            Exam date (YYYY-MM-DD)
          </Text>
          <TextInput
            value={examDate}
            onChangeText={setExamDate}
            placeholder="2026-12-15"
            placeholderTextColor={`${libraryTokens.muted}99`}
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: libraryTokens.border,
              backgroundColor: libraryTokens.surface,
              paddingHorizontal: 16,
              height: 52,
              fontFamily: fonts.body,
              fontSize: 16,
              color: libraryTokens.ink,
            }}
          />
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
              {preview.days} day{preview.days === 1 ? '' : 's'} until exam
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: libraryTokens.muted,
              }}>
              Aim for about {preview.mins} minutes each day.
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

        {existing || prefExam ? (
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
      </ScrollView>
    </View>
  );
}
