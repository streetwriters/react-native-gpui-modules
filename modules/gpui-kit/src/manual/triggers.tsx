import React, { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import PopoverNative from './GpuiKitPopoverNativeComponent';
import { SlotHost } from './SlotHost';
import HoverCardNative from './GpuiKitHoverCardNativeComponent';
import DropdownMenuNative from './GpuiKitDropdownMenuNativeComponent';
import TooltipNative from './GpuiKitTooltipNativeComponent';
import PopupMenuNative from './GpuiKitPopupMenuNativeComponent';
import CommandNative from './GpuiKitCommandNativeComponent';
import type { IconName } from '../generated/icons';

type Anchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type OpenEvent = NativeSyntheticEvent<Readonly<{ open: boolean }>>;
type SelectEvent = NativeSyntheticEvent<Readonly<{ index: number }>>;

interface Base {
  /** The React Native content the popup is anchored to. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface PopoverProps extends Base {
  /** Controls the popover; leave it out for the kit's own open state. */
  open?: boolean;
  anchor?: Anchor;
  /** Width of the content, in points. */
  width?: number;
  offset?: number;
  arrow?: boolean;
  appearance?: boolean;
  overlayClosable?: boolean;
  /** React Native content of the popover. */
  content?: ReactNode;
  onOpenChange?: (event: OpenEvent) => void;
}

export function Popover({
  children,
  content,
  open,
  onOpenChange,
  ...rest
}: PopoverProps) {
  const { style, testID, ...native } = rest;
  const toggle = useToggle(open, onOpenChange);
  return (
    <SlotHost
      style={style}
      testID={testID}
      native={PopoverNative as never}
      nativeProps={{
        ...native,
        appearance: native.appearance ?? true,
        overlayClosable: native.overlayClosable ?? true,
        open: toggle.current,
        controlled: true,
        onGpuiKitPopoverOpenChange: toggle.onChange,
      }}
      slots={[
        { name: 'trigger', content: toggle.wrap(children) },
        { name: 'content', content },
      ]}
    />
  );
}

export interface HoverCardProps extends Base {
  anchor?: Anchor;
  appearance?: boolean;
  /** Width of the content, in points. */
  width?: number;
  /** Milliseconds before it opens. */
  openDelay?: number;
  /** Milliseconds before it closes. */
  closeDelay?: number;
  /** React Native content of the card. */
  content?: ReactNode;
  onOpenChange?: (event: OpenEvent) => void;
}

export function HoverCard({
  children,
  content,
  onOpenChange,
  ...rest
}: HoverCardProps) {
  const { style, testID, ...native } = rest;
  return (
    <SlotHost
      style={style}
      testID={testID}
      native={HoverCardNative as never}
      nativeProps={{
        ...native,
        appearance: native.appearance ?? true,
        openDelay: native.openDelay ?? 0,
        closeDelay: native.closeDelay ?? 0,
        onGpuiKitHoverCardOpenChange: onOpenChange,
      }}
      slots={[
        { name: 'trigger', content: children },
        { name: 'content', content },
      ]}
    />
  );
}

export interface TooltipProps extends Base {
  /** Width of React Native content, in points. */
  width?: number;
  /** A string, or React Native content. */
  content?: ReactNode;
}

export function Tooltip({
  children,
  content,
  style,
  testID,
  width,
}: TooltipProps) {
  const text = typeof content === 'string' ? content : undefined;
  return (
    <SlotHost
      style={style}
      testID={testID}
      native={TooltipNative as never}
      nativeProps={{ text, width }}
      slots={[
        { name: 'trigger', content: children },
        { name: 'content', content: text === undefined ? content : null },
      ]}
    />
  );
}

export interface MenuEntry {
  label?: string;
  icon?: IconName;
  checked?: boolean;
  disabled?: boolean;
  separator?: boolean;
  onSelect?: () => void;
}

const entries = (items: MenuEntry[]) =>
  items.map(item => ({
    label: item.label ?? '',
    icon: item.icon ?? '',
    checked: item.checked ?? false,
    disabled: item.disabled ?? false,
    separator: item.separator ?? false,
  }));

export interface DropdownMenuProps extends Base {
  items: MenuEntry[];
  anchor?: Anchor;
  onOpenChange?: (event: OpenEvent) => void;
  onSelect?: (event: SelectEvent) => void;
}

export function DropdownMenu({
  children,
  items,
  onOpenChange,
  onSelect,
  style,
  testID,
  anchor,
}: DropdownMenuProps) {
  const toggle = useToggle(undefined, onOpenChange);
  return (
    <SlotHost
      style={style}
      testID={testID}
      native={DropdownMenuNative as never}
      nativeProps={{
        anchor,
        open: toggle.current,
        controlled: true,
        items: entries(items),
        onGpuiKitDropdownMenuOpenChange: toggle.onChange,
        onGpuiKitDropdownMenuSelect: (event: SelectEvent) => {
          items[event.nativeEvent.index]?.onSelect?.();
          onSelect?.(event);
        },
      }}
      slots={[{ name: 'trigger', content: toggle.wrap(children) }]}
    />
  );
}

export interface ContextMenuProps extends Base {
  items: MenuEntry[];
  onSelect?: (event: SelectEvent) => void;
}

export function ContextMenu({
  children,
  items,
  onSelect,
  style,
  testID,
}: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <SlotHost
      style={style}
      testID={testID}
      native={DropdownMenuNative as never}
      nativeProps={{
        anchor: 'top-left',
        open,
        controlled: true,
        items: entries(items),
        onGpuiKitDropdownMenuOpenChange: (event: OpenEvent) =>
          setOpen(event.nativeEvent.open),
        onGpuiKitDropdownMenuSelect: (event: SelectEvent) => {
          items[event.nativeEvent.index]?.onSelect?.();
          onSelect?.(event);
        },
      }}
      slots={[
        {
          name: 'trigger',
          content: (
            <View
              onPointerDown={event => {
                if (event.nativeEvent.button === 2) setOpen(true);
              }}
            >
              {children}
            </View>
          ),
        },
      ]}
    />
  );
}

