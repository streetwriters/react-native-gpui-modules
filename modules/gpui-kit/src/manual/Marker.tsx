import React, { type ReactNode } from 'react';
import { processColor, type ColorValue } from 'react-native';
import { kitStyle, type KitStyle } from './kitStyle';
import Native from './GpuiKitMarkerNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';
import type { IconName } from '../generated/icons';

export interface MarkerProps extends SlotHostProps {
  variant?: 'plain' | 'separator' | 'border';
  alignment?: 'start' | 'center' | 'end';
  loading?: boolean;
  loadingStyle?: 'spinner' | 'shimmer';
  /** Text of the content. */
  text?: string;
  /** A kit icon for the icon slot. */
  icon?: IconName;
  /** React Native content for the icon slot, instead of `icon`. */
  iconSlot?: ReactNode;
  /** `implicit`, `presentational` or an accessibility role name. */
  accessibilityRoleOverride?: string;
  /** Refines the separator line of the separator variant. */
  separatorStyle?: KitStyle;
  /** The shimmer of the shimmer loading style: its period in milliseconds. */
  shimmerDuration?: number;
  shimmerHighlightColor?: ColorValue;
  /** Half-width of the highlight as a fraction of the text width. */
  shimmerSpread?: number;
  shimmerReverse?: boolean;
  shimmerOnce?: boolean;
  /** React Native content after the text. */
  children?: ReactNode;
}

export function Marker({
  variant,
  alignment,
  loading,
  loadingStyle,
  text,
  icon,
  iconSlot,
  children,
  style,
  accessibilityRoleOverride,
  separatorStyle,
  shimmerDuration,
  shimmerHighlightColor,
  shimmerSpread,
  shimmerReverse,
  shimmerOnce,
  ...view
}: MarkerProps) {
  return (
    <SlotHost
      {...view}
      style={[{ height: 24, width: '100%' }, style]}
      native={Native as never}
      nativeProps={{
        variant,
        alignment,
        loading,
        loadingStyle,
        text,
        icon,
        accessibilityRoleOverride,
        separatorStyle: kitStyle(separatorStyle),
        shimmerDuration,
        shimmerHighlightColor:
          shimmerHighlightColor == null
            ? 0
            : ((processColor(shimmerHighlightColor) as number) ?? 0),
        shimmerSpread,
        shimmerReverse,
        shimmerOnce,
      }}
      slots={[
        { name: 'icon', content: iconSlot },
        { name: 'content', content: children },
      ]}
    />
  );
}
