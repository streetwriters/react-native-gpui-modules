import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import Native from './GpuiKitDropdownButtonNativeComponent';
import type { IconName } from '../generated/icons';
import type { ButtonProps } from '../generated/Button';
import { SlotHost } from './SlotHost';

export interface DropdownItem {
  label?: string;
  icon?: IconName;
  checked?: boolean;
  disabled?: boolean;
  /** A separator line instead of an item. */
  separator?: boolean;
  /**
   * A registered action name such as `input::SelectAll`: the item shows the
   * action's keybinding and dispatches the action when chosen.
   */
  action?: string;
  /** React Native content drawn as the item instead of the label. */
  content?: ReactNode;
  /** Entries of a submenu that opens from this item. */
  children?: DropdownItem[];
  onSelect?: () => void;
}

function flatten(
  items: DropdownItem[],
  parent = -1,
  out: { item: DropdownItem; parent: number }[] = [],
) {
  for (const item of items) {
    const index = out.length;
    out.push({ item, parent });
    if (item.children?.length) flatten(item.children, index, out);
  }
  return out;
}

export type DropdownSelectEvent = NativeSyntheticEvent<
  Readonly<{ index: number }>
>;

export interface DropdownButtonProps extends ViewProps {
  label?: string;
  icon?: IconName;
  loading?: boolean;
  selected?: boolean;
  disabled?: boolean;
  outline?: boolean;
  variant?: NonNullable<ButtonProps['variant']>;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  /** The screen reader name of the menu trigger. */
  menuAccessibilityLabel?: string;
  anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** The entries of the menu that opens from the caret half. */
  items?: DropdownItem[];
  /** The action half was pressed. */
  onPress?: () => void;
  /** A menu item was chosen. */
  onSelect?: (event: DropdownSelectEvent) => void;
}

export function DropdownButton({
  items = [],
  onPress,
  onSelect,
  style,
  ...rest
}: DropdownButtonProps) {
  const width =
    (rest.label?.length ?? 0) * 7.5 + (rest.icon ? 20 : 0) + 22 + 32;
  const flat = flatten(items);
  const nativeProps = {
    ...rest,
    items: flat.map(({ item, parent }) => ({
      label: item.label ?? '',
      icon: item.icon ?? '',
      checked: item.checked ?? false,
      disabled: item.disabled ?? false,
      separator: item.separator ?? false,
      action: item.action ?? '',
      parent,
    })),
    onGpuiKitDropdownButtonPress: () => onPress?.(),
    onGpuiKitDropdownButtonSelect: (event: DropdownSelectEvent) => {
      flat[event.nativeEvent.index]?.item.onSelect?.();
      onSelect?.(event);
    },
  };
  const slots = flat
    .map(({ item }, index) => ({
      name: `item-${index}`,
      content: item.content,
    }))
    .filter(slot => slot.content != null);
  if (slots.length)
    return (
      <SlotHost
        style={[{ height: 32, width }, style]}
        native={Native as never}
        nativeProps={nativeProps}
        slots={slots}
      />
    );
  return (
    <Native
      {...(nativeProps as object)}
      style={[{ height: 32, width }, style]}
    />
  );
}
