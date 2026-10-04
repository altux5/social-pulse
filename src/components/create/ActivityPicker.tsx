import { View } from 'react-native';
import { ACTIVITIES } from '@/domain/activities';
import type { ActivityType } from '@/domain/types';
import { colors, fonts } from '@/theme';
import { ActivityIcon } from '../icons/ActivityIcon';
import { Squish } from '../ui/Squish';
import { Txt } from '../ui/Txt';

interface Props {
  options: ActivityType[];
  value: ActivityType[];
  onChange: (next: ActivityType[]) => void;
}

/** Multi-select bubbles. "Everything" means "I just want to see you" and stands alone. */
export function ActivityPicker({ options, value, onChange }: Props) {
  const toggle = (a: ActivityType) => {
    if (a === 'everything') return onChange(value.includes('everything') ? [] : ['everything']);
    const without = value.filter((v) => v !== 'everything');
    onChange(without.includes(a) ? without.filter((v) => v !== a) : [...without, a]);
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 }}>
      {options.map((a, i) => {
        const selected = value.includes(a);
        return (
          <Squish
            key={a}
            onPress={() => toggle(a)}
            accessibilityLabel={ACTIVITIES[a].label}
            accessibilityState={{ selected }}
            style={{ width: '24%', alignItems: 'center', marginTop: i % 2 ? 12 : 0 }}
          >
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: selected ? colors.ink : colors.line,
                backgroundColor: selected ? ACTIVITIES[a].tint : colors.paper,
                transform: [{ scale: selected ? 1.06 : 1 }, { rotate: selected ? `${i % 2 ? 4 : -4}deg` : '0deg' }],
              }}
            >
              <ActivityIcon type={a} size={40} />
            </View>
            <Txt variant="small" align="center" style={{ marginTop: 6, fontFamily: selected ? fonts.bodyBold : fonts.body }}>
              {ACTIVITIES[a].label}
            </Txt>
          </Squish>
        );
      })}
    </View>
  );
}
