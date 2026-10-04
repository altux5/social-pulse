import { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { visibilityFor } from '@/domain/visibility';
import { useGraph } from '@/state/hooks';
import { findItem, FOCUS_CLOSE_MS, useSocial } from '@/state/store';
import { colors, motion, outline, withAlpha } from '@/theme';
import { EventPoster } from './EventPoster';
import { IntentionDetail } from './IntentionDetail';

/** Tapping an item unfolds it from where it sat into a focused view. */
export function FocusOverlay() {
  const focus = useSocial((s) => s.focus);
  const clearFocus = useSocial((s) => s.clearFocus);
  const markNewsSeen = useSocial((s) => s.markNewsSeen);
  const viewerId = useSocial((s) => s.viewerId);
  const graph = useGraph();
  const item = useSocial((s) => (s.focus ? findItem(s, s.focus.itemId) : undefined));
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const p = useSharedValue(0);
  const drag = useSharedValue(0);

  const isOpen = !!focus;
  const closing = !!focus?.closing;
  useEffect(() => {
    if (closing) {
      p.set(withTiming(0, { duration: FOCUS_CLOSE_MS, easing: motion.easing.soft }));
      drag.set(withTiming(0, { duration: FOCUS_CLOSE_MS }));
    } else if (isOpen) {
      drag.set(0);
      p.set(0);
      p.set(withTiming(1, { duration: motion.duration.unfold, easing: motion.easing.soft }));
    }
  }, [isOpen, closing, p, drag]);

  useEffect(() => {
    if (item && item.creatorId === viewerId) markNewsSeen(item.id);
  }, [item, viewerId, markNewsSeen]);

  useEffect(() => {
    if (!isOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      clearFocus();
      return true;
    });
    return () => sub.remove();
  }, [isOpen, clearFocus]);

  const tx = 10;
  const ty = insets.top + 8;
  const tw = W - 20;
  const th = H - ty - Math.max(insets.bottom, 10);
  const o = focus?.origin ?? { x: tx + tw * 0.08, y: ty + th * 0.2, width: tw * 0.84, height: th * 0.4 };

  const cardStyle = useAnimatedStyle(() => ({
    left: interpolate(p.get(), [0, 1], [o.x, tx]),
    top: interpolate(p.get(), [0, 1], [o.y, ty]) + drag.get(),
    width: interpolate(p.get(), [0, 1], [o.width, tw]),
    height: interpolate(p.get(), [0, 1], [o.height, th]),
    opacity: interpolate(p.get(), [0, 0.12], [0, 1]),
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: p.get() * (1 - Math.min(drag.get() / 400, 0.6)) }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(p.get(), [0.45, 1], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(p.get(), [0.4, 1], [14, 0], 'clamp') }],
  }));

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      drag.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) scheduleOnRN(clearFocus);
      else drag.set(withSpring(0, motion.spring.settle));
    });

  if (!focus || !item) return null;
  const isEvent = item.kind === 'event';
  const vis = isEvent ? visibilityFor(item, viewerId, graph) : null;
  const via = vis?.visible ? vis.via : undefined;
  const bg = isEvent ? colors.paper : '#FFFFFF';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(colors.cream, 0.94) }, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={clearFocus} accessibilityLabel="Close" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute' }, cardStyle]}>
        {isEvent ? <View style={[styles.fill, styles.radius, { backgroundColor: colors.stickerShadow, transform: [{ translateX: 5 }, { translateY: 6 }] }]} /> : null}
        <View
          style={[
            styles.fill,
            styles.radius,
            { backgroundColor: bg },
            isEvent ? { borderWidth: outline.width, borderColor: colors.ink } : styles.softShadow,
          ]}
        />
        {!isEvent ? (
          <Svg width="100%" height={18} viewBox="0 0 300 18" preserveAspectRatio="none" style={{ position: 'absolute', top: -14, left: 0 }}>
            <Path d="M30 18 A26 16 0 0 1 82 14 A30 18 0 0 1 140 10 A28 18 0 0 1 196 14 A26 15 0 0 1 248 16 L248 18 Z" fill={bg} />
          </Svg>
        ) : null}
        <View style={[styles.fill, styles.radius, { overflow: 'hidden' }]}>
          <Animated.View style={[{ width: tw, height: th }, contentStyle]}>
            <Animated.View key={item.id} entering={FadeIn.duration(300)} style={{ flex: 1 }}>
              {item.kind === 'event' ? (
                <EventPoster event={item} via={via} width={tw} onClose={clearFocus} />
              ) : (
                <IntentionDetail intention={item} onClose={clearFocus} />
              )}
            </Animated.View>
          </Animated.View>
        </View>
        <GestureDetector gesture={pan}>
          <View style={styles.grabZone} accessibilityLabel="Drag down to close">
            <View style={styles.grabber} />
          </View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  radius: { borderRadius: 34 },
  softShadow: {
    shadowColor: '#503C64',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 12,
  },
  grabZone: { position: 'absolute', top: 0, left: '30%', right: '30%', height: 26, alignItems: 'center', justifyContent: 'center' },
  grabber: { width: 44, height: 5, borderRadius: 3, backgroundColor: withAlpha(colors.ink, 0.18) },
});
