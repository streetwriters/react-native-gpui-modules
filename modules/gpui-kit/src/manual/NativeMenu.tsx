import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import Native, { Commands } from './GpuiKitNativeMenuNativeComponent';
import type { IconName } from '../generated/icons';
import { SlotHost, type SlotHostProps } from './SlotHost';

export interface NativeMenuEntry {
  label?: string;
  icon?: IconName;
  /** SVG markup drawn as the icon. */
  iconSvg?: string;
  checked?: boolean;
  disabled?: boolean;
  separator?: boolean;
  /** Entries of a submenu that opens from this item. */
  children?: NativeMenuEntry[];
  onSelect?: () => void;
}

export interface NativeMenuHandle {
  /** Opens the menu below the content, like a dropdown. */
  open(): void;
}

export interface NativeMenuProps extends SlotHostProps {
  items: NativeMenuEntry[];
  /** Opens the menu where the content is right-clicked (default `true`). */
  contextMenu?: boolean;
  /** The content the menu belongs to. */
  children?: ReactNode;
  onSelect?: (event: NativeSyntheticEvent<Readonly<{ index: number }>>) => void;
}

const flatten = (
  items: NativeMenuEntry[],
  parent = -1,
  out: { item: NativeMenuEntry; parent: number }[] = [],
) => {
  for (const item of items) {
    const index = out.length;
    out.push({ item, parent });
    if (item.children) flatten(item.children, index, out);
  }
  return out;
};

/**
 * A menu drawn by the operating system (an `NSMenu` on macOS), opened from a
 * right-click on its content or with `open()`.
 */
export const NativeMenu = forwardRef<NativeMenuHandle, NativeMenuProps>(
  function NativeMenu(
    { items, contextMenu = true, children, onSelect, ...view },
    ref,
  ) {
    const native = useRef<React.ComponentRef<typeof Native>>(null);
    useImperativeHandle(ref, () => ({
      open: () => {
        if (native.current) Commands.open(native.current);
      },
    }));
    const flat = flatten(items);
    return (
      <SlotHost
        fitWidth
        {...view}
        nativeRef={native}
        native={Native as never}
        nativeProps={{
          items: flat.map(({ item, parent }) => ({
            label: item.label ?? '',
            icon: item.icon ?? '',
            iconSvg: item.iconSvg ?? '',
            checked: item.checked ?? false,
            disabled: item.disabled ?? false,
            separator: item.separator ?? false,
            parent,
          })),
          contextMenu,
          onGpuiKitNativeMenuSelect: (
            event: NativeSyntheticEvent<Readonly<{ index: number }>>,
          ) => {
            flat[event.nativeEvent.index]?.item.onSelect?.();
            onSelect?.(event);
          },
        }}
        slots={[{ name: 'content', content: children }]}
      />
    );
  },
);
