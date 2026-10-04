import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { AudienceType, ID } from '@/domain/types';
import { useFriends, useMyGroups } from '@/state/hooks';
import { colors, fonts, radii } from '@/theme';
import { Avatar } from '../people/Avatar';
import { AvatarCluster } from '../people/AvatarCluster';
import { Chip } from '../ui/Buttons';
import { Squish } from '../ui/Squish';
import { Txt } from '../ui/Txt';

interface Props {
  type: AudienceType;
  groupIds: ID[];
  friendIds: ID[];
  onType: (t: AudienceType) => void;
  onGroups: (ids: ID[]) => void;
  onFriends: (ids: ID[]) => void;
}

const toggle = (list: ID[], id: ID) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

export function AudiencePicker({ type, groupIds, friendIds, onType, onGroups, onFriends }: Props) {
  const friends = useFriends();
  const groups = useMyGroups();

  const option = (t: AudienceType, title: string, subtitle: string, extra?: ReactNode, tint: string = colors.butter) => {
    const selected = type === t;
    return (
      <Squish
        key={t}
        onPress={() => onType(t)}
        accessibilityLabel={title}
        accessibilityState={{ selected }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          paddingHorizontal: 18,
          paddingVertical: 14,
          borderRadius: 28,
          borderWidth: 2,
          borderColor: selected ? colors.ink : colors.line,
          backgroundColor: selected ? tint : colors.paper,
        }}
      >
        <View style={{ flexShrink: 1 }}>
          <Txt variant="heading">{title}</Txt>
          <Txt variant="small" color={colors.inkSoft}>
            {subtitle}
          </Txt>
        </View>
        {extra}
      </Squish>
    );
  };

  return (
    <View style={{ gap: 10 }}>
      {option('all', 'All my friends', `${friends.length} people`, <AvatarCluster userIds={friends.map((f) => f.id)} size={28} max={4} />)}
      {option('groups', 'Friend groups', groups.length ? groups.map((g) => g.name).join(', ') : 'No groups yet', undefined, colors.mint)}
      {type === 'groups' ? (
        <Animated.View entering={FadeIn.duration(250)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 6 }}>
          {groups.map((g) => (
            <Chip
              key={g.id}
              label={`${g.name} · ${g.memberIds.length}`}
              selected={groupIds.includes(g.id)}
              onPress={() => onGroups(toggle(groupIds, g.id))}
              tint={colors.mint}
            />
          ))}
        </Animated.View>
      ) : null}
      {option('friends', 'Specific friends', friendIds.length ? `${friendIds.length} picked` : 'Pick exactly who', undefined, colors.lavender)}
      {type === 'friends' ? (
        <Animated.View entering={FadeIn.duration(250)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 2 }}>
          {friends.map((f) => {
            const picked = friendIds.includes(f.id);
            return (
              <Squish
                key={f.id}
                onPress={() => onFriends(toggle(friendIds, f.id))}
                accessibilityLabel={f.name}
                accessibilityState={{ selected: picked }}
                style={{ width: 70, alignItems: 'center', paddingVertical: 4 }}
              >
                <View style={{ padding: 3, borderRadius: radii.chip, backgroundColor: picked ? colors.lavenderDeep : 'transparent' }}>
                  <Avatar user={f} size={50} />
                </View>
                <Txt variant="small" style={{ fontFamily: picked ? fonts.bodyBold : fonts.body }}>
                  {f.name}
                </Txt>
              </Squish>
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}
