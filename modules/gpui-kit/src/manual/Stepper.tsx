import React from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import Native from './GpuiKitStepperNativeComponent';
import type { IconName } from '../generated/icons';

export interface StepperEntry {
  title?: string;
  icon?: IconName;
  disabled?: boolean;
}

export type StepperSelectEvent = NativeSyntheticEvent<
  Readonly<{ index: number }>
>;

export interface StepperProps extends ViewProps {
  items: StepperEntry[];
  selectedIndex?: number;
  textCenter?: boolean;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  onSelect?: (event: StepperSelectEvent) => void;
}

export function Stepper({ items, onSelect, style, ...rest }: StepperProps) {
  const vertical = rest.layout === 'vertical';
  return (
    <Native
      {...rest}
      items={items.map(item => ({
        title: item.title ?? '',
        icon: item.icon ?? '',
        disabled: item.disabled ?? false,
      }))}
      style={[
        vertical
          ? { width: 160, height: items.length * 64 }
          : { width: items.length * 140, height: 64 },
        style,
      ]}
      onGpuiKitStepperSelect={event => onSelect?.(event as StepperSelectEvent)}
    />
  );
}
