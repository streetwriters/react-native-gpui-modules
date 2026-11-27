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
import { kitStyle, type KitStyle } from './kitStyle';

type Anchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left-center'
  | 'right-center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
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
  /** Opens on the first render, when `open` is left out. */
  defaultOpen?: boolean;
  /** The button that opens it: `left` (default) or `right`. */
  mouseButton?: 'left' | 'right';
  /** Refines the content box: padding, gap, colors, radius, shadow and so on. */
  kitStyle?: KitStyle;
  anchor?: Anchor;
  /** Width of the content, in points (default 240); `auto` sizes it to the content. */
  width?: number | 'auto';
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
  defaultOpen,
  mouseButton,
  kitStyle: contentStyle,
  width,
  onOpenChange,
  ...rest
}: PopoverProps) {
  const { style, testID, ...native } = rest;
  const toggle = useToggle(open, onOpenChange, defaultOpen);
  return (
    <SlotHost
      fitWidth
      style={style}
      testID={testID}
      native={PopoverNative as never}
      nativeProps={{
        ...native,
        contentWidth: width === 'auto' ? -1 : width,
        kitStyle: kitStyle(contentStyle),
        appearance: native.appearance ?? true,
        overlayClosable: native.overlayClosable ?? true,
        open: toggle.current,
        controlled: true,
        onGpuiKitPopoverOpenChange: toggle.onChange,
      }}
      slots={[
        {
          name: 'trigger',
          content:
            mouseButton === 'right'
              ? toggle.wrapRight(children)
              : toggle.wrap(children),
        },
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
  const { style, testID, width, ...native } = rest;
  return (
    <SlotHost
      fitWidth
      style={style}
      testID={testID}
      native={HoverCardNative as never}
      nativeProps={{
        ...native,
        cardWidth: width,
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
      fitWidth
      style={style}
      testID={testID}
      native={TooltipNative as never}
      nativeProps={{ text, contentWidth: width }}
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
  /** A heading row that cannot be chosen. */
  heading?: boolean;
  /** Opens this URL when chosen, and shows the external link mark. */
  href?: string;
  /** A keystroke such as `cmd-c` that chooses the item while focus is inside the trigger; shown beside it. */
  shortcut?: string;
  /** React Native content drawn as the row, instead of `label`. */
  content?: ReactNode;
  /** Entries of a submenu that opens from this item. */
  children?: MenuEntry[];
  onSelect?: () => void;
}

/** Options of the menu itself. */
export interface MenuOptions {
  minWidth?: number;
  maxWidth?: number;
  maxHeight?: number;
  /** Scrolls when the entries are taller than `maxHeight`. */
  scrollable?: boolean;
  /** Which side checked items show their mark on. */
  checkSide?: 'left' | 'right';
  /** Shows the external link mark on link items (default `true`). */
  externalLinkIcon?: boolean;
}

type FlatEntry = { entry: MenuEntry };

/** The menu as the JSON the native side reads, and its entries by id. */
export function menuModel(items: MenuEntry[], options: MenuOptions = {}) {
  const flat: FlatEntry[] = [];
  const toJson = (list: MenuEntry[]): unknown[] =>
    list.map(entry => {
      const id = flat.length;
      flat.push({ entry });
      const kind = entry.separator
        ? 'separator'
        : entry.heading
          ? 'label'
          : entry.children
            ? 'submenu'
            : entry.href
              ? 'link'
              : 'item';
      return {
        kind,
        id,
        label: entry.label ?? '',
        icon: entry.icon ?? '',
        checked: entry.checked ?? false,
        disabled: entry.disabled ?? false,
        href: entry.href ?? '',
        shortcut: entry.shortcut ?? '',
        content: entry.content != null,
        children: entry.children ? toJson(entry.children) : [],
      };
    });
  const json = JSON.stringify({ ...options, items: toJson(items) });
  const slots = flat.map(({ entry }, id) => ({
    name: `item-${id}`,
    content: entry.content,
  }));
  return { json, flat, slots };
}

export interface DropdownMenuProps extends Base, MenuOptions {
  items: MenuEntry[];
  anchor?: Anchor;
  onOpenChange?: (event: OpenEvent) => void;
  /** An entry was chosen; `index` counts every entry, submenus' included, in order. */
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
  ...options
}: DropdownMenuProps) {
  const toggle = useToggle(undefined, onOpenChange);
  const model = menuModel(items, options);
  return (
    <SlotHost
      fitWidth
      style={style}
      testID={testID}
      native={DropdownMenuNative as never}
      nativeProps={{
        anchor,
        mode: 'dropdown',
        open: toggle.current,
        controlled: true,
        menuJson: model.json,
        onGpuiKitDropdownMenuOpenChange: toggle.onChange,
        onGpuiKitDropdownMenuSelect: (event: SelectEvent) => {
          model.flat[event.nativeEvent.index]?.entry.onSelect?.();
          onSelect?.(event);
        },
      }}
      slots={[
        { name: 'trigger', content: toggle.wrap(children) },
        ...model.slots,
      ]}
    />
  );
}

export interface ContextMenuProps extends Base, MenuOptions {
  items: MenuEntry[];
  onSelect?: (event: SelectEvent) => void;
}

/** A menu that opens where its content is right-clicked. */
export function ContextMenu({
  children,
  items,
  onSelect,
  style,
  testID,
  ...options
}: ContextMenuProps) {
  const model = menuModel(items, options);
  return (
    <SlotHost
      style={style}
      testID={testID}
      native={DropdownMenuNative as never}
      nativeProps={{
        mode: 'context',
        menuJson: model.json,
        onGpuiKitDropdownMenuSelect: (event: SelectEvent) => {
          model.flat[event.nativeEvent.index]?.entry.onSelect?.();
          onSelect?.(event);
        },
      }}
      slots={[{ name: 'trigger', content: children }, ...model.slots]}
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
  initial = false,
) {
  const [state, setState] = useState(initial);
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
    wrapRight: (children: ReactNode) => (
      <View
        onPointerDown={event => {
          if (event.nativeEvent.button === 2) report(!current);
        }}
      >
        {children}
      </View>
    ),
  };
}

const entries = (items: MenuEntry[]) =>
  items.map(item => ({
    label: item.label ?? '',
    icon: item.icon ?? '',
    checked: item.checked ?? false,
    disabled: item.disabled ?? false,
    separator: item.separator ?? false,
  }));

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
  disabled?: boolean;
  /** Extra words the search matches. */
  keywords?: string[];
  /** A keystroke such as `cmd-p` that runs the item while focus is in the palette; shown beside it. */
  shortcut?: string;
  /** React Native content drawn as the row; `label` is still what the search matches. */
  content?: ReactNode;
  onSelect?: () => void;
}

export interface CommandGroupEntry {
  group: string;
  items: CommandEntry[];
}

export type CommandListEntry = CommandEntry | CommandGroupEntry | 'separator';

export interface CommandProps {
  /** Items, titled groups and separators. */
  items: CommandListEntry[];
  placeholder?: string;
  searchable?: boolean;
  filterable?: boolean;
  bordered?: boolean;
  /** The tallest the palette's list may be, in points. */
  maxHeight?: number;
  /** React Native content above the list. */
  header?: ReactNode;
  /** React Native content below the list. */
  footer?: ReactNode;
  /** Focuses the search field when the palette first shows. */
  autoFocus?: boolean;
  /** Shows the loading state while results are fetched. */
  loading?: boolean;
  /** React Native content shown when nothing matches. */
  empty?: ReactNode;
  kitStyle?: KitStyle;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** `index` counts the items in order, groups' items included. */
  onSelect?: (event: SelectEvent) => void;
  /** An item was chosen: `index` as for `onSelect`, and its `section` and `row` in the palette. */
  onConfirm?: (
    event: NativeSyntheticEvent<
      Readonly<{ index: number; section: number; row: number }>
    >,
  ) => void;
  onCancel?: () => void;
  /** The search text changed; `matched` is how many items match it. */
  onQuery?: (text: string, matched: number) => void;
}

/** A searchable command palette. Without a height in `style` it is as high as its list. */
export function Command({
  items,
  onSelect,
  onConfirm,
  onCancel,
  onQuery,
  header,
  footer,
  empty,
  kitStyle: commandStyle,
  style,
  testID,
  ...rest
}: CommandProps) {
  const flat: CommandEntry[] = [];
  const item = (entry: CommandEntry) => {
    const id = flat.length;
    flat.push(entry);
    return {
      kind: 'item',
      id,
      label: entry.label,
      icon: entry.icon ?? '',
      checked: entry.checked ?? false,
      disabled: entry.disabled ?? false,
      keywords: entry.keywords ?? [],
      shortcut: entry.shortcut ?? '',
      content: entry.content != null,
    };
  };
  const json = JSON.stringify(
    items.map(entry =>
      entry === 'separator'
        ? { kind: 'separator' }
        : 'group' in entry
          ? { kind: 'group', label: entry.group, items: entry.items.map(item) }
          : item(entry),
    ),
  );
  return (
    <SlotHost
      testID={testID}
      style={[{ width: 360 }, style]}
      native={CommandNative as never}
      nativeProps={{
        entriesJson: json,
        placeholder: rest.placeholder ?? '',
        searchable: rest.searchable ?? true,
        filterable: rest.filterable ?? true,
        bordered: rest.bordered ?? true,
        listMaxHeight: rest.maxHeight ?? 0,
        autoFocus: rest.autoFocus ?? false,
        loading: rest.loading ?? false,
        kitStyle: kitStyle(commandStyle),
        onGpuiKitCommandSelect: (event: SelectEvent) => onSelect?.(event),
        onGpuiKitCommandConfirm: (
          event: NativeSyntheticEvent<
            Readonly<{ index: number; section: number; row: number }>
          >,
        ) => {
          flat[event.nativeEvent.index]?.onSelect?.();
          onConfirm?.(event);
        },
        onGpuiKitCommandCancel: () => onCancel?.(),
        onGpuiKitCommandQuery: (event: {
          nativeEvent: { text: string; matched: number };
        }) => onQuery?.(event.nativeEvent.text, event.nativeEvent.matched),
      }}
      slots={[
        { name: 'header', content: header },
        { name: 'footer', content: footer },
        { name: 'empty', content: empty },
        ...flat.map((entry, id) => ({
          name: `item-${id}`,
          content: entry.content,
        })),
      ]}
    />
  );
}
