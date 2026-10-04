import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ACTIVITIES } from '@/domain/activities';
import { itemWhen } from '@/domain/time';
import type { Intention } from '@/domain/types';
import { useJoinNews, useNow } from '@/state/hooks';
import { useSocial } from '@/state/store';
import { colors, fonts, radii } from '@/theme';
import { ActivityIcon } from '../icons/ActivityIcon';
import { Avatar } from '../people/Avatar';
import { AvatarCluster } from '../people/AvatarCluster';
import { ImInButton } from '../social/ImInButton';
import { audienceLine, headline, namesList, participantIds } from '../social/text';
import { BigButton, SoftButton } from '../ui/Buttons';
import { CloseButton } from '../ui/CloseButton';
import { Float } from '../ui/Float';
import { Txt } from '../ui/Txt';
import { ConfirmPlan } from './ConfirmPlan';

export function IntentionDetail({ intention, onClose }: { intention: Intention; onClose: () => void }) {
  const users = useSocial((s) => s.users);
  const groups = useSocial((s) => s.groups);
  const viewerId = useSocial((s) => s.viewerId);
  const now = useNow();
  const news = useJoinNews(intention.id, intention.creatorId);
  const [freshNews] = useState(news);
  const creator = users[intention.creatorId];
  const ids = participantIds(intention);
  const isCreator = intention.creatorId === viewerId;

  return (
    <ScrollView contentContainerStyle={{ padding: 26, paddingTop: 22, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {creator ? (
          <Float amplitude={3}>
            <Avatar user={creator} size={78} />
          </Float>
        ) : (
          <View />
        )}
        <CloseButton onPress={onClose} />
      </View>

      <Txt variant="hero" style={{ marginTop: 14 }}>
        {headline(intention, users, viewerId)}
      </Txt>
      <Txt variant="lead" color={colors.inkSoft}>
        {itemWhen(intention, now)}
      </Txt>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        {intention.activityTypes.map((a) => (
          <View key={a} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 6, paddingRight: 12, paddingVertical: 4, borderRadius: radii.chip, backgroundColor: ACTIVITIES[a].tint }}>
            <ActivityIcon type={a} size={24} />
            <Txt variant="small" style={{ fontFamily: fonts.bodyBold }}>
              {ACTIVITIES[a].label}
            </Txt>
          </View>
        ))}
      </View>

      {intention.customText ? (
        <View style={{ marginTop: 16, padding: 16, borderRadius: 24, backgroundColor: colors.butterSoft, transform: [{ rotate: '-0.8deg' }] }}>
          <Txt variant="quote">“{intention.customText}”</Txt>
        </View>
      ) : null}

      <Txt variant="label" color={colors.inkFaint} style={{ marginTop: 26 }}>
        who’s in
      </Txt>
      <AvatarCluster userIds={ids} size={52} showNames viewerId={viewerId} style={{ marginTop: 12 }} />
      {freshNews.length ? (
        <Animated.View entering={FadeIn.delay(500)}>
          <Txt variant="heading" color={colors.coralDeep} style={{ marginTop: 12 }}>
            {namesList(freshNews, users, viewerId)} {freshNews.length === 1 ? 'is' : 'are'} in!
          </Txt>
        </Animated.View>
      ) : null}

      <View style={{ marginTop: 28 }}>{isCreator ? <CreatorPanel intention={intention} /> : <ImInButton item={intention} />}</View>

      <Txt variant="small" color={colors.inkFaint} align="center" style={{ marginTop: 18 }}>
        {audienceLine(intention, users, groups, viewerId)}
      </Txt>
    </ScrollView>
  );
}

function CreatorPanel({ intention }: { intention: Intention }) {
  const simulate = useSocial((s) => s.simulateFriendJoin);
  const notify = useSocial((s) => s.notify);
  const [planning, setPlanning] = useState(false);
  const others = intention.participants.length - 1;

  if (planning) return <ConfirmPlan intention={intention} onCancel={() => setPlanning(false)} />;

  return (
    <View style={{ gap: 12 }}>
      {others > 0 ? (
        <View style={{ backgroundColor: colors.mint, borderRadius: radii.sheet, padding: 20 }}>
          <Txt variant="heading">
            {others} {others === 1 ? 'friend is' : 'friends are'} in.
          </Txt>
          <Txt variant="body" color={colors.inkSoft}>
            Sounds like a plan?
          </Txt>
          <BigButton label="Turn it into a plan" tint={colors.sage} onPress={() => setPlanning(true)} style={{ marginTop: 14 }} />
        </View>
      ) : (
        <View style={{ borderRadius: radii.sheet, padding: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.line }}>
          <Txt variant="heading">Waiting for your people…</Txt>
          <Txt variant="body" color={colors.inkSoft}>
            Nobody’s in yet. Ideas sometimes take a minute.
          </Txt>
        </View>
      )}
      <SoftButton
        label="Prototype: a friend says I’m in"
        tint={colors.sand}
        onPress={async () => {
          const ok = await simulate(intention.id);
          if (!ok) notify({ title: 'Everyone’s already in', subtitle: 'All the people who can see this have joined.' });
        }}
      />
    </View>
  );
}
