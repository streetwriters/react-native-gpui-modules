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
  /** Refines the box. */
  kitStyle?: KitStyle;
  /**
   * The body is as wide as its content, so the content box's alignment
   * (`contentStyle.alignItems`) places it; by default it is as wide as the box.
   */
  contentFit?: boolean;
  /**
   * The body clips what its content draws outside it; true by default unless
   * `contentFit`. `false` leaves the clipping to the content box's own
   * overflow (`contentStyle.overflowX`), as the kit's content does.
   */
  contentClip?: boolean;
}

export function GroupBox({
  variant,
  title,
  footer,
  children,
  titleStyle,
  contentStyle,
  kitStyle: boxStyle,
  contentFit,
  contentClip,
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
        kitStyle: kitStyle(boxStyle),
        title: typeof title === 'string' ? title : undefined,
        footer: typeof footer === 'string' ? footer : undefined,
      }}
      slots={[
        { name: 'title', content: typeof title === 'string' ? null : title },
        {
          name: 'body',
          content: children,
          fit: contentFit,
          clip: contentClip,
        },
        { name: 'footer', content: typeof footer === 'string' ? null : footer },
      ]}
    />
  );
}
