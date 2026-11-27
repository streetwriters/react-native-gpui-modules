import React, { type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import TextViewNative from './GpuiKitTextViewNativeComponent';
import ScrollAreaNative from './GpuiKitScrollAreaNativeComponent';
import { SlotHost } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';
import { NativeRoot } from '@react-native-gpui/core/desktop';

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
  /** Refines the view: its text size and color, padding and so on. */
  kitStyle?: KitStyle;
}

/**
 * The kit's markdown and HTML renderer. It is as wide as its box and, unless
 * the style sets a height, as high as its content.
 */
export function TextView({
  style,
  testID,
  selectable,
  scrollable,
  kitStyle: textStyle,
  ...rest
}: TextViewProps) {
  return (
    <NativeRoot style={style} testID={testID}>
      <TextViewNative
        {...rest}
        kitStyle={kitStyle(textStyle)}
        selectable={selectable ?? true}
        scrollable={scrollable ?? false}
      />
    </NativeRoot>
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
