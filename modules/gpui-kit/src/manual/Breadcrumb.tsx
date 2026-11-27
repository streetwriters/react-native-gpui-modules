import { NativeRoot } from '@react-native-gpui/core/desktop';
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
  return (
    <NativeRoot fitWidth style={style} testID={rest.testID}>
      <Native
        {...rest}
        testID={undefined}
        items={items.map(item => ({
          label: item.label,
          disabled: item.disabled ?? false,
          style: kitStyle(item.style),
        }))}
        onGpuiKitBreadcrumbPress={event => {
          items[event.nativeEvent.index]?.onPress?.();
          onPress?.(event as BreadcrumbPressEvent);
        }}
      />
    </NativeRoot>
  );
}
