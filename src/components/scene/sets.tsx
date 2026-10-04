import type { ReactNode } from 'react';
import { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { SceneKind } from '@/domain/activities';
import { colors } from '@/theme';
import type { AmbientMode } from './Ambient';
import type { Holding, Pose } from './Character';

/** Design space every scene is drawn in; scaled to the screen width. */
export const SCENE_W = 390;
export const SCENE_H = 300;

export interface Slot {
  x: number;
  /** Bottom edge (feet) in design units. */
  y: number;
  w: number;
  pose?: Pose;
  holding?: Holding;
}

export interface AmbientSprite {
  x: number;
  y: number;
  w: number;
  h: number;
  mode: AmbientMode;
  duration?: number;
  delay?: number;
  distance?: number;
  content: ReactNode;
}

export interface SceneSet {
  back: ReactNode;
  glow?: ReactNode;
  front?: ReactNode;
  slots: Slot[];
  ambient?: AmbientSprite[];
}

const ink = { stroke: colors.ink, strokeWidth: 2.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const DISPLAY = 'Fredoka_700Bold';

const steam = (key: string, x: number, y: number, delay: number): AmbientSprite => ({
  x,
  y,
  w: 14,
  h: 22,
  mode: 'rise',
  duration: 2600,
  delay,
  distance: 14,
  content: <Path key={key} d="M7 21c-4-4 4-7 0-11s4-6 0-9" stroke={colors.paper} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.95} />,
});

const note = (x: number, y: number, delay: number, color: string): AmbientSprite => ({
  x,
  y,
  w: 18,
  h: 22,
  mode: 'rise',
  duration: 3200,
  delay,
  distance: 26,
  content: (
    <G>
      <Path d="M7 17V4l9-2v12" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Circle cx={5} cy={17} r={3.5} fill={color} stroke={colors.ink} strokeWidth={1.6} />
      <Circle cx={14} cy={15} r={3.5} fill={color} stroke={colors.ink} strokeWidth={1.6} />
    </G>
  ),
});

function stringLights(path: string, points: [number, number][]) {
  return {
    wire: <Path d={path} stroke={colors.ink} strokeWidth={1.6} fill="none" opacity={0.7} />,
    bulbs: points.map(([x, y], i): AmbientSprite => ({
      x: x - 5,
      y: y - 2,
      w: 10,
      h: 12,
      mode: 'twinkle',
      duration: 1400 + (i % 3) * 500,
      delay: i * 160,
      content: <Ellipse cx={5} cy={7} rx={4} ry={5} fill={[colors.butter, colors.coral, colors.sage, colors.lavender][i % 4]} stroke={colors.ink} strokeWidth={1.2} />,
    })),
  };
}

function tree(x: number, y: number, r: number, key: string) {
  return (
    <G key={key}>
      <Rect x={x - 5} y={y} width={10} height={r * 1.3} rx={4} fill={colors.cocoa} {...ink} strokeWidth={2} />
      <Circle cx={x} cy={y - r * 0.2} r={r} fill={colors.sage} {...ink} />
      <Circle cx={x - r * 0.35} cy={y - r * 0.5} r={r * 0.28} fill="#B7DBB4" />
    </G>
  );
}

function cafe(): SceneSet {
  const stripes = Array.from({ length: 7 }, (_, i) => i);
  const sw = 172 / 7;
  return {
    back: (
      <G>
        <Rect x={200} y={92} width={172} height={140} rx={6} fill="#F7E2C4" {...ink} />
        <Rect x={196} y={84} width={180} height={12} rx={5} fill={colors.cocoa} {...ink} />
        {stripes.map((i) => (
          <Path
            key={i}
            d={`M${200 + i * sw} 96 h${sw} v22 a${sw / 2} ${sw / 2} 0 0 1 ${-sw} 0 z`}
            fill={i % 2 ? colors.paper : colors.coral}
            {...ink}
            strokeWidth={2}
          />
        ))}
        <Rect x={236} y={56} width={100} height={28} rx={14} fill={colors.paper} {...ink} />
        <SvgText x={286} y={77} fontSize={19} fontFamily={DISPLAY} fill={colors.ink} textAnchor="middle">
          café
        </SvgText>
        <Rect x={316} y={146} width={40} height={86} rx={8} fill={colors.sage} {...ink} />
        <Circle cx={326} cy={190} r={2.6} fill={colors.ink} />
      </G>
    ),
    glow: (
      <G>
        <Rect x={216} y={146} width={84} height={56} rx={10} fill="#FFE6A6" {...ink} />
        <Line x1={258} y1={146} x2={258} y2={202} {...ink} strokeWidth={2} />
        <Path d="M224 196 q8-14 16 0 M268 196 q8-16 18 0" stroke={colors.cocoa} strokeWidth={3} fill="none" opacity={0.5} />
      </G>
    ),
    front: (
      <G>
        <Ellipse cx={120} cy={204} rx={50} ry={10} fill={colors.paper} {...ink} />
        <Rect x={116} y={210} width={8} height={26} fill={colors.ink} />
        <Ellipse cx={120} cy={238} rx={20} ry={4} fill={colors.ink} />
        <Path d="M98 188h14v8a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z" fill={colors.paper} {...ink} strokeWidth={2} />
        <Path d="M130 188h14v8a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z" fill={colors.peach} {...ink} strokeWidth={2} />
        <Path d="M362 232 l-6 -26 h20 l-6 26z" fill={colors.coral} {...ink} strokeWidth={2} />
        <Circle cx={366} cy={198} r={10} fill={colors.sage} {...ink} strokeWidth={2} />
      </G>
    ),
    slots: [
      { x: 66, y: 250, w: 54, pose: 'sit', holding: 'cup' },
      { x: 174, y: 250, w: 54, pose: 'sit' },
      { x: 268, y: 248, w: 48 },
      { x: 30, y: 256, w: 48 },
    ],
    ambient: [steam('s1', 98, 162, 0), steam('s2', 130, 160, 900)],
  };
}

function gym(): SceneSet {
  return {
    back: (
      <G>
        <Rect x={24} y={112} width={206} height={120} rx={8} fill="#DCE7F2" {...ink} />
        <Rect x={92} y={86} width={78} height={30} rx={10} fill={colors.coral} {...ink} />
        <SvgText x={131} y={108} fontSize={20} fontFamily={DISPLAY} fill={colors.paper} textAnchor="middle">
          GYM
        </SvgText>
        <Rect x={188} y={164} width={30} height={68} rx={6} fill={colors.blueMuted} {...ink} />
      </G>
    ),
    glow: (
      <G>
        <Rect x={40} y={134} width={136} height={60} rx={10} fill="#FFF4D6" {...ink} />
        <G stroke={colors.ink} strokeWidth={3} strokeLinecap="round">
          <Line x1={58} y1={176} x2={86} y2={176} />
          <Line x1={58} y1={160} x2={86} y2={160} />
          <Line x1={120} y1={150} x2={120} y2={186} />
          <Line x1={150} y1={150} x2={150} y2={186} />
          <Line x1={116} y1={156} x2={154} y2={156} />
        </G>
      </G>
    ),
    front: (
      <G>
        <Rect x={240} y={236} width={92} height={12} rx={6} fill={colors.lavender} {...ink} strokeWidth={2} />
        <Path d="M352 236 a12 12 0 1 1 22 0 z" fill={colors.ink} />
        <Path d="M357 222 a6 6 0 0 1 12 0" stroke={colors.ink} strokeWidth={3} fill="none" />
        <G>
          <Rect x={30} y={242} width={30} height={5} rx={2.5} fill={colors.ink} />
          <Rect x={26} y={236} width={8} height={16} rx={3} fill={colors.blueMuted} {...ink} strokeWidth={1.6} />
          <Rect x={56} y={236} width={8} height={16} rx={3} fill={colors.blueMuted} {...ink} strokeWidth={1.6} />
        </G>
      </G>
    ),
    slots: [
      { x: 262, y: 244, w: 52, holding: 'dumbbell' },
      { x: 318, y: 246, w: 52 },
      { x: 120, y: 254, w: 50, holding: 'dumbbell' },
      { x: 210, y: 256, w: 48 },
    ],
  };
}

function dinner(): SceneSet {
  const lights = stringLights('M0 54 Q195 128 390 54', [
    [40, 66],
    [90, 80],
    [140, 89],
    [195, 92],
    [250, 89],
    [300, 80],
    [350, 66],
  ]);
  return {
    back: (
      <G>
        {tree(40, 178, 34, 't1')}
        {tree(356, 170, 40, 't2')}
        <Rect x={6} y={40} width={8} height={192} rx={3} fill={colors.cocoa} {...ink} strokeWidth={2} />
        <Rect x={376} y={40} width={8} height={192} rx={3} fill={colors.cocoa} {...ink} strokeWidth={2} />
        {lights.wire}
      </G>
    ),
    front: (
      <G>
        <Rect x={62} y={196} width={266} height={12} rx={5} fill="#F7E2C4" {...ink} />
        <Path d="M66 208 h258 v14 q-16 8 -32 0 q-16 8 -32 0 q-16 8 -32 0 q-16 8 -32 0 q-16 8 -32 0 q-16 8 -32 0 q-16 8 -32 0 q-16 8 -32 0 z" fill={colors.paper} {...ink} strokeWidth={2} />
        <Rect x={80} y={224} width={8} height={18} fill={colors.ink} />
        <Rect x={302} y={224} width={8} height={18} fill={colors.ink} />
        <Ellipse cx={128} cy={194} rx={18} ry={5} fill={colors.paper} {...ink} strokeWidth={1.8} />
        <Ellipse cx={262} cy={194} rx={18} ry={5} fill={colors.paper} {...ink} strokeWidth={1.8} />
        <Path d="M176 194 a20 12 0 0 0 40 0z" fill={colors.peach} {...ink} strokeWidth={2} />
        <Path d="M184 190 q6 -8 12 0 q6 -8 12 0" stroke={colors.coral} strokeWidth={3} fill="none" />
        <Rect x={232} y={176} width={6} height={20} rx={2} fill={colors.paper} {...ink} strokeWidth={1.6} />
        <Path d="M150 176 h12 l-2 12 h-8z" fill={colors.rose} {...ink} strokeWidth={1.6} />
      </G>
    ),
    slots: [
      { x: 102, y: 240, w: 54, pose: 'sit' },
      { x: 162, y: 236, w: 54, pose: 'sit' },
      { x: 226, y: 236, w: 54, pose: 'sit' },
      { x: 290, y: 240, w: 54, pose: 'sit' },
    ],
    ambient: [
      ...lights.bulbs,
      {
        x: 229,
        y: 160,
        w: 12,
        h: 18,
        mode: 'flicker',
        duration: 700,
        content: <Path d="M6 17c-5-3-3-9 0-15 3 6 5 12 0 15z" fill={colors.butter} stroke={colors.coral} strokeWidth={1.4} />,
      },
    ],
  };
}

function bar(): SceneSet {
  return {
    back: (
      <G>
        <Rect x={160} y={98} width={220} height={134} rx={8} fill="#5A4C6E" {...ink} />
        <Rect x={156} y={90} width={228} height={12} rx={5} fill={colors.ink} />
        <Rect x={330} y={156} width={36} height={76} rx={6} fill="#3E3450" {...ink} />
      </G>
    ),
    glow: (
      <G>
        <Rect x={196} y={116} width={116} height={44} rx={22} fill="none" stroke="#FF8FB1" strokeWidth={10} opacity={0.25} />
        <Rect x={196} y={116} width={116} height={44} rx={22} fill="none" stroke="#FF8FB1" strokeWidth={3.5} />
        <SvgText x={254} y={146} fontSize={24} fontFamily={DISPLAY} fill="#FFB3CA" textAnchor="middle">
          bar
        </SvgText>
        <Rect x={180} y={176} width={130} height={40} rx={8} fill="#FFD98A" {...ink} strokeWidth={2} />
        <Path d="M196 216 q10-18 20 0 M240 216 q10-20 22 0 M280 216 q8-14 16 0" stroke="#5A4C6E" strokeWidth={4} fill="none" opacity={0.55} />
      </G>
    ),
    front: (
      <G>
        <Ellipse cx={100} cy={190} rx={36} ry={8} fill={colors.cocoa} {...ink} />
        <Rect x={96} y={196} width={8} height={40} fill={colors.ink} />
        <Ellipse cx={100} cy={238} rx={18} ry={4} fill={colors.ink} />
        <Path d="M84 172 h12 l-6 8z" fill={colors.lavender} {...ink} strokeWidth={1.6} />
        <Line x1={90} y1={180} x2={90} y2={188} {...ink} strokeWidth={1.6} />
        <Rect x={106} y={174} width={10} height={14} rx={2} fill={colors.butter} {...ink} strokeWidth={1.6} />
      </G>
    ),
    slots: [
      { x: 52, y: 248, w: 54, holding: 'glass' },
      { x: 150, y: 248, w: 54, holding: 'glass' },
      { x: 220, y: 254, w: 50 },
      { x: 290, y: 256, w: 50, holding: 'glass' },
    ],
  };
}

function park(): SceneSet {
  return {
    back: (
      <G>
        {tree(54, 166, 40, 't1')}
        {tree(338, 156, 46, 't2')}
        {tree(388, 182, 26, 't3')}
        <Path d="M120 300 Q170 262 214 246 T300 216 L330 216 Q262 246 236 262 T200 300 Z" fill="#F1DDBB" opacity={0.95} />
        <G {...ink} strokeWidth={2}>
          <Rect x={230} y={196} width={64} height={8} rx={3} fill={colors.cocoa} />
          <Rect x={230} y={208} width={64} height={7} rx={3} fill={colors.cocoa} />
          <Line x1={238} y1={215} x2={238} y2={228} />
          <Line x1={286} y1={215} x2={286} y2={228} />
        </G>
      </G>
    ),
    slots: [
      { x: 160, y: 262, w: 54 },
      { x: 212, y: 256, w: 52 },
      { x: 104, y: 266, w: 50 },
      { x: 268, y: 252, w: 48 },
    ],
    ambient: [
      {
        x: 140,
        y: 60,
        w: 30,
        h: 14,
        mode: 'drift',
        duration: 6000,
        distance: 30,
        content: <Path d="M2 8 q6 -7 13 0 q7 -7 13 0" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" />,
      },
      {
        x: 190,
        y: 84,
        w: 22,
        h: 12,
        mode: 'drift',
        duration: 7000,
        delay: 400,
        distance: 24,
        content: <Path d="M2 7 q4.5 -5 9.5 0 q4.5 -5 9.5 0" stroke={colors.ink} strokeWidth={1.8} fill="none" strokeLinecap="round" />,
      },
    ],
  };
}

function games(): SceneSet {
  const lights = stringLights('M30 70 Q200 120 380 64', [
    [80, 84],
    [140, 96],
    [200, 100],
    [260, 96],
    [320, 84],
  ]);
  return {
    back: (
      <G>
        {tree(36, 170, 44, 't1')}
        {tree(370, 168, 34, 't2')}
        {lights.wire}
      </G>
    ),
    front: (
      <G>
        <Rect x={98} y={200} width={200} height={12} rx={5} fill={colors.cocoa} {...ink} />
        <Rect x={112} y={212} width={9} height={28} fill={colors.ink} />
        <Rect x={276} y={212} width={9} height={28} fill={colors.ink} />
        <G transform="translate(150 186) rotate(-4)">
          <Rect width={46} height={16} rx={3} fill={colors.paper} {...ink} strokeWidth={1.8} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Rect key={i} x={2 + i * 7} y={i % 2 ? 2 : 8} width={7} height={6} fill={colors.coral} opacity={0.75} />
          ))}
        </G>
        <Rect x={224} y={190} width={14} height={10} rx={2} fill={colors.lavender} {...ink} strokeWidth={1.6} transform="rotate(10 231 195)" />
        <Rect x={240} y={192} width={14} height={10} rx={2} fill={colors.sky} {...ink} strokeWidth={1.6} transform="rotate(-8 247 197)" />
      </G>
    ),
    slots: [
      { x: 128, y: 240, w: 54, pose: 'sit' },
      { x: 196, y: 236, w: 54, pose: 'sit' },
      { x: 266, y: 240, w: 54, pose: 'sit' },
      { x: 336, y: 254, w: 48 },
    ],
    ambient: [
      ...lights.bulbs,
      {
        x: 118,
        y: 168,
        w: 20,
        h: 20,
        mode: 'bob',
        duration: 1600,
        distance: 4,
        content: (
          <G>
            <Rect x={2} y={2} width={16} height={16} rx={4} fill={colors.butterSoft} {...ink} strokeWidth={1.8} />
            <Circle cx={7} cy={7} r={1.6} fill={colors.ink} />
            <Circle cx={13} cy={13} r={1.6} fill={colors.ink} />
          </G>
        ),
      },
    ],
  };
}

