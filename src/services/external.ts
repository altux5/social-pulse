import * as Linking from 'expo-linking';
import { itemEnd, itemStart } from '@/domain/time';
import type { SocialEvent } from '@/domain/types';

const WHATSAPP_LINK = /^https:\/\/(chat\.whatsapp\.com|wa\.me)\/[A-Za-z0-9_\-/?=&%.]+$/;

export type ExternalResult = 'opened' | 'placeholder';

/** Social Pulse never hosts chat; it hands the conversation to WhatsApp. */
export async function openWhatsApp(event: SocialEvent): Promise<ExternalResult> {
  const link = event.whatsappLink;
  if (link && WHATSAPP_LINK.test(link) && (await Linking.canOpenURL(link))) {
    await Linking.openURL(link);
    return 'opened';
  }
  return 'placeholder';
}

export interface CalendarPayload {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
}

export function calendarPayload(event: SocialEvent): CalendarPayload {
  return {
    title: event.title,
    startDate: itemStart(event),
    endDate: itemEnd(event),
    location: event.calendarData?.location,
    notes: event.description,
  };
}

/** Placeholder until expo-calendar (needs a permission prompt + dev build decisions) is wired in. */
export async function addToCalendar(event: SocialEvent): Promise<{ result: ExternalResult; payload: CalendarPayload }> {
  return { result: 'placeholder', payload: calendarPayload(event) };
}
