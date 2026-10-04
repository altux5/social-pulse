import { Easing } from 'react-native-reanimated';

/** Calm, warm, alive: soft ease-outs, gentle springs, slow ambient loops. */
export const motion = {
  duration: { tap: 140, quick: 220, base: 360, unfold: 520, slow: 700 },
  ambient: { float: 3600, drift: 22000, steam: 2600, twinkle: 1800 },
  stagger: 70,
  easing: {
    soft: Easing.bezier(0.22, 1, 0.36, 1),
    inOut: Easing.bezier(0.45, 0, 0.55, 1),
  },
  spring: {
    gentle: { damping: 18, stiffness: 150, mass: 1 },
    settle: { damping: 22, stiffness: 220, mass: 0.9 },
  },
} as const;
