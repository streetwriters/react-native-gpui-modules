import React, { type ReactNode } from 'react';
import Native from './GpuiKitGroupBoxNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';

export interface GroupBoxProps extends SlotHostProps {
  variant?: 'normal' | 'fill' | 'outline';
  /** A string, or React Native content. */
  title?: ReactNode;
  /** React Native content below the body. */
  footer?: ReactNode;
  children?: ReactNode;
  /** Refines the title. */
  titleStyle?: KitStyle;
  /** Refines the content box. */
  contentStyle?: KitStyle;
}

export function GroupBox({
  variant,
  title,
  footer,
  children,
  titleStyle,
  contentStyle,
  ...view
}: GroupBoxProps) {
  return (
    <SlotHost
      {...view}
      native={Native as never}
      nativeProps={{
        variant,
        titleStyle: kitStyle(titleStyle),
        contentStyle: kitStyle(contentStyle),
        title: typeof title === 'string' ? title : undefined,
      }}
      slots={[
        { name: 'title', content: typeof title === 'string' ? null : title },
        { name: 'body', content: children },
        { name: 'footer', content: footer },
      ]}
    />
  );
}
