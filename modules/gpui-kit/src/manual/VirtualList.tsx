import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
  type ReactNode,
} from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import Native, { Commands } from './GpuiKitVirtualListNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';

export interface VirtualListHandle {
  /** Scrolls row `index` into view, at the top (default), center or bottom. */
  scrollToItem(index: number, strategy?: 'top' | 'center' | 'bottom'): void;
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
  /**
   * Generated rows instead of `children`, for lists too long for a view per
   * row: `count` rows of `columns` cells, each the text `text` with `{row}`
   * and `{col}` filled in (`firstText` for the first cell).
   */
  template?: {
    count: number;
    columns?: number;
    text: string;
    firstText?: string;
    rowStyle?: KitStyle;
    cellStyle?: KitStyle;
  };
  /** Refines the list: padding, gap, border. */
  kitStyle?: KitStyle;
  /** Overlay scrollbars. */
  scrollbars?: 'vertical' | 'horizontal' | 'both';
  /** The rows drawn changed. */
  onVisibleRangeChange?: (
    event: NativeSyntheticEvent<Readonly<{ start: number; end: number }>>,
  ) => void;
}

/** A list the kit virtualizes: only the rows in view are drawn. */
export const VirtualList = forwardRef<VirtualListHandle, VirtualListProps>(
  function VirtualList(
    {
      children,
      itemSize,
      crossSize,
      horizontal,
      template,
      kitStyle: listStyle,
      scrollbars,
      onVisibleRangeChange,
      style,
      ...view
    },
    ref,
  ) {
    const rows = React.Children.toArray(children);
    const native = useRef<ComponentRef<typeof Native>>(null);
    useImperativeHandle(ref, () => ({
      scrollToItem: (index, strategy) =>
        native.current &&
        Commands.scrollToItemWith(native.current, index, strategy ?? 'top'),
      scrollToEnd: () => native.current && Commands.scrollToEnd(native.current),
    }));
    return (
      <SlotHost
        {...view}
        style={[{ width: 320, height: 240 }, style]}
        native={Native as never}
        nativeRef={native as never}
        nativeProps={{
          count: template ? template.count : rows.length,
          itemSize: itemSize ?? 32,
          crossSize: crossSize ?? 0,
          horizontal: horizontal ?? false,
          templateJson: template
            ? JSON.stringify({
                columns: template.columns ?? 1,
                text: template.text,
                firstText: template.firstText ?? template.text,
                rowStyle: kitStyle(template.rowStyle),
                cellStyle: kitStyle(template.cellStyle),
              })
            : '',
          kitStyle: kitStyle(listStyle),
          scrollbars: scrollbars ?? '',
          onGpuiKitVirtualListVisibleRange: onVisibleRangeChange,
        }}
        slots={rows.map((row, index) => ({
          name: `row-${index}`,
          content: row,
        }))}
      />
    );
  },
);
