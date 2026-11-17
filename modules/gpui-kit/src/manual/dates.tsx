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
    <CalendarNative
      {...rest}
      style={[{ width: 280 * (rest.numberOfMonths ?? 1), height: 320 }, style]}
      date={date}
      endDate={endDate}
      controlled={date !== undefined}
      onGpuiKitCalendarChange={onChange as never}
    />
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
  onChange?: (event: DateChangeEvent) => void;
}

export function DatePicker({
  date,
  endDate,
  onChange,
  appearance,
  style,
  ...rest
}: DatePickerProps) {
  return (
    <DatePickerNative
      {...rest}
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
  disabled?: boolean;
  invalid?: boolean;
  size?: Size;
  onChange?: (event: TimeChangeEvent) => void;
}

export function TimeField({ time, onChange, style, ...rest }: TimeFieldProps) {
  return (
    <TimeFieldNative
      {...rest}
      style={[{ width: 140, height: 32 }, style]}
      time={time}
      controlled={time !== undefined}
      onGpuiKitTimeFieldChange={onChange as never}
    />
  );
}

export type ColorChangeEvent = NativeSyntheticEvent<
  Readonly<{ color: number; cleared: boolean }>
>;

export interface ColorPickerProps extends ViewProps {
  /** The colour; leave it out for the kit's own value. */
  value?: ColorValue;
  label?: string;
  featuredColors?: ColorValue[];
  size?: Size;
  /** `color` is 0xAARRGGBB, and `cleared` is set when the colour was cleared. */
  onChange?: (event: ColorChangeEvent) => void;
}

const argb = (color: ColorValue) => (processColor(color) as number | null) ?? 0;

export function ColorPicker({
  value,
  featuredColors,
  onChange,
  style,
  ...rest
}: ColorPickerProps) {
  return (
    <ColorPickerNative
      {...rest}
      style={[{ width: 40, height: 32 }, style]}
      value={value === undefined ? undefined : argb(value)}
      controlled={value !== undefined}
      featuredColors={featuredColors?.map(argb)}
      onGpuiKitColorPickerChange={onChange as never}
    />
  );
}
