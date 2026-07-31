import {Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {progressTokens} from '../../config/progressTokens';

export type WeeklyActivityDay = {
  day: string;
  count: number;
  isToday?: boolean;
};

type WeeklyActivityChartProps = {
  data: WeeklyActivityDay[];
};

const CHART_HEIGHT = progressTokens.barChartHeight;
const LABEL_HEIGHT = 18;
const BAR_AREA = CHART_HEIGHT - LABEL_HEIGHT - 12;
const MIN_BAR_RATIO = 0.1;

function dayLabel(date: Date): string {
  return date
    .toLocaleDateString(undefined, {weekday: 'narrow'})
    .slice(0, 1)
    .toUpperCase();
}

function barHeightPx(count: number, maxCount: number): number {
  if (count <= 0) {
    return Math.round(BAR_AREA * MIN_BAR_RATIO);
  }
  const ratio = count / maxCount;
  return Math.max(Math.round(ratio * BAR_AREA), Math.round(BAR_AREA * 0.18));
}

export function WeeklyActivityChart({data}: WeeklyActivityChartProps) {
  const chartData = data.length > 0 ? data.slice(-7) : mapActivityToWeeklyChart([]);
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <View
      style={{
        backgroundColor: progressTokens.background,
        borderWidth: 1,
        borderColor: progressTokens.borderWarm,
        borderRadius: progressTokens.cardRadius,
        padding: 24,
      }}>
      <View
        style={{
          height: CHART_HEIGHT,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 12,
        }}>
        {chartData.map((entry, index) => {
          const heightPx = barHeightPx(entry.count, maxCount);

          return (
            <View
              key={`${entry.day}-${index}`}
              style={{
                flex: 1,
                height: CHART_HEIGHT,
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 12,
              }}>
              <View
                style={{
                  width: '100%',
                  height: heightPx,
                  borderRadius: 999,
                  backgroundColor: progressTokens.brandGreen,
                }}
              />
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 10,
                  lineHeight: 14,
                  letterSpacing: 0.2,
                  textTransform: 'uppercase',
                  color: entry.isToday ? progressTokens.ink : progressTokens.mutedWarm,
                  fontWeight: entry.isToday ? '700' : '600',
                }}>
                {entry.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Maps API activity rows to chart data ({ day, count }). Always 7 days. */
export function mapActivityToWeeklyChart(
  days: Array<{date: string; cardsReviewed: number}>,
): WeeklyActivityDay[] {
  const todayKey = new Date().toISOString().slice(0, 10);
  const countByDate = new Map(days.map(d => [d.date, d.cardsReviewed]));

  const result: WeeklyActivityDay[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const dateKey = date.toISOString().slice(0, 10);

    result.push({
      day: dayLabel(date),
      count: countByDate.get(dateKey) ?? 0,
      isToday: dateKey === todayKey,
    });
  }

  return result;
}
