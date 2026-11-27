import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import type { IconName } from '../generated/icons';
import Native from './GpuiKitSettingsNativeComponent';
import { SlotHost, type Slot, type SlotHostProps } from './SlotHost';

interface SettingBase {
  /** Identifies the item in `onChange` and `onReset`. */
  key?: string;
  description?: string;
  /** The description is Markdown. */
  markdown?: boolean;
  /** Words that find the item in the search besides its title and description. */
  keywords?: string[];
  /** Puts the control under the title instead of beside it. */
  vertical?: boolean;
  disabled?: boolean;
}

/** A kit field: the kit draws the control and its reset button. */
export type SettingKitField = SettingBase & {
  title: string;
  /** Width of the control, in points. */
  width?: number;
} & (
    | {
        kind: 'switch' | 'checkbox';
        value: boolean;
        defaultValue?: boolean;
      }
    | {
        kind: 'dropdown';
        value: string;
        defaultValue?: string;
        /** `[value, label]` pairs. */
        options: [string, string][];
        /** The menu scrolls, for long lists. */
        scrollable?: boolean;
      }
    | {
        kind: 'number';
        value: number;
        defaultValue?: number;
        min?: number;
        max?: number;
        step?: number;
      }
    | { kind: 'input'; value: string; defaultValue?: string }
  );

/** An item whose control is React Native content beside the kit's title and description. */
export type SettingContentField = SettingBase & {
  kind: 'field';
  title: string;
  field: ReactNode;
  /** Width of the control, in points; without one it is as wide as its content. */
  width?: number;
  /** Shows the reset button, which calls `onReset`, while true. */
  dirty?: boolean;
};

/** An item drawn entirely by React Native content. */
export type SettingContentRow = SettingBase & {
  kind: 'render';
  content: ReactNode;
  /** Shows the reset button, which calls `onReset`, while true. */
  dirty?: boolean;
};

export type SettingItemSpec =
  SettingKitField | SettingContentField | SettingContentRow;

export interface SettingGroupSpec {
  title?: string;
  description?: string;
  /** A string, or React Native content. */
  footer?: ReactNode;
  items: SettingItemSpec[];
}

export interface SettingPageSpec {
  title: string;
  icon?: IconName;
  description?: string;
  /** Shows the page's reset button; true by default. */
  resettable?: boolean;
  /** The page is open in the sidebar at first. */
  defaultOpen?: boolean;
  /** React Native content after the page title. */
  titleSuffix?: ReactNode;
  groups: SettingGroupSpec[];
}

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
}

export interface SettingsProps extends SlotHostProps {
  /** The pages, their groups and items. */
  pages?: SettingPageSpec[];
  /** A flat list of React Native controls, grouped into pages by `page` and `group`. */
  entries?: SettingsEntry[];
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  groupVariant?: 'normal' | 'outline' | 'fill';
  sidebarWidth?: number;
  /** Width of the React Native controls of `entries`, in points. */
  fieldWidth?: number;
  /** A kit field changed. */
  onChange?: (key: string, value: boolean | number | string) => void;
  /** The reset button of an item with `dirty` was pressed. */
  onReset?: (key: string) => void;
}

function fromEntries(entries: SettingsEntry[], fieldWidth: number) {
  const pages: SettingPageSpec[] = [];
  for (const entry of entries) {
    let page = pages[pages.length - 1];
    if (page?.title !== entry.page) {
      page = { title: entry.page, groups: [] };
      pages.push(page);
    }
    let group = page.groups[page.groups.length - 1];
    if (!group || (group.title ?? '') !== (entry.group ?? '')) {
      group = { title: entry.group, items: [] };
      page.groups.push(group);
    }
    group.items.push({
      kind: 'field',
      title: entry.title,
      description: entry.description,
      field: entry.field,
      vertical: entry.vertical,
      disabled: entry.disabled,
      width: fieldWidth,
    });
  }
  return pages;
}

/** The kit's settings: a sidebar of pages, each with groups of setting items. */
export function Settings({
  pages,
  entries,
  size,
  groupVariant,
  sidebarWidth,
  fieldWidth = 220,
  onChange,
  onReset,
  ...view
}: SettingsProps) {
  const all = pages ?? fromEntries(entries ?? [], fieldWidth);
  const slots: Slot[] = [];
  const json = all.map((page, p) => {
    if (page.titleSuffix != null)
      slots.push({
        name: `page-${p}-suffix`,
        content: page.titleSuffix,
        fit: true,
      });
    return {
      title: page.title,
      icon: page.icon ?? '',
      description: page.description ?? '',
      resettable: page.resettable,
      defaultOpen: page.defaultOpen ?? false,
      groups: page.groups.map((group, g) => {
        const textFooter = typeof group.footer === 'string';
        if (group.footer != null && !textFooter)
          slots.push({ name: `group-${p}-${g}-footer`, content: group.footer });
        return {
          title: group.title ?? '',
          description: group.description ?? '',
          footer: textFooter ? group.footer : '',
          items: group.items.map((item, i) => {
            if (item.kind === 'field' || item.kind === 'render')
              slots.push({
                name: `item-${p}-${g}-${i}`,
                content: item.kind === 'field' ? item.field : item.content,
                fit: item.kind === 'field' && item.width === undefined,
              });
            const rest: Record<string, unknown> = { ...item };
            delete rest.field;
            delete rest.content;
            return { ...rest, key: item.key ?? `${p}.${g}.${i}` };
          }),
        };
      }),
    };
  });
  return (
    <SlotHost
      {...view}
      native={Native as never}
      nativeProps={{
        pagesJson: JSON.stringify(json),
        size,
        groupVariant: groupVariant ?? '',
        sidebarWidth,
        onGpuiKitSettingsChange: (
          event: NativeSyntheticEvent<Readonly<{ key: string; value: string }>>,
        ) =>
          onChange?.(
            event.nativeEvent.key,
            JSON.parse(event.nativeEvent.value) as boolean | number | string,
          ),
        onGpuiKitSettingsReset: (
          event: NativeSyntheticEvent<Readonly<{ key: string }>>,
        ) => onReset?.(event.nativeEvent.key),
      }}
      slots={slots}
    />
  );
}
