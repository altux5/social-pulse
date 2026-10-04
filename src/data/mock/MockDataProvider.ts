import type {
  ConfirmDetails,
  ID,
  Intention,
  NewAvailability,
  NewEvent,
  NewIntention,
  SocialEvent,
  SocialItem,
  SocialSnapshot,
} from '@/domain/types';
import { buildGraph, isParticipant, potentialJoiners } from '@/domain/visibility';
import type { RemoteChange, SocialDataProvider } from '../SocialDataProvider';
import { createSeedSnapshot } from './seed';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** In-memory provider that also plays "friends" so the prototype feels alive. */
export class MockDataProvider implements SocialDataProvider {
  private db: SocialSnapshot = createSeedSnapshot();
  private listeners = new Set<(change: RemoteChange) => void>();
  private timers: ReturnType<typeof setTimeout>[] = [];

  async loadSnapshot(): Promise<SocialSnapshot> {
    return clone(this.db);
  }

  async reset(): Promise<SocialSnapshot> {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.db = createSeedSnapshot();
    return clone(this.db);
  }

  async createIntention(input: NewIntention): Promise<Intention> {
    const now = new Date().toISOString();
    const intention: Intention = {
      kind: 'intention',
      id: uid('i'),
      status: 'open',
      ...input,
      participants: [{ userId: input.creatorId, joinedAt: now }],
      createdAt: now,
    };
    this.db.intentions.push(intention);
    this.scheduleFriendlyJoin(intention.id, 3800);
    return clone(intention);
  }

  async createEvent(input: NewEvent): Promise<SocialEvent> {
    const now = new Date().toISOString();
    const { location, ...rest } = input;
    const event: SocialEvent = {
      kind: 'event',
      id: uid('e'),
      ...rest,
      participants: [{ userId: input.creatorId, joinedAt: now }],
      calendarData: { location, durationMinutes: 180 },
      createdAt: now,
    };
    this.db.events.push(event);
    this.scheduleFriendlyJoin(event.id, 4500);
    return clone(event);
  }

  async join(itemId: ID, userId: ID): Promise<SocialItem> {
    const item = this.find(itemId);
    if (!isParticipant(item, userId)) {
      item.participants.push({ userId, joinedAt: new Date().toISOString() });
    }
    return clone(item);
  }

  async leave(itemId: ID, userId: ID): Promise<SocialItem> {
    const item = this.find(itemId);
    if (item.creatorId !== userId) {
      item.participants = item.participants.filter((p) => p.userId !== userId);
    }
    return clone(item);
  }

  async confirmIntention(intentionId: ID, details: ConfirmDetails) {
    const intention = this.find(intentionId);
    if (intention.kind !== 'intention') throw new Error('Only intentions can be confirmed');
    const event: SocialEvent = {
      kind: 'event',
      id: uid('e'),
      creatorId: intention.creatorId,
      title: details.title,
      date: intention.date,
      time: details.time,
      description: intention.customText,
      activityTypes: intention.activityTypes.filter((a) => a !== 'everything'),
      audienceType: intention.audienceType,
      audienceIds: [...intention.audienceIds],
      friendsOfFriendsAllowed: details.friendsOfFriendsAllowed,
      participants: clone(intention.participants),
      calendarData: { durationMinutes: 180 },
      fromIntentionId: intention.id,
      createdAt: new Date().toISOString(),
    };
    if (event.activityTypes.length === 0) event.activityTypes = ['everything'];
    intention.status = 'confirmed';
    intention.eventId = event.id;
    this.db.events.push(event);
    return { intention: clone(intention), event: clone(event) };
  }

  async setAvailability(input: NewAvailability) {
    const existing = this.db.availability.find(
      (a) => a.userId === input.userId && a.date === input.date && a.timePeriod === input.timePeriod,
    );
    if (existing) {
      Object.assign(existing, input);
      return clone(existing);
    }
    const created = { id: uid('a'), ...input };
    this.db.availability.push(created);
    return clone(created);
  }

  async removeAvailability(id: ID) {
    this.db.availability = this.db.availability.filter((a) => a.id !== id);
  }

  async simulateFriendJoin(itemId: ID): Promise<SocialItem | null> {
    const item = this.find(itemId);
    const graph = buildGraph(this.db.friendships, this.db.groups);
    const candidates = potentialJoiners(
      item,
      this.db.users.map((u) => u.id),
      graph,
    );
    if (candidates.length === 0) return null;
    const userId = candidates[Math.floor(Math.random() * candidates.length)];
    item.participants.push({ userId, joinedAt: new Date().toISOString() });
    const snapshot = clone(item);
    this.emit({ type: 'itemUpdated', item: snapshot, joinedUserId: userId });
    return snapshot;
  }

  subscribe(listener: (change: RemoteChange) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(change: RemoteChange) {
    this.listeners.forEach((l) => l(change));
  }

  private scheduleFriendlyJoin(itemId: ID, delayMs: number) {
    this.timers.push(
      setTimeout(() => {
        void this.simulateFriendJoin(itemId);
      }, delayMs),
    );
  }

  private find(itemId: ID): SocialItem {
    const item =
      this.db.intentions.find((i) => i.id === itemId) ?? this.db.events.find((e) => e.id === itemId);
    if (!item) throw new Error(`Unknown item ${itemId}`);
    return item;
  }
}