function city(): SceneSet {
  const blocks: [number, number, number, string][] = [
    [8, 120, 52, colors.lavender],
    [64, 92, 46, colors.sky],
    [114, 132, 58, colors.peach],
    [234, 104, 50, colors.sage],
    [288, 130, 46, colors.rose],
    [338, 96, 48, colors.butterSoft],
  ];
  return {
    back: (
      <G>
        {blocks.map(([x, y, w, fill]) => (
          <G key={x}>
            <Rect x={x} y={y} width={w} height={226 - y} rx={6} fill={fill} {...ink} />
          </G>
        ))}
        <Path d="M176 226 V120 q24 -30 48 0 V226z" fill="#EADBC6" {...ink} />
      </G>
    ),
    glow: (
      <G>
        {blocks.flatMap(([x, y, w]) =>
          [0, 1, 2].flatMap((row) =>
            [0, 1].map((col) => (
              <Rect key={`${x}-${row}-${col}`} x={x + 9 + col * (w / 2 - 4)} y={y + 14 + row * 26} width={w / 2 - 14} height={14} rx={3} fill="#FFF0BC" stroke={colors.ink} strokeWidth={1.5} />
            )),
          ),
        )}
      </G>
    ),
    slots: [
      { x: 120, y: 262, w: 52 },
      { x: 186, y: 258, w: 52 },
      { x: 252, y: 262, w: 50 },
      { x: 60, y: 266, w: 48 },
    ],
    ambient: [
      {
        x: 186,
        y: 50,
        w: 28,
        h: 38,
        mode: 'bob',
        duration: 2200,
        distance: 5,
        content: (
          <G>
            <Path d="M14 36 C4 22 2 16 2 13 a12 12 0 0 1 24 0 c0 3-2 9-12 23z" fill={colors.coral} {...ink} strokeWidth={2} />
            <Circle cx={14} cy={13} r={4.5} fill={colors.paper} {...ink} strokeWidth={1.8} />
          </G>
        ),
      },
    ],
  };
}

