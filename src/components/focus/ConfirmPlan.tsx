import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { dayLabel, timesInPeriod } from '@/domain/time';
import type { ActivityType, Intention, TimePeriod } from '@/domain/types';
import { useSocial } from '@/state/store';
import { colors, fonts, outline, radii, typeScale } from '@/theme';
import { BigButton, Chip, SoftButton } from '../ui/Buttons';
import { Txt } from '../ui/Txt';

function defaultTitle(activities: ActivityType[], period: TimePeriod): string {
  const first = activities[0] ?? 'everything';
  const meal = { morning: 'Breakfast', afternoon: 'Lunch', evening: 'Dinner', night: 'Late bite' }[period];
  const map: Record<ActivityType, string> = {
    coffee: 'Coffee',
    food: meal,
    bar: 'Drinks',
    gym: 'Gym',
    walk: 'Walk',
    games: 'Games night',
    explore: 'Exploring',
    everything: 'Hangout',
    party: 'Party',
  };
  return map[first];
}

/** Creator-only: lock in a time and the intention becomes an event. */
export function ConfirmPlan({ intention, onCancel }: { intention: Intention; onCancel: () => void }) {
  const confirmIntention = useSocial((s) => s.confirmIntention);
  const focusItem = useSocial((s) => s.focusItem);
  const notify = useSocial((s) => s.notify);
  const times = timesInPeriod(intention.timePeriod);
  const [time, setTime] = useState(intention.approximateTime ?? times[Math.min(2, times.length - 1)]);
  const [title, setTitle] = useState(defaultTitle(intention.activityTypes, intention.timePeriod));
  const [fof, setFof] = useState(false);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    const event = await confirmIntention(intention.id, { title: title.trim() || 'Hangout', time, friendsOfFriendsAllowed: fof });
    focusItem(event.id);
    notify({ title: 'It’s a plan!', subtitle: `${event.title} · ${dayLabel(event.date)} ${event.time}` });
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(360)}
      style={{ backgroundColor: colors.mint, borderRadius: radii.sheet, padding: 20, borderWidth: outline.width, borderColor: colors.ink }}
    >
      <Txt variant="label" color={colors.inkSoft}>
        call it
      </Txt>
      <TextInput
        value={title}
        onChangeText={setTitle}
        maxLength={40}
        accessibilityLabel="Plan name"
        style={[typeScale.title, { color: colors.ink, paddingVertical: 4, borderBottomWidth: 2, borderColor: colors.sageDeep, borderStyle: 'dashed' }]}
      />
      <Txt variant="label" color={colors.inkSoft} style={{ marginTop: 18 }}>
        what time, for real?
      </Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 10 }}>
        {times.map((t) => (
          <Chip key={t} label={t} size="sm" selected={t === time} onPress={() => setTime(t)} tint={colors.butter} />
        ))}
      </ScrollView>
      <Chip
        label="Friends of friends welcome"
        selected={fof}
        onPress={() => setFof((v) => !v)}
        tint={colors.butter}
        style={{ alignSelf: 'flex-start', marginTop: 6 }}
      />
      <Txt variant="small" color={colors.inkSoft} style={{ marginTop: 6 }}>
        {fof ? 'Friends of the people who join can see it too. Just one hop, no further.' : 'Only the people who saw your idea can see the plan.'}
      </Txt>
      <View style={{ marginTop: 18, gap: 10 }}>
        <BigButton label="It’s happening" tint={colors.sage} onPress={() => void confirm()} disabled={busy} />
        <SoftButton label="Not yet" onPress={onCancel} tint="transparent" style={{ shadowOpacity: 0, elevation: 0 }} />
      </View>
      <Txt variant="small" color={colors.inkFaint} align="center" style={{ marginTop: 4, fontFamily: fonts.body }}>
        Everyone who’s in comes along.
      </Txt>
    </Animated.View>
  );
}
