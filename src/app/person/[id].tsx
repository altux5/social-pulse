import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';
import { ActivityIcon, PeriodIcon } from '@/components/icons/ActivityIcon';
import { Avatar } from '@/components/people/Avatar';
import { closeOverlay, Overlay } from '@/components/sheets/Overlay';
import { namesList } from '@/components/social/text';
import { BigButton, SoftButton } from '@/components/ui/Buttons';
import { CloseButton } from '@/components/ui/CloseButton';
import { Float } from '@/components/ui/Float';
import { Squish } from '@/components/ui/Squish';
import { Txt } from '@/components/ui/Txt';
import { activityPhrase } from '@/domain/activities';
import { availabilityPhrase, dayLabel, naturalWhen } from '@/domain/time';
import type { ID } from '@/domain/types';
import { friendIdsOf } from '@/domain/visibility';
import { useGraph, useNow, usePersonContext, useUser } from '@/state/hooks';
import { useSocial } from '@/state/store';
import { colors, fonts, radii } from '@/theme';

/** Not a profile: just what's going on with this person, right now. */
export default function Person() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser(id);
  const users = useSocial((s) => s.users);
  const viewerId = useSocial((s) => s.viewerId);
  const homeViewerId = useSocial((s) => s.homeViewerId);
  const setViewer = useSocial((s) => s.setViewer);
  const resetDemo = useSocial((s) => s.resetDemo);
  const focusItem = useSocial((s) => s.focusItem);
  const notify = useSocial((s) => s.notify);
  const graph = useGraph();
  const now = useNow();
  const ctx = usePersonContext(id ?? '', now);

  if (!user) {
    return (
      <Overlay>
        <View style={{ padding: 28 }}>
          <Txt variant="heading">Can’t find that person.</Txt>
        </View>
      </Overlay>
    );
  }

  const isYou = user.id === viewerId;
  const mutual = isYou ? [] : friendIdsOf(graph, user.id).filter((f) => f !== viewerId && graph.friendsOf.get(viewerId)?.has(f));
  const open = (itemId: ID) => {
    closeOverlay();
    setTimeout(() => focusItem(itemId), 260);
  };

  const lines: { key: string; icon: ReactNode; text: string; onPress?: () => void }[] = [
    ...ctx.availability.map((a) => ({
      key: a.id,
      icon: <PeriodIcon period={a.timePeriod ?? 'afternoon'} size={30} />,
      text: `${isYou ? 'You’re around' : 'Free'} ${availabilityPhrase(a, now)}`,
    })),
    ...ctx.wants.map((i) => ({
      key: i.id,
      icon: <ActivityIcon type={i.activityTypes[0] ?? 'everything'} size={30} />,
      text: `${isYou ? 'Want' : 'Wants'} ${activityPhrase(i.activityTypes, i.timePeriod)} ${naturalWhen(i.date, i.timePeriod, now)}`,
      onPress: () => open(i.id),
    })),
    ...ctx.joined.map((i) => ({
      key: i.id,
      icon: <ActivityIcon type={i.activityTypes[0] ?? 'everything'} size={30} />,
      text: `In for ${i.creatorId === viewerId ? 'your' : `${users[i.creatorId]?.name}’s`} ${activityPhrase(i.activityTypes, i.timePeriod).replace(/^to /, '')}`,
      onPress: () => open(i.id),
    })),
    ...ctx.going.map((e) => ({
      key: e.id,
      icon: <ActivityIcon type={e.activityTypes[0] ?? 'party'} size={30} />,
      text: `${e.creatorId === user.id ? 'Hosting' : 'Going to'} ${e.title} · ${dayLabel(e.date, now)}`,
      onPress: () => open(e.id),
    })),
  ];

  const invite = () => {
    closeOverlay();
    setTimeout(() => router.push({ pathname: '/create', params: { friend: user.id } }), 260);
  };

  return (
    <Overlay>
      <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ padding: 24, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'flex-end' }}>
          <CloseButton onPress={closeOverlay} />
        </View>
        <View style={{ alignItems: 'center', marginTop: -18 }}>
          <Float amplitude={4}>
            <Avatar user={user} size={104} />
          </Float>
          <Txt variant="hero" style={{ marginTop: 10 }}>
            {isYou ? 'You' : user.name}
          </Txt>
          <Txt variant="small" color={colors.inkSoft} align="center">
            {isYou ? `This is what your friends see.` : mutual.length ? `You both know ${namesList(mutual, users, viewerId)}` : 'One of your people'}
          </Txt>
        </View>

        <View style={{ marginTop: 20, gap: 10 }}>
          {lines.length ? (
            lines.map((line, i) => (
              <Animated.View key={line.key} entering={FadeInDown.delay(80 + i * 60).duration(360)} style={{ marginLeft: i % 2 ? 18 : 0, marginRight: i % 2 ? 0 : 18 }}>
                <Squish
                  onPress={line.onPress}
                  disabled={!line.onPress}
                  accessibilityLabel={line.text}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderRadius: radii.pebble,
                    backgroundColor: line.onPress ? colors.paper : colors.butterSoft,
                    borderWidth: line.onPress ? 2 : 0,
                    borderColor: colors.line,
                  }}
                >
                  {line.icon}
                  <Txt variant="body" style={{ flex: 1, fontFamily: fonts.bodyBold }}>
                    {line.text}
                  </Txt>
                  {line.onPress ? (
                    <Svg width={10} height={14} viewBox="0 0 10 14">
                      <Path d="M2 2l6 5-6 5" stroke={colors.inkFaint} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  ) : null}
                </Squish>
              </Animated.View>
            ))
          ) : (
            <Txt variant="body" color={colors.inkSoft} align="center">
              {isYou ? 'Nothing out there yet.' : `Nothing on ${user.name}’s mind yet. Maybe they’re waiting for you.`}
            </Txt>
          )}
        </View>

        <View style={{ marginTop: 22, gap: 10 }}>
          {isYou ? (
            <BigButton
              label="Set when you’re around"
              tint={colors.butter}
              onPress={() => {
                closeOverlay();
                setTimeout(() => router.push('/availability'), 260);
              }}
            />
          ) : (
            <BigButton label={`Ask ${user.name} to hang out`} tint={colors.butter} onPress={invite} />
          )}
        </View>

        {isYou ? (
          <View style={{ marginTop: 28, padding: 16, borderRadius: radii.pebble, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.line }}>
            <Txt variant="label" color={colors.inkFaint}>
              prototype: see the pulse as…
            </Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 12 }}>
              {Object.values(users).map((u) => (
                <Squish
                  key={u.id}
                  onPress={() => {
                    setViewer(u.id);
                    closeOverlay();
                    notify({ userId: u.id, title: `Now seeing it as ${u.name}`, subtitle: u.id === homeViewerId ? 'Back to you.' : 'Tap your avatar to switch back.' }); 
                  }}
                  accessibilityLabel={`See as ${u.name}`}
                  style={{ alignItems: 'center', width: 58 }}
                >
                  <View style={{ padding: 3, borderRadius: 40, backgroundColor: u.id === viewerId ? colors.coral : 'transparent' }}>
                    <Avatar user={u} size={44} />
                  </View>
                  <Txt variant="small" style={{ fontSize: 12 }}>
                    {u.name}
                  </Txt>
                </Squish>
              ))}
            </ScrollView>
            <Txt variant="small" color={colors.inkSoft}>
              Try Zeynep: she sees Altuğ’s House Party only because Ece is going. Anna, Zeynep’s friend, doesn’t.
            </Txt>
            <SoftButton
              label="Reset demo data"
              tint={colors.sand}
              style={{ marginTop: 12 }}
              icon={
                <Svg width={16} height={16} viewBox="0 0 16 16">
                  <Path d="M13 8a5 5 0 1 1-1.5-3.6" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
                  <Line x1={12} y1={1.5} x2={12} y2={5} stroke={colors.ink} strokeWidth={2} strokeLinecap="round" />
                  <Line x1={12} y1={5} x2={8.5} y2={5} stroke={colors.ink} strokeWidth={2} strokeLinecap="round" />
                </Svg>
              }
              onPress={async () => {
                await resetDemo();
                closeOverlay();
                notify({ title: 'Fresh start', subtitle: 'Demo data is back to the beginning.' });
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    </Overlay>
  );
}
