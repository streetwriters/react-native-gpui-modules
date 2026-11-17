import React, { type ReactNode } from 'react';
import Native from './GpuiKitEmptyNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';
import type { IconName } from '../generated/icons';

export interface EmptyProps extends SlotHostProps {
  /** A string, or React Native content. */
  title?: ReactNode;
  /** A string, or React Native content. */
  description?: ReactNode;
  /** A kit icon framed in the media slot. */
  icon?: IconName;
  /** React Native content for the media slot, instead of `icon`. */
  media?: ReactNode;
  /** Content below the header, such as actions. */
  children?: ReactNode;
}

export function Empty({
  title,
  description,
  icon,
  media,
  children,
  ...view
}: EmptyProps) {
  const text = (value: ReactNode) =>
    typeof value === 'string' ? value : undefined;
  return (
    <SlotHost
      {...view}
      native={Native as never}
      nativeProps={{ title: text(title), description: text(description), icon }}
      slots={[
        { name: 'media', content: media },
        { name: 'title', content: text(title) === undefined ? title : null },
        {
          name: 'description',
          content: text(description) === undefined ? description : null,
        },
        { name: 'content', content: children },
      ]}
    />
  );
}
