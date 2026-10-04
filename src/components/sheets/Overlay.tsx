import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, withAlpha } from '@/theme';

export function closeOverlay() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

interface OverlayProps {
  children: ReactNode;
  /** Full-height for multi-step flows; otherwise the sheet hugs its content. */
  full?: boolean;
  onClose?: () => void;
}

/** A soft paper sheet that rises over the Social Pulse, which stays visible behind it. */
export function Overlay({ children, full = false, onClose = closeOverlay }: OverlayProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const top = insets.top + 12;
  return (
    <View style={{ flex: 1 }}>
      <Animated.View entering={FadeIn.duration(260)} style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(colors.ink, 0.3) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.springify().damping(22).stiffness(170)}
        style={[
          styles.sheet,
          {
            bottom: Math.max(insets.bottom, 8),
            maxHeight: height - top - Math.max(insets.bottom, 8),
          },
          full ? { top } : null,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 8,
    right: 8,
    backgroundColor: colors.cream,
    borderRadius: 36,
    overflow: 'hidden',
  },
});
