import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { dayLabel } from '@/domain/time';
import type { Availability, DateKey } from '@/domain/types';
import type { VisibleItem } from '@/state/hooks';
import { useSocial } from '@/state/store';
import { colors, fonts, radii } from '@/theme';
import { PeriodIcon } from '../icons/ActivityIcon';
import { AvatarCluster } from '../people/AvatarCluster';
import { namesList } from '../social/text';
import { Txt } from '../ui/Txt';
import { LandscapeItem } from './LandscapeItem';

type Anchor = { x: number; y: number };

function trailPath(points: Anchor[]): string {
  if (points.length < 2) return '';
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    d += ` C${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`;
  }
  return d;
}

interface Props {
  items: VisibleItem[];
  availability: Availability[];
  now: Date;
  width: number;
}

/** Everything coming up, laid out as a little winding path through the week. */
export function Landscape({ items, availability, now, width }: Props) {
  const users = useSocial((s) => s.users);
  const viewerId = useSocial((s) => s.viewerId);
  const [anchors, setAnchors] = useState<Record<string, Anchor>>({});
  const [height, setHeight] = useState(0);

  const onAnchor = useCallback((id: string, x: number, y: number) => {
    setAnchors((prev) => (prev[id]?.x === x && prev[id]?.y === y ? prev : { ...prev, [id]: { x, y } }));
  }, []);

  const days = useMemo(() => {
    const map = new Map<DateKey, { items: VisibleItem[]; avail: Availability[] }>();
    const slot = (d: DateKey) => {
      if (!map.has(d)) map.set(d, { items: [], avail: [] });
      return map.get(d)!;
    };
    items.forEach((e) => slot(e.item.date).items.push(e));
    availability.forEach((a) => slot(a.date).avail.push(a));
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [items, availability]);

  const liveIds = new Set<string>(days.flatMap(([date, g]) => [`day-${date}`, ...g.items.map((e) => e.item.id)]));
  const path = trailPath(
    Object.entries(anchors)
      .filter(([id]) => liveIds.has(id))
      .map(([, a]) => a)
      .sort((a, b) => a.y - b.y),
  );

  let index = 0;
  const children: ReactNode[] = [];
  for (const [date, group] of days) {
    const availIds = [...new Set(group.avail.map((a) => a.userId))];
    children.push(
      <DaySign
        key={`day-${date}`}
        label={dayLabel(date, now)}
        period={group.avail[0]?.timePeriod ?? 'afternoon'}
        availIds={availIds}
        availText={
          !availIds.length
            ? ''
            : availIds.length === 1 && availIds[0] === viewerId
              ? 'You’re around'
              : `${namesList(availIds, users, viewerId)} ${availIds.length === 1 ? 'is' : 'are'} around`
        }
        onLayout={(e) => {
          const { x, y, height: h } = e.nativeEvent.layout;
          onAnchor(`day-${date}`, x + 60, y + h / 2);
        }}
      />,
    );
    for (const entry of group.items) {
      children.push(<LandscapeItem key={entry.item.id} entry={entry} index={index} width={width} now={now} onAnchor={onAnchor} />);
      index += 1;
    }
  }

  return (
    <View onLayout={(e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height)}>
      {path && height ? (
        <Animated.View entering={FadeIn.duration(800)} style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
          <Svg width={width} height={height}>
            <Path d={path} stroke="#E2CFB2" strokeWidth={4} strokeLinecap="round" strokeDasharray="1 14" fill="none" />
          </Svg>
        </Animated.View>
      ) : null}
      {children}
    </View>
  );
}

interface DaySignProps {
  label: string;
  period: Availability['timePeriod'];
  availIds: string[];
  availText: string;
  onLayout: (e: LayoutChangeEvent) => void;
}

function DaySign({ label, period, availIds, availText, onLayout }: DaySignProps) {
  return (
    <View onLayout={onLayout} style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginLeft: 22, marginRight: 16, marginTop: 6, marginBottom: 22 }}>
      <View
        style={{
          backgroundColor: colors.paper,
          borderWidth: 2,
          borderColor: colors.ink,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 5,
          transform: [{ rotate: '-2deg' }],
        }}
      >
        <Txt variant="heading" style={{ fontFamily: fonts.displayBold }}>
          {label}
        </Txt>
      </View>
      {availIds.length ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingLeft: 6,
            paddingRight: 12,
            paddingVertical: 4,
            borderRadius: radii.chip,
            backgroundColor: colors.butterSoft,
            flexShrink: 1,
          }}
        >
          <PeriodIcon period={period ?? 'afternoon'} size={20} />
          <AvatarCluster userIds={availIds} size={22} max={4} />
          <Txt variant="small" style={{ flexShrink: 1 }} numberOfLines={1}>
            {availText}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}
