import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export type AmbientMode = 'rise' | 'twinkle' | 'drift' | 'flicker' | 'bob';

interface AmbientProps {
  mode: AmbientMode;
  duration?: number;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/** Small environmental motion: steam rising, lights twinkling, clouds drifting. */
export function Ambient({ mode, duration = 2400, delay = 0, distance = 10, style, children }: AmbientProps) {
  const reduce = useReducedMotion();
  const t = useSharedValue(mode === 'twinkle' ? 1 : 0);

  useEffect(() => {
    if (reduce) return;
    const loops = mode === 'rise' ? withTiming(1, { duration, easing: Easing.out(Easing.quad) }) : withTiming(1, { duration, easing: Easing.inOut(Easing.sin) });
    t.value = 0;
    t.value = withDelay(delay, withRepeat(loops, -1, mode !== 'rise'));
    return () => cancelAnimation(t);
  }, [reduce, mode, duration, delay, t]);

  const animated = useAnimatedStyle(() => {
    switch (mode) {
      case 'rise':
        return {
          opacity: interpolate(t.value, [0, 0.25, 0.8, 1], [0, 1, 0.6, 0]),
          transform: [{ translateY: -distance * t.value }, { scale: 0.9 + 0.2 * t.value }],
        };
      case 'twinkle':
        return { opacity: 0.35 + 0.65 * t.value };
      case 'drift':
        return { transform: [{ translateX: distance * t.value }] };
      case 'flicker':
        return { transform: [{ scale: 0.9 + 0.18 * t.value }] };
      case 'bob':
      default:
        return { transform: [{ translateY: (t.value - 0.5) * 2 * distance }] };
    }
  });

  return (
    <Animated.View pointerEvents="none" style={[style, animated]}>
      {children}
    </Animated.View>
  );
}