function party(): SceneSet {
  const lights = stringLights('M180 132 L276 70 L372 132', [
    [200, 120],
    [228, 102],
    [256, 84],
    [296, 84],
    [324, 102],
    [352, 120],
  ]);
  return {
    back: (
      <G>
        {tree(60, 172, 38, 't1')}
        <Rect x={318} y={70} width={18} height={40} fill={colors.cocoa} {...ink} />
        <Path d="M178 136 L276 66 L374 136 Z" fill={colors.coral} {...ink} />
        <Rect x={192} y={134} width={170} height={98} rx={4} fill="#F7D3B6" {...ink} />
        <Path d="M290 300 L300 232 L340 232 L380 300 Z" fill="#FFE38A" opacity={0.35} />
        {lights.wire}
      </G>
    ),
    glow: (
      <G>
        <Rect x={208} y={150} width={46} height={40} rx={6} fill="#FFE38A" {...ink} />
        <Path d="M218 190 q6-16 12 0 M236 190 q6-18 12 0" fill="#C9907A" opacity={0.6} />
        <Rect x={300} y={168} width={40} height={64} rx={6} fill="#FFE9A6" {...ink} />
        <Circle cx={308} cy={202} r={2.4} fill={colors.ink} />
        <Circle cx={276} cy={110} r={12} fill="#FFE38A" {...ink} strokeWidth={2} />
      </G>
    ),
    slots: [
      { x: 262, y: 248, w: 50 },
      { x: 206, y: 254, w: 52 },
      { x: 148, y: 258, w: 52 },
      { x: 92, y: 262, w: 50 },
    ],
    ambient: [...lights.bulbs, note(222, 128, 0, colors.butter), note(250, 120, 1300, colors.lavender), note(236, 126, 2400, colors.sage)],
  };
}

const SETS: Record<SceneKind, () => SceneSet> = { cafe, gym, dinner, bar, park, games, city, party };

export function sceneSet(kind: SceneKind): SceneSet {
  return SETS[kind]();
}
