import type { ReactNode } from 'react';
import { processColor, type ColorValue } from 'react-native';
import type { IconName } from '../generated/icons';
import { kitStyle, type KitStyle } from './kitStyle';

/** An entry of an addon button's dropdown menu. */
export interface InputAddonMenuEntry {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  separator?: boolean;
  onSelect?: () => void;
}

/** One child of an addon: the kit's `InputGroupText`, `InputGroupButton`, `Label`, an icon, a `Kbd`, a `Spinner` or React Native content. */
export interface InputAddonItem {
  kind?: 'text' | 'button' | 'label' | 'icon' | 'kbd' | 'spinner' | 'content';
  text?: string;
  icon?: IconName;
  /** A button's label. */
  label?: string;
  variant?: 'ghost' | 'primary' | 'secondary' | 'danger' | 'outline';
  /** A button's tooltip, also its accessibility label. */
  tooltip?: string;
  disabled?: boolean;
  loading?: boolean;
  color?: ColorValue;
  /** A `Kbd` keystroke such as `enter` or `cmd-k`. */
  keys?: string;
  /** Pushes the item to the far end of its addon (`ml_auto`). */
  push?: boolean;
  kitStyle?: KitStyle;
  /** A button's size: the group's compact `xsmall` (default) or `small`. */
  size?: 'xsmall' | 'small';
  /** Draws a caret after a button's label. */
  dropdownCaret?: boolean;
  /** Turns a button into the trigger of a dropdown menu. */
  menu?: InputAddonMenuEntry[];
  /** Turns a button into the trigger of a popover with this content. */
  popover?: ReactNode;
  popoverWidth?: number;
  content?: ReactNode;
  onPress?: () => void;
}

/** `InputGroupAddon`: items on one side of the control. */
export interface InputAddon {
  align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end';
  kitStyle?: KitStyle;
  items: InputAddonItem[];
}

export function addonsJson(
  addons: InputAddon[] | undefined,
  invalid: boolean | undefined,
) {
  if (!addons?.length) return '';
  return JSON.stringify({
    invalid: invalid ?? false,
    addons: addons.map(addon => ({
      align: addon.align ?? 'inline-start',
      style: kitStyle(addon.kitStyle),
      items: addon.items.map(item => {
        const color =
          item.color == null ? null : processColor(item.color as ColorValue);
        return {
          kind: item.kind ?? (item.content != null ? 'content' : 'text'),
          text: item.text ?? '',
          icon: item.icon ?? '',
          label: item.label ?? '',
          variant: item.variant ?? '',
          tooltip: item.tooltip ?? '',
          disabled: item.disabled ?? false,
          loading: item.loading ?? false,
          color: typeof color === 'number' ? color >>> 0 : null,
          keys: item.keys ?? '',
          push: item.push ?? false,
          style: kitStyle(item.kitStyle),
          size: item.size ?? '',
          caret: item.dropdownCaret ?? false,
          menu: (item.menu ?? []).map(entry => ({
            label: entry.label ?? '',
            checked: entry.checked ?? false,
            disabled: entry.disabled ?? false,
            separator: entry.separator ?? false,
          })),
          popover: item.popover != null,
          popover_width: item.popoverWidth ?? 0,
        };
      }),
    })),
  });
}

export function addonSlots(addons: InputAddon[] | undefined) {
  const slots: [string, ReactNode][] = [];
  addons?.forEach((addon, a) =>
    addon.items.forEach((item, i) => {
      if (item.content != null) slots.push([`addon-${a}-${i}`, item.content]);
      if (item.popover != null)
        slots.push([`addon-${a}-${i}-popover`, item.popover]);
    }),
  );
  return slots;
}

export function pressAddon(
  addons: InputAddon[] | undefined,
  at: Readonly<{ addon: number; item: number; index: number }>,
) {
  const item = addons?.[at.addon]?.items[at.item];
  if (at.index < 0) item?.onPress?.();
  else item?.menu?.[at.index]?.onSelect?.();
}
