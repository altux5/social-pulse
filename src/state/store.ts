import { create } from 'zustand';
import { dataProvider, type RemoteChange } from '@/data';
import { activityPhrase } from '@/domain/activities';
import { itemWhen } from '@/domain/time';
import type {
  Availability,
  ConfirmDetails,
  FriendGroup,
  Friendship,
  ID,
  Intention,
  NewAvailability,
  NewEvent,
  NewIntention,
  SocialEvent,
  SocialItem,
  SocialSnapshot,
  User,
} from '@/domain/types';

export interface FocusOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FocusState {
  itemId: ID;
  origin?: FocusOrigin;
  /** True while the focus view folds back before unmounting. */
  closing: boolean;
}

export const FOCUS_CLOSE_MS = 380;

export interface Feedback {
  id: number;
  userId?: ID;
  title: string;
  subtitle?: string;
}

export interface JoinNews {
  itemId: ID;
  userId: ID;
  at: number;
}

interface SocialData {
  status: 'loading' | 'ready';
  viewerId: ID;
  /** The person this device belongs to; others are prototype "peek as" views. */
  homeViewerId: ID;
  users: Record<ID, User>;
  friendships: Friendship[];
  groups: FriendGroup[];
  availability: Availability[];
  intentions: Intention[];
  events: SocialEvent[];
}

interface SocialState extends SocialData {
  joinNews: JoinNews[];
  feedback: Feedback | null;
  focus: FocusState | null;

  init(): Promise<void>;
  setViewer(id: ID): void;
  join(itemId: ID): Promise<void>;
  leave(itemId: ID): Promise<void>;
  createIntention(input: Omit<NewIntention, 'creatorId'>): Promise<Intention>;
  createEvent(input: Omit<NewEvent, 'creatorId'>): Promise<SocialEvent>;
  confirmIntention(id: ID, details: ConfirmDetails): Promise<SocialEvent>;
  setAvailability(entries: Omit<NewAvailability, 'userId'>[]): Promise<void>;
  removeAvailability(id: ID): Promise<void>;
  simulateFriendJoin(itemId: ID): Promise<boolean>;
  resetDemo(): Promise<void>;
  focusItem(itemId: ID, origin?: FocusOrigin): void;
  clearFocus(): void;
  markNewsSeen(itemId: ID): void;
  notify(feedback: Omit<Feedback, 'id'>): void;
  dismissFeedback(): void;
}

function fromSnapshot(s: SocialSnapshot): SocialData {
  return {
    status: 'ready',
    viewerId: s.currentUserId,
    homeViewerId: s.currentUserId,
    users: Object.fromEntries(s.users.map((u) => [u.id, u])),
    friendships: s.friendships,
    groups: s.groups,
    availability: s.availability,
    intentions: s.intentions,
    events: s.events,
  };
}

function upsert(state: Pick<SocialData, 'intentions' | 'events'>, item: SocialItem) {
  if (item.kind === 'intention') {
    const exists = state.intentions.some((i) => i.id === item.id);
    return {
      intentions: exists ? state.intentions.map((i) => (i.id === item.id ? item : i)) : [...state.intentions, item],
    };
  }
  const exists = state.events.some((e) => e.id === item.id);
  return { events: exists ? state.events.map((e) => (e.id === item.id ? item : e)) : [...state.events, item] };
}

export function findItem(state: Pick<SocialData, 'intentions' | 'events'>, id: ID): SocialItem | undefined {
  return state.intentions.find((i) => i.id === id) ?? state.events.find((e) => e.id === id);
}

let unsubscribe: (() => void) | null = null;
let feedbackSeq = 0;

