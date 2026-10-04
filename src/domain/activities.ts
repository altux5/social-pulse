import type { ActivityType, TimePeriod } from './types';

export type SceneKind = 'cafe' | 'gym' | 'dinner' | 'bar' | 'park' | 'games' | 'city' | 'party';

export interface ActivityMeta {
  type: ActivityType;
  label: string;
  scene: SceneKind;
  tint: string;
}

export const ACTIVITIES: Record<ActivityType, ActivityMeta> = {
  coffee: { type: 'coffee', label: 'Coffee', scene: 'cafe', tint: '#F6D9B8' },
  food: { type: 'food', label: 'Food', scene: 'dinner', tint: '#FBD0B9' },
  bar: { type: 'bar', label: 'Bar / Drinks', scene: 'bar', tint: '#E3D3F2' },
  gym: { type: 'gym', label: 'Gym', scene: 'gym', tint: '#CFE3F2' },
  walk: { type: 'walk', label: 'Walk', scene: 'park', tint: '#D5EBCB' },
  games: { type: 'games', label: 'Games', scene: 'games', tint: '#FFE7A8' },
  explore: { type: 'explore', label: 'Explore', scene: 'city', tint: '#CDE7E2' },
  everything: { type: 'everything', label: 'Everything', scene: 'park', tint: '#FAD6DE' },
  party: { type: 'party', label: 'Party', scene: 'party', tint: '#F9C9B6' },
};

export const INTENTION_ACTIVITIES: ActivityType[] = [
  'coffee',
  'food',
  'bar',
  'gym',
  'walk',
  'games',
  'explore',
  'everything',
];

export const EVENT_ACTIVITIES: ActivityType[] = [...INTENTION_ACTIVITIES.filter((a) => a !== 'everything'), 'party'];

export function sceneFor(activities: ActivityType[]): SceneKind {
  return ACTIVITIES[activities[0] ?? 'everything'].scene;
}

function nounFor(activity: ActivityType, period: TimePeriod, combined: boolean): string {
  switch (activity) {
    case 'coffee':
      return 'coffee';
    case 'food':
      return { morning: 'breakfast', afternoon: 'lunch', evening: 'dinner', night: 'a late bite' }[period];
    case 'bar':
      return 'drinks';
    case 'gym':
      return combined ? 'the gym' : 'to hit the gym';
    case 'walk':
      return 'a walk';
    case 'games':
      return period === 'night' || period === 'evening' ? 'a games night' : 'games';
    case 'explore':
      return combined ? 'exploring' : 'to explore';
    case 'party':
      return 'a party';
    case 'everything':
      return 'to hang out';
  }
}

/** "coffee", "dinner & exploring", "to hang out". Reads after "wants". */
export function activityPhrase(activities: ActivityType[], period: TimePeriod): string {
  if (activities.length === 0 || activities.includes('everything')) return 'to hang out';
  const combined = activities.length > 1;
  const nouns = activities.slice(0, 3).map((a) => nounFor(a, period, combined));
  if (nouns.length === 1) return nouns[0];
  return `${nouns.slice(0, -1).join(', ')} & ${nouns[nouns.length - 1]}`;
}

export function activityListLabel(activities: ActivityType[]): string {
  return activities.map((a) => ACTIVITIES[a].label.split(' /')[0].toLowerCase()).join(' + ');
}
