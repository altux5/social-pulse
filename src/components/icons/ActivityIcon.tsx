import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import type { ActivityType, TimePeriod } from '@/domain/types';
import { colors } from '@/theme';

const stroke = { stroke: colors.ink, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Little hand-drawn stickers for each activity (40×40 grid). */
export function ActivityIcon({ type, size = 28 }: { type: ActivityType; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {(() => {
        switch (type) {
          case 'coffee':
            return (
              <G {...stroke}>
                <Path d="M9 16h18v8a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8z" fill={colors.paper} />
                <Path d="M27 18h2.5a3.5 3.5 0 0 1 0 7H27" fill="none" />
                <Path d="M10 21h16" stroke={colors.cocoa} strokeWidth={3} />
                <Path d="M14 6c-2 2 2 4 0 6M20 5c-2 2 2 4 0 6" fill="none" />
              </G>
            );
          case 'food':
            return (
              <G {...stroke}>
                <Path d="M6 20h28a14 11 0 0 1-28 0z" fill={colors.peach} />
                <Path d="M12 20c2-3 4 0 6-3s4 0 6-2 3 1 5 0" fill="none" stroke={colors.butter} strokeWidth={2.6} />
                <Line x1={24} y1={18} x2={34} y2={5} />
                <Line x1={27} y1={19} x2={37} y2={8} />
              </G>
            );
          case 'bar':
            return (
              <G {...stroke}>
                <Path d="M8 9h24L20 23z" fill={colors.lavender} />
                <Line x1={20} y1={23} x2={20} y2={33} />
                <Line x1={14} y1={34} x2={26} y2={34} />
                <Circle cx={25} cy={8} r={3} fill={colors.sage} />
              </G>
            );
          case 'gym':
            return (
              <G {...stroke}>
                <Rect x={4} y={13} width={6} height={14} rx={2} fill={colors.blueMuted} />
                <Rect x={30} y={13} width={6} height={14} rx={2} fill={colors.blueMuted} />
                <Rect x={10} y={16} width={4} height={8} rx={1.5} fill={colors.sky} />
                <Rect x={26} y={16} width={4} height={8} rx={1.5} fill={colors.sky} />
                <Line x1={14} y1={20} x2={26} y2={20} />
              </G>
            );
          case 'walk':
            return (
              <G {...stroke}>
                <Line x1={20} y1={24} x2={20} y2={35} stroke={colors.cocoa} strokeWidth={3} />
                <Circle cx={20} cy={16} r={11} fill={colors.sage} />
                <Path d="M14 15c2-3 5-3 7-1" fill="none" stroke={colors.mint} />
              </G>
            );
          case 'games':
            return (
              <G {...stroke}>
                <Rect x={8} y={8} width={24} height={24} rx={6} fill={colors.butterSoft} transform="rotate(-8 20 20)" />
                <G fill={colors.ink} stroke="none">
                  <Circle cx={14.5} cy={15} r={2.2} />
                  <Circle cx={20} cy={20} r={2.2} />
                  <Circle cx={25.5} cy={25} r={2.2} />
                </G>
              </G>
            );
          case 'explore':
            return (
              <G {...stroke}>
                <Circle cx={20} cy={20} r={14} fill={colors.mint} />
                <Path d="M20 9l4 11-4 11-4-11z" fill={colors.coral} />
                <Circle cx={20} cy={20} r={1.8} fill={colors.ink} />
              </G>
            );
          case 'party':
            return (
              <G {...stroke}>
                <Ellipse cx={18} cy={15} rx={9} ry={11} fill={colors.coral} />
                <Path d="M18 26l-2 3h4z" fill={colors.coral} />
                <Path d="M18 29c3 3-3 5 1 8" fill="none" />
                <Path d="M14 10c1-2 3-3 5-3" fill="none" stroke={colors.paper} />
                <Circle cx={31} cy={10} r={1.6} fill={colors.butter} />
                <Circle cx={32} cy={22} r={1.6} fill={colors.lavender} />
              </G>
            );
          case 'everything':
          default:
            return (
              <G {...stroke}>
                <Path d="M20 33S7 25 7 15.5A6.5 6.5 0 0 1 20 12a6.5 6.5 0 0 1 13 3.5C33 25 20 33 20 33z" fill={colors.rose} />
                <Path d="M12 14a3 3 0 0 1 3-3" fill="none" stroke={colors.paper} />
              </G>
            );
        }
      })()}
    </Svg>
  );
}

export function PeriodIcon({ period, size = 34 }: { period: TimePeriod; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {(() => {
        switch (period) {
          case 'morning':
            return (
              <G {...stroke}>
                <Path d="M8 28a12 12 0 0 1 24 0z" fill={colors.butter} />
                <Line x1={4} y1={28} x2={36} y2={28} />
                <Line x1={20} y1={7} x2={20} y2={11} />
                <Line x1={7} y1={14} x2={10} y2={17} />
                <Line x1={33} y1={14} x2={30} y2={17} />
              </G>
            );
          case 'afternoon':
            return (
              <G {...stroke}>
                <Circle cx={20} cy={20} r={8} fill={colors.butter} />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
                  const a = (d * Math.PI) / 180;
                  return <Line key={d} x1={20 + Math.cos(a) * 12} y1={20 + Math.sin(a) * 12} x2={20 + Math.cos(a) * 15} y2={20 + Math.sin(a) * 15} />;
                })}
              </G>
            );
          case 'evening':
            return (
              <G {...stroke}>
                <Path d="M8 26a12 12 0 0 1 24 0z" fill={colors.coral} />
                <Line x1={4} y1={26} x2={36} y2={26} />
                <Line x1={10} y1={31} x2={30} y2={31} stroke={colors.peach} />
              </G>
            );
          case 'night':
          default:
            return (
              <G {...stroke}>
                <Path d="M26 8a12 12 0 1 0 6 18A10 10 0 0 1 26 8z" fill={colors.lavender} />
                <Circle cx={10} cy={10} r={1.4} fill={colors.ink} stroke="none" />
                <Circle cx={33} cy={14} r={1.2} fill={colors.ink} stroke="none" />
              </G>
            );
        }
      })()}
    </Svg>
  );
}
