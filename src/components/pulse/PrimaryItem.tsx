import { View } from 'react-native';
import { ACTIVITIES } from '@/domain/activities';
import { itemEnd, itemStart, itemWhen } from '@/domain/time';
import { hashSeed } from '@/components/shapes/paths';
import { Cloud, Island } from '@/components/shapes/Shapes';
import { useJoinNews, type VisibleItem } from '@/state/hooks';
import { useSocial } from '@/state/store';
import { colors, fonts } from '@/theme';
import { Avatar } from '../people/Avatar';
import { AvatarCluster } from '../people/AvatarCluster';
import { ImInButton } from '../social/ImInButton';
import { FofTag, NewsTag, UpNext } from '../social/Tags';
import { headline, namesList, participantIds } from '../social/text';
import { Float } from '../ui/Float';
import { Squish } from '../ui/Squish';
import { Txt } from '../ui/Txt';
import { useFocusFrom } from './useFocusFrom';

/** The closest thing with your people, standing in front of its scene. */
export function PrimaryItem({ entry, now }: { entry: VisibleItem; now: Date }) {
  const { item, via } = entry;
  const users = useSocial((s) => s.users);
  const viewerId = useSocial((s) => s.viewerId);
  const news = useJoinNews(item.id, item.creatorId);
  const { ref, open } = useFocusFrom(item.id);
  const ids = participantIds(item);
  const others = ids.filter((id) => id !== item.creatorId);
  const creator = users[item.creatorId];
  const live = itemStart(item) <= now && itemEnd(item) > now;
  const title = headline(item, users, viewerId);

  const people = (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8, minHeight: 44, paddingRight: item.creatorId === viewerId ? 0 : 118 }}>
      <AvatarCluster userIds={ids} size={30} max={5} />
      <Txt variant="small" color={colors.inkSoft} style={{ flexShrink: 1 }} numberOfLines={2}>
        {item.kind === 'event'
          ? `${ids.length} going`
          : others.length === 1 && others[0] === viewerId
            ? 'You’re in'
            : others.length
            ? `${namesList(others, users, viewerId)} ${others.length === 1 && others[0] !== viewerId ? 'is' : 'are'} in`
            : 'be the first'}
      </Txt>
    </View>
  );

  // Sibling, not child, of the tappable shape so buttons never nest.
  const imIn = (inset: number) => (
    <View style={{ position: 'absolute', right: inset, bottom: inset }}>
      <ImInButton item={item} compact />
    </View>
  );

  if (item.kind === 'intention') {
    return (
      <Float amplitude={3} style={{ marginHorizontal: 14 }}>
        <View ref={ref} collapsable={false}>
          <Squish onPress={open} scaleTo={0.98} accessibilityLabel={`${title}. Open`}>
            <Cloud seed={hashSeed(item.id)} contentStyle={{ paddingHorizontal: 34, paddingTop: 38, paddingBottom: 34 }}>
              <UpNext live={live} />
              <Txt variant="hero">{title}</Txt>
              <Txt variant="lead" color={colors.inkSoft} style={{ marginTop: 2 }}>
                {itemWhen(item, now)}
              </Txt>
              {item.customText ? (
                <Txt variant="quote" color={colors.inkSoft} style={{ marginTop: 6 }} numberOfLines={2}>
                  “{item.customText}”
                </Txt>
              ) : null}
              {news.length ? <NewsTag names={namesList(news, users, viewerId)} /> : null}
              {people}
            </Cloud>
            {creator ? <Avatar user={creator} size={52} style={{ position: 'absolute', top: -14, left: 26 }} /> : null}
          </Squish>
          {imIn(36)}
        </View>
      </Float>
    );
  }

  return (
    <View ref={ref} collapsable={false} style={{ marginHorizontal: 18, transform: [{ rotate: '-1.2deg' }] }}>
      <Squish onPress={open} scaleTo={0.98} accessibilityLabel={`${item.title}. Open`}>
        <Island seed={hashSeed(item.id)} fill={ACTIVITIES[item.activityTypes[0] ?? 'everything'].tint} contentStyle={{ paddingHorizontal: 28, paddingVertical: 26 }}>
          <UpNext live={live} />
          <Txt variant="label" color={colors.inkSoft}>
            {itemWhen(item, now)}
          </Txt>
          <Txt variant="poster" style={{ fontSize: 38, lineHeight: 42, marginTop: 2 }}>
            {item.title}
          </Txt>
          <Txt variant="small" color={colors.inkSoft} style={{ fontFamily: fonts.bodyBold }}>
            hosted by {item.creatorId === viewerId ? 'you' : creator?.name}
          </Txt>
          {item.friendsOfFriendsAllowed ? <FofTag via={via} /> : null}
          {news.length ? <NewsTag names={namesList(news, users, viewerId)} /> : null}
          {people}
        </Island>
      </Squish>
      {imIn(30)}
    </View>
  );
}
