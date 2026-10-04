import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { dayLabel, isPeriodOver, PERIODS, timesInPeriod, upcomingDays } from '@/domain/time';
import type { ClockTime, DateKey, TimePeriod } from '@/domain/types';
import { colors, fonts } from '@/theme';
import { PeriodIcon } from '../icons/ActivityIcon';
import { Chip } from '../ui/Buttons';
import { Squish } from '../ui/Squish';
import { Txt } from '../ui/Txt';

const PEBBLE_TINTS = [colors.butter, colors.peach, colors.mint, colors.sky, colors.lavender, colors.rose, colors.butterSoft];

/** Today and tomorrow are big; the rest of the week gets smaller the further away it is. */
export function DayPicker({ value, onChange, now }: { value?: DateKey; onChange: (d: DateKey) => void; now: Date }) {
  const days = upcomingDays(7, now);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      {days.map((d, i) => {
        const big = i < 2;
        const selected = d === value;
        const size = big ? 1 : i < 4 ? 0.82 : 0.7;
        return (
          <View key={d} style={{ transform: [{ rotate: `${(i % 2 ? 1.5 : -1.5) * (big ? 0.6 : 1)}deg` }] }}>
            <Squish
              onPress={() => onChange(d)}
              accessibilityLabel={dayLabel(d, now)}
              accessibilityState={{ selected }}
              style={{
                paddingHorizontal: 22 * size + 4,
                paddingVertical: 16 * size,
                minWidth: big ? 140 : undefined,
                alignItems: 'center',
                borderTopLeftRadius: 30,
                borderTopRightRadius: 24 + (i % 3) * 6,
                borderBottomLeftRadius: 22 + (i % 2) * 10,
                borderBottomRightRadius: 30,
                borderWidth: 2,
                borderColor: selected ? colors.ink : colors.line,
                backgroundColor: selected ? PEBBLE_TINTS[i] : colors.paper,
              }}
            >
              <Txt variant={big ? 'title' : 'heading'} style={{ fontSize: big ? 24 : 20 * size + 2, fontFamily: fonts.displayBold }}>
                {dayLabel(d, now)}
              </Txt>
            </Squish>
          </View>
        );
      })}
    </View>
  );
}

const PERIOD_TINT: Record<TimePeriod, string> = {
  morning: colors.butterSoft,
  afternoon: colors.sky,
  evening: colors.peach,
  night: colors.lavender,
};

interface PeriodPickerProps {
  date?: DateKey;
  value: TimePeriod[];
  onToggle: (p: TimePeriod) => void;
  now: Date;
}

export function PeriodPicker({ date, value, onToggle, now }: PeriodPickerProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {PERIODS.map((p) => {
        const selected = value.includes(p);
        const over = date ? isPeriodOver(date, p, now) : false;
        return (
          <Squish
            key={p}
            onPress={() => onToggle(p)}
            disabled={over}
            accessibilityLabel={p}
            accessibilityState={{ selected, disabled: over }}
            style={{
              width: '47%',
              flexGrow: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 12,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: selected ? colors.ink : colors.line,
              backgroundColor: selected ? PERIOD_TINT[p] : colors.paper,
              opacity: over ? 0.35 : 1,
            }}
          >
            <PeriodIcon period={p} size={36} />
            <Txt variant="heading" style={{ textTransform: 'capitalize' }}>
              {p}
            </Txt>
          </Squish>
        );
      })}
    </View>
  );
}

/** Optional softer precision. Never required (unless `exact`, used for confirmed events). */
export function RoughTime({
  period,
  value,
  onChange,
  label = 'Got a rough time? Totally optional.',
  exact = false,
}: {
  period: TimePeriod;
  value?: ClockTime;
  onChange: (t?: ClockTime) => void;
  label?: string;
  exact?: boolean;
}) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 18 }}>
      <Txt variant="small" color={colors.inkSoft} style={{ marginBottom: 8 }}>
        {label}
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {timesInPeriod(period).map((t) => (
          <Chip
            key={t}
            size="sm"
            label={exact ? t : `~${t}`}
            selected={value === t}
            onPress={() => onChange(value === t && !exact ? undefined : t)}
            tint={colors.butter}
          />
        ))}
      </View>
    </Animated.View>
  );
}
