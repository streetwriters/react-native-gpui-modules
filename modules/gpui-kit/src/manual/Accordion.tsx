import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import Native from './GpuiKitAccordionNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';
import type { IconName } from '../generated/icons';
import { indicesOf } from './items';
import { kitStyle, type KitStyle } from './kitStyle';

export interface AccordionEntry {
  /** The title text, or React Native content for the title row. */
  title: ReactNode;
  icon?: IconName;
  open?: boolean;
  disabled?: boolean;
  /** Content shown while the item is open: a string is drawn in the kit's own type. */
  content?: ReactNode;
  /** Refines this item's title row. */
  titleStyle?: KitStyle;
  /** Refines this item's content. */
  contentStyle?: KitStyle;
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
          title: typeof item.title === 'string' ? item.title : '',
          icon: item.icon ?? '',
          open: item.open ?? false,
          disabled: item.disabled ?? false,
          text: typeof item.content === 'string' ? item.content : '',
          titleStyle: kitStyle(item.titleStyle),
          contentStyle: kitStyle(item.contentStyle),
        })),
        onGpuiKitAccordionToggle: (event: { nativeEvent: { open: string } }) =>
          onToggle?.({
            ...event,
            nativeEvent: { open: indicesOf(event.nativeEvent.open) },
          } as AccordionToggleEvent),
      }}
      slots={items.flatMap((item, index) => [
        {
          name: `item-${index}`,
          content: typeof item.content === 'string' ? null : item.content,
        },
        {
          name: `title-${index}`,
          content: typeof item.title === 'string' ? null : item.title,
        },
      ])}
    />
  );
}
