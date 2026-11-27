import { NativeRoot } from '@react-native-gpui/core/desktop';
import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import Native from './GpuiKitToggleGroupNativeComponent';
import type { ToggleProps } from '../generated/Toggle';
import { childProps, indicesOf } from './items';

export type ToggleGroupChangeEvent = NativeSyntheticEvent<
  Readonly<{ checked: number[] }>
>;

export interface ToggleGroupProps extends ViewProps {
  /** `Toggle` elements; `label`, `icon`, `checked` and `disabled` are used, and `onChange` is called when the toggle changes. */
  children?: ReactNode;
  segmented?: boolean;
  single?: boolean;
  disabled?: boolean;
  variant?: 'ghost' | 'outline';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  onChange?: (event: ToggleGroupChangeEvent) => void;
}

export function ToggleGroup({
  children,
  onChange,
  style,
  ...rest
}: ToggleGroupProps) {
  const toggles = childProps<ToggleProps>(children);
  return (
    <NativeRoot fitWidth style={style} testID={rest.testID}>
      <Native
        {...rest}
        testID={undefined}
        items={toggles.map(toggle => ({
          label: toggle.label ?? '',
          icon: toggle.icon ?? '',
          checked: toggle.checked ?? false,
          disabled: toggle.disabled ?? false,
        }))}
        onGpuiKitToggleGroupChange={event => {
          const checked = new Set(indicesOf(event.nativeEvent.checked));
          toggles.forEach((toggle, index) =>
            toggle.onChange?.({
              nativeEvent: { state: checked.has(index) },
            } as never),
          );
          onChange?.({
            ...event,
            nativeEvent: { checked: [...checked] },
          } as ToggleGroupChangeEvent);
        }}
      />
    </NativeRoot>
  );
}
