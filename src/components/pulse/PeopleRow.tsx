import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { activityPhrase } from '@/domain/activities';
import { availabilityPhrase, dayDiff, shortDayLabel } from '@/domain/time';
import type { Availability, ID, User } from '@/domain/types';
import { isParticipant } from '@/domain/visibility';
import { useFriends, useViewer, type VisibleItem } from '@/state/hooks';
import { useSocial } from '@/state/store';
import { colors, fonts } from '@/theme';
import { Avatar } from '../people/Avatar';
import { Squish } from '../ui/Squish';
import { Txt } from '../ui/Txt';

function statusFor(userId: ID, viewerId: ID, items: VisibleItem[], availability: Availability[], now: Date) {
  const a = availability.find((x) => x.userId === userId);
  if (a) return { text: `free ${availabilityPhrase(a, now)}`, glow: dayDiff(a.date, now) === 0 };
  const want = items.find((e) => e.item.kind === 'intention' && e.item.creatorId === userId);
  if (want && want.item.kind === 'intention') {
    return { text: `${userId === viewerId ? 'you want' : 'wants'} ${activityPhrase(want.item.activityTypes, want.item.timePeriod)}`, glow: false };
  }
  const going = items.find((e) => e.item.kind === 'event' && isParticipant(e.item, userId));
  if (going) return { text: `going out ${shortDayLabel(going.item.date, now).toLowerCase()}`, glow: false };
  return { text: userId === viewerId ? 'when are you around?' : 'quiet for now', glow: false };
}

interface Props {
  items: VisibleItem[];
  availability: Availability[];
  now: Date;
}

/** Your people, scattered in a loose wave rather than a list. */
export function PeopleRow({ items, availability, now }: Props) {
  const viewer = useViewer();
  const viewerId = useSocial((s) => s.viewerId);
  const friends = useFriends();

  const people = useMemo(() => {
    const withStatus = friends.map((u) => ({ user: u, status: statusFor(u.id, viewerId, items, availability, now) }));
    withStatus.sort((a, b) => Number(b.status.glow) - Number(a.status.glow) || Number(b.status.text !== 'quiet for now') - Number(a.status.text !== 'quiet for now'));
    return viewer ? [{ user: viewer, status: statusFor(viewer.id, viewerId, items, availability, now) }, ...withStatus] : withStatus;
  }, [friends, viewer, viewerId, items, availability, now]);

  return (
    <View style={{ marginTop: 26 }}>
      <Txt variant="label" color={colors.inkFaint} style={{ marginLeft: 24 }}>
        your people
      </Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 6 }}>
        {people.map(({ user, status }, i) => (
          <Person key={user.id} user={user} isYou={user.id === viewerId} status={status.text} glow={status.glow} lift={Math.sin(i * 1.4) * 8} />
        ))}
      </ScrollView>
    </View>
  );
}

function Person({ user, isYou, status, glow, lift }: { user: User; isYou: boolean; status: string; glow: boolean; lift: number }) {
  return (
    <View style={{ transform: [{ translateY: lift }] }}>
    <Squish
      onPress={() => router.push({ pathname: '/person/[id]', params: { id: user.id } })}
      accessibilityLabel={`${isYou ? 'You' : user.name}, ${status}`}
      style={{ width: 86, alignItems: 'center' }}
    >
      <View style={{ padding: 4, borderRadius: 40, backgroundColor: glow ? colors.butter : 'transparent' }}>
        <Avatar user={user} size={58} />
      </View>
      <Txt variant="small" style={{ fontFamily: fonts.bodyBold, marginTop: 4 }}>
        {isYou ? 'You' : user.name}
      </Txt>
      <Txt variant="small" color={colors.inkSoft} align="center" numberOfLines={2} style={{ fontSize: 12, lineHeight: 15 }}>
        {status}
      </Txt>
    </Squish>
    </View>
  );
}
