import { useEffect, useMemo, useState } from 'react';
import { availabilityEnd, itemEnd, itemStart } from '@/domain/time';
import type { Availability, ID, Intention, SocialEvent, SocialItem, User } from '@/domain/types';
import { buildGraph, friendIdsOf, isParticipant, visibilityFor, type SocialGraph } from '@/domain/visibility';
import { useSocial } from './store';

export interface VisibleItem {
  item: SocialItem;
  /** Set when the viewer only sees an event through a friend (friends-of-friends). */
  via?: ID;
}

export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function useGraph(): SocialGraph {
  const friendships = useSocial((s) => s.friendships);
  const groups = useSocial((s) => s.groups);
  return useMemo(() => buildGraph(friendships, groups), [friendships, groups]);
}

export function useUser(id: ID | undefined): User | undefined {
  return useSocial((s) => (id ? s.users[id] : undefined));
}

export function useViewer(): User | undefined {
  const viewerId = useSocial((s) => s.viewerId);
  return useUser(viewerId);
}

export function useVisibleItems(now: Date): VisibleItem[] {
  const intentions = useSocial((s) => s.intentions);
  const events = useSocial((s) => s.events);
  const viewerId = useSocial((s) => s.viewerId);
  const graph = useGraph();
  return useMemo(() => {
    const all: SocialItem[] = [...intentions.filter((i) => i.status === 'open'), ...events];
    const out: VisibleItem[] = [];
    for (const item of all) {
      if (itemEnd(item).getTime() <= now.getTime()) continue;
      const v = visibilityFor(item, viewerId, graph);
      if (v.visible) out.push({ item, via: v.via });
    }
    return out.sort((a, b) => itemStart(a.item).getTime() - itemStart(b.item).getTime());
  }, [intentions, events, viewerId, graph, now]);
}

export function useFriends(): User[] {
  const users = useSocial((s) => s.users);
  const viewerId = useSocial((s) => s.viewerId);
  const graph = useGraph();
  return useMemo(
    () =>
      friendIdsOf(graph, viewerId)
        .map((id) => users[id])
        .filter(Boolean),
    [graph, viewerId, users],
  );
}

/** Availability is visible to all friends (and yourself). */
export function useVisibleAvailability(now: Date): Availability[] {
  const availability = useSocial((s) => s.availability);
  const viewerId = useSocial((s) => s.viewerId);
  const graph = useGraph();
  return useMemo(
    () =>
      availability
        .filter((a) => a.userId === viewerId || graph.friendsOf.get(viewerId)?.has(a.userId))
        .filter((a) => availabilityEnd(a).getTime() > now.getTime())
        .sort((a, b) => a.date.localeCompare(b.date)),
    [availability, viewerId, graph, now],
  );
}

export function useMyGroups() {
  const groups = useSocial((s) => s.groups);
  const viewerId = useSocial((s) => s.viewerId);
  return useMemo(() => groups.filter((g) => g.ownerId === viewerId), [groups, viewerId]);
}

/** Friends who joined the viewer's own items and haven't been acknowledged yet. */
export function useJoinNews(itemId: ID, creatorId: ID): ID[] {
  const news = useSocial((s) => s.joinNews);
  const viewerId = useSocial((s) => s.viewerId);
  return useMemo(
    () =>
      creatorId === viewerId
        ? news.filter((n) => n.itemId === itemId && n.userId !== viewerId).map((n) => n.userId)
        : [],
    [news, itemId, creatorId, viewerId],
  );
}

export interface PersonContext {
  availability: Availability[];
  wants: Intention[];
  going: SocialEvent[];
  joined: Intention[];
}

export function usePersonContext(personId: ID, now: Date): PersonContext {
  const visible = useVisibleItems(now);
  const availability = useVisibleAvailability(now);
  return useMemo(() => {
    const wants: Intention[] = [];
    const going: SocialEvent[] = [];
    const joined: Intention[] = [];
    for (const { item } of visible) {
      if (item.kind === 'intention') {
        if (item.creatorId === personId) wants.push(item);
        else if (isParticipant(item, personId)) joined.push(item);
      } else if (isParticipant(item, personId)) {
        going.push(item);
      }
    }
    return { availability: availability.filter((a) => a.userId === personId), wants, going, joined };
  }, [visible, availability, personId]);
}
