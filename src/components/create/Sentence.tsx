import type { ReactNode } from 'react';
import { View } from 'react-native';
import { colors, fonts } from '@/theme';
import { Txt } from '../ui/Txt';

export type Segment = string | { text: string; filled: boolean };

/** The flow writes a sentence as you go: "I wanna hang out on Friday evening". */
export function Sentence({ lines }: { lines: Segment[][] }) {
  return (
    <View style={{ gap: 2 }}>
      {lines.map((segments, i) => (
        <Txt key={i} variant="title" style={{ fontSize: 26, lineHeight: 34 }}>
          {segments.map((seg, j): ReactNode => {
            if (typeof seg === 'string') return seg;
            return (
              <Txt
                key={j}
                variant="title"
                color={seg.filled ? colors.ink : colors.inkFaint}
                style={{
                  fontSize: 26,
                  lineHeight: 34,
                  fontFamily: fonts.displayBold,
                  textDecorationLine: seg.filled ? 'underline' : 'none',
                  textDecorationColor: colors.coral,
                  textDecorationStyle: 'solid',
                }}
              >
                {seg.text}
              </Txt>
            );
          })}
        </Txt>
      ))}
    </View>
  );
}
