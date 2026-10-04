import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import type { SceneKind } from '@/domain/activities';
import type { TimePeriod, User } from '@/domain/types';
import { colors } from '@/theme';
import { Float } from '../ui/Float';
import { Ambient } from './Ambient';
import { Character } from './Character';
import { SCENE_H, SCENE_W, sceneSet, type AmbientSprite } from './sets';

const SKY: Record<TimePeriod, { stops: string[]; hill: string; ground: string }> = {
  morning: { stops: ['#FFE0BE', '#FFF1DC', '#FFF7EA'], hill: '#CFE6BC', ground: '#B6DAA0' },
  afternoon: { stops: ['#B9D9F1', '#DDEDF2', '#F1F6EC'], hill: '#BFE0AC', ground: '#A6D38F' },
  evening: { stops: ['#F2A487', '#F8C6A0', '#FFE6C8'], hill: '#D6D29E', ground: '#BCCB8C' },
  night: { stops: ['#232E5C', '#37427A', '#56609A'], hill: '#3D5A6A', ground: '#33505B' },
};

export function sceneHeight(width: number) {
  return (width * SCENE_H) / SCENE_W;
}

export function skyTop(period: TimePeriod) {
  return SKY[period].stops[0];
}

function Celestial({ period }: { period: TimePeriod }) {
  switch (period) {
    case 'morning':
      return (
        <G>
          <Circle cx={92} cy={128} r={44} fill="#FFE9A8" opacity={0.55} />
          <Circle cx={92} cy={128} r={26} fill="#FFD36E" />
        </G>
      );
    case 'afternoon':
      return (
        <G>
          <Circle cx={318} cy={54} r={36} fill="#FFF3C0" opacity={0.6} />
          <Circle cx={318} cy={54} r={22} fill="#FFE08A" />
        </G>
      );
    case 'evening':
      return (
        <G>
          <Circle cx={300} cy={196} r={58} fill="#FFB98A" opacity={0.45} />
          <Circle cx={300} cy={196} r={36} fill="#FF9B6A" />
        </G>
      );
    case 'night':
      return (
        <G>
          <Circle cx={322} cy={58} r={32} fill="#FFF2C4" opacity={0.18} />
          <Circle cx={322} cy={58} r={20} fill="#FFF2C4" />
          <Circle cx={316} cy={52} r={4} fill="#EBDCA8" />
          <Circle cx={328} cy={64} r={3} fill="#EBDCA8" />
        </G>
      );
  }
}

const STARS: [number, number][] = [
  [40, 30],
  [96, 64],
  [150, 24],
  [210, 52],
  [256, 20],
  [372, 104],
  [20, 96],
  [180, 92],
];

function skySprites(period: TimePeriod): AmbientSprite[] {
  if (period === 'night') {
    return STARS.map(([x, y], i) => ({
      x,
      y,
      w: 8,
      h: 8,
      mode: 'twinkle',
      duration: 1400 + (i % 4) * 400,
      delay: i * 230,
      content: <Path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#FFF2C4" />,
    }));
  }
  const puff = (
    <Path
      d="M8 22 a8 8 0 0 1 2-15 a10 10 0 0 1 19-2 a8 8 0 0 1 12 6 a6 6 0 0 1 1 11 z"
      fill={colors.paper}
      opacity={0.92}
    />
  );
  return [
    { x: 24, y: 34, w: 46, h: 26, mode: 'drift', duration: 14000, distance: 40, content: puff },
    { x: 200, y: 64, w: 46, h: 26, mode: 'drift', duration: 18000, delay: 1200, distance: -34, content: puff },
  ];
}

function Sprite({ s, sprite }: { s: number; sprite: AmbientSprite }) {
  return (
    <Ambient
      mode={sprite.mode}
      duration={sprite.duration}
      delay={sprite.delay}
      distance={(sprite.distance ?? 10) * s}
      style={{ position: 'absolute', left: sprite.x * s, top: sprite.y * s, width: sprite.w * s, height: sprite.h * s }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${sprite.w} ${sprite.h}`}>
        {sprite.content}
      </Svg>
    </Ambient>
  );
}

interface SceneProps {
  kind: SceneKind;
  period: TimePeriod;
  people: User[];
  width: number;
}

/** An illustrated little world for the activity, lit by the time of day, populated by the actual friends. */
export function Scene({ kind, period, people, width }: SceneProps) {
  const s = width / SCENE_W;
  const height = SCENE_H * s;
  const set = useMemo(() => sceneSet(kind), [kind]);
  const sky = SKY[period];
  const gradientId = `sky-${period}`;

  return (
    <View style={{ width, height, overflow: 'hidden' }} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={sky.stops[0]} />
            <Stop offset="0.55" stopColor={sky.stops[1]} />
            <Stop offset="1" stopColor={sky.stops[2]} />
          </LinearGradient>
        </Defs>
        <Rect width={SCENE_W} height={SCENE_H} fill={`url(#${gradientId})`} />
        <Celestial period={period} />
        <Path d="M0 206 Q90 172 190 196 T390 186 L390 300 L0 300 Z" fill={sky.hill} />
        <Path d="M0 234 Q120 214 250 230 T390 222 L390 300 L0 300 Z" fill={sky.ground} />
        {set.back}
        {period === 'night' ? <Rect width={SCENE_W} height={SCENE_H} fill="#1D2452" opacity={0.25} /> : null}
        {set.glow}
      </Svg>

      {skySprites(period).map((sprite, i) => (
        <Sprite key={`sky${i}`} s={s} sprite={sprite} />
      ))}

      {set.slots.map((slot, i) => {
        const user = people[i];
        if (!user) return null;
        const h = (slot.w * 100) / 60;
        return (
          <Float
            key={user.id}
            amplitude={1.4 * s}
            duration={2400 + i * 350}
            delay={i * 220}
            style={{ position: 'absolute', left: (slot.x - slot.w / 2) * s, top: (slot.y - h) * s }}
          >
            <Character user={user} width={slot.w * s} pose={slot.pose} holding={slot.holding} />
          </Float>
        );
      })}

      {set.front ? (
        <Svg width={width} height={height} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} style={StyleSheet.absoluteFill}>
          {set.front}
        </Svg>
      ) : null}

      {set.ambient?.map((sprite, i) => <Sprite key={`a${i}`} s={s} sprite={sprite} />)}
    </View>
  );
}
