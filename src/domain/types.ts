export type ID = string;

/** Local calendar day, formatted `YYYY-MM-DD`. */
export type DateKey = string;

/** Clock time, formatted `HH:mm`. */
export type ClockTime = string;

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export type ActivityType =
  | 'coffee'
  | 'food'
  | 'bar'
  | 'gym'
  | 'walk'
  | 'games'
  | 'explore'
  | 'everything'
  | 'party';

export type AudienceType = 'all' | 'groups' | 'friends';

export type HairStyle = 'short' | 'curly' | 'long' | 'bun' | 'buzz' | 'bob' | 'wavy';

export interface AvatarLook {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  glasses?: boolean;
  beard?: boolean;
}

export interface User {
  id: ID;
  name: string;
  color: string;
  look: AvatarLook;
}

export interface Friendship {
  userId: ID;
  friendId: ID;
}

export interface FriendGroup {
  id: ID;
  ownerId: ID;
  name: string;
  memberIds: ID[];
}

export interface Availability {
  id: ID;
  userId: ID;
  date: DateKey;
  /** Undefined means "around all day". */
  timePeriod?: TimePeriod;
  startTime?: ClockTime;
  endTime?: ClockTime;
}

export interface Participant {
  userId: ID;
  joinedAt: string;
}

interface SocialItemBase {
  id: ID;
  creatorId: ID;
  date: DateKey;
  activityTypes: ActivityType[];
  audienceType: AudienceType;
  /** Group ids for `groups`, user ids for `friends`, empty for `all`. */
  audienceIds: ID[];
  participants: Participant[];
  createdAt: string;
}

export interface Intention extends SocialItemBase {
  kind: 'intention';
  timePeriod: TimePeriod;
  approximateTime?: ClockTime;
  customText?: string;
  status: 'open' | 'confirmed';
  eventId?: ID;
}

export interface CalendarData {
  location?: string;
  durationMinutes: number;
}

export interface SocialEvent extends SocialItemBase {
  kind: 'event';
  title: string;
  time: ClockTime;
  description?: string;
  friendsOfFriendsAllowed: boolean;
  whatsappLink?: string;
  calendarData?: CalendarData;
  fromIntentionId?: ID;
}

export type SocialItem = Intention | SocialEvent;

export interface SocialSnapshot {
  currentUserId: ID;
  users: User[];
  friendships: Friendship[];
  groups: FriendGroup[];
  availability: Availability[];
  intentions: Intention[];
  events: SocialEvent[];
}

export interface NewIntention {
  creatorId: ID;
  date: DateKey;
  timePeriod: TimePeriod;
  approximateTime?: ClockTime;
  activityTypes: ActivityType[];
  customText?: string;
  audienceType: AudienceType;
  audienceIds: ID[];
}

export interface NewEvent {
  creatorId: ID;
  title: string;
  date: DateKey;
  time: ClockTime;
  description?: string;
  activityTypes: ActivityType[];
  audienceType: AudienceType;
  audienceIds: ID[];
  friendsOfFriendsAllowed: boolean;
  location?: string;
}

export interface ConfirmDetails {
  title: string;
  time: ClockTime;
  friendsOfFriendsAllowed: boolean;
}

export interface NewAvailability {
  userId: ID;
  date: DateKey;
  timePeriod?: TimePeriod;
  startTime?: ClockTime;
  endTime?: ClockTime;
}
