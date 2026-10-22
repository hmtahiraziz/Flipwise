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
  /** Total study minutes across the same 7-day window (from history). */
  minutesThisWeek?: number;
};

const CHART_HEIGHT = progressTokens.barChartHeight;
const LABEL_HEIGHT = 18;
const COUNT_HEIGHT = 16;
const BAR_AREA = CHART_HEIGHT - LABEL_HEIGHT - COUNT_HEIGHT - 8;
const MIN_BAR_RATIO = 0.08;

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
  return Math.max(Math.round(ratio * BAR_AREA), Math.round(BAR_AREA * 0.16));
}

export function WeeklyActivityChart({
  data,
  minutesThisWeek,
}: WeeklyActivityChartProps) {
  const chartData = data.length > 0 ? data.slice(-7) : mapActivityToWeeklyChart([]);
  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  const weekTotal = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <View
      style={{
        backgroundColor: progressTokens.background,
        borderWidth: 1,
        borderColor: progressTokens.borderWarm,
        borderRadius: progressTokens.cardRadius,
        padding: 20,
        gap: 12,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}>
        <View style={{flex: 1}}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 13,
              color: progressTokens.mutedWarm,
            }}>
            Cards reviewed
          </Text>
          {typeof minutesThisWeek === 'number' ? (
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                color: progressTokens.mutedWarm,
                marginTop: 2,
              }}>
              {minutesThisWeek} min studied
            </Text>
          ) : null}
        </View>
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 20,
            color: progressTokens.ink,
          }}>
          {weekTotal}
        </Text>
      </View>
      <View
        style={{
          height: CHART_HEIGHT,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 10,
        }}>
        {chartData.map((entry, index) => {
          const heightPx = barHeightPx(entry.count, maxCount);
          const active = entry.count > 0;

          return (
            <View
              key={`${entry.day}-${index}`}
              style={{
                flex: 1,
                height: CHART_HEIGHT,
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 6,
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 10,
                  lineHeight: COUNT_HEIGHT,
                  color: active ? progressTokens.ink : progressTokens.mutedWarm,
                  opacity: active ? 1 : 0.5,
                }}>
                {entry.count > 0 ? entry.count : '·'}
              </Text>
              <View
                style={{
                  width: '100%',
                  height: heightPx,
                  borderRadius: 999,
                  backgroundColor: entry.isToday
                    ? progressTokens.brandGreen
                    : active
                      ? progressTokens.brandGreen
                      : progressTokens.borderWarm,
                  opacity: entry.isToday ? 1 : active ? 0.75 : 1,
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
