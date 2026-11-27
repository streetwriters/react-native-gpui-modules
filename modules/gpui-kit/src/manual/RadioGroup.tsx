import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import Native from './GpuiKitRadioGroupNativeComponent';
import type { RadioProps } from '../generated/Radio';
import { childProps } from './items';
import { SlotHost, type SlotHostProps } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';

export type RadioGroupChangeEvent = NativeSyntheticEvent<
  Readonly<{ index: number }>
>;

export interface RadioGroupProps extends SlotHostProps {
  /** `Radio` elements; `label`, `disabled`, `size` and `kitStyle` are used, and their children are drawn below the label. */
  children?: ReactNode;
  layout?: 'vertical' | 'horizontal';
  selectedIndex?: number;
  disabled?: boolean;
  /** Refines the group (`.w()`, `.gap_3()`, `.justify_between()` and so on). */
  kitStyle?: KitStyle;
  style?: StyleProp<ViewStyle>;
  onChange?: (event: RadioGroupChangeEvent) => void;
}

export function RadioGroup({
  children,
  layout,
  selectedIndex,
  disabled,
  kitStyle: groupStyle,
  onChange,
  ...view
}: RadioGroupProps) {
  const radios = childProps<RadioProps>(children);
  return (
    <SlotHost
      {...view}
      native={Native as never}
      nativeProps={{
        items: radios.map(radio => ({
          label: radio.label ?? '',
          disabled: radio.disabled ?? false,
          size: radio.size ?? '',
          kitStyle: kitStyle(radio.kitStyle),
        })),
        layout,
        selectedIndex: selectedIndex ?? -1,
        disabled,
        kitStyle: kitStyle(groupStyle),
        onGpuiKitRadioGroupChange: onChange,
      }}
      slots={radios.map((radio, index) => ({
        name: `radio-${index}`,
        content: radio.children,
      }))}
    />
  );
}
