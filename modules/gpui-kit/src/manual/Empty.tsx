import React, { type ReactNode } from 'react';
import Native from './GpuiKitEmptyNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';
import type { IconName } from '../generated/icons';
import { kitStyle, type KitStyle } from './kitStyle';

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
  /** Content after the content box (`Empty::child`). */
  extra?: ReactNode;
  /** Refines the empty state (border, background, padding, alignment). */
  kitStyle?: KitStyle;
  /** Refines the header. */
  headerStyle?: KitStyle;
  /** Refines the content box. */
  contentStyle?: KitStyle;
}

export function Empty({
  title,
  description,
  icon,
  media,
  children,
  extra,
  kitStyle: emptyStyle,
  headerStyle,
  contentStyle,
  ...view
}: EmptyProps) {
  const text = (value: ReactNode) =>
    typeof value === 'string' ? value : undefined;
  return (
    <SlotHost
      {...view}
      native={Native as never}
      nativeProps={{
        title: text(title),
        description: text(description),
        icon,
        kitStyle: kitStyle(emptyStyle),
        headerStyle: kitStyle(headerStyle),
        contentStyle: kitStyle(contentStyle),
      }}
      slots={[
        { name: 'media', content: media },
        { name: 'title', content: text(title) === undefined ? title : null },
        {
          name: 'description',
          content: text(description) === undefined ? description : null,
        },
        { name: 'content', content: children },
        { name: 'extra', content: extra },
      ]}
    />
  );
}
