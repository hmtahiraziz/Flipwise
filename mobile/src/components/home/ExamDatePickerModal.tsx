import {useMemo, useState} from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {
  addDaysIso,
  parseIsoDate,
  toIsoDate,
} from '../../lib/examPlan';

type ExamDatePickerModalProps = {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSelect: (isoDate: string) => void;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function ExamDatePickerModal({
  visible,
  value,
  onClose,
  onSelect,
}: ExamDatePickerModalProps) {
  const insets = useSafeAreaInsets();
  const selected = parseIsoDate(value) ?? new Date();
  selected.setHours(12, 0, 0, 0);
  const [cursor, setCursor] = useState(() => startOfMonth(selected));
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const startPad = first.getDay();
    const daysInMonth = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
    ).getDate();
    const out: Array<Date | null> = [];
    for (let i = 0; i < startPad; i += 1) out.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      out.push(new Date(cursor.getFullYear(), cursor.getMonth(), day, 12));
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const presets = [
    {label: '+1 week', days: 7},
    {label: '+2 weeks', days: 14},
    {label: '+1 month', days: 30},
    {label: '+2 months', days: 60},
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onShow={() => setCursor(startOfMonth(selected))}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(25, 28, 26, 0.45)',
          justifyContent: 'flex-end',
        }}>
        <Pressable
          onPress={e => e.stopPropagation()}
          style={{
            backgroundColor: libraryTokens.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: libraryTokens.border,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
            gap: 16,
          }}>
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 999,
              backgroundColor: libraryTokens.border,
              marginBottom: 4,
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 20,
                color: libraryTokens.ink,
              }}>
              Exam date
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityLabel="Close date picker">
              <MaterialIcons name="close" size={22} color={libraryTokens.muted} />
            </Pressable>
          </View>

          <View style={{flexDirection: 'row', gap: 8, flexWrap: 'wrap'}}>
            {presets.map(preset => (
              <Pressable
                key={preset.label}
                onPress={() => onSelect(addDaysIso(toIsoDate(today), preset.days))}
                className="active:opacity-90"
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: libraryTokens.border,
                  backgroundColor: libraryTokens.background,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 12,
                    color: libraryTokens.ink,
                  }}>
                  {preset.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Pressable
              onPress={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1, 12),
                )
              }
              hitSlop={8}
              accessibilityLabel="Previous month"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: libraryTokens.background,
              }}>
              <MaterialIcons name="chevron-left" size={22} color={libraryTokens.ink} />
            </Pressable>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 15,
                color: libraryTokens.ink,
              }}>
              {monthLabel}
            </Text>
            <Pressable
              onPress={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1, 12),
                )
              }
              hitSlop={8}
              accessibilityLabel="Next month"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: libraryTokens.background,
              }}>
              <MaterialIcons name="chevron-right" size={22} color={libraryTokens.ink} />
            </Pressable>
          </View>

          <View style={{flexDirection: 'row'}}>
            {WEEKDAYS.map((label, index) => (
              <Text
                key={`${label}-${index}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: fonts.bodyBold,
                  fontSize: 11,
                  color: libraryTokens.muted,
                  marginBottom: 8,
                }}>
                {label}
              </Text>
            ))}
          </View>

          {Array.from({length: Math.ceil(cells.length / 7)}, (_, row) => (
            <View key={`row-${row}`} style={{flexDirection: 'row'}}>
              {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                const index = row * 7 + col;
                if (!day) {
                  return <View key={`empty-${index}`} style={{flex: 1, height: 44}} />;
                }
                const iso = toIsoDate(day);
                const isSelected = sameDay(day, selected);
                const isToday = sameDay(day, today);
                const isPast = day.getTime() < today.getTime() - 86400000;
                return (
                  <Pressable
                    key={iso}
                    disabled={isPast}
                    onPress={() => onSelect(iso)}
                    accessibilityRole="button"
                    accessibilityState={{selected: isSelected, disabled: isPast}}
                    style={{
                      flex: 1,
                      height: 44,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isPast ? 0.35 : 1,
                    }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected
                          ? brandColors.lime
                          : isToday
                            ? libraryTokens.background
                            : 'transparent',
                        borderWidth: isToday && !isSelected ? 1 : 0,
                        borderColor: libraryTokens.border,
                      }}>
                      <Text
                        style={{
                          fontFamily: isSelected
                            ? fonts.bodyBold
                            : fonts.bodySemiBold,
                          fontSize: 14,
                          color: libraryTokens.ink,
                        }}>
                        {day.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
