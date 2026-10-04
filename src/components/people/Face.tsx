import { Circle, Ellipse, G, Line, Path } from 'react-native-svg';
import type { AvatarLook } from '@/domain/types';
import { colors } from '@/theme';

/** Shared cartoon head used by avatars and scene characters alike. */
export function Face({ cx, cy, r, look }: { cx: number; cy: number; r: number; look: AvatarLook }) {
  const { hair, skin, hairStyle } = look;
  const X = (k: number) => cx + r * k;
  const Y = (k: number) => cy + r * k;

  const back = (() => {
    switch (hairStyle) {
      case 'long':
        return (
          <>
            <Circle cx={cx} cy={Y(-0.05)} r={r * 1.1} fill={hair} />
            <Path d={`M${X(-1.1)} ${Y(-0.1)} Q${X(-1.2)} ${Y(1.5)} ${X(-0.55)} ${Y(1.55)} L${X(0.55)} ${Y(1.55)} Q${X(1.2)} ${Y(1.5)} ${X(1.1)} ${Y(-0.1)} Z`} fill={hair} />
          </>
        );
      case 'wavy':
        return (
          <>
            <Circle cx={cx} cy={Y(-0.05)} r={r * 1.12} fill={hair} />
            <Path
              d={`M${X(-1.12)} ${Y(-0.1)} Q${X(-1.3)} ${Y(0.6)} ${X(-1.05)} ${Y(1.0)} Q${X(-1.25)} ${Y(1.35)} ${X(-0.7)} ${Y(1.45)} L${X(0.7)} ${Y(1.45)} Q${X(1.25)} ${Y(1.35)} ${X(1.05)} ${Y(1.0)} Q${X(1.3)} ${Y(0.6)} ${X(1.12)} ${Y(-0.1)} Z`}
              fill={hair}
            />
          </>
        );
      case 'bob':
        return (
          <>
            <Circle cx={cx} cy={Y(-0.05)} r={r * 1.1} fill={hair} />
            <Path d={`M${X(-1.12)} ${Y(-0.1)} L${X(-1.12)} ${Y(0.8)} Q${cx} ${Y(1.0)} ${X(1.12)} ${Y(0.8)} L${X(1.12)} ${Y(-0.1)} Z`} fill={hair} />
          </>
        );
      case 'bun':
        return <Circle cx={cx} cy={Y(-1.05)} r={r * 0.45} fill={hair} />;
      default:
        return null;
    }
  })();

  const front = (() => {
    switch (hairStyle) {
      case 'curly':
        return (
          <G>
            <Path d={`M${X(-1.0)} ${Y(-0.05)} C${X(-1.05)} ${Y(-1.2)} ${X(1.05)} ${Y(-1.2)} ${X(1.0)} ${Y(-0.05)} Q${cx} ${Y(-0.55)} ${X(-1.0)} ${Y(-0.05)} Z`} fill={hair} />
            {[-175, -150, -125, -100, -75, -50, -25, -5].map((deg) => {
              const a = (deg * Math.PI) / 180;
              return <Circle key={deg} cx={cx + Math.cos(a) * r * 0.92} cy={cy + Math.sin(a) * r * 0.86} r={r * 0.3} fill={hair} />;
            })}
          </G>
        );
      case 'buzz':
        return <Path d={`M${X(-0.98)} ${Y(-0.18)} C${X(-1.0)} ${Y(-1.12)} ${X(1.0)} ${Y(-1.12)} ${X(0.98)} ${Y(-0.18)} C${X(0.7)} ${Y(-0.62)} ${X(-0.7)} ${Y(-0.62)} ${X(-0.98)} ${Y(-0.18)} Z`} fill={hair} opacity={0.92} />;
      case 'long':
      case 'wavy':
        return (
          <Path
            d={`M${X(-1.03)} ${Y(0.15)} C${X(-1.1)} ${Y(-1.15)} ${X(1.1)} ${Y(-1.15)} ${X(1.03)} ${Y(0.15)} C${X(0.85)} ${Y(-0.35)} ${X(0.3)} ${Y(-0.5)} ${cx} ${Y(-0.62)} C${X(-0.3)} ${Y(-0.5)} ${X(-0.85)} ${Y(-0.35)} ${X(-1.03)} ${Y(0.15)} Z`}
            fill={hair}
          />
        );
      case 'bob':
        return <Path d={`M${X(-1.05)} ${Y(0.2)} C${X(-1.1)} ${Y(-1.15)} ${X(1.1)} ${Y(-1.15)} ${X(1.05)} ${Y(0.2)} L${X(0.85)} ${Y(-0.28)} Q${cx} ${Y(-0.22)} ${X(-0.85)} ${Y(-0.28)} Z`} fill={hair} />;
      case 'bun':
        return <Path d={`M${X(-1.0)} ${Y(-0.05)} C${X(-1.05)} ${Y(-1.15)} ${X(1.05)} ${Y(-1.15)} ${X(1.0)} ${Y(-0.05)} C${X(0.7)} ${Y(-0.5)} ${X(0.2)} ${Y(-0.6)} ${X(0.05)} ${Y(-0.7)} C${X(-0.2)} ${Y(-0.55)} ${X(-0.7)} ${Y(-0.45)} ${X(-1.0)} ${Y(-0.05)} Z`} fill={hair} />;
      case 'short':
      default:
        return <Path d={`M${X(-1.0)} ${Y(-0.05)} C${X(-1.08)} ${Y(-1.2)} ${X(1.08)} ${Y(-1.2)} ${X(1.0)} ${Y(-0.05)} C${X(0.75)} ${Y(-0.55)} ${X(-0.1)} ${Y(-0.65)} ${X(-1.0)} ${Y(-0.05)} Z`} fill={hair} />;
    }
  })();

  const mouth = look.beard ? '#F7E6D8' : colors.ink;

  return (
    <G>
      {back}
      <Circle cx={X(-0.97)} cy={Y(0.12)} r={r * 0.2} fill={skin} />
      <Circle cx={X(0.97)} cy={Y(0.12)} r={r * 0.2} fill={skin} />
      <Circle cx={cx} cy={cy} r={r} fill={skin} />
      {look.beard ? (
        <Path d={`M${X(-0.9)} ${Y(0.15)} Q${X(-0.85)} ${Y(1.08)} ${cx} ${Y(1.1)} Q${X(0.85)} ${Y(1.08)} ${X(0.9)} ${Y(0.15)} Q${X(0.5)} ${Y(0.6)} ${cx} ${Y(0.58)} Q${X(-0.5)} ${Y(0.6)} ${X(-0.9)} ${Y(0.15)} Z`} fill={hair} />
      ) : null}
      {front}
      <Ellipse cx={X(-0.36)} cy={Y(0.14)} rx={r * 0.085} ry={r * 0.115} fill={colors.ink} />
      <Ellipse cx={X(0.36)} cy={Y(0.14)} rx={r * 0.085} ry={r * 0.115} fill={colors.ink} />
      <Circle cx={X(-0.6)} cy={Y(0.42)} r={r * 0.15} fill="#F08A8A" opacity={0.35} />
      <Circle cx={X(0.6)} cy={Y(0.42)} r={r * 0.15} fill="#F08A8A" opacity={0.35} />
      <Path d={`M${X(-0.2)} ${Y(0.44)} Q${cx} ${Y(0.64)} ${X(0.2)} ${Y(0.44)}`} stroke={mouth} strokeWidth={r * 0.08} strokeLinecap="round" fill="none" />
      {look.glasses ? (
        <G stroke={colors.ink} strokeWidth={r * 0.07} fill="none">
          <Circle cx={X(-0.36)} cy={Y(0.14)} r={r * 0.24} />
          <Circle cx={X(0.36)} cy={Y(0.14)} r={r * 0.24} />
          <Line x1={X(-0.12)} y1={Y(0.12)} x2={X(0.12)} y2={Y(0.12)} />
        </G>
      ) : null}
    </G>
  );
}
