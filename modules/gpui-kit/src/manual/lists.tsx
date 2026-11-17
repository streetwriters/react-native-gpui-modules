import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import ListNative from './GpuiKitListNativeComponent';
import TreeNative from './GpuiKitTreeNativeComponent';
import { SlotHost } from './SlotHost';

export type ListIndexEvent = NativeSyntheticEvent<Readonly<{ index: number }>>;

export interface ListRowEntry {
  /** The text of the row. */
  label?: string;
  disabled?: boolean;
  /** React Native content of the row, instead of `label`. */
  content?: ReactNode;
}

export interface ListProps {
  rows: ListRowEntry[];
  /** The selected row; leave it out for the kit's own selection. */
  selectedIndex?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onSelect?: (event: ListIndexEvent) => void;
  /** A row was pressed or Enter was pressed on it. */
  onConfirm?: (event: ListIndexEvent) => void;
  onCancel?: () => void;
  /** Shows a search field that filters the rows by their `label`. */
  searchable?: boolean;
}

/** A list of rows of the same height. Rows with `content` hold React Native views. */
export function List({
  rows,
  selectedIndex,
  onSelect,
  onConfirm,
  onCancel,
  searchable,
  style,
  testID,
}: ListProps) {
  return (
    <SlotHost
      style={[{ width: 240, height: 200 }, style]}
      testID={testID}
      native={ListNative as never}
      nativeProps={{
        items: rows.map(row => ({
          label: row.label ?? '',
          disabled: row.disabled ?? false,
        })),
        selectedIndex: selectedIndex ?? -1,
        controlled: selectedIndex !== undefined,
        searchable: searchable ?? false,
        onGpuiKitListSelect: onSelect,
        onGpuiKitListConfirm: onConfirm,
        onGpuiKitListCancel: () => onCancel?.(),
      }}
      slots={rows.map((row, index) => ({
        name: `row-${index}`,
        content: row.content,
      }))}
    />
  );
}

/** A list with a search field; rows that do not match their `label` are hidden. */
export function SearchableList(props: ListProps) {
  return <List {...props} searchable />;
}

export interface TreeEntry {
  id: string;
  label: string;
  children?: TreeEntry[];
  expanded?: boolean;
  disabled?: boolean;
}

export interface TreeProps {
  items: TreeEntry[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onSelect?: (
    event: NativeSyntheticEvent<Readonly<{ index: number; id: string }>>,
  ) => void;
  onToggle?: (
    event: NativeSyntheticEvent<Readonly<{ id: string; expanded: boolean }>>,
  ) => void;
}

const flatten = (
  items: TreeEntry[],
  depth = 0,
): {
  id: string;
  label: string;
  depth: number;
  expanded: boolean;
  disabled: boolean;
}[] =>
  items.flatMap(item => [
    {
      id: item.id,
      label: item.label,
      depth,
      expanded: item.expanded ?? false,
      disabled: item.disabled ?? false,
    },
    ...flatten(item.children ?? [], depth + 1),
  ]);

export function Tree({ items, onSelect, onToggle, style, testID }: TreeProps) {
  return (
    <TreeNative
      testID={testID}
      style={[{ width: 240, height: 200 }, style]}
      items={flatten(items)}
      onGpuiKitTreeSelect={onSelect as never}
      onGpuiKitTreeToggle={onToggle as never}
    />
  );
}
