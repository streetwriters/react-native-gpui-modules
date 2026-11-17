import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
  type ReactNode,
} from 'react';
import Native, { Commands } from './GpuiKitVirtualListNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';

export interface VirtualListHandle {
  scrollToItem(index: number): void;
  scrollToEnd(): void;
}

export interface VirtualListProps extends SlotHostProps {
  /** One React Native view per row; rows draw only while they are visible. */
  children?: ReactNode;
  /** The row size along the scroll axis, in points. */
  itemSize?: number;
  /** The row size across the scroll axis; the list's own size by default. */
  crossSize?: number;
  horizontal?: boolean;
}

/** A list the kit virtualizes: only the rows in view are drawn. */
export const VirtualList = forwardRef<VirtualListHandle, VirtualListProps>(
  function VirtualList(
    { children, itemSize, crossSize, horizontal, style, ...view },
    ref,
  ) {
    const rows = React.Children.toArray(children);
    const native = useRef<ComponentRef<typeof Native>>(null);
    useImperativeHandle(ref, () => ({
      scrollToItem: index =>
        native.current && Commands.scrollToItem(native.current, index),
      scrollToEnd: () => native.current && Commands.scrollToEnd(native.current),
    }));
    return (
      <SlotHost
        {...view}
        style={[{ width: 320, height: 240 }, style]}
        native={Native as never}
        nativeRef={native as never}
        nativeProps={{
          count: rows.length,
          itemSize: itemSize ?? 32,
          crossSize: crossSize ?? 0,
          horizontal: horizontal ?? false,
        }}
        slots={rows.map((row, index) => ({
          name: `row-${index}`,
          content: row,
        }))}
      />
    );
  },
);
