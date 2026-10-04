import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '@/theme';

interface FloatProps {
  children?: ReactNode;
  amplitude?: number;
  /** Degrees of gentle sway. */
  sway?: number;
  driftX?: number;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: 'auto' | 'none' | 'box-none';
}

/** Slow ambient bob. Disabled when the OS asks for reduced motion. */
export function Float({
  children,
  amplitude = 4,
  sway = 0,
  driftX = 0,
  duration = motion.ambient.float,
  delay = 0,
  style,
  pointerEvents,
}: FloatProps) {
  const reduce = useReducedMotion();
  const t = useSharedValue(0.5);

  useEffect(() => {
    if (reduce) return;
    t.value = 0;
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: motion.easing.inOut }), -1, true));
    return () => cancelAnimation(t);
  }, [reduce, delay, duration, t]);

  const animated = useAnimatedStyle(() => {
    const k = (t.value - 0.5) * 2;
    return {
      transform: [{ translateY: k * amplitude }, { translateX: k * driftX }, { rotate: `${k * sway}deg` }],
    };
  });

  return (
    <Animated.View pointerEvents={pointerEvents} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}
