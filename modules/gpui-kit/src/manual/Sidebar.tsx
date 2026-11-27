import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import type { IconName } from '../generated/icons';
import SidebarNative from './GpuiKitSidebarNativeComponent';
import ToggleNative from './GpuiKitSidebarToggleNativeComponent';
import { SlotHost, type Slot } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';
import { menuModel, type MenuEntry } from './triggers';

interface Base {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface SidebarEntry {
  label: string;
  icon?: IconName;
  active?: boolean;
  disabled?: boolean;
  /** Start with the children shown. */
  open?: boolean;
  /** A click on the item opens its children instead of toggling them. */
  clickToOpen?: boolean;
  /** React Native content after the label. */
  suffix?: ReactNode;
  /** Refines the item, for example a border. */
  kitStyle?: KitStyle;
  /** Refines the item's label. */
  labelStyle?: KitStyle;
  /** The item's context menu; each entry's `onSelect` is called when it is chosen. */
  contextMenu?: MenuEntry[];
  children?: SidebarEntry[];
  onPress?: () => void;
}

export interface SidebarGroupEntry {
  label: string;
  items: SidebarEntry[];
}

export interface SidebarProps extends Base {
  groups: SidebarGroupEntry[];
  /** The side of the window the sidebar is on, which the collapsed icons and borders follow. */
  side?: 'left' | 'right';
  collapsed?: boolean;
  collapsible?: 'icon' | 'offcanvas' | 'none';
  /** Width when open, in points. */
  width?: number;
  /** React Native content above the menu. */
  header?: ReactNode;
  /** Wraps `header` in the kit's sidebar header, which pads it and highlights it on hover. */
  kitHeader?: boolean;
  /** A menu the header opens; it needs `kitHeader`. */
  headerMenu?: MenuEntry[];
  headerStyle?: KitStyle;
  /** React Native content below the menu. */
  footer?: ReactNode;
  /** Wraps `footer` in the kit's sidebar footer. */
  kitFooter?: boolean;
  footerStyle?: KitStyle;
  /** Refines the sidebar, for example its gap. */
  kitStyle?: KitStyle;
  /** The index of the pressed item among all items, depth first. */
  onPress?: (event: NativeSyntheticEvent<Readonly<{ index: number }>>) => void;
}

/** The kit's sidebar: groups of menu items, a header and a footer. */
export function Sidebar({
  groups,
  side,
  collapsed,
  collapsible,
  width = 240,
  header,
  kitHeader,
  headerMenu,
  headerStyle,
  footer,
  kitFooter,
  footerStyle,
  kitStyle: sidebarStyle,
  onPress,
  style,
  testID,
}: SidebarProps) {
  const flat: SidebarEntry[] = [];
  const menus: ReturnType<typeof menuModel>[] = [];
  const slots: Slot[] = [
    { name: 'header', content: header },
    { name: 'footer', content: footer },
  ];
  const toJson = (entry: SidebarEntry): unknown => {
    const index = flat.length;
    flat.push(entry);
    if (entry.suffix != null)
      slots.push({ name: `suffix-${index}`, content: entry.suffix, fit: true });
    const menu = entry.contextMenu ? menuModel(entry.contextMenu) : null;
    menus[index] = menu as never;
    return {
      index,
      label: entry.label,
      icon: entry.icon ?? '',
      active: entry.active ?? false,
      disabled: entry.disabled ?? false,
      defaultOpen: entry.open ?? false,
      clickToOpen: entry.clickToOpen ?? false,
      kitStyle: kitStyle(entry.kitStyle),
      labelStyle: kitStyle(entry.labelStyle),
      suffix: entry.suffix != null,
      menu: menu ? JSON.parse(menu.json) : null,
      children: (entry.children ?? []).map(toJson),
    };
  };
  const json = groups.map(group => ({
    label: group.label,
    items: group.items.map(toJson),
  }));
  const header$ = headerMenu ? menuModel(headerMenu) : null;
  return (
    <SlotHost
      style={[{ width, height: 400 }, style]}
      testID={testID}
      native={SidebarNative as never}
      nativeProps={{
        groupsJson: JSON.stringify(json),
        side: side ?? 'left',
        sidebarWidth: width,
        collapsed,
        collapsible,
        headerKit: kitHeader ?? false,
        headerMenuJson: header$?.json ?? '',
        headerStyle: kitStyle(headerStyle),
        footerKit: kitFooter ?? false,
        footerStyle: kitStyle(footerStyle),
        kitStyle: kitStyle(sidebarStyle),
        onGpuiKitSidebarPress: (
          event: NativeSyntheticEvent<Readonly<{ index: number }>>,
        ) => {
          flat[event.nativeEvent.index]?.onPress?.();
          onPress?.(event);
        },
        onGpuiKitSidebarHeaderMenu: (
          event: NativeSyntheticEvent<Readonly<{ id: number }>>,
        ) => header$?.flat[event.nativeEvent.id]?.entry.onSelect?.(),
        onGpuiKitSidebarItemMenu: (
          event: NativeSyntheticEvent<Readonly<{ index: number; id: number }>>,
        ) =>
          menus[event.nativeEvent.index]?.flat[
            event.nativeEvent.id
          ]?.entry.onSelect?.(),
      }}
      slots={slots}
    />
  );
}

export interface SidebarToggleProps extends Base {
  side?: 'left' | 'right';
  collapsed?: boolean;
  onPress?: () => void;
}

/** The kit's button that collapses and opens a sidebar. */
export function SidebarToggle({
  side,
  collapsed,
  onPress,
  style,
  testID,
}: SidebarToggleProps) {
  return (
    <ToggleNative
      testID={testID}
      style={[{ width: 24, height: 24 }, style]}
      side={side ?? 'left'}
      collapsed={collapsed}
      onGpuiKitSidebarTogglePress={() => onPress?.()}
    />
  );
}
