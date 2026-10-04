import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ActivityPicker } from '@/components/create/ActivityPicker';
import { AudiencePicker } from '@/components/create/AudiencePicker';
import { Sentence, type Segment } from '@/components/create/Sentence';
import { DayPicker, PeriodPicker, RoughTime } from '@/components/create/WhenPickers';
import { Scene } from '@/components/scene/Scene';
import { closeOverlay, Overlay } from '@/components/sheets/Overlay';
import { Cloud, Island } from '@/components/shapes/Shapes';
import { namesList } from '@/components/social/text';
import { BigButton, Chip } from '@/components/ui/Buttons';
import { CloseButton } from '@/components/ui/CloseButton';
import { Field } from '@/components/ui/Field';
import { Squish } from '@/components/ui/Squish';
import { Txt } from '@/components/ui/Txt';
import { ACTIVITIES, activityListLabel, activityPhrase, EVENT_ACTIVITIES, INTENTION_ACTIVITIES, sceneFor } from '@/domain/activities';
import { currentPeriod, dayLabel, dayPeriodPhrase, naturalWhen, periodOfTime } from '@/domain/time';
import type { ActivityType, AudienceType, ClockTime, DateKey, ID, TimePeriod } from '@/domain/types';
import { useNow } from '@/state/hooks';
import { useSocial } from '@/state/store';
import { colors, fonts } from '@/theme';

type Step = 'when' | 'what' | 'who';

const EVENT_SUGGESTIONS: { title: string; activity: ActivityType }[] = [
  { title: 'House Party', activity: 'party' },
  { title: 'Dinner', activity: 'food' },
  { title: 'Drinks', activity: 'bar' },
  { title: 'Gym', activity: 'gym' },
  { title: 'Games night', activity: 'games' },
  { title: 'Coffee', activity: 'coffee' },
  { title: 'Walk', activity: 'walk' },
];

