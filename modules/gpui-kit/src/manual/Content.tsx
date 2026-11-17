import React, { type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import TextViewNative from './GpuiKitTextViewNativeComponent';
import ScrollAreaNative from './GpuiKitScrollAreaNativeComponent';
import { SlotHost } from './SlotHost';

interface Base {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface TextViewProps extends Base {
  /** The markdown or HTML source. */
  source: string;
  format?: 'markdown' | 'html';
  selectable?: boolean;
  scrollable?: boolean;
  maxLines?: number;
}

/** The kit's markdown and HTML renderer. */
export function TextView({
  style,
  selectable,
  scrollable,
  ...rest
}: TextViewProps) {
  return (
    <TextViewNative
      {...rest}
      selectable={selectable ?? true}
      scrollable={scrollable ?? false}
      style={[{ width: 320, height: 160 }, style]}
    />
  );
}

export interface ScrollAreaProps extends Base {
  axis?: 'vertical' | 'horizontal' | 'both';
  /** React Native or kit views that scroll under the kit's scrollbar. */
  children?: ReactNode;
}

export function ScrollArea({ axis, children, style, testID }: ScrollAreaProps) {
  return (
    <SlotHost
      style={[{ width: 320, height: 160 }, style]}
      testID={testID}
      native={ScrollAreaNative as never}
      nativeProps={{ axis }}
      slots={[{ name: 'body', content: children }]}
    />
  );
}
