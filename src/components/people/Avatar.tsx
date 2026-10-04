import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Ellipse, Rect } from 'react-native-svg';
import type { User } from '@/domain/types';
import { colors, shade } from '@/theme';
import { Face } from './Face';

interface AvatarProps {
  user: User;
  size?: number;
  ring?: string | null;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ user, size = 44, ring = colors.paper, style }: AvatarProps) {
  const ringWidth = ring ? Math.max(2, Math.round(size * 0.06)) : 0;
  return (
    <View
      accessibilityLabel={user.name}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: shade(user.color, 0.55),
          borderWidth: ringWidth,
          borderColor: ring ?? 'transparent',
        },
        style,
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Rect x={43} y={66} width={14} height={20} fill={shade(user.look.skin, -0.08)} />
        <Ellipse cx={50} cy={106} rx={38} ry={24} fill={user.color} />
        <Face cx={50} cy={48} r={23} look={user.look} />
      </Svg>
    </View>
  );
}
