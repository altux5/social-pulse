import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DayPicker, PeriodPicker } from '@/components/create/WhenPickers';
import { closeOverlay, Overlay } from '@/components/sheets/Overlay';
import { BigButton, Chip } from '@/components/ui/Buttons';
import { CloseButton } from '@/components/ui/CloseButton';
import { Txt } from '@/components/ui/Txt';
import { availabilityPhrase, clockFromMinutes, minutesOf, PERIOD_META, timesInPeriod, todayKey } from '@/domain/time';
import type { ClockTime, DateKey, TimePeriod } from '@/domain/types';
import { useNow, useVisibleAvailability } from '@/state/hooks';
import { useSocial } from '@/state/store';
import { colors, fonts, radii } from '@/theme';

export default function Availability() {
  const now = useNow();
  const viewerId = useSocial((s) => s.viewerId);
  const setAvailability = useSocial((s) => s.setAvailability);
  const removeAvailability = useSocial((s) => s.removeAvailability);
  const notify = useSocial((s) => s.notify);
  const mine = useVisibleAvailability(now).filter((a) => a.userId === viewerId);

  const [date, setDate] = useState<DateKey>(todayKey(now));
  const [allDay, setAllDay] = useState(false);
  const [periods, setPeriods] = useState<TimePeriod[]>([]);
  const [start, setStart] = useState<ClockTime>();
  const [end, setEnd] = useState<ClockTime>();

  const single = !allDay && periods.length === 1 ? periods[0] : undefined;
  const endOptions = useMemo(() => {
    if (!single || !start) return [];
    const from = minutesOf(start) + 60;
    const to = PERIOD_META[single].end * 60 + 120;
    const out: ClockTime[] = [];
    for (let m = from; m <= to && out.length < 9; m += 60) out.push(clockFromMinutes(m));
    return out;
  }, [single, start]);

  const togglePeriod = (p: TimePeriod) => {
    setAllDay(false);
    setStart(undefined);
    setEnd(undefined);
    setPeriods((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));
  };

  const ok = allDay || periods.length > 0;

  const save = async () => {
    const entries = allDay
      ? [{ date }]
      : periods.map((p) => ({ date, timePeriod: p, startTime: single ? start : undefined, endTime: single && start ? end : undefined }));
    await setAvailability(entries);
    closeOverlay();
    notify({
      title: 'Your friends can see you’re around',
      subtitle: `Free ${availabilityPhrase({ id: '', userId: viewerId, ...entries[0] }, now)}${entries.length > 1 ? ' and more' : ''}`,
    });
  };

  return (
    <Overlay full>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Txt variant="hero" style={{ flex: 1 }}>
            When are you around?
          </Txt>
          <CloseButton onPress={closeOverlay} />
        </View>
        <Txt variant="body" color={colors.inkSoft} style={{ marginTop: 6, marginBottom: 20 }}>
          Not an invite. It just tells your friends you’re up for something.
        </Txt>

        <DayPicker
          value={date}
          now={now}
          onChange={(d) => {
            setDate(d);
            setPeriods([]);
            setStart(undefined);
            setEnd(undefined);
          }}
        />

        <View style={{ marginTop: 22 }}>
          <Chip
            label="Around all day"
            selected={allDay}
            onPress={() => {
              setAllDay((v) => !v);
              setPeriods([]);
            }}
            tint={colors.butter}
            style={{ alignSelf: 'flex-start', marginBottom: 12 }}
          />
          <PeriodPicker date={date} value={periods} onToggle={togglePeriod} now={now} />
        </View>

        {single ? (
          <Animated.View entering={FadeInDown.duration(300)} style={{ marginTop: 18 }}>
            <Txt variant="small" color={colors.inkSoft} style={{ marginBottom: 8 }}>
              More exact? Optional.
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {timesInPeriod(single).map((t) => (
                <Chip
                  key={t}
                  size="sm"
                  label={`from ${t}`}
                  selected={start === t}
                  tint={colors.butter}
                  onPress={() => {
                    setStart(start === t ? undefined : t);
                    setEnd(undefined);
                  }}
                />
              ))}
            </View>
            {endOptions.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {endOptions.map((t) => (
                  <Chip key={t} size="sm" label={`until ${t}`} selected={end === t} tint={colors.peach} onPress={() => setEnd(end === t ? undefined : t)} />
                ))}
              </View>
            ) : null}
          </Animated.View>
        ) : null}

        <View style={{ marginTop: 26 }}>
          <BigButton label="I’m around" tint={colors.butter} disabled={!ok} onPress={() => void save()} />
          <Txt variant="small" color={colors.inkFaint} align="center" style={{ marginTop: 10 }}>
            Visible to all your friends.
          </Txt>
        </View>

        {mine.length ? (
          <View style={{ marginTop: 26 }}>
            <Txt variant="label" color={colors.inkFaint} style={{ marginBottom: 10 }}>
              you’re around
            </Txt>
            <View style={{ gap: 8 }}>
              {mine.map((a) => (
                <View
                  key={a.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: 16,
                    paddingRight: 6,
                    paddingVertical: 6,
                    borderRadius: radii.chip,
                    backgroundColor: colors.butterSoft,
                  }}
                >
                  <Txt variant="body" style={{ fontFamily: fonts.bodyBold, flexShrink: 1 }}>
                    {availabilityPhrase(a, now)}
                  </Txt>
                  <Chip size="sm" label="not anymore" onPress={() => void removeAvailability(a.id)} />
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Overlay>
  );
}
