import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import type { IconName } from '../generated/icons';
import { kitStyle, type KitStyle } from './kitStyle';
import SelectNative from './GpuiKitSelectNativeComponent';
import ComboboxNative, {
  Commands as ComboboxCommands,
} from './GpuiKitComboboxNativeComponent';
import { SlotHost } from './SlotHost';

type Size = 'xsmall' | 'small' | 'medium' | 'large';

const row = (item: string | PickerItem) =>
  typeof item === 'string'
    ? { title: item, value: item }
    : {
        title: item.title,
        value: item.value ?? item.title,
        icon: item.icon ?? '',
        disabled: item.disabled ?? false,
        badge: item.badge ?? '',
        display: item.display ?? '',
      };

function listJson(
  items: (string | PickerItem)[] | undefined,
  groups: PickerGroup[] | undefined,
  extra: { max?: number; pinned?: string[] } = {},
) {
  const plain = !groups && (items ?? []).every(i => typeof i === 'string');
  if (plain && !extra.max && !extra.pinned?.length) return '';
  return JSON.stringify({
    items: (items ?? []).map(row),
    groups: (groups ?? []).map(g => ({
      title: g.title,
      items: g.items.map(row),
    })),
    max: extra.max ?? 0,
    pinned: extra.pinned ?? [],
  });
}

const plainItems = (items: (string | PickerItem)[] | undefined) =>
  (items ?? []).map(i => (typeof i === 'string' ? i : i.title));

/** A row of a `Select` or `Combobox`; a string is a row whose value is its title. */
export interface PickerItem {
  title: string;
  /** Defaults to the title. */
  value?: string;
  icon?: IconName;
  disabled?: boolean;
  /** A badge after the title, such as `Featured`. */
  badge?: string;
  /** What the trigger shows when the row is chosen; defaults to the title. */
  display?: string;
}

export interface PickerGroup {
  title: string;
  items: (string | PickerItem)[];
}

interface PickerBase extends ViewProps {
  items?: (string | PickerItem)[];
  /** Rows in titled sections, instead of `items`. */
  groups?: PickerGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  cleanable?: boolean;
  disabled?: boolean;
  appearance?: boolean;
  menuWidth?: number;
  icon?: IconName;
  size?: Size;
}

export type SelectChangeEvent = NativeSyntheticEvent<
  Readonly<{ value: string; index: number }>
>;

export interface SelectProps extends PickerBase {
  /** The chosen item; leave it out for the kit's own selection. */
  value?: string;
  /** The first chosen item of an uncontrolled select. */
  defaultValue?: string;
  /** Text before the chosen item in the trigger. */
  titlePrefix?: string;
  /** The popup's maximum height, in points. */
  menuMaxHeight?: number;
  /** What the popup shows when there is nothing to pick. */
  emptyText?: string;
  /** Refines the trigger (padding and so on). */
  kitStyle?: KitStyle;
  onChange?: (event: SelectChangeEvent) => void;
}

export function Select({
  value,
  onChange,
  style,
  appearance,
  kitStyle: triggerStyle,
  items,
  groups,
  ...rest
}: SelectProps) {
  return (
    <SelectNative
      {...rest}
      items={plainItems(items)}
      listJson={listJson(items, groups)}
      kitStyle={kitStyle(triggerStyle)}
      style={[{ width: 200, height: 32 }, style]}
      appearance={appearance ?? true}
      value={value}
      controlled={value !== undefined}
      onGpuiKitSelectChange={onChange as never}
    />
  );
}

export type ComboboxChangeEvent = NativeSyntheticEvent<
  Readonly<{ values: string[] }>
>;

export interface ComboboxProps extends PickerBase {
  multiple?: boolean;
  /** The chosen items; leave it out for the kit's own selection. */
  values?: string[];
  /** The first chosen items of an uncontrolled combobox. */
  defaultValues?: string[];
  /** At most this many rows can be chosen. */
  maxSelections?: number;
  /** Rows that always show as chosen and cannot be toggled. */
  pinned?: string[];
  /** Replaces the selection mark. */
  checkIcon?: IconName;
  /** Draws the trigger with React Native content, given the chosen values. */
  renderTrigger?: (selection: string[]) => ReactNode;
  /** React Native content below the rows. */
  footer?: ReactNode;
  onChange?: (event: ComboboxChangeEvent) => void;
  /** The popup closed. */
  onConfirm?: (event: ComboboxChangeEvent) => void;
  /** The search text, sent after `requestQuery()`. */
  onQuery?: (query: string) => void;
}

export interface ComboboxHandle {
  /** Sends the current search text to `onQuery`. */
  requestQuery(): void;
}

const split = (event: { nativeEvent: { values: string } }) => ({
  ...event,
  nativeEvent: {
    values:
      event.nativeEvent.values === ''
        ? []
        : event.nativeEvent.values.split('\n'),
  },
});

export const Combobox = forwardRef<ComboboxHandle, ComboboxProps>(
  function Combobox(
    {
      values,
      defaultValues,
      onChange,
      onConfirm,
      onQuery,
      style,
      appearance,
      items,
      groups,
      maxSelections,
      pinned,
      checkIcon,
      renderTrigger,
      footer,
      ...rest
    },
    ref,
  ) {
    const native = useRef<React.ComponentRef<typeof ComboboxNative>>(null);
    const [own, setOwn] = useState(defaultValues ?? []);
    useImperativeHandle(ref, () => ({
      requestQuery: () => {
        if (native.current) ComboboxCommands.requestQuery(native.current);
      },
    }));
    const selection = values ?? own;
    const nativeProps = {
      ...rest,
      style:
        renderTrigger || footer
          ? { flex: 1 }
          : [{ width: 240, height: 32 }, style],
      items: plainItems(items),
      listJson: listJson(items, groups, { max: maxSelections, pinned }),
      appearance: appearance ?? true,
      values: values?.join('\n'),
      defaultValues: (defaultValues ?? []).join('\n'),
      checkIcon: checkIcon ?? '',
      controlled: values !== undefined,
      onGpuiKitComboboxChange: (event: never) => {
        const next = split(event) as ComboboxChangeEvent;
        setOwn(next.nativeEvent.values);
        onChange?.(next);
      },
      onGpuiKitComboboxConfirm: (event: never) =>
        onConfirm?.(split(event) as ComboboxChangeEvent),
      onGpuiKitComboboxQuery: (
        event: NativeSyntheticEvent<Readonly<{ query: string }>>,
      ) => onQuery?.(event.nativeEvent.query),
    };
    if (renderTrigger || footer)
      return (
        <SlotHost
          style={[{ width: 240, height: 32 }, style]}
          testID={rest.testID}
          nativeRef={native}
          native={ComboboxNative as never}
          nativeProps={nativeProps}
          slots={[
            { name: 'trigger', content: renderTrigger?.(selection) },
            { name: 'footer', content: footer },
          ]}
        />
      );
    return <ComboboxNative ref={native} {...(nativeProps as object)} />;
  },
);
