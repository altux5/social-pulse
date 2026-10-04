import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, outline, radii, shadows } from '@/theme';
import { Squish } from './Squish';
import { Txt } from './Txt';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  tint?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

/** Selectable pebble. Selected ones get an ink outline and a little colour. */
export function Chip({ label, selected, onPress, icon, tint = colors.butter, disabled, size = 'md', style }: ChipProps) {
  const pad = size === 'lg' ? { paddingHorizontal: 20, paddingVertical: 14 } : size === 'sm' ? { paddingHorizontal: 12, paddingVertical: 7 } : { paddingHorizontal: 16, paddingVertical: 10 };
  return (
    <Squish
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        pad,
        selected ? { backgroundColor: tint, borderColor: colors.ink } : null,
        disabled ? { opacity: 0.35 } : null,
        style,
      ]}
    >
      {icon}
      <Txt variant={size === 'lg' ? 'lead' : size === 'sm' ? 'small' : 'body'} style={selected ? { fontFamily: fonts.bodyBold } : null}>
        {label}
      </Txt>
    </Squish>
  );
}

interface ButtonProps {
  label: string;
  onPress?: () => void;
  tint?: string;
  textColor?: string;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

/** The big sticker button. Used for the one thing a screen wants you to do. */
export function BigButton({ label, onPress, tint = colors.coral, textColor = colors.ink, disabled, icon, style, accessibilityHint }: ButtonProps) {
  return (
    <Squish
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[{ alignSelf: 'stretch' }, disabled ? { opacity: 0.4 } : null, style]}
    >
      <View style={styles.bigShadow} />
      <View style={[styles.big, { backgroundColor: tint }]}>
        {icon}
        <Txt variant="heading" color={textColor} style={{ fontFamily: fonts.displayBold, letterSpacing: 0.6 }}>
          {label}
        </Txt>
      </View>
    </Squish>
  );
}

/** Quiet secondary action. */
export function SoftButton({ label, onPress, tint = colors.paper, textColor = colors.ink, disabled, icon, style }: ButtonProps) {
  return (
    <Squish
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={[styles.soft, { backgroundColor: tint }, shadows.low, disabled ? { opacity: 0.4 } : null, style]}
    >
      {icon}
      <Txt variant="body" color={textColor} style={{ fontFamily: fonts.bodyBold }}>
        {label}
      </Txt>
    </Squish>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radii.chip,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.line,
  },
  big: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: radii.chip,
    borderWidth: outline.width,
    borderColor: outline.color,
  },
  bigShadow: {
    position: 'absolute',
    left: 4,
    right: -4,
    top: 5,
    bottom: -5,
    borderRadius: radii.chip,
    backgroundColor: colors.stickerShadow,
  },
  soft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radii.chip,
  },
});
