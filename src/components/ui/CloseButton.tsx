import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { colors } from '@/theme';
import { Squish } from './Squish';

export function CloseButton({ onPress, label = 'Close' }: { onPress: () => void; label?: string }) {
  return (
    <Squish onPress={onPress} accessibilityLabel={label} hitSlop={10}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.paper,
          borderWidth: 2,
          borderColor: colors.ink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Line x1={2} y1={2} x2={12} y2={12} stroke={colors.ink} strokeWidth={2.4} strokeLinecap="round" />
          <Line x1={12} y1={2} x2={2} y2={12} stroke={colors.ink} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      </View>
    </Squish>
  );
}
