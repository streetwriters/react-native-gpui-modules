import React, { Children, type ReactNode } from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import StatusBarNative from './GpuiKitStatusBarNativeComponent';
import ToolbarNative from './GpuiKitToolbarNativeComponent';
import ResizableNative from './GpuiKitResizableNativeComponent';
import CarouselNative from './GpuiKitCarouselNativeComponent';
import { SlotHost } from './SlotHost';

interface Base {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface StatusBarProps extends Base {
  left?: ReactNode;
  right?: ReactNode;
}

export function StatusBar({ left, right, style, testID }: StatusBarProps) {
  return (
    <SlotHost
      style={[{ height: 28 }, style]}
      testID={testID}
      native={StatusBarNative as never}
      nativeProps={{}}
      slots={[
        { name: 'left', content: left },
        { name: 'right', content: right },
      ]}
    />
  );
}

export interface ToolbarProps extends Base {
  disabled?: boolean;
  /** React Native views, one per toolbar item. */
  children?: ReactNode;
}

export function Toolbar({ disabled, children, style, testID }: ToolbarProps) {
  const items = Children.toArray(children);
  return (
    <SlotHost
      style={[{ height: 40 }, style]}
      testID={testID}
      native={ToolbarNative as never}
      nativeProps={{ disabled }}
      slots={items.map((item, index) => ({
        name: `item-${index}`,
        content: item,
      }))}
    />
  );
}

export interface ResizablePanelProps {
  /** Initial size in points. */
  size?: number;
  minSize?: number;
  maxSize?: number;
  /** Keep the size when the group is resized. */
  fixed?: boolean;
  visible?: boolean;
  children?: ReactNode;
}

/** A panel of a `Resizable`. */
export function ResizablePanel(_props: ResizablePanelProps) {
  return null;
}

export interface ResizableProps extends Base {
  vertical?: boolean;
  /** `ResizablePanel` elements. */
  children?: ReactNode;
  /** The sizes of the panels, in points, after the user dragged a handle. */
  onResize?: (
    event: NativeSyntheticEvent<Readonly<{ sizes: number[] }>>,
  ) => void;
}

export function Resizable({
  vertical,
  children,
  onResize,
  style,
  testID,
}: ResizableProps) {
  const panels = Children.toArray(children).filter(
    (child): child is React.ReactElement<ResizablePanelProps> =>
      React.isValidElement(child),
  );
  return (
    <SlotHost
      style={[{ width: 420, height: 240 }, style]}
      testID={testID}
      native={ResizableNative as never}
      nativeProps={{
        vertical,
        panels: panels.map(panel => ({
          size: panel.props.size ?? 0,
          min: panel.props.minSize ?? 0,
          max: panel.props.maxSize ?? 0,
          fixed: panel.props.fixed ?? false,
          visible: panel.props.visible ?? true,
        })),
        onGpuiKitResizableResize: (event: { nativeEvent: { sizes: string } }) =>
          onResize?.({
            ...event,
            nativeEvent: {
              sizes: event.nativeEvent.sizes.split(',').map(Number),
            },
          } as never),
      }}
      slots={panels.map((panel, index) => ({
        name: `panel-${index}`,
        content: panel.props.children,
      }))}
    />
  );
}

export interface CarouselProps extends Base {
  /** React Native views, one per slide. */
  children?: ReactNode;
  vertical?: boolean;
  looping?: boolean;
  controls?: boolean;
  pagination?: boolean;
  /** The slide shown; leave it out for the kit's own state. */
  selectedIndex?: number;
  onChange?: (event: NativeSyntheticEvent<Readonly<{ index: number }>>) => void;
}

export function Carousel({
  children,
  vertical,
  looping,
  controls,
  pagination,
  selectedIndex,
  onChange,
  style,
  testID,
}: CarouselProps) {
  const slides = Children.toArray(children);
  return (
    <SlotHost
      style={[{ width: 320, height: 180 }, style]}
      testID={testID}
      native={CarouselNative as never}
      nativeProps={{
        vertical,
        looping,
        controls: controls ?? true,
        pagination: pagination ?? true,
        selectedIndex,
        controlled: selectedIndex !== undefined,
        onGpuiKitCarouselChange: onChange,
      }}
      slots={slides.map((slide, index) => ({
        name: `slide-${index}`,
        content: slide,
      }))}
    />
  );
}
