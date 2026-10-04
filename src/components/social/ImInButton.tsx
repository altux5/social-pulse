import { View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import type { SocialItem } from '@/domain/types';
import { isParticipant } from '@/domain/visibility';
import { useSocial } from '@/state/store';
import { colors, fonts, outline, radii } from '@/theme';
import { BigButton } from '../ui/Buttons';
import { Squish } from '../ui/Squish';
import { Txt } from '../ui/Txt';

/** The single social response. Creators don't see it on their own items. */
export function ImInButton({ item, compact = false }: { item: SocialItem; compact?: boolean }) {
  const viewerId = useSocial((s) => s.viewerId);
  const join = useSocial((s) => s.join);
  const leave = useSocial((s) => s.leave);
  if (item.creatorId === viewerId) return null;
  const joined = isParticipant(item, viewerId);

  if (compact) {
    return (
      <Squish
        onPress={() => void (joined ? leave(item.id) : join(item.id))}
        accessibilityLabel={joined ? "You're in. Tap to step out" : "I'm in"}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 9,
          borderRadius: radii.chip,
          borderWidth: 2,
          borderColor: colors.ink,
          backgroundColor: joined ? colors.mint : colors.coral,
        }}
      >
        <Txt variant="body" style={{ fontFamily: fonts.displayBold, letterSpacing: 0.4 }}>
          {joined ? 'You’re in ✓' : 'I’M IN'}
        </Txt>
      </Squish>
    );
  }

  if (!joined) {
    return (
      <Animated.View key="out" entering={FadeIn.duration(220)}>
        <BigButton label="I’M IN" onPress={() => void join(item.id)} tint={colors.coral} />
      </Animated.View>
    );
  }

  return (
    <Animated.View key="in" entering={ZoomIn.duration(260)}>
      <Squish
        onPress={() => void leave(item.id)}
        accessibilityLabel="You're in. Tap to step out"
        style={{
          alignItems: 'center',
          paddingVertical: 12,
          borderRadius: radii.chip,
          borderWidth: outline.width,
          borderColor: colors.sageDeep,
          borderStyle: 'dashed',
          backgroundColor: colors.mint,
        }}
      >
        <Txt variant="heading" style={{ fontFamily: fonts.displayBold }}>
          You’re in ✓
        </Txt>
        <View>
          <Txt variant="small" color={colors.inkSoft}>
            tap if plans change
          </Txt>
        </View>
      </Squish>
    </Animated.View>
  );
}
