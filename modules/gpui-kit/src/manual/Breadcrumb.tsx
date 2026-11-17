import React from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import Native from './GpuiKitBreadcrumbNativeComponent';
import { kitStyle, type KitStyle } from './kitStyle';

export interface BreadcrumbEntry {
  label: string;
  disabled?: boolean;
  /** Refines this item. */
  style?: KitStyle;
  onPress?: () => void;
}

export type BreadcrumbPressEvent = NativeSyntheticEvent<
  Readonly<{ index: number }>
>;

export interface BreadcrumbProps extends ViewProps {
  items: BreadcrumbEntry[];
  onPress?: (event: BreadcrumbPressEvent) => void;
}

export function Breadcrumb({
  items,
  onPress,
  style,
  ...rest
}: BreadcrumbProps) {
  const width = items.reduce(
    (sum, item) => sum + item.label.length * 7.5 + 28,
    0,
  );
  return (
    <Native
      {...rest}
      items={items.map(item => ({
        label: item.label,
        disabled: item.disabled ?? false,
        style: kitStyle(item.style),
      }))}
      style={[{ height: 24, width }, style]}
      onGpuiKitBreadcrumbPress={event => {
        items[event.nativeEvent.index]?.onPress?.();
        onPress?.(event as BreadcrumbPressEvent);
      }}
    />
  );
}
