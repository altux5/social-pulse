import { Platform, type ViewStyle } from 'react-native';
import { colors } from './colors';

export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

/** Nothing is sharp-cornered; bigger things get rounder. */
export const radii = { chip: 999, pebble: 22, sheet: 36, poster: 32 } as const;

export const avatarSize = { xs: 24, sm: 32, md: 44, lg: 64, xl: 96 } as const;

const soft = (y: number, blur: number, opacity: number): ViewStyle =>
  Platform.select<ViewStyle>({
    web: { boxShadow: `0px ${y}px ${blur}px rgba(80, 60, 100, ${opacity})` } as ViewStyle,
    default: {
      shadowColor: '#503C64',
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: blur / 2,
      elevation: Math.round(y * 1.5),
    },
  })!;

/** Floating things cast soft, diffuse shadows; grounded things use a hard offset (drawn in SVG). */
export const shadows = {
  float: soft(10, 28, 0.12),
  lift: soft(6, 16, 0.14),
  low: soft(2, 6, 0.1),
} as const;

export const outline = { width: 2.5, color: colors.ink } as const;
