import { ScrollView, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { sceneFor } from '@/domain/activities';
import { dayLabel, periodOfTime } from '@/domain/time';
import type { ID, SocialEvent } from '@/domain/types';
import { isParticipant } from '@/domain/visibility';
import { useSocial } from '@/state/store';
import { addToCalendar, openWhatsApp } from '@/services/external';
import { colors, fonts, radii } from '@/theme';
import { Avatar } from '../people/Avatar';
import { AvatarCluster } from '../people/AvatarCluster';
import { Scene } from '../scene/Scene';
import { ImInButton } from '../social/ImInButton';
import { FofTag } from '../social/Tags';
import { audienceLine, participantIds } from '../social/text';
import { SoftButton } from '../ui/Buttons';
import { CloseButton } from '../ui/CloseButton';
import { Txt } from '../ui/Txt';

/** An event reads like a little poster for a real night out. */
export function EventPoster({ event, via, width, onClose }: { event: SocialEvent; via?: ID; width: number; onClose: () => void }) {
  const users = useSocial((s) => s.users);
  const groups = useSocial((s) => s.groups);
  const viewerId = useSocial((s) => s.viewerId);
  const notify = useSocial((s) => s.notify);
  const simulate = useSocial((s) => s.simulateFriendJoin);
  const ids = participantIds(event);
  const host = users[event.creatorId];
  const isHost = event.creatorId === viewerId;
  const joined = isParticipant(event, viewerId);
  const people = ids.map((id) => users[id]).filter(Boolean);

  const whatsapp = async () => {
    const result = await openWhatsApp(event);
    if (result === 'placeholder') {
      notify({ title: 'WhatsApp would open here', subtitle: 'Prototype: the group chat link gets attached to the plan later.' });
    }
  };

  const calendar = async () => {
    const { payload } = await addToCalendar(event);
    notify({
      title: 'Calendar invite ready',
      subtitle: `${payload.title}, ${dayLabel(event.date)} ${event.time}${payload.location ? ` at ${payload.location}` : ''}. Prototype: not saved to your phone yet.`,
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 44 }}>
      <View>
        <Scene kind={sceneFor(event.activityTypes)} period={periodOfTime(event.time)} people={people} width={width} />
        <View style={{ position: 'absolute', top: 14, right: 14 }}>
          <CloseButton onPress={onClose} />
        </View>
      </View>

      <View style={{ marginTop: -28, backgroundColor: colors.paper, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingTop: 22 }}>
        <Txt variant="label" color={colors.coralDeep}>
          {dayLabel(event.date)} · {event.time}
        </Txt>
        <Txt variant="poster" style={{ textTransform: 'uppercase', marginTop: 4 }}>
          {event.title}
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          {host ? <Avatar user={host} size={30} ring={null} /> : null}
          <Txt variant="body" color={colors.inkSoft}>
            hosted by <Txt variant="body" style={{ fontFamily: fonts.bodyBold }}>{isHost ? 'you' : host?.name}</Txt>
          </Txt>
        </View>
        {event.calendarData?.location ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <Svg width={14} height={18} viewBox="0 0 14 18">
              <Path d="M7 17C2 10 1 8 1 6.5a6 6 0 0 1 12 0C13 8 12 10 7 17z" fill={colors.coral} stroke={colors.ink} strokeWidth={1.4} />
            </Svg>
            <Txt variant="small" color={colors.inkSoft}>
              {event.calendarData.location}
            </Txt>
          </View>
        ) : null}
        {event.description ? (
          <Txt variant="body" style={{ marginTop: 14 }}>
            {event.description}
          </Txt>
        ) : null}

        <Txt variant="label" color={colors.inkFaint} style={{ marginTop: 24 }}>
          {ids.length} {ids.length === 1 ? 'person' : 'people'} going
        </Txt>
        <AvatarCluster userIds={ids} size={48} showNames viewerId={viewerId} max={12} style={{ marginTop: 12 }} />

        {event.friendsOfFriendsAllowed ? (
          <View style={{ marginTop: 18, padding: 16, borderRadius: radii.pebble, backgroundColor: colors.butterSoft }}>
            <FofTag />
            <Txt variant="small" color={colors.inkSoft} style={{ marginTop: 8 }}>
              {via
                ? `You can see this because ${users[via]?.name ?? 'a friend'} is going.`
                : 'Friends of the people going can see this. It stops there.'}
            </Txt>
          </View>
        ) : null}

        <View style={{ marginTop: 24 }}>
          {isHost ? (
            <View style={{ gap: 10 }}>
              <View style={{ padding: 16, borderRadius: radii.pebble, backgroundColor: colors.mint }}>
                <Txt variant="heading">It’s your plan.</Txt>
                <Txt variant="small" color={colors.inkSoft}>
                  People see it and can say they’re in.
                </Txt>
              </View>
              <SoftButton
                label="Prototype: a friend says I’m in"
                tint={colors.sand}
                onPress={async () => {
                  const ok = await simulate(event.id);
                  if (!ok) notify({ title: 'Everyone’s already in', subtitle: 'All the people who can see this have joined.' });
                }}
              />
            </View>
          ) : (
            <ImInButton item={event} />
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <SoftButton
            label="Open WhatsApp"
            onPress={() => void whatsapp()}
            tint={colors.mint}
            style={{ flex: 1 }}
            icon={
              <Svg width={18} height={18} viewBox="0 0 18 18">
                <Path d="M9 1.5a7.5 7.5 0 0 0-6.4 11.4L1.5 16.5l3.7-1A7.5 7.5 0 1 0 9 1.5z" fill={colors.sage} stroke={colors.ink} strokeWidth={1.4} />
              </Svg>
            }
          />
          <SoftButton
            label="Add to Calendar"
            onPress={() => void calendar()}
            tint={joined ? colors.butter : colors.paper}
            style={{ flex: 1 }}
            icon={
              <Svg width={18} height={18} viewBox="0 0 18 18">
                <Rect x={1.5} y={3} width={15} height={13} rx={3} fill={colors.paper} stroke={colors.ink} strokeWidth={1.4} />
                <Rect x={1.5} y={3} width={15} height={4.5} rx={2} fill={colors.coral} stroke={colors.ink} strokeWidth={1.4} />
              </Svg>
            }
          />
        </View>

        <Txt variant="small" color={colors.inkFaint} align="center" style={{ marginTop: 18 }}>
          {audienceLine(event, users, groups, viewerId)}
          {event.fromIntentionId ? '. Started as an idea, then people said I’m in.' : ''}
        </Txt>
      </View>
    </ScrollView>
  );
}