/**
 * The popup's own open state. The trigger is React Native content, which takes
 * the press itself, so it is a `Pressable` here that opens and closes the popup;
 * the kit reports the other ways it closes (Escape, a press outside).
 */
function useToggle(
  open: boolean | undefined,
  onOpenChange?: (event: OpenEvent) => void,
) {
  const [state, setState] = useState(false);
  const current = open ?? state;
  const report = (next: boolean) => {
    setState(next);
    onOpenChange?.({ nativeEvent: { open: next } } as OpenEvent);
  };
  return {
    current,
    onChange: (event: OpenEvent) => report(event.nativeEvent.open),
    wrap: (children: ReactNode) => (
      <Pressable onPress={() => report(!current)}>{children}</Pressable>
    ),
  };
}

export interface PopupMenuProps {
  items: MenuEntry[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onSelect?: (event: SelectEvent) => void;
}

/** A menu shown in place, for a surface of your own. */
export function PopupMenu({ items, onSelect, style, testID }: PopupMenuProps) {
  return (
    <PopupMenuNative
      testID={testID}
      style={[{ width: 220, height: items.length * 30 + 12 }, style]}
      items={entries(items)}
      onGpuiKitPopupMenuSelect={(event: SelectEvent) => {
        items[event.nativeEvent.index]?.onSelect?.();
        onSelect?.(event);
      }}
    />
  );
}

export interface CommandEntry {
  label: string;
  icon?: IconName;
  checked?: boolean;
  /** Extra words the search matches. */
  keywords?: string[];
}

export interface CommandProps {
  items: CommandEntry[];
  placeholder?: string;
  searchable?: boolean;
  filterable?: boolean;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onSelect?: (event: SelectEvent) => void;
  onConfirm?: (event: SelectEvent) => void;
  onCancel?: () => void;
  onQuery?: (text: string) => void;
}

/** A searchable command list. */
export function Command({
  items,
  onSelect,
  onConfirm,
  onCancel,
  onQuery,
  style,
  testID,
  ...rest
}: CommandProps) {
  return (
    <CommandNative
      testID={testID}
      style={[{ width: 360, height: 300 }, style]}
      items={items.map(item => ({
        label: item.label,
        icon: item.icon ?? '',
        checked: item.checked ?? false,
        keywords: (item.keywords ?? []).join(','),
      }))}
      placeholder={rest.placeholder}
      searchable={rest.searchable ?? true}
      filterable={rest.filterable ?? true}
      bordered={rest.bordered ?? true}
      onGpuiKitCommandSelect={onSelect as never}
      onGpuiKitCommandConfirm={onConfirm as never}
      onGpuiKitCommandCancel={() => onCancel?.()}
      onGpuiKitCommandQuery={(event: { nativeEvent: { text: string } }) =>
        onQuery?.(event.nativeEvent.text)
      }
    />
  );
}
