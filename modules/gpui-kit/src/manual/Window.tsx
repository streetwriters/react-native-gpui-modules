import React, {
  Children,
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import TitleBarNative from './GpuiKitTitleBarNativeComponent';
import WindowBorderNative from './GpuiKitWindowBorderNativeComponent';
import GridLayoutNative, {
  Commands as GridLayoutCommands,
} from './GpuiKitGridLayoutNativeComponent';
import { kitStyle, type KitStyle } from './kitStyle';
import { SlotHost } from './SlotHost';

interface Base {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface TitleBarProps extends Base {
  /** React Native content of the bar. */
  children?: ReactNode;
}

export function TitleBar({ children, style, testID }: TitleBarProps) {
  return (
    <SlotHost
      style={[{ height: 36 }, style]}
      testID={testID}
      native={TitleBarNative as never}
      nativeProps={{}}
      slots={[{ name: 'content', content: children }]}
    />
  );
}

export interface WindowBorderProps extends Base {
  children?: ReactNode;
}

/** The kit's window border and shadow, drawn on Linux. */
export function WindowBorder({ children, style, testID }: WindowBorderProps) {
  return (
    <SlotHost
      style={[{ flex: 1 }, style]}
      testID={testID}
      native={WindowBorderNative as never}
      nativeProps={{}}
      slots={[{ name: 'content', content: children }]}
    />
  );
}

/** Where an item of a `GridLayout` sits and how far it may be resized. */
export interface GridArea {
  id: string;
  /** The leading column, from zero. */
  col?: number;
  /** The top row, from zero. */
  row?: number;
  colSpan?: number;
  rowSpan?: number;
  /** The fewest columns and rows a resize may leave, as `[cols, rows]`. */
  minSpan?: [number, number];
  /** The most columns and rows a resize may give, as `[cols, rows]`. */
  maxSpan?: [number, number];
  /** Neither dragged, resized nor pushed: other items flow around it. */
  locked?: boolean;
}

export interface GridItemProps extends GridArea {
  /** Names the item for assistive technology. */
  label?: string;
  /** The item moves only by its `handle`. */
  dragHandleOnly?: boolean;
  /** Refines the item, for example its corner radius, which the drag and selection styles follow. */
  kitStyle?: KitStyle;
  /** Refines the column that holds the handle and the content. */
  cardStyle?: KitStyle;
  /** React Native content of the drag handle, at the top of the item. */
  handle?: ReactNode;
  /** Refines the drag handle. */
  handleStyle?: KitStyle;
  /** React Native content; it fills the item. */
  children?: ReactNode;
}

/** An item of a `GridLayout`. */
export function GridItem(_props: GridItemProps) {
  return null;
}

export type GridAreaLayout = Required<
  Pick<GridArea, 'id' | 'col' | 'row' | 'colSpan' | 'rowSpan' | 'locked'>
> & { minSpan: [number, number]; maxSpan: [number | null, number | null] };

export interface GridLayoutHandle {
  /** Replaces the layout without reporting a change. */
  setAreas: (areas: GridArea[]) => void;
}

export interface GridLayoutProps extends Base {
  /** Columns of the grid; 12 by default. */
  columns?: number;
  draggable?: boolean;
  resizable?: boolean;
  /** Where items settle: up (`vertical`, the default), to the leading edge, or nowhere. */
  compaction?: 'vertical' | 'horizontal' | 'none';
  /** A dragged item may not push others aside. */
  preventCollision?: boolean;
  /** Shows the items in this many columns, keeping the layout. */
  reflow?: number;
  /** The height of one row, in points. */
  rowHeight?: number;
  /** Names the grid for assistive technology. */
  label?: string;
  /** `GridItem` elements. */
  children?: ReactNode;
  /** The layout after a drag, a resize or a keyboard move. */
  onChange?: (areas: GridAreaLayout[]) => void;
  /** The selected item, or null. */
  onSelect?: (id: string | null) => void;
}

const areaJson = (area: GridArea) => ({
  id: area.id,
  col: area.col ?? 0,
  row: area.row ?? 0,
  col_span: area.colSpan ?? 1,
  row_span: area.rowSpan ?? 1,
  min_col_span: area.minSpan?.[0] ?? 1,
  min_row_span: area.minSpan?.[1] ?? 1,
  max_col_span: area.maxSpan?.[0] ?? null,
  max_row_span: area.maxSpan?.[1] ?? null,
  locked: area.locked ?? false,
});

type AreaJson = ReturnType<typeof areaJson>;

const fromJson = (area: AreaJson): GridAreaLayout => ({
  id: area.id,
  col: area.col,
  row: area.row,
  colSpan: area.col_span,
  rowSpan: area.row_span,
  minSpan: [area.min_col_span, area.min_row_span],
  maxSpan: [area.max_col_span, area.max_row_span],
  locked: area.locked,
});

export const GridLayout = forwardRef<GridLayoutHandle, GridLayoutProps>(
  function GridLayout(
    {
      columns,
      draggable,
      resizable,
      compaction,
      preventCollision,
      reflow,
      rowHeight,
      label,
      children,
      onChange,
      onSelect,
      style,
      testID,
    },
    ref,
  ) {
    const native = useRef<React.ElementRef<typeof GridLayoutNative>>(null);
    useImperativeHandle(ref, () => ({
      setAreas: areas => {
        if (native.current)
          GridLayoutCommands.setAreas(
            native.current,
            JSON.stringify(areas.map(areaJson)),
          );
      },
    }));
    const items = Children.toArray(children).filter(
      (child): child is React.ReactElement<GridItemProps> =>
        React.isValidElement(child),
    );
    return (
      <SlotHost
        style={style}
        testID={testID}
        nativeRef={native}
        native={GridLayoutNative as never}
        nativeProps={{
          columns,
          itemsDraggable: draggable,
          itemsResizable: resizable,
          compaction: compaction ?? '',
          preventCollision,
          reflow: reflow ?? 0,
          rowHeight: rowHeight ?? 0,
          label: label ?? '',
          areasJson: JSON.stringify(items.map(item => areaJson(item.props))),
          itemsJson: JSON.stringify(
            items.map(item => ({
              id: item.props.id,
              label: item.props.label ?? '',
              dragHandleOnly: item.props.dragHandleOnly ?? false,
              kitStyle: kitStyle(item.props.kitStyle),
              cardStyle: kitStyle(item.props.cardStyle),
              handleStyle: kitStyle(item.props.handleStyle),
            })),
          ),
          onGpuiKitGridLayoutChange: (
            event: NativeSyntheticEvent<Readonly<{ layout: string }>>,
          ) =>
            onChange?.(
              (JSON.parse(event.nativeEvent.layout) as AreaJson[]).map(
                fromJson,
              ),
            ),
          onGpuiKitGridLayoutSelect: (
            event: NativeSyntheticEvent<Readonly<{ id: string }>>,
          ) => onSelect?.(event.nativeEvent.id || null),
        }}
        slots={items.flatMap((item, index) => [
          { name: `handle-${index}`, content: item.props.handle, fit: false },
          { name: `item-${index}`, content: item.props.children, fill: true },
        ])}
      />
    );
  },
);
