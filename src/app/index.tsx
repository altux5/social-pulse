import { router } from 'expo-router';
import { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { FocusOverlay } from '@/components/focus/FocusOverlay';
import { ActivityIcon } from '@/components/icons/ActivityIcon';
import { Avatar } from '@/components/people/Avatar';
import { CreateDock } from '@/components/pulse/CreateDock';
import { FeedbackBubble } from '@/components/pulse/FeedbackBubble';
import { Landscape } from '@/components/pulse/Landscape';
import { PeopleRow } from '@/components/pulse/PeopleRow';
import { PrimaryItem } from '@/components/pulse/PrimaryItem';
import { Scene, sceneHeight, skyTop } from '@/components/scene/Scene';
import { Cloud } from '@/components/shapes/Shapes';
import { BigButton } from '@/components/ui/Buttons';
import { Float } from '@/components/ui/Float';
import { Squish } from '@/components/ui/Squish';
import { Txt } from '@/components/ui/Txt';
import { sceneFor } from '@/domain/activities';
import { currentPeriod, periodOfTime } from '@/domain/time';
import { useNow, useViewer, useVisibleAvailability, useVisibleItems } from '@/state/hooks';
import { useSocial } from '@/state/store';
import { colors, fonts, radii } from '@/theme';

export default function SocialPulse() {
  const status = useSocial((s) => s.status);
  const users = useSocial((s) => s.users);
  const viewerId = useSocial((s) => s.viewerId);
  const homeViewerId = useSocial((s) => s.homeViewerId);
  const viewer = useViewer();
  const now = useNow();
  const items = useVisibleItems(now);
  const availability = useVisibleAvailability(now);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const sh = sceneHeight(width);
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const parallax = useAnimatedStyle(() => {
    const y = scrollY.value;
    return { transform: [{ translateY: y > 0 ? y * 0.45 : y / 2 }, { scale: y < 0 ? 1 - y / sh : 1 }] };
  });

  const primary = items[0];
  const rest = useMemo(() => items.slice(1), [items]);
  const kind = primary ? sceneFor(primary.item.activityTypes) : 'park';
  const period = primary
    ? primary.item.kind === 'event'
      ? periodOfTime(primary.item.time)
      : primary.item.timePeriod
    : currentPeriod(now);
  const scenePeople = primary
    ? primary.item.participants.map((p) => users[p.userId]).filter(Boolean)
    : viewer
      ? [viewer]
      : [];
  const night = period === 'night';
  const heroTop = insets.top + 54;

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream }}>
        <Float amplitude={6}>
          <Txt variant="heading" color={colors.inkSoft}>
            gathering your people…
          </Txt>
        </Float>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 170 }}>
        <View style={{ height: heroTop + sh, overflow: 'hidden', backgroundColor: colors.cream }}>
          <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, height: heroTop + sh }, parallax]}>
            <Animated.View key={`${kind}-${period}`} entering={FadeIn.duration(700)} exiting={FadeOut.duration(500)} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
              <View style={{ height: heroTop + 2, backgroundColor: skyTop(period) }} />
              <View style={{ position: 'absolute', bottom: 0 }}>
                <Scene kind={kind} period={period} people={scenePeople} width={width} />
              </View>
            </Animated.View>
          </Animated.View>

          <View style={{ position: 'absolute', top: insets.top + 6, left: 22, right: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Svg width={26} height={16} viewBox="0 0 26 16">
                  <Path d="M1 9h6l2.5-6 4 11 3-7 1.5 2H25" stroke={night ? colors.butter : colors.coralDeep} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Txt variant="heading" color={night ? colors.paper : colors.ink} style={{ fontFamily: fonts.displayBold }}>
                  social pulse
                </Txt>
              </View>
              <Txt variant="small" color={night ? colors.sand : colors.inkSoft}>
                What’s happening with your people?
              </Txt>
            </View>
            {viewer ? (
              <Squish onPress={() => router.push({ pathname: '/person/[id]', params: { id: viewer.id } })} accessibilityLabel="You" style={{ alignItems: 'center' }}>
                <Avatar user={viewer} size={42} />
                {viewerId !== homeViewerId ? (
                  <View style={{ marginTop: 2, paddingHorizontal: 8, paddingVertical: 1, borderRadius: radii.chip, backgroundColor: colors.butter }}>
                    <Txt variant="small" style={{ fontSize: 11, fontFamily: fonts.bodyBold }}>
                      as {viewer.name}
                    </Txt>
                  </View>
                ) : null}
              </Squish>
            ) : null}
          </View>
        </View>

        <View style={{ marginTop: -40 }}>
          {primary ? (
            <Animated.View key={primary.item.id} entering={FadeInDown.duration(600)}>
              <PrimaryItem entry={primary} now={now} />
            </Animated.View>
          ) : (
            <Float amplitude={3} style={{ marginHorizontal: 16 }}>
              <Cloud seed={7} contentStyle={{ padding: 34 }}>
                <Txt variant="hero">It’s quiet with your people.</Txt>
                <Txt variant="lead" color={colors.inkSoft} style={{ marginBottom: 16 }}>
                  Put something out there? Someone’s probably free.
                </Txt>
                <BigButton label="I wanna hang out…" tint={colors.butter} onPress={() => router.push('/create')} />
              </Cloud>
            </Float>
          )}
        </View>

        <PeopleRow items={items} availability={availability} now={now} />

        {rest.length || availability.length ? (
          <>
            <Txt variant="label" color={colors.inkFaint} style={{ marginLeft: 24, marginTop: 28, marginBottom: 16 }}>
              coming up
            </Txt>
            <Landscape items={rest} availability={availability} now={now} width={width} />
          </>
        ) : null}

        <View style={{ alignItems: 'center', marginTop: 12, paddingHorizontal: 40, gap: 6 }}>
          <ActivityIcon type="everything" size={30} />
          <Txt variant="body" color={colors.inkFaint} align="center">
            That’s everything with your people for now. Go see them.
          </Txt>
        </View>
      </Animated.ScrollView>

      <CreateDock />
      <FocusOverlay />
      <FeedbackBubble />
    </View>
  );
}
