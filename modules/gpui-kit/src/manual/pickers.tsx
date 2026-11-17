import React from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import type { IconName } from '../generated/icons';
import SelectNative from './GpuiKitSelectNativeComponent';
import ComboboxNative from './GpuiKitComboboxNativeComponent';

type Size = 'xsmall' | 'small' | 'medium' | 'large';

interface PickerBase extends ViewProps {
  items: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  cleanable?: boolean;
  disabled?: boolean;
  appearance?: boolean;
  menuWidth?: number;
  icon?: IconName;
  size?: Size;
}

export type SelectChangeEvent = NativeSyntheticEvent<
  Readonly<{ value: string; index: number }>
>;

export interface SelectProps extends PickerBase {
  /** The chosen item; leave it out for the kit's own selection. */
  value?: string;
  onChange?: (event: SelectChangeEvent) => void;
}

export function Select({
  value,
  onChange,
  style,
  appearance,
  ...rest
}: SelectProps) {
  return (
    <SelectNative
      {...rest}
      style={[{ width: 200, height: 32 }, style]}
      appearance={appearance ?? true}
      value={value}
      controlled={value !== undefined}
      onGpuiKitSelectChange={onChange as never}
    />
  );
}

export type ComboboxChangeEvent = NativeSyntheticEvent<
  Readonly<{ values: string[] }>
>;

export interface ComboboxProps extends PickerBase {
  multiple?: boolean;
  /** The chosen items; leave it out for the kit's own selection. */
  values?: string[];
  onChange?: (event: ComboboxChangeEvent) => void;
  /** The popup closed. */
  onConfirm?: (event: ComboboxChangeEvent) => void;
}

const split = (event: { nativeEvent: { values: string } }) => ({
  ...event,
  nativeEvent: {
    values:
      event.nativeEvent.values === ''
        ? []
        : event.nativeEvent.values.split('\n'),
  },
});

export function Combobox({
  values,
  onChange,
  onConfirm,
  style,
  appearance,
  ...rest
}: ComboboxProps) {
  return (
    <ComboboxNative
      {...rest}
      style={[{ width: 240, height: 32 }, style]}
      appearance={appearance ?? true}
      values={values?.join('\n')}
      controlled={values !== undefined}
      onGpuiKitComboboxChange={event =>
        onChange?.(split(event) as ComboboxChangeEvent)
      }
      onGpuiKitComboboxConfirm={event =>
        onConfirm?.(split(event) as ComboboxChangeEvent)
      }
    />
  );
}
