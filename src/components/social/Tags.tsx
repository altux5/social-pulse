import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { ID } from '@/domain/types';
import { useSocial } from '@/state/store';
import { colors, fonts, radii } from '@/theme';
import { Ambient } from '../scene/Ambient';
import { Txt } from '../ui/Txt';

export function UpNext({ live, light = false }: { live?: boolean; light?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <Ambient mode="twinkle" duration={900}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.coral }} />
      </Ambient>
      <Txt variant="label" color={light ? colors.paper : colors.coralDeep}>
        {live ? 'happening now' : 'up next'}
      </Txt>
    </View>
  );
}

/** Marks the one-hop visibility setting and, when relevant, who brought you in. */
export function FofTag({ via, compact }: { via?: ID; compact?: boolean }) {
  const users = useSocial((s) => s.users);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radii.chip,
        backgroundColor: 'rgba(255,250,242,0.75)',
        marginTop: 10,
      }}
    >
      <Svg width={22} height={12} viewBox="0 0 22 12">
        <Circle cx={6} cy={6} r={4.5} stroke={colors.ink} strokeWidth={1.8} fill="none" />
        <Circle cx={16} cy={6} r={4.5} stroke={colors.ink} strokeWidth={1.8} fill={colors.butter} />
      </Svg>
      <Txt variant="small" style={{ fontFamily: fonts.bodyBold }}>
        {via ? `through ${users[via]?.name ?? 'a friend'}` : compact ? 'friends of friends' : 'friends of friends welcome'}
      </Txt>
    </View>
  );
}

/** Speech-bubble tag the creator sees when someone new is in. */
export function NewsTag({ names }: { names: string }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radii.chip,
        backgroundColor: colors.coral,
      }}
    >
      <Txt variant="small" style={{ fontFamily: fonts.bodyBold }}>
        {names} {names.includes('&') || names.includes(',') ? 'are' : 'is'} in!
      </Txt>
    </View>
  );
}
