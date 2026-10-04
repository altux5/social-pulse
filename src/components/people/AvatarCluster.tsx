import { useState } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { LinearTransition, withSpring, withTiming, ZoomIn, type EntryExitAnimationFunction } from 'react-native-reanimated';
import type { ID } from '@/domain/types';
import { useSocial } from '@/state/store';
import { colors, fonts } from '@/theme';
import { Txt } from '../ui/Txt';
import { Avatar } from './Avatar';

/** New participants rise into the cluster from below (where the "I'm in" button lives). */
const riseIn: EntryExitAnimationFunction = () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: 80 }, { scale: 0.4 }] },
    animations: {
      opacity: withTiming(1, { duration: 280 }),
      transform: [
        { translateY: withSpring(0, { damping: 17, stiffness: 140 }) },
        { scale: withSpring(1, { damping: 14, stiffness: 170 }) },
      ],
    },
  };
};

// Reanimated web only supports its predefined layout animations.
const joinEntering = Platform.OS === 'web' ? ZoomIn.duration(420) : riseIn;

interface ClusterProps {
  userIds: ID[];
  size?: number;
  max?: number;
  showNames?: boolean;
  viewerId?: ID;
  style?: StyleProp<ViewStyle>;
}

export function AvatarCluster({ userIds, size = 34, max = 6, showNames = false, viewerId, style }: ClusterProps) {
  const users = useSocial((s) => s.users);
  const [initial] = useState(() => new Set(userIds));
  const shown = userIds.slice(0, max);
  const extra = userIds.length - shown.length;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-start', flexWrap: showNames ? 'wrap' : 'nowrap', rowGap: 10 }, style]}>
      {shown.map((id, i) => {
        const user = users[id];
        if (!user) return null;
        const lift = ((i % 3) - 1) * size * 0.07;
        return (
          <Animated.View
            key={id}
            entering={initial.has(id) ? undefined : joinEntering}
            layout={LinearTransition.duration(320)}
            style={{ marginLeft: i === 0 ? 0 : showNames ? 8 : -size * 0.3, zIndex: shown.length - i }}
          >
            <View style={{ alignItems: 'center', transform: [{ translateY: lift }, { rotate: `${((i % 3) - 1) * 4}deg` }] }}>
              <Avatar user={user} size={size} />
              {showNames ? (
                <Txt variant="small" style={{ marginTop: 4, fontFamily: fonts.bodyBold }} color={colors.inkSoft}>
                  {id === viewerId ? 'You' : user.name}
                </Txt>
              ) : null}
            </View>
          </Animated.View>
        );
      })}
      {extra > 0 ? (
        <View
          style={{
            marginLeft: showNames ? 8 : -size * 0.3,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.sand,
            borderWidth: 2,
            borderColor: colors.paper,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Txt variant="small" style={{ fontFamily: fonts.bodyBold }}>
            +{extra}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}
