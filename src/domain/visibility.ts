import type { FriendGroup, Friendship, ID, SocialItem } from './types';

export interface SocialGraph {
  friendsOf: Map<ID, Set<ID>>;
  groupsById: Map<ID, FriendGroup>;
}

export function buildGraph(friendships: Friendship[], groups: FriendGroup[]): SocialGraph {
  const friendsOf = new Map<ID, Set<ID>>();
  const link = (a: ID, b: ID) => {
    if (!friendsOf.has(a)) friendsOf.set(a, new Set());
    friendsOf.get(a)!.add(b);
  };
  for (const f of friendships) {
    link(f.userId, f.friendId);
    link(f.friendId, f.userId);
  }
  return { friendsOf, groupsById: new Map(groups.map((g) => [g.id, g])) };
}

export function areFriends(graph: SocialGraph, a: ID, b: ID): boolean {
  return graph.friendsOf.get(a)?.has(b) ?? false;
}

export function friendIdsOf(graph: SocialGraph, id: ID): ID[] {
  return [...(graph.friendsOf.get(id) ?? [])];
}

export function isParticipant(item: SocialItem, userId: ID): boolean {
  return item.participants.some((p) => p.userId === userId);
}

/** Whether the creator explicitly addressed this person (all friends, a group they're in, or by name). */
export function isInDirectAudience(item: SocialItem, userId: ID, graph: SocialGraph): boolean {
  if (item.creatorId === userId) return true;
  if (!areFriends(graph, item.creatorId, userId)) return false;
  switch (item.audienceType) {
    case 'all':
      return true;
    case 'friends':
      return item.audienceIds.includes(userId);
    case 'groups':
      return item.audienceIds.some((gid) => graph.groupsById.get(gid)?.memberIds.includes(userId));
  }
}

export type Visibility = { visible: false } | { visible: true; via?: ID };

/**
 * Friends-of-friends propagates exactly one hop: only participants who were
 * directly invited by the creator make the event visible to their own friends.
 */
export function visibilityFor(item: SocialItem, viewerId: ID, graph: SocialGraph): Visibility {
  if (isInDirectAudience(item, viewerId, graph) || isParticipant(item, viewerId)) {
    return { visible: true };
  }
  if (item.kind === 'event' && item.friendsOfFriendsAllowed) {
    const bridge = item.participants.find(
      (p) =>
        p.userId !== item.creatorId &&
        isInDirectAudience(item, p.userId, graph) &&
        areFriends(graph, p.userId, viewerId),
    );
    if (bridge) return { visible: true, via: bridge.userId };
  }
  return { visible: false };
}

/** People who can currently see the item but haven't joined yet. */
export function potentialJoiners(item: SocialItem, userIds: ID[], graph: SocialGraph): ID[] {
  return userIds.filter(
    (id) => !isParticipant(item, id) && visibilityFor(item, id, graph).visible,
  );
}
