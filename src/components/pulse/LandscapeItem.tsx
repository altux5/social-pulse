import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ACTIVITIES } from '@/domain/activities';
import { itemWhen } from '@/domain/time';
import { isParticipant } from '@/domain/visibility';
import { hashSeed, rng } from '@/components/shapes/paths';
import { Cloud, Island } from '@/components/shapes/Shapes';
import { useJoinNews, type VisibleItem } from '@/state/hooks';
import { useSocial } from '@/state/store';
import { colors, fonts, motion } from '@/theme';
import { ActivityIcon } from '../icons/ActivityIcon';
import { Avatar } from '../people/Avatar';
import { AvatarCluster } from '../people/AvatarCluster';
import { FofTag, NewsTag } from '../social/Tags';
import { headline, namesList, participantIds } from '../social/text';
import { Float } from '../ui/Float';
import { Squish } from '../ui/Squish';
import { Txt } from '../ui/Txt';
import { useFocusFrom } from './useFocusFrom';

interface Props {
  entry: VisibleItem;
  index: number;
  width: number;
  now: Date;
  onAnchor?: (id: string, x: number, y: number) => void;
}

/** One object in the social landscape: a floating thought or a grounded plan. */
export function LandscapeItem({ entry, index, width, now, onAnchor }: Props) {
  const { item, via } = entry;
  const users = useSocial((s) => s.users);
  const viewerId = useSocial((s) => s.viewerId);
  const news = useJoinNews(item.id, item.creatorId);
  const { ref, open } = useFocusFrom(item.id);
  const seed = hashSeed(item.id);
  const rand = rng(seed);
  const ids = participantIds(item);
  const mine = isParticipant(item, viewerId);
  const title = headline(item, users, viewerId);

  const isEvent = item.kind === 'event';
  const itemWidth = width * (isEvent ? 0.8 : 0.72 + rand() * 0.06);
  const side = index % 2 === 0 ? 'left' : 'right';
  const inset = width * (0.04 + rand() * 0.08);
  const placement = side === 'left' ? { marginLeft: inset } : { marginLeft: width - itemWidth - inset };

  const onLayout = (e: LayoutChangeEvent) => {
    const { x, y, width: w, height: h } = e.nativeEvent.layout;
    onAnchor?.(item.id, x + w / 2, y + h / 2);
  };

  const footer = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
      <AvatarCluster userIds={ids} size={26} max={5} />
      <Txt variant="small" color={colors.inkSoft} style={{ flexShrink: 1 }}>
        {isEvent ? `${ids.length} going` : ids.length > 1 ? `${ids.length - 1} in` : ''}
        {mine && item.creatorId !== viewerId ? ' · you’re in' : ''}
      </Txt>
    </View>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(120 + index * motion.stagger).duration(520)}
      onLayout={onLayout}
      style={[{ width: itemWidth, marginBottom: 34 }, placement]}
    >
      {isEvent ? (
        <View ref={ref} collapsable={false} style={{ transform: [{ rotate: `${(rand() - 0.5) * 3}deg` }] }}>
          <Squish onPress={open} scaleTo={0.97} accessibilityLabel={`${title}, ${itemWhen(item, now)}. Open`}>
            <Island seed={seed} fill={ACTIVITIES[item.activityTypes[0] ?? 'everything'].tint}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Txt variant="label" color={colors.inkSoft}>
                  {itemWhen(item, now)}
                </Txt>
                <ActivityIcon type={item.activityTypes[0] ?? 'everything'} size={30} />
              </View>
              <Txt variant="title" style={{ fontFamily: fonts.displayBold }}>
                {title}
              </Txt>
              {item.kind === 'event' && item.friendsOfFriendsAllowed ? <FofTag via={via} compact /> : null}
              {news.length ? <NewsTag names={namesList(news, users, viewerId)} /> : null}
              {footer}
            </Island>
          </Squish>
          <View style={{ alignSelf: 'center', width: '70%', height: 10, borderRadius: 10, backgroundColor: 'rgba(80,60,40,0.10)', marginTop: 4 }} />
        </View>
      ) : (
        <Float amplitude={4} duration={3400 + (seed % 5) * 300} delay={(seed % 7) * 150} sway={0.6}>
          <View ref={ref} collapsable={false}>
            <Squish onPress={open} scaleTo={0.97} accessibilityLabel={`${title}, ${itemWhen(item, now)}. Open`}>
              <Cloud seed={seed} contentStyle={{ paddingLeft: 30, paddingRight: 28, paddingTop: 28, paddingBottom: 26 }}>
                <View style={{ flexDirection: 'row', gap: 2, marginBottom: 4 }}>
                  {item.activityTypes.slice(0, 3).map((a) => (
                    <ActivityIcon key={a} type={a} size={24} />
                  ))}
                </View>
                <Txt variant="heading">{title}</Txt>
                <Txt variant="small" color={colors.inkSoft}>
                  {itemWhen(item, now)}
                </Txt>
                {item.customText ? (
                  <Txt variant="quote" color={colors.inkSoft} numberOfLines={1} style={{ fontSize: 14, marginTop: 4 }}>
                    “{item.customText}”
                  </Txt>
                ) : null}
                {news.length ? <NewsTag names={namesList(news, users, viewerId)} /> : null}
                {footer}
              </Cloud>
            </Squish>
            <ThoughtTrail side={side} />
            {users[item.creatorId] ? (
              <Avatar
                user={users[item.creatorId]}
                size={40}
                style={{ position: 'absolute', bottom: -30, [side === 'left' ? 'left' : 'right']: -2 }}
              />
            ) : null}
          </View>
        </Float>
      )}
    </Animated.View>
  );
}

/** Two little dots linking a thought to the person thinking it. */
function ThoughtTrail({ side }: { side: 'left' | 'right' }) {
  const anchor = side === 'left' ? 'left' : 'right';
  return (
    <>
      <View style={{ position: 'absolute', bottom: -4, [anchor]: 38, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.thought }} />
      <View style={{ position: 'absolute', bottom: -14, [anchor]: 30, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.thought }} />
    </>
  );
}
