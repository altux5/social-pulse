import { Text, type TextProps } from 'react-native';
import { colors, typeScale, type TypeVariant } from '@/theme';

interface TxtProps extends TextProps {
  variant?: TypeVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Txt({ variant = 'body', color = colors.ink, align, style, ...rest }: TxtProps) {
  return <Text {...rest} style={[typeScale[variant], { color, textAlign: align }, style]} />;
}