export default function Create() {
  const params = useLocalSearchParams<{ mode?: string; friend?: string }>();
  const isEvent = params.mode === 'event';
  const steps: Step[] = isEvent ? ['what', 'when', 'who'] : ['when', 'what', 'who'];
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const now = useNow();
  const { width: windowWidth } = useWindowDimensions();

  const users = useSocial((s) => s.users);
  const groups = useSocial((s) => s.groups);
  const viewerId = useSocial((s) => s.viewerId);
  const createIntention = useSocial((s) => s.createIntention);
  const createEvent = useSocial((s) => s.createEvent);
  const notify = useSocial((s) => s.notify);

  const [date, setDate] = useState<DateKey>();
  const [period, setPeriod] = useState<TimePeriod>();
  const [approx, setApprox] = useState<ClockTime>();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [note, setNote] = useState('');
  const [audienceType, setAudienceType] = useState<AudienceType>(params.friend ? 'friends' : 'all');
  const [groupIds, setGroupIds] = useState<ID[]>([]);
  const [friendIds, setFriendIds] = useState<ID[]>(params.friend ? [params.friend] : []);
  const [title, setTitle] = useState('');
  const [eventPeriod, setEventPeriod] = useState<TimePeriod>('evening');
  const [time, setTime] = useState<ClockTime>();
  const [location, setLocation] = useState('');
  const [fof, setFof] = useState(false);
  const [busy, setBusy] = useState(false);

  const audienceIds = audienceType === 'groups' ? groupIds : audienceType === 'friends' ? friendIds : [];
  const audienceOk = audienceType === 'all' || audienceIds.length > 0;
  const stepOk: Record<Step, boolean> = {
    when: isEvent ? !!date && !!time : !!date && !!period,
    what: isEvent ? title.trim().length > 0 && activities.length > 0 : activities.length > 0,
    who: audienceOk,
  };

  const audiencePhrase =
    audienceType === 'all'
      ? 'all my friends'
      : audienceType === 'groups'
        ? groupIds
            .map((id) => groups.find((g) => g.id === id)?.name)
            .filter(Boolean)
            .join(' & ') || 'a group…'
        : friendIds.length
          ? namesList(friendIds, users, viewerId)
          : 'someone…';

  const lines: Segment[][] = isEvent
    ? [
        [{ text: title.trim() || 'Something', filled: !!title.trim() }, ' is happening'],
        ...(date ? [[{ text: `${dayLabel(date, now)}${time ? ` · ${time}` : ''}`, filled: !!time }]] : []),
        ...(step === 'who' ? [['for ', { text: audiencePhrase, filled: audienceOk }, fof ? ' and their friends' : '']] : []),
      ]
    : [
        [
          'I wanna hang out ',
          date && period
            ? { text: `${naturalWhen(date, period, now)}${approx ? ` around ${approx}` : ''}`, filled: true }
            : { text: date ? `${naturalWhen(date, undefined, now)}…` : 'on…', filled: false },
        ],
        ...(stepIndex >= 1
          ? [['I’m down to ', { text: activities.length ? activityListLabel(activities) : '…', filled: activities.length > 0 }]]
          : []),
        ...(note.trim() && stepIndex >= 1 ? [[`“${note.trim()}”`]] : []),
        ...(step === 'who' ? [['with ', { text: audiencePhrase, filled: audienceOk }]] : []),
      ];

  const publish = async () => {
    if (!date || busy) return;
    setBusy(true);
    if (isEvent && time) {
      const event = await createEvent({
        title: title.trim(),
        date,
        time,
        description: note.trim() || undefined,
        activityTypes: activities,
        audienceType,
        audienceIds,
        friendsOfFriendsAllowed: fof,
        location: location.trim() || undefined,
      });
      closeOverlay();
      notify({ title: `${event.title} is on`, subtitle: `${dayLabel(event.date)} · ${event.time}. Your people can see it now.` });
    } else if (period) {
      await createIntention({
        date,
        timePeriod: period,
        approximateTime: approx,
        activityTypes: activities,
        customText: note.trim() || undefined,
        audienceType,
        audienceIds,
      });
      closeOverlay();
      notify({ title: 'It’s out there', subtitle: 'Your people can see it now. Let’s see who’s in.' });
    }
  };

  const last = stepIndex === steps.length - 1;
  const viewer = users[viewerId];
  const previewIds =
    audienceType === 'friends' ? friendIds : audienceType === 'groups' ? groups.filter((g) => groupIds.includes(g.id)).flatMap((g) => g.memberIds) : [];
  const previewPeople = [viewer, ...[...new Set(previewIds)].map((id) => users[id])].filter(Boolean).slice(0, 4);

  return (
    <Overlay full>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 16 }}>
          {stepIndex > 0 ? (
            <Squish onPress={() => setStepIndex((i) => i - 1)} accessibilityLabel="Back" hitSlop={10} style={{ paddingVertical: 8, paddingRight: 12 }}>
              <Txt variant="body" style={{ fontFamily: fonts.bodyBold }} color={colors.inkSoft}>
                ← back
              </Txt>
            </Squish>
          ) : (
            <Txt variant="label" color={colors.inkFaint}>
              {isEvent ? 'make a plan' : 'new intention'}
            </Txt>
          )}
          <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={`Step ${stepIndex + 1} of ${steps.length}`}>
            {steps.map((s, i) => (
              <View key={s} style={{ width: i === stepIndex ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i <= stepIndex ? colors.coral : colors.line }} />
            ))}
          </View>
          <CloseButton onPress={closeOverlay} />
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 22, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
          <Sentence lines={lines} />

          <Animated.View key={step} entering={FadeInDown.duration(380)} style={{ marginTop: 24 }}>
            {step === 'when' ? (
              <View>
                <DayPicker
                  value={date}
                  now={now}
                  onChange={(d) => {
                    setDate(d);
                    setPeriod(undefined);
                    setApprox(undefined);
                  }}
                />
                {date ? (
                  <Animated.View entering={FadeInDown.duration(320)} style={{ marginTop: 22 }}>
                    <PeriodPicker
                      date={date}
                      now={now}
                      value={isEvent ? [eventPeriod] : period ? [period] : []}
                      onToggle={(p) => {
                        if (isEvent) {
                          setEventPeriod(p);
                          setTime(undefined);
                        } else {
                          setPeriod(p);
                          setApprox(undefined);
                        }
                      }}
                    />
                    {isEvent ? (
                      <RoughTime period={eventPeriod} value={time} onChange={setTime} label="What time?" exact />
                    ) : period ? (
                      <RoughTime period={period} value={approx} onChange={setApprox} />
                    ) : null}
                  </Animated.View>
                ) : null}
              </View>
            ) : null}

            {step === 'what' && !isEvent ? (
              <View>
                <ActivityPicker options={INTENTION_ACTIVITIES} value={activities} onChange={setActivities} />
                <Txt variant="heading" style={{ marginTop: 26, marginBottom: 10 }}>
                  Anything specific?
                </Txt>
                <Field value={note} onChangeText={setNote} placeholder="Try that new ramen place" maxLength={120} accessibilityLabel="Anything specific" />
              </View>
            ) : null}

            {step === 'what' && isEvent ? (
              <View>
                <Field
                  value={title}
                  onChangeText={setTitle}
                  placeholder="House Party"
                  maxLength={40}
                  accessibilityLabel="What's happening"
                  style={{ fontFamily: fonts.displayBold, fontSize: 24, paddingVertical: 14 }}
                />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {EVENT_SUGGESTIONS.map((sug) => (
                    <Chip
                      key={sug.title}
                      size="sm"
                      label={sug.title}
                      selected={title === sug.title}
                      tint={ACTIVITIES[sug.activity].tint}
                      onPress={() => {
                        setTitle(sug.title);
                        setActivities([sug.activity]);
                      }}
                    />
                  ))}
                </View>
                <Txt variant="label" color={colors.inkFaint} style={{ marginTop: 24, marginBottom: 12 }}>
                  the vibe
                </Txt>
                <ActivityPicker options={EVENT_ACTIVITIES} value={activities} onChange={setActivities} />
                <View style={{ gap: 10, marginTop: 22 }}>
                  <Field value={location} onChangeText={setLocation} placeholder="Where? (optional)" maxLength={80} accessibilityLabel="Where" />
                  <Field value={note} onChangeText={setNote} placeholder="Anything else? Snacks, dress code…" maxLength={160} multiline accessibilityLabel="Details" />
                </View>
              </View>
            ) : null}

            {step === 'who' ? (
              <View>
                <Txt variant="heading" style={{ marginBottom: 12 }}>
                  Who should see this?
                </Txt>
                <AudiencePicker
                  type={audienceType}
                  groupIds={groupIds}
                  friendIds={friendIds}
                  onType={setAudienceType}
                  onGroups={setGroupIds}
                  onFriends={setFriendIds}
                />
                {isEvent ? (
                  <View style={{ marginTop: 18 }}>
                    <Chip label="Friends of friends welcome" selected={fof} onPress={() => setFof((v) => !v)} tint={colors.butter} style={{ alignSelf: 'flex-start' }} />
                    <Txt variant="small" color={colors.inkSoft} style={{ marginTop: 6 }}>
                      {fof ? 'When a friend joins, their friends can see it too. Just one hop, no further.' : 'Only the people you picked can see it.'}
                    </Txt>
                  </View>
                ) : null}

                <Txt variant="label" color={colors.inkFaint} style={{ marginTop: 28, marginBottom: 14 }}>
                  how it’ll look
                </Txt>
                {isEvent ? (
                  <View style={{ marginRight: 30, transform: [{ rotate: '-1deg' }] }}>
                    <Island seed={11} fill={ACTIVITIES[activities[0] ?? 'party'].tint}>
                      <Txt variant="label" color={colors.inkSoft}>
                        {date ? `${dayLabel(date, now)} · ${time ?? ''}` : ''}
                      </Txt>
                      <Txt variant="title" style={{ fontFamily: fonts.displayBold }}>
                        {title}
                      </Txt>
                    </Island>
                  </View>
                ) : (
                  <Cloud seed={5} style={{ marginRight: 30 }}>
                    <Txt variant="heading">You want {activityPhrase(activities, period ?? 'evening')}</Txt>
                    <Txt variant="small" color={colors.inkSoft}>
                      {date && period ? dayPeriodPhrase(date, period, now) : ''}
                      {approx ? ` · around ${approx}` : ''}
                    </Txt>
                    {note.trim() ? (
                      <Txt variant="quote" color={colors.inkSoft} numberOfLines={2} style={{ fontSize: 14 }}>
                        “{note.trim()}”
                      </Txt>
                    ) : null}
                  </Cloud>
                )}
              </View>
            ) : null}
          </Animated.View>

          <View style={{ marginTop: 28, borderRadius: 28, overflow: 'hidden' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Scene
              kind={activities.length ? sceneFor(activities) : isEvent ? 'party' : 'park'}
              period={isEvent ? (time ? periodOfTime(time) : eventPeriod) : (period ?? currentPeriod(now))}
              people={previewPeople}
              width={windowWidth - 60}
            />
          </View>
        </ScrollView>

        <View style={{ paddingHorizontal: 22, paddingBottom: 18, paddingTop: 8 }}>
          <BigButton
            label={last ? (isEvent ? 'Make it happen' : 'Put it out there') : 'Next'}
            tint={last ? colors.coral : colors.butter}
            disabled={!stepOk[step] || busy}
            onPress={() => (last ? void publish() : setStepIndex((i) => i + 1))}
          />
        </View>
      </KeyboardAvoidingView>
    </Overlay>
  );
}
