import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import ListNative, {
  Commands as ListCommands,
} from './GpuiKitListNativeComponent';
import TreeNative, {
  Commands as TreeCommands,
} from './GpuiKitTreeNativeComponent';
import { kitStyle, type KitStyle } from './kitStyle';
import { SlotHost } from './SlotHost';

export type ListIndexEvent = NativeSyntheticEvent<Readonly<{ index: number }>>;

export interface ListRowEntry {
  /** The text of the row. */
  label?: string;
  disabled?: boolean;
  /** React Native content of the row, instead of `label`. */
  content?: ReactNode;
}

export interface ListSection {
  /** React Native content above the section's rows. */
  header?: ReactNode;
  /** React Native content below the section's rows. */
  footer?: ReactNode;
  rows: ListRowEntry[];
}

export interface ListProps {
  /** The rows of a list without sections. */
  rows?: ListRowEntry[];
  /** Rows in sections, each with an optional header and footer; `index` in events counts every row in order. */
  sections?: ListSection[];
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
  /** Rows can be selected (default `true`). */
  selectable?: boolean;
  /** Shows the loading state. */
  loading?: boolean;
  /** More rows can be loaded: `onLoadMore` is called near the end of the list. */
  hasMore?: boolean;
  /** How many rows before the end `onLoadMore` is called (20 by default). */
  loadMoreThreshold?: number;
  onLoadMore?: () => void;
  /**
   * Rows can be dragged to reorder them; `onMove` reports a row dropped
   * before or after another, both by their index in the rows.
   */
  draggableRows?: boolean;
  onMove?: (from: number, to: number, position: 'before' | 'after') => void;
  /** Refines each row. */
  itemStyle?: KitStyle;
  /** Refines the list: padding, border, radius. */
  kitStyle?: KitStyle;
}

export interface ListHandle {
  /** Scrolls a row into view, by its section and its row in the section. */
  scrollToItem(
    section: number,
    row: number,
    strategy?: 'top' | 'center' | 'bottom',
  ): void;
  scrollToSelected(): void;
}

/** A list of rows. Rows with `content` hold React Native views. */
export const List = forwardRef<ListHandle, ListProps>(function List(
  {
    rows,
    sections,
    selectedIndex,
    onSelect,
    onConfirm,
    onCancel,
    searchable,
    selectable,
    loading,
    hasMore,
    loadMoreThreshold,
    onLoadMore,
    draggableRows,
    onMove,
    itemStyle,
    kitStyle: listStyle,
    style,
    testID,
  },
  ref,
) {
  const native = useRef<React.ComponentRef<typeof ListNative>>(null);
  useImperativeHandle(ref, () => ({
    scrollToItem: (section, row, strategy) => {
      if (native.current)
        ListCommands.scrollToItem(
          native.current,
          section,
          row,
          strategy ?? 'top',
        );
    },
    scrollToSelected: () => {
      if (native.current) ListCommands.scrollToSelected(native.current);
    },
  }));
  const groups: ListSection[] = sections ?? [{ rows: rows ?? [] }];
  const flat = groups.flatMap((group, section) =>
    group.rows.map(row => ({ row, section })),
  );
  return (
    <SlotHost
      style={[{ width: 240, height: 200 }, style]}
      testID={testID}
      nativeRef={native}
      native={ListNative as never}
      nativeProps={{
        items: flat.map(({ row, section }) => ({
          label: row.label ?? '',
          disabled: row.disabled ?? false,
          section,
        })),
        sectionCount: groups.length,
        selectedIndex: selectedIndex ?? -1,
        controlled: selectedIndex !== undefined,
        searchable: searchable ?? false,
        selectable: selectable ?? true,
        loading: loading ?? false,
        hasMore: hasMore ?? false,
        loadMoreThreshold: loadMoreThreshold ?? 20,
        rowsDraggable: draggableRows ?? false,
        onGpuiKitListLoadMore: () => onLoadMore?.(),
        onGpuiKitListMove: (
          event: NativeSyntheticEvent<
            Readonly<{ from: number; to: number; position: string }>
          >,
        ) =>
          onMove?.(
            event.nativeEvent.from,
            event.nativeEvent.to,
            event.nativeEvent.position as 'before' | 'after',
          ),
        itemStyle: kitStyle(itemStyle),
        kitStyle: kitStyle(listStyle),
        onGpuiKitListSelect: onSelect,
        onGpuiKitListConfirm: onConfirm,
        onGpuiKitListCancel: () => onCancel?.(),
      }}
      slots={[
        ...flat.map(({ row }, index) => ({
          name: `row-${index}`,
          content: row.content,
        })),
        ...groups.flatMap((group, section) => [
          { name: `section-header-${section}`, content: group.header },
          { name: `section-footer-${section}`, content: group.footer },
        ]),
      ]}
    />
  );
});

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

export interface TreeMenuItem {
  label?: string;
  separator?: boolean;
  /** Shown for files only, not for folders. */
  filesOnly?: boolean;
  onSelect?: (id: string) => void;
}

export interface TreeProps {
  items: TreeEntry[];
  /** Indent per level, in points (default 16). */
  indent?: number;
  /** Indent added to every row, in points. */
  indentOffset?: number;
  /** Refines each row, for example `borderRadius` and `paddingHorizontal`. */
  rowStyle?: KitStyle;
  kitStyle?: KitStyle;
  /** The right-click menu of a row. */
  contextMenu?: TreeMenuItem[];
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

export interface TreeHandle {
  /** Selects a visible row by its id. */
  selectItem(id: string): void;
}

export const Tree = forwardRef<TreeHandle, TreeProps>(function Tree(
  {
    items,
    indent,
    indentOffset,
    rowStyle,
    kitStyle: treeStyle,
    contextMenu,
    onSelect,
    onToggle,
    style,
    testID,
  },
  ref,
) {
  const native = useRef<React.ComponentRef<typeof TreeNative>>(null);
  useImperativeHandle(ref, () => ({
    selectItem: id => {
      if (native.current) TreeCommands.selectItem(native.current, id);
    },
  }));
  return (
    <TreeNative
      ref={native}
      testID={testID}
      style={[{ width: 240, height: 200 }, style]}
      items={flatten(items)}
      indent={indent ?? 16}
      indentOffset={indentOffset ?? 0}
      rowStyle={kitStyle(rowStyle)}
      kitStyle={kitStyle(treeStyle)}
      contextMenu={(contextMenu ?? []).map(entry => ({
        label: entry.label ?? '',
        separator: entry.separator ?? false,
        filesOnly: entry.filesOnly ?? false,
      }))}
      onGpuiKitTreeMenu={event =>
        contextMenu?.[event.nativeEvent.item]?.onSelect?.(event.nativeEvent.id)
      }
      onGpuiKitTreeSelect={onSelect as never}
      onGpuiKitTreeToggle={onToggle as never}
    />
  );
});
