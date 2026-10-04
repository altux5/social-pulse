import { activityPhrase } from '@/domain/activities';
import type { FriendGroup, ID, SocialItem, User } from '@/domain/types';

export function headline(item: SocialItem, users: Record<ID, User>, viewerId: ID): string {
  if (item.kind === 'event') return item.title;
  const phrase = activityPhrase(item.activityTypes, item.timePeriod);
  if (item.creatorId === viewerId) return `You want ${phrase}`;
  return `${users[item.creatorId]?.name ?? 'Someone'} wants ${phrase}`;
}

export function nameOf(id: ID, users: Record<ID, User>, viewerId: ID): string {
  return id === viewerId ? 'You' : (users[id]?.name ?? 'Someone');
}

/** "Ece", "Ece & Can", "Ece, Can & 2 more". */
export function namesList(ids: ID[], users: Record<ID, User>, viewerId: ID): string {
  const ordered = ids.includes(viewerId) ? [viewerId, ...ids.filter((id) => id !== viewerId)] : ids;
  const names = ordered.map((id) => nameOf(id, users, viewerId));
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  if (names.length === 3) return `${names[0]}, ${names[1]} & ${names[2]}`;
  return `${names[0]}, ${names[1]} & ${names.length - 2} more`;
}

export function participantIds(item: SocialItem): ID[] {
  return item.participants.map((p) => p.userId);
}

export function audienceLine(item: SocialItem, users: Record<ID, User>, groups: FriendGroup[], viewerId: ID): string {
  const owner = item.creatorId === viewerId ? 'your' : `${users[item.creatorId]?.name ?? 'their'}’s`;
  switch (item.audienceType) {
    case 'all':
      return `Out there for all of ${owner} friends`;
    case 'groups': {
      const names = item.audienceIds.map((id) => groups.find((g) => g.id === id)?.name).filter(Boolean);
      return `Out there for ${names.join(' & ') || 'a group'}`;
    }
    case 'friends':
      return `Out there for ${namesList(item.audienceIds, users, viewerId)}`;
  }
}
