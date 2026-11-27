import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import Native from './GpuiKitStepperNativeComponent';
import type { IconName } from '../generated/icons';
import { kitStyle, type KitStyle } from './kitStyle';
import { SlotHost, type SlotHostProps } from './SlotHost';

export interface StepperEntry {
  title?: string;
  /** A second line under the title. */
  description?: string;
  icon?: IconName;
  disabled?: boolean;
  /** React Native content of the step, instead of `title` and `description`. */
  content?: ReactNode;
  /** Refines the step (`.pb_8()` and so on). */
  kitStyle?: KitStyle;
}

export type StepperSelectEvent = NativeSyntheticEvent<
  Readonly<{ index: number }>
>;

export interface StepperProps extends SlotHostProps {
  items: StepperEntry[];
  selectedIndex?: number;
  /** Centres each step's content under its indicator. */
  textCenter?: boolean;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  /** Refines the stepper (`.w_full()`, `.items_center()` and so on). */
  kitStyle?: KitStyle;
  onSelect?: (event: StepperSelectEvent) => void;
}

/** A row or column of steps. Without a height in `style` it is as high as its steps. */
export function Stepper({
  items,
  selectedIndex,
  textCenter,
  disabled,
  layout,
  size,
  kitStyle: stepperStyle,
  onSelect,
  ...view
}: StepperProps) {
  return (
    <SlotHost
      fitWidth={layout === 'vertical'}
      {...view}
      native={Native as never}
      nativeProps={{
        items: items.map(item => ({
          title: item.title ?? '',
          description: item.description ?? '',
          icon: item.icon ?? '',
          disabled: item.disabled ?? false,
          kitStyle: kitStyle(item.kitStyle),
        })),
        selectedIndex: selectedIndex ?? 0,
        textCenter,
        disabled,
        layout,
        size,
        kitStyle: kitStyle(stepperStyle),
        onGpuiKitStepperSelect: onSelect,
      }}
      slots={items.map((item, index) => ({
        name: `step-${index}`,
        content: item.content,
      }))}
    />
  );
}
