import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SquishProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  children?: ReactNode;
}

/** Everything tappable gives a little under the finger. */
export function Squish({ style, scaleTo = 0.95, children, onPressIn, onPressOut, ...rest }: SquishProps) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      onPressIn={(e) => {
        scale.set(withTiming(scaleTo, { duration: motion.duration.tap }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, motion.spring.settle));
        onPressOut?.(e);
      }}
      style={[style, animated]}
    >
      {children}
    </AnimatedPressable>
  );
}
