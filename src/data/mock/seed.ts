import type {
  Availability,
  FriendGroup,
  Friendship,
  Intention,
  Participant,
  SocialEvent,
  SocialSnapshot,
  TimePeriod,
  User,
} from '@/domain/types';
import { addDays, nextWeekdayOffset, todayKey } from '@/domain/time';

export const FOUNDER_ID = 'altug';

const users: User[] = [
  { id: 'altug', name: 'Altuğ', color: '#F2876B', look: { skin: '#E9B892', hair: '#3A2A24', hairStyle: 'short' } },
  { id: 'mert', name: 'Mert', color: '#8DB8E2', look: { skin: '#D9A47E', hair: '#2A1E1A', hairStyle: 'curly' } },
  { id: 'ece', name: 'Ece', color: '#EFA2B5', look: { skin: '#F1C8A8', hair: '#6B3B2A', hairStyle: 'long' } },
  { id: 'deniz', name: 'Deniz', color: '#8CC497', look: { skin: '#E3B18D', hair: '#211B18', hairStyle: 'bob', glasses: true } },
  { id: 'can', name: 'Can', color: '#B7A3E6', look: { skin: '#C99070', hair: '#2B2220', hairStyle: 'buzz' } },
  { id: 'zeynep', name: 'Zeynep', color: '#F6C75E', look: { skin: '#F3CEB2', hair: '#9A4E2A', hairStyle: 'bun' } },
  { id: 'anna', name: 'Anna', color: '#86CDBE', look: { skin: '#F6D8C3', hair: '#E0B25A', hairStyle: 'wavy' } },
  { id: 'mehmet', name: 'Mehmet', color: '#7E9FC6', look: { skin: '#C58C64', hair: '#2E2622', hairStyle: 'short', beard: true } },
];

const friendPairs: [string, string][] = [
  ['altug', 'mert'],
  ['altug', 'ece'],
  ['altug', 'deniz'],
  ['altug', 'can'],
  ['altug', 'mehmet'],
  ['mert', 'ece'],
  ['mert', 'can'],
  ['mert', 'deniz'],
  ['ece', 'deniz'],
  ['ece', 'zeynep'],
  ['deniz', 'mehmet'],
  ['can', 'mehmet'],
  ['zeynep', 'anna'],
];

const groups: FriendGroup[] = [
  { id: 'g_altug_uni', ownerId: 'altug', name: 'University Friends', memberIds: ['mert', 'ece', 'can'] },
  { id: 'g_altug_munich', ownerId: 'altug', name: 'Munich Friends', memberIds: ['ece', 'deniz', 'mehmet'] },
  { id: 'g_altug_gym', ownerId: 'altug', name: 'Gym Friends', memberIds: ['can', 'mehmet'] },
  { id: 'g_mert_football', ownerId: 'mert', name: 'Sunday Football', memberIds: ['altug', 'can'] },
  { id: 'g_ece_neighbours', ownerId: 'ece', name: 'Neighbours', memberIds: ['zeynep', 'deniz'] },
  { id: 'g_deniz_books', ownerId: 'deniz', name: 'Book Club', memberIds: ['ece', 'mehmet'] },
  { id: 'g_can_gym', ownerId: 'can', name: 'Gym Crew', memberIds: ['altug', 'mehmet', 'mert'] },
  { id: 'g_mehmet_climb', ownerId: 'mehmet', name: 'Climbing', memberIds: ['altug', 'can', 'deniz'] },
  { id: 'g_zeynep_uni', ownerId: 'zeynep', name: 'Uni', memberIds: ['ece', 'anna'] },
];

function minutesAgo(now: Date, minutes: number): string {
  return new Date(now.getTime() - minutes * 60_000).toISOString();
}

function people(now: Date, ids: string[]): Participant[] {
  return ids.map((userId, i) => ({ userId, joinedAt: minutesAgo(now, 90 - i * 12) }));
}

