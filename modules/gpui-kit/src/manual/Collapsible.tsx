import React, { type ReactNode } from 'react';
import Native from './GpuiKitCollapsibleNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';

export interface CollapsibleProps extends SlotHostProps {
  open?: boolean;
  /** React Native content that is always shown, usually a button that toggles `open`. */
  trigger?: ReactNode;
  /** React Native content shown while `open`. */
  children?: ReactNode;
  /** React Native content that is always shown, after the content. */
  after?: ReactNode;
  /** Animates the content's height as it opens and closes. */
  animated?: boolean;
  /** Refines the collapsible, for example the `gap` between the trigger and the content. */
  kitStyle?: KitStyle;
}

export function Collapsible({
  open,
  trigger,
  children,
  kitStyle: style,
  animated,
  after,
  ...view
}: CollapsibleProps) {
  return (
    <SlotHost
      {...view}
      native={Native as never}
      nativeProps={{ open, animated, kitStyle: kitStyle(style) }}
      slots={[
        { name: 'trigger', content: trigger },
        { name: 'content', content: children },
        { name: 'after', content: after },
      ]}
    />
  );
}
