import { NativeRoot } from '@react-native-gpui/core/desktop';
import React from 'react';
import type { ColorValue, NativeSyntheticEvent, ViewProps } from 'react-native';
import { processColor } from 'react-native';
import CalendarNative from './GpuiKitCalendarNativeComponent';
import DatePickerNative from './GpuiKitDatePickerNativeComponent';
import TimeFieldNative from './GpuiKitTimeFieldNativeComponent';
import ColorPickerNative from './GpuiKitColorPickerNativeComponent';

type Size = 'xsmall' | 'small' | 'medium' | 'large';

/** Dates are `YYYY-MM-DD` strings; an empty string is no date. */
export type DateChangeEvent = NativeSyntheticEvent<
  Readonly<{ start: string; end: string }>
>;

export interface CalendarProps extends ViewProps {
  /** The selected date, or the start of the range; leave it out for the kit's own selection. */
  date?: string;
  /** The end of the range. */
  endDate?: string;
  /** Select a range instead of one date. */
  range?: boolean;
  numberOfMonths?: number;
  /** 0 is Monday. */
  firstDayOfWeek?: number;
  /** Weekdays that cannot be picked, 0 being Sunday. */
  disabledWeekdays?: number[];
  onChange?: (event: DateChangeEvent) => void;
}

export function Calendar({
  date,
  endDate,
  onChange,
  style,
  ...rest
}: CalendarProps) {
  return (
    <NativeRoot fitWidth style={style} testID={rest.testID}>
      <CalendarNative
        {...rest}
        testID={undefined}
        date={date}
        endDate={endDate}
        controlled={date !== undefined}
        onGpuiKitCalendarChange={onChange as never}
      />
    </NativeRoot>
  );
}

export interface DatePickerProps extends ViewProps {
  date?: string;
  endDate?: string;
  range?: boolean;
  /** A chrono format such as `%Y-%m-%d`. */
  dateFormat?: string;
  placeholder?: string;
  cleanable?: boolean;
  appearance?: boolean;
  numberOfMonths?: number;
  size?: Size;
  /** Quick picks beside the calendar; `end` makes a range preset. Dates are `YYYY-MM-DD`. */
  presets?: { label: string; start: string; end?: string }[];
  /** Dates that cannot be picked: weekdays (0 is Sunday), a range, an interval, or days of the month. */
  disabled?: {
    weekdays?: number[];
    range?: { from?: string; to?: string };
    interval?: { before?: string; after?: string };
    daysOfMonth?: number[];
  };
  /** The years the year picker offers, `[first, last]`. */
  yearRange?: [number, number];
  /** Edit the time of day below the calendar. `default` is `HH:MM:SS`. */
  time?: {
    precision?: 'minute' | 'second';
    hourCycle?: 'h23' | 'h12';
    default?: string;
  };
  /** The first value of an uncontrolled picker: `date`, `start` and `end`, or `dateTime` (`YYYY-MM-DDTHH:MM:SS`). */
  initial?: { date?: string; start?: string; end?: string; dateTime?: string };
  onChange?: (event: DateChangeEvent) => void;
}

export function DatePicker({
  date,
  endDate,
  onChange,
  appearance,
  style,
  presets,
  disabled,
  yearRange,
  time,
  initial,
  ...rest
}: DatePickerProps) {
  return (
    <DatePickerNative
      {...rest}
      options={JSON.stringify({
        presets,
        disabled,
        yearRange,
        time,
        ...initial,
      })}
      style={[{ width: 240, height: 32 }, style]}
      appearance={appearance ?? true}
      date={date}
      endDate={endDate}
      controlled={date !== undefined}
      onGpuiKitDatePickerChange={onChange as never}
    />
  );
}

export type TimeChangeEvent = NativeSyntheticEvent<Readonly<{ time: string }>>;

export interface TimeFieldProps extends ViewProps {
  /** `HH:MM:SS`; leave it out for the kit's own value. */
  time?: string;
  /** The first value of an uncontrolled field. */
  defaultTime?: string;
  /** Edit seconds as well. */
  precision?: 'minute' | 'second';
  /** `h12` adds an AM/PM segment. */
  hourCycle?: 'h23' | 'h12';
  disabled?: boolean;
  invalid?: boolean;
  size?: Size;
  onChange?: (event: TimeChangeEvent) => void;
}

export function TimeField({
  time,
  defaultTime,
  onChange,
  style,
  ...rest
}: TimeFieldProps) {
  return (
    <NativeRoot fitWidth style={style} testID={rest.testID}>
      <TimeFieldNative
        {...rest}
        testID={undefined}
        time={time ?? defaultTime}
        controlled={time !== undefined}
        onGpuiKitTimeFieldChange={onChange as never}
      />
    </NativeRoot>
  );
}

export type ColorChangeEvent = NativeSyntheticEvent<
  Readonly<{ color: number; cleared: boolean }>
>;

export interface ColorPickerProps extends ViewProps {
  /** The colour; leave it out for the kit's own value. */
  value?: ColorValue;
  label?: string;
  /** The first colour of an uncontrolled picker. */
  defaultValue?: ColorValue;
  featuredColors?: ColorValue[];
  /** Draw the trigger as a framed field that opens the picker (`ColorSelect`). */
  select?: boolean;
  /** The text of an empty `select` field. */
  placeholder?: string;
  size?: Size;
  /** `color` is 0xAARRGGBB, and `cleared` is set when the colour was cleared. */
  onChange?: (event: ColorChangeEvent) => void;
}

const argb = (color: ColorValue) => (processColor(color) as number | null) ?? 0;

export function ColorPicker({
  value,
  defaultValue,
  featuredColors,
  onChange,
  style,
  ...rest
}: ColorPickerProps) {
  const shown = value ?? defaultValue;
  return (
    <NativeRoot fitWidth={!rest.select} style={style} testID={rest.testID}>
      <ColorPickerNative
        {...rest}
        testID={undefined}
        value={shown === undefined ? undefined : argb(shown)}
        hasValue={shown !== undefined}
        controlled={value !== undefined}
        featuredColors={featuredColors?.map(argb)}
        onGpuiKitColorPickerChange={onChange as never}
      />
    </NativeRoot>
  );
}