/** Seed is relative to "now" so the pulse always feels current. */
export function createSeedSnapshot(now = new Date()): SocialSnapshot {
  const today = todayKey(now);
  const day = (n: number) => addDays(today, n);
  const hour = now.getHours();

  const soonDate = hour < 20 ? day(0) : day(1);
  const soonPeriod: TimePeriod = hour < 20 ? 'evening' : 'morning';
  const soonTime = hour < 17 ? '18:30' : hour < 20 ? undefined : '10:30';

  const saturday = nextWeekdayOffset(6, now);
  const base = { audienceIds: [] as string[], status: 'open' as const };

  const intentions: Intention[] = [
    {
      ...base,
      kind: 'intention',
      id: 'i_mert_coffee',
      creatorId: 'mert',
      date: soonDate,
      timePeriod: soonPeriod,
      approximateTime: soonTime,
      activityTypes: ['coffee'],
      audienceType: 'all',
      participants: people(now, ['mert', 'ece']),
      createdAt: minutesAgo(now, 95),
    },
    {
      ...base,
      kind: 'intention',
      id: 'i_deniz_walk',
      creatorId: 'deniz',
      date: day(1),
      timePeriod: 'morning',
      activityTypes: ['walk', 'coffee'],
      customText: 'Englischer Garten loop, then pastries?',
      audienceType: 'all',
      participants: people(now, ['deniz']),
      createdAt: minutesAgo(now, 300),
    },
    {
      ...base,
      kind: 'intention',
      id: 'i_zeynep_walk',
      creatorId: 'zeynep',
      date: day(1),
      timePeriod: 'afternoon',
      activityTypes: ['walk', 'explore'],
      customText: 'Flea market at Theresienwiese?',
      audienceType: 'all',
      participants: people(now, ['zeynep', 'anna']),
      createdAt: minutesAgo(now, 200),
    },
    {
      ...base,
      kind: 'intention',
      id: 'i_altug_bar',
      creatorId: 'altug',
      date: day(2),
      timePeriod: 'evening',
      activityTypes: ['bar'],
      audienceType: 'groups',
      audienceIds: ['g_altug_uni'],
      participants: people(now, ['altug', 'mert', 'can']),
      createdAt: minutesAgo(now, 400),
    },
    {
      ...base,
      kind: 'intention',
      id: 'i_can_gym',
      creatorId: 'can',
      date: day(2),
      timePeriod: 'morning',
      approximateTime: '09:00',
      activityTypes: ['gym'],
      audienceType: 'groups',
      audienceIds: ['g_can_gym'],
      participants: people(now, ['can', 'mehmet']),
      createdAt: minutesAgo(now, 500),
    },
    {
      ...base,
      kind: 'intention',
      id: 'i_ece_ramen',
      creatorId: 'ece',
      date: day(3),
      timePeriod: 'evening',
      activityTypes: ['food', 'explore'],
      customText: 'Try that new ramen place',
      audienceType: 'friends',
      audienceIds: ['altug', 'mert', 'deniz', 'zeynep'],
      participants: people(now, ['ece', 'zeynep']),
      createdAt: minutesAgo(now, 150),
    },
    {
      ...base,
      kind: 'intention',
      id: 'i_mehmet_games',
      creatorId: 'mehmet',
      date: day(4),
      timePeriod: 'night',
      activityTypes: ['games', 'bar'],
      audienceType: 'all',
      participants: people(now, ['mehmet']),
      createdAt: minutesAgo(now, 60),
    },
  ];

  const events: SocialEvent[] = [
    {
      kind: 'event',
      id: 'e_ece_dinner',
      creatorId: 'ece',
      title: 'Dinner at Ece’s',
      date: day(1),
      time: '19:30',
      description: 'Making mantı. Come hungry, bring nothing.',
      activityTypes: ['food'],
      audienceType: 'friends',
      audienceIds: ['altug', 'mert', 'deniz'],
      friendsOfFriendsAllowed: false,
      participants: people(now, ['ece', 'mert', 'deniz']),
      calendarData: { location: 'Ece’s flat, Maxvorstadt', durationMinutes: 180 },
      createdAt: minutesAgo(now, 1200),
    },
    {
      kind: 'event',
      id: 'e_mehmet_boulder',
      creatorId: 'mehmet',
      title: 'Bouldering',
      date: day(3),
      time: '10:00',
      description: 'Shoes can be rented there.',
      activityTypes: ['gym'],
      audienceType: 'groups',
      audienceIds: ['g_mehmet_climb'],
      friendsOfFriendsAllowed: false,
      participants: people(now, ['mehmet', 'can']),
      calendarData: { location: 'Boulderwelt Ost', durationMinutes: 150 },
      createdAt: minutesAgo(now, 900),
    },
    {
      kind: 'event',
      id: 'e_altug_party',
      creatorId: 'altug',
      title: 'House Party',
      date: day(saturday),
      time: '21:00',
      description: 'Bring a snack or a playlist. Rooftop opens at 23:00 if it isn’t raining.',
      activityTypes: ['party'],
      audienceType: 'all',
      audienceIds: [],
      friendsOfFriendsAllowed: true,
      participants: people(now, ['altug', 'ece', 'mert', 'deniz', 'can', 'mehmet']),
      calendarData: { location: 'Altuğ’s place, Schwabing', durationMinutes: 300 },
      createdAt: minutesAgo(now, 2000),
    },
  ];

  const availability: Availability[] = [
    { id: 'a_mert', userId: 'mert', date: soonDate, timePeriod: soonPeriod },
    { id: 'a_ece', userId: 'ece', date: day(1) },
    { id: 'a_deniz', userId: 'deniz', date: day(2), timePeriod: 'evening', startTime: '18:00', endTime: '22:00' },
    { id: 'a_can', userId: 'can', date: day(1), timePeriod: 'night' },
    { id: 'a_mehmet', userId: 'mehmet', date: day(5), timePeriod: 'afternoon' },
    { id: 'a_zeynep', userId: 'zeynep', date: soonDate, timePeriod: soonPeriod },
    { id: 'a_anna', userId: 'anna', date: day(1), timePeriod: 'afternoon' },
  ];

  const friendships: Friendship[] = friendPairs.map(([userId, friendId]) => ({ userId, friendId }));

  return {
    currentUserId: FOUNDER_ID,
    users,
    friendships,
    groups,
    availability,
    intentions,
    events,
  };
}