export const useSocial = create<SocialState>()((set, get) => {
  const onRemoteChange = (change: RemoteChange) => {
    const { item, joinedUserId } = change;
    set((s) => upsert(s, item));
    if (!joinedUserId) return;
    set((s) => ({ joinNews: [...s.joinNews, { itemId: item.id, userId: joinedUserId, at: Date.now() }] }));
    const { viewerId, users } = get();
    if (item.creatorId === viewerId) {
      get().notify({
        userId: joinedUserId,
        title: `${users[joinedUserId]?.name ?? 'Someone'} is in!`,
        subtitle: item.kind === 'event' ? `${item.title} · ${itemWhen(item)}` : `${activityPhrase(item.activityTypes, item.timePeriod)} · ${itemWhen(item)}`,
      });
    }
  };

  return {
    status: 'loading',
    viewerId: '',
    homeViewerId: '',
    users: {},
    friendships: [],
    groups: [],
    availability: [],
    intentions: [],
    events: [],
    joinNews: [],
    feedback: null,
    focus: null,

    async init() {
      if (unsubscribe) return;
      unsubscribe = dataProvider.subscribe(onRemoteChange);
      const snapshot = await dataProvider.loadSnapshot();
      set(fromSnapshot(snapshot));
    },

    setViewer(id) {
      set({ viewerId: id, focus: null, feedback: null });
    },

    async join(itemId) {
      const { viewerId } = get();
      const item = findItem(get(), itemId);
      if (!item || item.participants.some((p) => p.userId === viewerId)) return;
      const optimistic = {
        ...item,
        participants: [...item.participants, { userId: viewerId, joinedAt: new Date().toISOString() }],
      } as SocialItem;
      set((s) => ({
        ...upsert(s, optimistic),
        joinNews: [...s.joinNews, { itemId, userId: viewerId, at: Date.now() }],
      }));
      const saved = await dataProvider.join(itemId, viewerId);
      set((s) => upsert(s, saved));
    },

    async leave(itemId) {
      const { viewerId } = get();
      const item = findItem(get(), itemId);
      if (!item || item.creatorId === viewerId) return;
      set((s) => ({
        ...upsert(s, { ...item, participants: item.participants.filter((p) => p.userId !== viewerId) } as SocialItem),
        joinNews: s.joinNews.filter((n) => !(n.itemId === itemId && n.userId === viewerId)),
      }));
      const saved = await dataProvider.leave(itemId, viewerId);
      set((s) => upsert(s, saved));
    },

    async createIntention(input) {
      const created = await dataProvider.createIntention({ ...input, creatorId: get().viewerId });
      set((s) => upsert(s, created));
      return created;
    },

    async createEvent(input) {
      const created = await dataProvider.createEvent({ ...input, creatorId: get().viewerId });
      set((s) => upsert(s, created));
      return created;
    },

    async confirmIntention(id, details) {
      const { intention, event } = await dataProvider.confirmIntention(id, details);
      set((s) => {
        const withIntention = { ...s, ...upsert(s, intention) };
        return { intentions: withIntention.intentions, ...upsert(withIntention, event) };
      });
      return event;
    },

    async setAvailability(entries) {
      const userId = get().viewerId;
      for (const entry of entries) {
        const saved = await dataProvider.setAvailability({ ...entry, userId });
        set((s) => ({
          availability: s.availability.some((a) => a.id === saved.id)
            ? s.availability.map((a) => (a.id === saved.id ? saved : a))
            : [...s.availability, saved],
        }));
      }
    },

    async removeAvailability(id) {
      set((s) => ({ availability: s.availability.filter((a) => a.id !== id) }));
      await dataProvider.removeAvailability(id);
    },

    async simulateFriendJoin(itemId) {
      const updated = await dataProvider.simulateFriendJoin(itemId);
      return updated !== null;
    },

    async resetDemo() {
      const snapshot = await dataProvider.reset();
      set({ ...fromSnapshot(snapshot), joinNews: [], feedback: null, focus: null });
    },

    focusItem(itemId, origin) {
      const current = get().focus;
      if (current && !current.closing) {
        set({ focus: { ...current, itemId } });
        return;
      }
      set({ focus: { itemId, origin, closing: false } });
    },

    clearFocus() {
      const current = get().focus;
      if (!current || current.closing) return;
      set({ focus: { ...current, closing: true } });
      setTimeout(() => {
        if (get().focus?.closing) set({ focus: null });
      }, FOCUS_CLOSE_MS);
    },

    markNewsSeen(itemId) {
      const { viewerId } = get();
      set((s) => ({
        joinNews: s.joinNews.filter((n) => n.itemId !== itemId || n.userId === viewerId),
      }));
    },

    notify(feedback) {
      feedbackSeq += 1;
      set({ feedback: { ...feedback, id: feedbackSeq } });
    },

    dismissFeedback() {
      set({ feedback: null });
    },
  };
});
