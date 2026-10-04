import type { TextStyle } from 'react-native';

export const fonts = {
  display: 'Fredoka_600SemiBold',
  displayMedium: 'Fredoka_500Medium',
  displayBold: 'Fredoka_700Bold',
  body: 'Nunito_600SemiBold',
  bodyRegular: 'Nunito_400Regular',
  bodyBold: 'Nunito_800ExtraBold',
  bodyItalic: 'Nunito_600SemiBold_Italic',
} as const;

/** Rounded display face for things people say; friendly sans for everything else. */
export const typeScale = {
  poster: { fontFamily: fonts.displayBold, fontSize: 44, lineHeight: 46, letterSpacing: -0.5 },
  hero: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 31, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 25 },
  lead: { fontFamily: fonts.body, fontSize: 17, lineHeight: 23 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' },
  quote: { fontFamily: fonts.bodyItalic, fontSize: 16, lineHeight: 22 },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof typeScale;
