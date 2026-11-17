import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import Native from './GpuiKitButtonGroupNativeComponent';
import type { ButtonProps } from '../generated/Button';
import { childProps, indicesOf, syntheticPress } from './items';

export type ButtonGroupPressEvent = NativeSyntheticEvent<
  Readonly<{ pressed: number[] }>
>;

export interface ButtonGroupProps extends ViewProps {
  /** `Button` elements; `label`, `icon`, `variant`, `selected` and `disabled` are used, and `onPress` is called when the button is pressed. */
  children?: ReactNode;
  multiple?: boolean;
  compact?: boolean;
  outline?: boolean;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  variant?: NonNullable<ButtonProps['variant']>;
  onPress?: (event: ButtonGroupPressEvent) => void;
}

export function ButtonGroup({
  children,
  onPress,
  style,
  ...rest
}: ButtonGroupProps) {
  const buttons = childProps<ButtonProps>(children);
  const widths = buttons.map(
    button => (button.label?.length ?? 0) * 7.5 + (button.icon ? 20 : 0) + 22,
  );
  const vertical = rest.layout === 'vertical';
  return (
    <Native
      {...rest}
      items={buttons.map(button => ({
        label: button.label ?? '',
        icon: button.icon ?? '',
        selected: button.selected ?? false,
        disabled: button.disabled ?? false,
        variant: button.variant ?? '',
      }))}
      style={[
        {
          height: vertical ? buttons.length * 32 : 32,
          width: vertical
            ? Math.max(0, ...widths)
            : widths.reduce((sum, width) => sum + width, 0),
        },
        style,
      ]}
      onGpuiKitButtonGroupPress={event => {
        const pressed = indicesOf(event.nativeEvent.pressed);
        for (const index of pressed)
          buttons[index]?.onPress?.(syntheticPress as never);
        onPress?.({
          ...event,
          nativeEvent: { pressed },
        } as ButtonGroupPressEvent);
      }}
    />
  );
}
