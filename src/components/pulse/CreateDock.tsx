import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useViewer } from '@/state/hooks';
import { colors, fonts, outline, radii } from '@/theme';
import { Avatar } from '../people/Avatar';
import { Float } from '../ui/Float';
import { Squish } from '../ui/Squish';
import { Txt } from '../ui/Txt';

/** Not a tab bar: one big invitation to put something out there, two small companions. */
export function CreateDock() {
  const insets = useSafeAreaInsets();
  const viewer = useViewer();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="dockFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.cream} stopOpacity={0} />
            <Stop offset="0.6" stopColor={colors.cream} stopOpacity={0.85} />
            <Stop offset="1" stopColor={colors.cream} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dockFade)" />
      </Svg>

      <View pointerEvents="box-none" style={styles.row}>
        <Float amplitude={2.5} duration={4200} delay={300} style={{ marginBottom: 14 }}>
          <Satellite label="I’m around" onPress={() => router.push('/availability')}>
            <Svg width={30} height={30} viewBox="0 0 40 40">
              <Circle cx={20} cy={20} r={8} fill={colors.butter} stroke={colors.ink} strokeWidth={2.2} />
              {[0, 60, 120, 180, 240, 300].map((d) => {
                const a = (d * Math.PI) / 180;
                return <Line key={d} x1={20 + Math.cos(a) * 12} y1={20 + Math.sin(a) * 12} x2={20 + Math.cos(a) * 15.5} y2={20 + Math.sin(a) * 15.5} stroke={colors.ink} strokeWidth={2.2} strokeLinecap="round" />;
              })}
            </Svg>
          </Satellite>
        </Float>

        <Float amplitude={3} duration={3800}>
          <View style={{ transform: [{ rotate: '-1.5deg' }] }}>
          <Squish onPress={() => router.push('/create')} accessibilityLabel="I wanna hang out. Create an intention">
            <View style={styles.mainShadow} />
            <View style={styles.main}>
              {viewer ? <Avatar user={viewer} size={36} ring={null} /> : null}
              <Txt variant="heading" style={{ fontFamily: fonts.displayBold }}>
                I wanna hang out…
              </Txt>
            </View>
          </Squish>
          </View>
        </Float>

        <Float amplitude={2.5} duration={4600} delay={800} style={{ marginBottom: 22 }}>
          <Satellite label="Plan it" onPress={() => router.push({ pathname: '/create', params: { mode: 'event' } })}>
            <Svg width={30} height={30} viewBox="0 0 40 40">
              <Path d="M6 12h28v5a3 3 0 0 0 0 6v5H6v-5a3 3 0 0 0 0-6z" fill={colors.lavender} stroke={colors.ink} strokeWidth={2.2} strokeLinejoin="round" />
              <Line x1={16} y1={13} x2={16} y2={27} stroke={colors.ink} strokeWidth={2} strokeDasharray="2 3" />
            </Svg>
          </Satellite>
        </Float>
      </View>
    </View>
  );
}

function Satellite({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Squish onPress={onPress} accessibilityLabel={label} style={{ alignItems: 'center' }}>
      <View style={styles.satellite}>{children}</View>
      <Txt variant="small" style={{ fontFamily: fonts.bodyBold, fontSize: 11, marginTop: 3 }} color={colors.inkSoft}>
        {label}
      </Txt>
    </Squish>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 18 },
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10, paddingHorizontal: 12 },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 8,
    paddingRight: 22,
    paddingVertical: 8,
    borderRadius: radii.chip,
    backgroundColor: colors.butter,
    borderWidth: outline.width,
    borderColor: outline.color,
  },
  mainShadow: {
    position: 'absolute',
    left: 4,
    right: -4,
    top: 5,
    bottom: -5,
    borderRadius: radii.chip,
    backgroundColor: colors.stickerShadow,
  },
  satellite: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
