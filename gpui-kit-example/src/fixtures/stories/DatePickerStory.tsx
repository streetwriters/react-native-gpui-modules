import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { DatePicker } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/date_picker_story.rs` of gpui-component v0.9.1. */
const SECONDARY = '#e5e5e5';
const pad = (n: number) => String(n).padStart(2, '0');
const day = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const shift = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return day(date);
};
const nowDateTime = () => {
  const date = new Date();
  return `${day(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};
const debug = (value: string | null) =>
  value === null ? 'None' : `Some(${JSON.stringify(value)})`;

const valueText = {
  fontSize: 14,
  lineHeight: 22.65,
  color: theme.mutedForeground,
};

export function DatePickerStory({ size = 'medium' }: { size?: StorySize }) {
  const [value, setValue] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<string | null>(null);
  const today = shift(0);
  const presets = [
    { label: 'Yesterday', start: shift(-1) },
    { label: 'Last Week', start: shift(-7) },
    { label: 'Last Month', start: shift(-30) },
  ];
  const rangePresets = [7, 14, 30, 90].map(days => ({
    label: `Last ${days} Days`,
    start: shift(-days),
    end: today,
  }));
  const onDate = (e: { nativeEvent: { start: string; end: string } }) =>
    setValue(
      e.nativeEvent.end
        ? `${e.nativeEvent.start} - ${e.nativeEvent.end}`
        : e.nativeEvent.start || null,
    );
  const onDateTime = (e: { nativeEvent: { start: string } }) =>
    setDateTime(e.nativeEvent.start || null);
  const field = { width: 280 };
  return (
    <StoryFrame testID="story-date_picker">
      <View style={{ gap: 12 }}>
        <StoryToolbar size={size} />
        <Section
          title="Default"
          description="Single-date selection with presets and clear action."
          column
          style={{ width: 512, gap: 12 }}
        >
          <DatePicker
            size={size}
            style={field}
            cleanable
            presets={presets}
            disabled={{ weekdays: [0, 6] }}
            initial={{ date: today }}
            onChange={onDate}
          />
          <Text style={valueText}>{`Value: ${debug(value)}`}</Text>
        </Section>
        <Section
          title="Date and time"
          description="Edit the time of day below the calendar; changes apply as you make them."
          column
          style={{ width: 512, gap: 12 }}
        >
          <DatePicker
            size={size}
            style={field}
            time={{ precision: 'minute' }}
            initial={{ dateTime: nowDateTime() }}
            onChange={onDateTime}
          />
          <DatePicker
            size={size}
            style={field}
            placeholder="With seconds"
            cleanable
            time={{ precision: 'second', default: '09:00:00' }}
            onChange={onDateTime}
          />
          <DatePicker
            size={size}
            style={field}
            placeholder="12-hour clock"
            cleanable
            time={{
              precision: 'minute',
              hourCycle: 'h12',
              default: '09:00:00',
            }}
            onChange={onDateTime}
          />
          <Text style={valueText}>{`Value: ${debug(dateTime)}`}</Text>
        </Section>
        <Section
          title="Disabled dates"
          description="Matchers can block intervals, ranges, or custom dates."
          column
          style={{ width: 512, gap: 12 }}
        >
          <DatePicker
            size={size}
            style={field}
            disabled={{ interval: { before: today, after: shift(5) } }}
            initial={{ date: today }}
          />
          <DatePicker
            size={size}
            style={field}
            dateFormat="%Y-%m-%d"
            disabled={{ range: { from: today, to: shift(7) } }}
            initial={{ date: shift(-1) }}
          />
          <DatePicker
            size={size}
            style={field}
            disabled={{ daysOfMonth: [1, 2, 3, 4, 5] }}
            initial={{ date: today }}
          />
        </Section>
        <Section
          title="Date range"
          description="Two months with range presets."
          style={{ width: 512 }}
        >
          <DatePicker
            size={size}
            style={field}
            numberOfMonths={2}
            cleanable
            presets={rangePresets}
            initial={{ start: today, end: shift(4) }}
            onChange={onDate}
          />
        </Section>
        <Section
          title="Empty range"
          description="Empty range with presets."
          style={{ width: 512 }}
        >
          <DatePicker
            range
            size={size}
            style={field}
            placeholder="Range mode picker"
            cleanable
            presets={rangePresets}
            onChange={onDate}
          />
        </Section>
        <Section
          title="Year range"
          description="Custom year range."
          style={{ width: 512 }}
        >
          <DatePicker
            size={size}
            style={field}
            numberOfMonths={1}
            cleanable
            placeholder="Select birthday"
            yearRange={[1927, new Date().getFullYear() + 1]}
          />
        </Section>
        <Section
          title="Custom style"
          description="Appearance-free input."
          style={{ width: 512 }}
        >
          <View style={{ width: 280, backgroundColor: SECONDARY }}>
            <DatePicker
              size={size}
              style={field}
              appearance={false}
              placeholder="Without appearance"
            />
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
