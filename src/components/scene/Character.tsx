import Svg, { Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import type { User } from '@/domain/types';
import { colors, shade } from '@/theme';
import { Face } from '../people/Face';

export type Pose = 'stand' | 'sit';
export type Holding = 'cup' | 'glass' | 'dumbbell' | 'none';

interface CharacterProps {
  user: User;
  width: number;
  pose?: Pose;
  holding?: Holding;
}

const PANTS = '#4A4560';

/** A friend, drawn on a 60×100 grid with feet at the bottom edge. */
export function Character({ user, width, pose = 'stand', holding = 'none' }: CharacterProps) {
  const sleeve = shade(user.color, -0.14);
  return (
    <Svg width={width} height={(width * 100) / 60} viewBox="0 0 60 100">
      {pose === 'stand' ? (
        <G>
          <Rect x={21} y={70} width={7.5} height={25} rx={3.5} fill={PANTS} />
          <Rect x={31.5} y={70} width={7.5} height={25} rx={3.5} fill={PANTS} />
          <Ellipse cx={24} cy={96} rx={6.5} ry={3.5} fill={colors.ink} />
          <Ellipse cx={36.5} cy={96} rx={6.5} ry={3.5} fill={colors.ink} />
        </G>
      ) : (
        <G>
          <Rect x={20} y={72} width={21} height={9} rx={4.5} fill={PANTS} />
          <Rect x={20} y={72} width={8} height={18} rx={4} fill={PANTS} />
          <Rect x={33} y={72} width={8} height={18} rx={4} fill={PANTS} />
        </G>
      )}
      <Rect x={26} y={36} width={8} height={10} fill={shade(user.look.skin, -0.08)} />
      <Path d="M15 78 Q13 53 24 45 L36 45 Q47 53 45 78 Z" fill={user.color} />
      <Path d="M24 45 Q30 50 36 45" stroke={shade(user.color, -0.2)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Path d="M19 52 Q11 62 15 72" stroke={sleeve} strokeWidth={6.5} strokeLinecap="round" fill="none" />
      {holding === 'none' ? (
        <Path d="M41 52 Q49 62 45 72" stroke={sleeve} strokeWidth={6.5} strokeLinecap="round" fill="none" />
      ) : (
        <Path d="M41 52 Q49 60 41 63" stroke={sleeve} strokeWidth={6.5} strokeLinecap="round" fill="none" />
      )}
      {holding === 'cup' ? <Rect x={38} y={55} width={9} height={10} rx={2.5} fill={colors.paper} stroke={colors.ink} strokeWidth={1.4} /> : null}
      {holding === 'glass' ? (
        <G stroke={colors.ink} strokeWidth={1.4}>
          <Path d="M37 52 h12 l-6 7 z" fill={colors.lavender} />
          <Line x1={43} y1={59} x2={43} y2={66} />
        </G>
      ) : null}
      {holding === 'dumbbell' ? (
        <G>
          <Rect x={36} y={60} width={12} height={3} rx={1.5} fill={colors.ink} />
          <Rect x={34} y={56.5} width={4} height={10} rx={1.5} fill={colors.blueMuted} stroke={colors.ink} strokeWidth={1.2} />
          <Rect x={46} y={56.5} width={4} height={10} rx={1.5} fill={colors.blueMuted} stroke={colors.ink} strokeWidth={1.2} />
        </G>
      ) : null}
      <Face cx={30} cy={25} r={14} look={user.look} />
    </Svg>
  );
}
