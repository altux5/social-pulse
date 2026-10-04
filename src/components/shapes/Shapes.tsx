import { useMemo, useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';
import { blobPath, cloudPath } from './paths';

interface ShapeProps {
  seed: number;
  fill?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

function useSize() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const onLayout = (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev && Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1 ? prev : { w: width, h: height }));
  };
  return { size, onLayout };
}

/** Intention silhouette: soft, scalloped, shadow drifting below like it floats. */
export function Cloud({ seed, fill = colors.thought, style, contentStyle, children }: ShapeProps) {
  const { size, onLayout } = useSize();
  const d = useMemo(() => (size ? cloudPath(size.w, size.h, seed) : null), [size, seed]);
  return (
    <View style={style} onLayout={onLayout}>
      {size && d ? (
        <Svg
          width={size.w}
          height={size.h + 12}
          style={{ position: 'absolute', left: 0, top: 0 }}
          pointerEvents="none"
        >
          <Path d={d} fill={colors.thoughtShadow} transform="translate(0 10)" />
          <Path d={d} fill={fill} />
        </Svg>
      ) : null}
      <View style={[{ paddingHorizontal: 30, paddingVertical: 28 }, contentStyle]}>{children}</View>
    </View>
  );
}

/** Event silhouette: outlined pebble with a hard offset shadow, firmly placed. */
export function Island({ seed, fill = colors.butter, style, contentStyle, children }: ShapeProps) {
  const { size, onLayout } = useSize();
  const d = useMemo(() => (size ? blobPath(size.w, size.h, seed) : null), [size, seed]);
  return (
    <View style={style} onLayout={onLayout}>
      {size && d ? (
        <Svg
          width={size.w + 8}
          height={size.h + 8}
          style={{ position: 'absolute', left: 0, top: 0 }}
          pointerEvents="none"
        >
          <Path d={d} fill={colors.stickerShadow} transform="translate(5 6)" />
          <Path d={d} fill={fill} stroke={colors.ink} strokeWidth={2.5} />
        </Svg>
      ) : null}
      <View style={[{ paddingHorizontal: 24, paddingVertical: 22 }, contentStyle]}>{children}</View>
    </View>
  );
}
