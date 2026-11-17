import React, { type ReactNode } from 'react';
import {
  useColorScheme,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { IconName } from '../generated/icons';
import ThemeNative from './GpuiKitThemeNativeComponent';
import InputGroupNative from './GpuiKitInputGroupNativeComponent';
import SidebarNative from './GpuiKitSidebarNativeComponent';
import { SlotHost } from './SlotHost';

export interface ThemeProps {
  /** `system` follows the app's colour scheme. */
  mode?: 'light' | 'dark' | 'system';
  /** The kit's theme changed; `dark` says which one it is now. */
  onChange?: (event: NativeSyntheticEvent<Readonly<{ dark: boolean }>>) => void;
}

const hidden = { position: 'absolute', width: 0, height: 0 } as const;

/** Switches the theme of every kit component in the window. */
export function Theme({ mode = 'system', onChange }: ThemeProps) {
  const scheme = useColorScheme();
  const resolved =
    mode === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : mode;
  return (
    <ThemeNative
      style={hidden}
      mode={resolved}
      onGpuiKitThemeChange={onChange as never}
    />
  );
}

type Size = 'xsmall' | 'small' | 'medium' | 'large';

interface Base {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface InputGroupProps extends Base {
  /** Controls the text; leave it out for the kit's own text. */
  value?: string;
  placeholder?: string;
  /** Text, or React Native content, before the input. */
  start?: ReactNode;
  /** Text, or React Native content, after the input. */
  end?: ReactNode;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  size?: Size;
  onChangeText?: (text: string) => void;
}

export function InputGroup({
  value,
  start,
  end,
  onChangeText,
  style,
  testID,
  ...rest
}: InputGroupProps) {
  const text = (node: ReactNode) =>
    typeof node === 'string' ? node : undefined;
  return (
    <SlotHost
      style={[{ width: 280, height: 36 }, style]}
      testID={testID}
      native={InputGroupNative as never}
      nativeProps={{
        ...rest,
        value,
        controlled: value !== undefined,
        startText: text(start),
        endText: text(end),
        onGpuiKitInputGroupChange: (event: { nativeEvent: { text: string } }) =>
          onChangeText?.(event.nativeEvent.text),
      }}
      slots={[
        { name: 'start', content: text(start) === undefined ? start : null },
        { name: 'end', content: text(end) === undefined ? end : null },
      ]}
    />
  );
}

export interface SidebarEntry {
  label: string;
  icon?: IconName;
  active?: boolean;
  disabled?: boolean;
  /** Start with the children shown. */
  open?: boolean;
  children?: SidebarEntry[];
}

export interface SidebarGroupEntry {
  label: string;
  items: SidebarEntry[];
}

export interface SidebarProps extends Base {
  groups: SidebarGroupEntry[];
  collapsed?: boolean;
  collapsible?: 'icon' | 'offcanvas' | 'none';
  width?: number;
  /** React Native content above the menu. */
  header?: ReactNode;
  /** React Native content below the menu. */
  footer?: ReactNode;
  /** The index of the pressed item among all items, depth first. */
  onPress?: (event: NativeSyntheticEvent<Readonly<{ index: number }>>) => void;
}

export function Sidebar({
  groups,
  collapsed,
  collapsible,
  width = 240,
  header,
  footer,
  onPress,
  style,
  testID,
}: SidebarProps) {
  const flat: { group: number; entry: SidebarEntry; depth: number }[] = [];
  const walk = (group: number, entries: SidebarEntry[], depth: number) =>
    entries.forEach(entry => {
      flat.push({ group, entry, depth });
      walk(group, entry.children ?? [], depth + 1);
    });
  groups.forEach((group, index) => walk(index, group.items, 0));
  return (
    <SlotHost
      style={[{ width, height: 400 }, style]}
      testID={testID}
      native={SidebarNative as never}
      nativeProps={{
        width,
        collapsed,
        collapsible,
        groups: groups.map(group => ({ label: group.label })),
        items: flat.map(({ group, entry, depth }) => ({
          group,
          label: entry.label,
          icon: entry.icon ?? '',
          depth,
          active: entry.active ?? false,
          disabled: entry.disabled ?? false,
          open: entry.open ?? false,
        })),
        onGpuiKitSidebarPress: onPress,
      }}
      slots={[
        { name: 'header', content: header },
        { name: 'footer', content: footer },
      ]}
    />
  );
}
