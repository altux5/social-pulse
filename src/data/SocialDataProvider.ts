import type {
  Availability,
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

/** Changes that originate outside this device (other friends acting). */
export type RemoteChange = { type: 'itemUpdated'; item: SocialItem; joinedUserId?: ID };

/**
 * The only boundary the UI/state layer talks to. The mock implementation
 * keeps everything in memory; a Supabase implementation can replace it later.
 */
export interface SocialDataProvider {
  loadSnapshot(): Promise<SocialSnapshot>;
  createIntention(input: NewIntention): Promise<Intention>;
  createEvent(input: NewEvent): Promise<SocialEvent>;
  join(itemId: ID, userId: ID): Promise<SocialItem>;
  leave(itemId: ID, userId: ID): Promise<SocialItem>;
  confirmIntention(
    intentionId: ID,
    details: ConfirmDetails,
  ): Promise<{ intention: Intention; event: SocialEvent }>;
  setAvailability(input: NewAvailability): Promise<Availability>;
  removeAvailability(id: ID): Promise<void>;
  /** Prototype-only: make a friend who can see the item join it. */
  simulateFriendJoin(itemId: ID): Promise<SocialItem | null>;
  reset(): Promise<SocialSnapshot>;
  subscribe(listener: (change: RemoteChange) => void): () => void;
}
