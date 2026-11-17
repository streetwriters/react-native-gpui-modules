import React, { type ReactNode } from 'react';
import Native from './GpuiKitSettingsNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';

export interface SettingsEntry {
  /** The sidebar page the entry is on. */
  page: string;
  /** The group of the page the entry is in. */
  group?: string;
  title: string;
  description?: string;
  /** The control, as React Native content. */
  field: ReactNode;
  /** Puts the control under the title instead of beside it. */
  vertical?: boolean;
  disabled?: boolean;
  /**
   * `field` lays the entry out as a kit setting field (`SettingItem::new`
   * with a custom `SettingField`): the kit draws the title and description
   * and places the React Native control. `row`, the default, draws the row
   * itself with `SettingItem::render`.
   */
  kind?: 'row' | 'field';
}

export interface SettingsProps extends SlotHostProps {
  entries: SettingsEntry[];
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  sidebarWidth?: number;
  /** Width of the controls, in points. */
  fieldWidth?: number;
}

export function Settings({ entries, ...rest }: SettingsProps) {
  const { size, sidebarWidth, fieldWidth, ...view } = rest;
  return (
    <SlotHost
      {...view}
      native={Native as never}
      nativeProps={{
        size,
        sidebarWidth,
        fieldWidth,
        items: entries.map(entry => ({
          page: entry.page,
          group: entry.group ?? '',
          title: entry.title,
          description: entry.description ?? '',
          vertical: entry.vertical ?? false,
          disabled: entry.disabled ?? false,
          kitField: entry.kind === 'field',
        })),
      }}
      slots={entries.map((entry, index) => ({
        name: `field-${index}`,
        content: entry.field,
      }))}
    />
  );
}
