import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocial } from '@/state/store';
import { colors, fonts, radii, shadows } from '@/theme';
import { Avatar } from '../people/Avatar';
import { Squish } from '../ui/Squish';
import { Txt } from '../ui/Txt';

/** Gentle note from your people ("Ece is in!"). Not a reward, just news. */
export function FeedbackBubble() {
  const insets = useSafeAreaInsets();
  const feedback = useSocial((s) => s.feedback);
  const dismiss = useSocial((s) => s.dismissFeedback);
  const user = useSocial((s) => (feedback?.userId ? s.users[feedback.userId] : undefined));

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(dismiss, 3400);
    return () => clearTimeout(t);
  }, [feedback, dismiss]);

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + 8, left: 0, right: 0, alignItems: 'center' }}>
      {feedback ? (
        <Animated.View key={feedback.id} entering={FadeInUp.duration(380)} exiting={FadeOutUp.duration(260)}>
          <Squish
            onPress={dismiss}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`${feedback.title} ${feedback.subtitle ?? ''}`}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingLeft: user ? 6 : 18,
                paddingRight: 18,
                paddingVertical: 6,
                borderRadius: radii.chip,
                backgroundColor: colors.paper,
                borderWidth: 2,
                borderColor: colors.ink,
                maxWidth: 340,
              },
              shadows.lift,
            ]}
          >
            {user ? <Avatar user={user} size={38} ring={null} /> : null}
            <View style={{ flexShrink: 1, paddingVertical: user ? 0 : 6 }}>
              <Txt variant="body" style={{ fontFamily: fonts.displayBold, fontSize: 17 }}>
                {feedback.title}
              </Txt>
              {feedback.subtitle ? (
                <Txt variant="small" color={colors.inkSoft} numberOfLines={2}>
                  {feedback.subtitle}
                </Txt>
              ) : null}
            </View>
          </Squish>
        </Animated.View>
      ) : null}
    </View>
  );
}
