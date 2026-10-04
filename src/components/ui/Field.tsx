import { TextInput, type TextInputProps } from 'react-native';
import { colors, fonts } from '@/theme';

export function Field({ style, ...rest }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.inkFaint}
      {...rest}
      style={[
        {
          fontFamily: fonts.body,
          fontSize: 16,
          color: colors.ink,
          backgroundColor: colors.paper,
          borderRadius: 22,
          borderWidth: 2,
          borderColor: colors.line,
          paddingHorizontal: 16,
          paddingVertical: 13,
        },
        style,
      ]}
    />
  );
}
