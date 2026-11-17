import React, { type ReactNode } from 'react';
import Native from './GpuiKitDescriptionListNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';

export interface DescriptionItem {
  label: string;
  /** Text, or React Native content for the value. */
  value?: ReactNode;
  /** Columns the item spans. */
  span?: number;
  /** A separator line instead of an item. */
  separator?: boolean;
}

export interface DescriptionListProps extends SlotHostProps {
  items: DescriptionItem[];
  layout?: 'horizontal' | 'vertical';
  bordered?: boolean;
  columns?: number;
  labelWidth?: number;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
}

export function DescriptionList({ items, ...rest }: DescriptionListProps) {
  const { layout, bordered, columns, labelWidth, size, ...view } = rest;
  const slots = items.flatMap((item, index) =>
    item.value != null &&
    typeof item.value !== 'string' &&
    typeof item.value !== 'number'
      ? [{ name: `value-${index}`, content: item.value }]
      : [],
  );
  return (
    <SlotHost
      {...view}
      native={Native as never}
      nativeProps={{
        layout,
        bordered: bordered ?? true,
        columns,
        labelWidth,
        size,
        items: items.map(item => ({
          label: item.label,
          value:
            typeof item.value === 'string' || typeof item.value === 'number'
              ? String(item.value)
              : '',
          span: item.span ?? 1,
          separator: item.separator ?? false,
        })),
      }}
      slots={slots}
    />
  );
}
