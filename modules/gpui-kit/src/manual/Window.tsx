import React, { Children, type ReactNode } from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import TitleBarNative from './GpuiKitTitleBarNativeComponent';
import WindowBorderNative from './GpuiKitWindowBorderNativeComponent';
import GridLayoutNative from './GpuiKitGridLayoutNativeComponent';
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

export interface GridItemProps {
  id: string;
  col: number;
  row: number;
  colSpan?: number;
  rowSpan?: number;
  children?: ReactNode;
}

/** An item of a `GridLayout`. */
export function GridItem(_props: GridItemProps) {
  return null;
}

export interface GridLayoutProps extends Base {
  columns?: number;
  draggable?: boolean;
  resizable?: boolean;
  /** `GridItem` elements. */
  children?: ReactNode;
  /** The layout after a drag or a resize, as `id:col:row:colSpan:rowSpan` entries. */
  onChange?: (
    event: NativeSyntheticEvent<Readonly<{ layout: string }>>,
  ) => void;
}

export function GridLayout({
  columns,
  draggable,
  resizable,
  children,
  onChange,
  style,
  testID,
}: GridLayoutProps) {
  const items = Children.toArray(children).filter(
    (child): child is React.ReactElement<GridItemProps> =>
      React.isValidElement(child),
  );
  return (
    <SlotHost
      style={[{ width: 420, height: 240 }, style]}
      testID={testID}
      native={GridLayoutNative as never}
      nativeProps={{
        columns,
        draggable,
        resizable,
        areas: items.map(item => ({
          id: item.props.id,
          col: item.props.col,
          row: item.props.row,
          colSpan: item.props.colSpan ?? 1,
          rowSpan: item.props.rowSpan ?? 1,
        })),
        onGpuiKitGridLayoutChange: onChange,
      }}
      slots={items.map((item, index) => ({
        name: `item-${index}`,
        content: item.props.children,
      }))}
    />
  );
}
