/** Warm paper world: off-white ground, soft fruit colours, plum-ink text. */
export const colors = {
  cream: '#FBF3E6',
  paper: '#FFFAF2',
  sand: '#F3E5CF',
  line: '#E8DAC4',

  ink: '#2F2A3D',
  inkSoft: '#5F5872',
  inkFaint: '#9A93A6',

  coral: '#F2876B',
  coralDeep: '#DD6A4D',
  peach: '#FFD2B5',
  butter: '#FFD97A',
  butterSoft: '#FFF0C2',
  sage: '#9DC8A0',
  sageDeep: '#5E9A6A',
  mint: '#DCEFD9',
  sky: '#BCD8F0',
  blueMuted: '#7E9FC6',
  lavender: '#D9CCF2',
  lavenderDeep: '#8E79C9',
  rose: '#F7C6CF',
  cocoa: '#8A5A44',

  /** Intentions are airy and pale. */
  thought: '#FFFFFF',
  thoughtShadow: 'rgba(95, 80, 120, 0.10)',
  /** Events are grounded and outlined. */
  stickerShadow: '#2F2A3D',
} as const;

export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Mix a colour toward black (amount < 0) or white (amount > 0). */
export function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const target = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  const mix = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16);
    return Math.round(c + (target - c) * t)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${mix(0)}${mix(2)}${mix(4)}`;
}
