import React, { type ReactNode } from 'react';
import Native from './GpuiKitCollapsibleNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';

export interface CollapsibleProps extends SlotHostProps {
  open?: boolean;
  /** React Native content that is always shown, usually a button that toggles `open`. */
  trigger?: ReactNode;
  /** React Native content shown while `open`. */
  children?: ReactNode;
}

export function Collapsible({
  open,
  trigger,
  children,
  ...view
}: CollapsibleProps) {
  return (
    <SlotHost
      {...view}
      native={Native as never}
      nativeProps={{ open }}
      slots={[
        { name: 'trigger', content: trigger },
        { name: 'content', content: children },
      ]}
    />
  );
}
