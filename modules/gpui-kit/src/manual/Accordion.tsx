import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import Native from './GpuiKitAccordionNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';
import type { IconName } from '../generated/icons';
import { indicesOf } from './items';
import { kitStyle, type KitStyle } from './kitStyle';

export interface AccordionEntry {
  title: string;
  icon?: IconName;
  open?: boolean;
  disabled?: boolean;
  /** React Native content shown while the item is open. */
  content?: ReactNode;
}

export type AccordionToggleEvent = NativeSyntheticEvent<
  Readonly<{ open: number[] }>
>;

export interface AccordionProps extends SlotHostProps {
  items: AccordionEntry[];
  multiple?: boolean;
  bordered?: boolean;
  disabled?: boolean;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  /** Refines every item's title row. */
  titleStyle?: KitStyle;
  /** Refines every item's content. */
  contentStyle?: KitStyle;
  /** Refines a title row while the pointer is over it. */
  itemHoverStyle?: KitStyle;
  /** The indices of the open items changed. */
  onToggle?: (event: AccordionToggleEvent) => void;
}

export function Accordion({
  items,
  onToggle,
  multiple,
  bordered,
  disabled,
  size,
  titleStyle,
  contentStyle,
  itemHoverStyle,
  ...view
}: AccordionProps) {
  return (
    <SlotHost
      {...view}
      native={Native as never}
      nativeProps={{
        multiple,
        bordered: bordered ?? true,
        disabled,
        size,
        titleStyle: kitStyle(titleStyle),
        contentStyle: kitStyle(contentStyle),
        itemHoverStyle: kitStyle(itemHoverStyle),
        items: items.map(item => ({
          title: item.title,
          icon: item.icon ?? '',
          open: item.open ?? false,
          disabled: item.disabled ?? false,
        })),
        onGpuiKitAccordionToggle: (event: { nativeEvent: { open: string } }) =>
          onToggle?.({
            ...event,
            nativeEvent: { open: indicesOf(event.nativeEvent.open) },
          } as AccordionToggleEvent),
      }}
      slots={items.map((item, index) => ({
        name: `item-${index}`,
        content: item.content,
      }))}
    />
  );
}
