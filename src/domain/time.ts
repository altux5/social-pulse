import type { Availability, ClockTime, DateKey, SocialItem, TimePeriod } from './types';

export const PERIODS: TimePeriod[] = ['morning', 'afternoon', 'evening', 'night'];

/** Hours are local; night runs past midnight (26 = 02:00 next day). */
export const PERIOD_META: Record<TimePeriod, { label: string; start: number; end: number }> = {
  morning: { label: 'morning', start: 8, end: 12 },
  afternoon: { label: 'afternoon', start: 12, end: 17 },
  evening: { label: 'evening', start: 17, end: 21 },
  night: { label: 'night', start: 21, end: 26 },
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: DateKey, n: number): DateKey {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

export function todayKey(now = new Date()): DateKey {
  return toDateKey(now);
}

export function dayDiff(key: DateKey, now = new Date()): number {
  const a = fromDateKey(key).getTime();
  const b = fromDateKey(todayKey(now)).getTime();
  return Math.round((a - b) / 86_400_000);
}

export function upcomingDays(count: number, now = new Date()): DateKey[] {
  const today = todayKey(now);
  return Array.from({ length: count }, (_, i) => addDays(today, i));
}

export function weekdayName(key: DateKey): string {
  return WEEKDAYS[fromDateKey(key).getDay()];
}

/** "Today", "Tomorrow", "Friday", or "Sat 12 Oct" further out. */
export function dayLabel(key: DateKey, now = new Date()): string {
  const diff = dayDiff(key, now);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1 && diff < 7) return weekdayName(key);
  const d = fromDateKey(key);
  return `${WEEKDAYS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function shortDayLabel(key: DateKey, now = new Date()): string {
  const label = dayLabel(key, now);
  return label === 'Today' || label === 'Tomorrow' ? label : label.slice(0, 3);
}

export function minutesOf(time: ClockTime): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function clockFromMinutes(total: number): ClockTime {
  const wrapped = ((total % 1440) + 1440) % 1440;
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}

export function periodOfTime(time: ClockTime): TimePeriod {
  const h = minutesOf(time) / 60;
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function currentPeriod(now = new Date()): TimePeriod {
  return periodOfTime(clockFromMinutes(now.getHours() * 60 + now.getMinutes()));
}

/** Half-hour slots inside a period, e.g. evening → 17:00 … 20:30. */
export function timesInPeriod(period: TimePeriod): ClockTime[] {
  const { start, end } = PERIOD_META[period];
  const out: ClockTime[] = [];
  for (let m = start * 60; m < end * 60; m += 30) out.push(clockFromMinutes(m));
  return out;
}

function atMinutes(key: DateKey, minutes: number): Date {
  const d = fromDateKey(key);
  d.setMinutes(minutes);
  return d;
}

export function itemStart(item: SocialItem): Date {
  if (item.kind === 'event') return atMinutes(item.date, minutesOf(item.time));
  const minutes = item.approximateTime
    ? minutesOf(item.approximateTime)
    : PERIOD_META[item.timePeriod].start * 60;
  return atMinutes(item.date, minutes);
}

export function itemEnd(item: SocialItem): Date {
  if (item.kind === 'event') {
    const duration = item.calendarData?.durationMinutes ?? 180;
    return atMinutes(item.date, minutesOf(item.time) + duration);
  }
  return atMinutes(item.date, PERIOD_META[item.timePeriod].end * 60);
}

export function isPeriodOver(key: DateKey, period: TimePeriod, now = new Date()): boolean {
  return atMinutes(key, PERIOD_META[period].end * 60).getTime() <= now.getTime();
}

export function availabilityEnd(a: Availability): Date {
  if (a.endTime) {
    const end = minutesOf(a.endTime);
    const start = a.startTime ? minutesOf(a.startTime) : 0;
    return atMinutes(a.date, end <= start ? end + 1440 : end);
  }
  return atMinutes(a.date, (a.timePeriod ? PERIOD_META[a.timePeriod].end : 26) * 60);
}

/** "Tonight", "This afternoon", "Tomorrow evening", "Friday night". */
export function dayPeriodPhrase(key: DateKey, period: TimePeriod, now = new Date()): string {
  const diff = dayDiff(key, now);
  if (diff === 0) {
    if (period === 'evening') return 'Tonight';
    if (period === 'night') return 'Late tonight';
    return `This ${period}`;
  }
  if (diff === 1) return `Tomorrow ${period}`;
  return `${dayLabel(key, now)} ${period}`;
}

/** Lower-case phrase that reads naturally after "I wanna hang out …". */
export function naturalWhen(key: DateKey, period: TimePeriod | undefined, now = new Date()): string {
  const diff = dayDiff(key, now);
  if (!period) {
    if (diff === 0) return 'today';
    if (diff === 1) return 'tomorrow';
    return `on ${dayLabel(key, now)}`;
  }
  if (diff === 0) return dayPeriodPhrase(key, period, now).toLowerCase();
  if (diff === 1) return `tomorrow ${period}`;
  return `on ${dayLabel(key, now)} ${period}`;
}

/** Display line under an item: "Friday · around 18:30", "Tonight", "Saturday · 21:00". */
export function itemWhen(item: SocialItem, now = new Date()): string {
  if (item.kind === 'event') return `${dayLabel(item.date, now)} · ${item.time}`;
  const phrase = dayPeriodPhrase(item.date, item.timePeriod, now);
  if (!item.approximateTime) return phrase;
  const day = dayDiff(item.date, now) === 0 ? phrase : dayLabel(item.date, now);
  return `${day} · around ${item.approximateTime}`;
}

export function availabilityPhrase(a: Availability, now = new Date()): string {
  const day = dayLabel(a.date, now);
  if (a.startTime && a.endTime) return `${day} · ${a.startTime}–${a.endTime}`;
  if (!a.timePeriod) return dayDiff(a.date, now) <= 1 ? `${day.toLowerCase()}, all day` : `${day}, all day`;
  const phrase = dayPeriodPhrase(a.date, a.timePeriod, now);
  return dayDiff(a.date, now) <= 1 ? phrase.toLowerCase() : phrase;
}

export function nextWeekdayOffset(weekday: number, now = new Date()): number {
  const diff = (weekday - now.getDay() + 7) % 7;
  return diff === 0 ? 7 : diff;
}
