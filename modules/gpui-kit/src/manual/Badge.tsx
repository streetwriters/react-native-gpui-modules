import React, { useState, type ReactNode } from 'react';
import {
  processColor,
  View,
  type ColorValue,
  type LayoutChangeEvent,
} from 'react-native';
import { NativeRoot, NativeSlot } from '@react-native-gpui/core/desktop';
import Native from './GpuiKitBadgeNativeComponent';
import type { SlotHostProps } from './SlotHost';
import type { IconName } from '../generated/icons';

export interface BadgeProps extends SlotHostProps {
  /** A dot instead of a count. */
  dot?: boolean;
  /** The count; 0 hides it. */
  count?: number;
  /** An icon badge at the bottom-right. */
  icon?: IconName;
  /** Counts above it show as `max+`; 99 by default. */
  max?: number;
  color?: ColorValue;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  /**
   * What the badge sits on. The badge is as big as its child and the
   * indicator overflows the child's corner, as in the kit.
   */
  children?: ReactNode;
}

/** The kit's badge: a count, dot or icon on the corner of its child. */
export function Badge({
  dot,
  count,
  icon,
  max,
  color,
  size,
  children,
  style,
  ...view
}: BadgeProps) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const hasChild = children != null && children !== false;
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBox(current =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  };
  return (
    <NativeRoot {...view} style={[{ alignSelf: 'flex-start' }, style, box]}>
      <Native
        dot={dot}
        count={count}
        icon={icon}
        max={max}
        color={color == null ? undefined : (processColor(color) as never)}
        size={size}
        slots={hasChild ? 'child' : ''}
      >
        {hasChild ? (
          <NativeSlot>
            <View
              collapsable={false}
              onLayout={onLayout}
              style={{ alignSelf: 'flex-start' }}
            >
              {children}
            </View>
          </NativeSlot>
        ) : null}
      </Native>
    </NativeRoot>
  );
}
