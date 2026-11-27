import React, {
  Children,
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import StatusBarNative from './GpuiKitStatusBarNativeComponent';
import ToolbarNative from './GpuiKitToolbarNativeComponent';
import ResizableNative, {
  Commands as ResizableCommands,
} from './GpuiKitResizableNativeComponent';
import CarouselNative from './GpuiKitCarouselNativeComponent';
import { SlotHost } from './SlotHost';
import type { IconName } from '../generated/icons';
import { kitStyle, type KitStyle } from './kitStyle';

interface Base {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface StatusBarProps extends Base {
  /** Items at the start; a string is drawn in the bar's own type. */
  left?: ReactNode | ReactNode[];
  /** Items between the ends: start-aligned, end-aligned with only `left`, centred with both ends. */
  children?: ReactNode | ReactNode[];
  /** Items at the end. */
  right?: ReactNode | ReactNode[];
  kitStyle?: KitStyle;
}

const statusParts = (region: string, items: ReactNode | ReactNode[]) =>
  Children.toArray(items).map(item => ({ region, item }));

/** A bar of left, center and right regions; without a height in `style` it is as high as its content. */
export function StatusBar({
  left,
  children,
  right,
  kitStyle: barStyle,
  style,
  testID,
}: StatusBarProps) {
  const parts = [
    ...statusParts('left', left),
    ...statusParts('center', children),
    ...statusParts('right', right),
  ];
  const text = (item: ReactNode) =>
    typeof item === 'string' || typeof item === 'number' ? String(item) : '';
  return (
    <SlotHost
      style={style}
      testID={testID}
      native={StatusBarNative as never}
      nativeProps={{
        parts: parts.map(part => ({
          region: part.region,
          text: text(part.item),
        })),
        kitStyle: kitStyle(barStyle),
      }}
      slots={parts.map((part, index) => ({
        name: `part-${index}`,
        content: text(part.item) ? null : part.item,
      }))}
    />
  );
}

export type ToolbarItem =
  | {
      kind: 'button';
      label?: string;
      icon?: IconName;
      tooltip?: string;
      disabled?: boolean;
      onPress?: () => void;
    }
  | {
      kind: 'toggle';
      label?: string;
      icon?: IconName;
      tooltip?: string;
      checked?: boolean;
      disabled?: boolean;
      onChange?: (checked: boolean) => void;
    }
  | { kind: 'separator' }
  | { kind: 'spacer' }
  | {
      kind: 'group';
      /** The group's accessible name. */
      label?: string;
      gap?: number;
      items: ToolbarItem[];
    }
  /** React Native content, centred in a box of the toolbar's control height. */
  | { kind: 'content'; content: ReactNode };

export interface ToolbarProps extends Base {
  disabled?: boolean;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  /** The toolbar's items, in order; buttons become compact ghost buttons of the toolbar's size. */
  items?: ToolbarItem[];
  /** React Native views, one per toolbar item, when `items` is left out. */
  children?: ReactNode;
  kitStyle?: KitStyle;
}

/** A row of commands. Without a height in `style` it is as high as its items. */
export function Toolbar({
  disabled,
  size,
  items,
  children,
  kitStyle: barStyle,
  style,
  testID,
}: ToolbarProps) {
  const entries =
    items ??
    Children.toArray(children).map(content => ({
      kind: 'content' as const,
      content,
    }));
  const flat: ToolbarItem[] = [];
  const toJson = (list: ToolbarItem[]): unknown[] =>
    list.map(item => {
      const id = flat.length;
      flat.push(item);
      if (item.kind === 'group')
        return {
          kind: 'group',
          id,
          label: item.label ?? '',
          gap: item.gap,
          items: toJson(item.items),
        };
      if (item.kind === 'button' || item.kind === 'toggle')
        return {
          kind: item.kind,
          id,
          label: item.label ?? '',
          icon: item.icon ?? '',
          tooltip: item.tooltip ?? '',
          disabled: item.disabled ?? false,
          checked: item.kind === 'toggle' ? (item.checked ?? false) : false,
        };
      return { kind: item.kind, id };
    });
  const json = JSON.stringify(toJson(entries));
  return (
    <SlotHost
      style={style}
      testID={testID}
      native={ToolbarNative as never}
      nativeProps={{
        disabled,
        size: size ?? '',
        itemsJson: json,
        kitStyle: kitStyle(barStyle),
        onGpuiKitToolbarPress: (
          event: NativeSyntheticEvent<{ id: number }>,
        ) => {
          const item = flat[event.nativeEvent.id];
          if (item?.kind === 'button') item.onPress?.();
        },
        onGpuiKitToolbarToggle: (
          event: NativeSyntheticEvent<{ id: number; checked: boolean }>,
        ) => {
          const item = flat[event.nativeEvent.id];
          if (item?.kind === 'toggle')
            item.onChange?.(event.nativeEvent.checked);
        },
      }}
      slots={flat.map((item, id) => ({
        name: `item-${id}`,
        content: item.kind === 'content' ? item.content : null,
      }))}
    />
  );
}

export interface ResizablePanelProps {
  /** Initial size in points. */
  size?: number;
  minSize?: number;
  maxSize?: number;
  /** Keep the size when the group is resized. */
  fixed?: boolean;
  /** Takes no share of the free space (`flex_none`). */
  flexNone?: boolean;
  visible?: boolean;
  /** Text drawn in the panel with a padding of 16, in the kit's own type. */
  label?: string;
  /** React Native content, or a nested `Resizable`. */
  children?: ReactNode;
}

/** A panel of a `Resizable`; it renders nothing by itself. */
export function ResizablePanel(_props: ResizablePanelProps) {
  return null;
}

export interface ResizableHandle {
  /** Sets panel `index` of the top-level group to `size` points. */
  resizePanel(index: number, size: number): void;
}

export interface ResizableProps extends Base {
  vertical?: boolean;
  /** `ResizablePanel` elements; a panel whose child is a `Resizable` nests a group. */
  children?: ReactNode;
  /** The sizes of the panels, in points, after the user dragged a handle. */
  onResize?: (
    event: NativeSyntheticEvent<Readonly<{ sizes: number[] }>>,
  ) => void;
}

type PanelElement = React.ReactElement<ResizablePanelProps>;
type GroupElement = React.ReactElement<ResizableProps>;

const panelsOf = (children: ReactNode) =>
  Children.toArray(children).filter((child): child is PanelElement =>
    React.isValidElement(child),
  );

/** Panels separated by draggable handles. */
export const Resizable = forwardRef<ResizableHandle, ResizableProps>(
  function Resizable({ vertical, children, onResize, style, testID }, ref) {
    const native = useRef<React.ComponentRef<typeof ResizableNative>>(null);
    useImperativeHandle(ref, () => ({
      resizePanel: (index, size) => {
        if (native.current)
          ResizableCommands.resizePanel(native.current, index, size);
      },
    }));
    const slots: { name: string; content: ReactNode }[] = [];
    const toJson = (panels: PanelElement[]): unknown[] =>
      panels.map(panel => {
        const props = panel.props;
        const only = Children.toArray(props.children);
        const nested =
          only.length === 1 &&
          React.isValidElement(only[0]) &&
          only[0].type === Resizable
            ? (only[0] as GroupElement)
            : null;
        const spec: Record<string, unknown> = {
          size: props.size ?? 0,
          min: props.minSize ?? 0,
          max: props.maxSize ?? 0,
          fixed: props.fixed ?? false,
          flexNone: props.flexNone ?? false,
          visible: props.visible ?? true,
          label: props.label ?? '',
        };
        if (nested) {
          spec.vertical = nested.props.vertical ?? false;
          spec.panels = toJson(panelsOf(nested.props.children));
        } else if (props.children != null) {
          spec.slot = slots.length;
          slots.push({
            name: `panel-${slots.length}`,
            content: props.children,
          });
        }
        return spec;
      });
    const panelsJson = JSON.stringify(toJson(panelsOf(children)));
    return (
      <SlotHost
        style={style}
        testID={testID}
        nativeRef={native}
        native={ResizableNative as never}
        nativeProps={{
          vertical,
          panelsJson,
          onGpuiKitResizableResize: (event: {
            nativeEvent: { sizes: string };
          }) =>
            onResize?.({
              ...event,
              nativeEvent: {
                sizes: event.nativeEvent.sizes.split(',').map(Number),
              },
            } as never),
        }}
        slots={slots}
      />
    );
  },
);

export interface CarouselProps extends Base {
  /** React Native views, one per slide. */
  children?: ReactNode;
  /** Slides drawn by the kit as centred text, styled by `slideStyle`, instead of `children`. */
  slides?: string[];
  slideStyle?: KitStyle;
  vertical?: boolean;
  looping?: boolean;
  controls?: boolean;
  pagination?: boolean;
  /** Numbers the pagination items. */
  paginationLabels?: boolean;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  /** Content of the previous and next controls, instead of their arrows. */
  previousLabel?: string;
  nextLabel?: string;
  previousAccessibilityLabel?: string;
  nextAccessibilityLabel?: string;
  /** Refines the carousel, its content box, its track and each item. */
  kitStyle?: KitStyle;
  contentStyle?: KitStyle;
  trackStyle?: KitStyle;
  itemStyle?: KitStyle;
  /** The slide shown; leave it out for the kit's own state. */
  selectedIndex?: number;
  onChange?: (event: NativeSyntheticEvent<Readonly<{ index: number }>>) => void;
}

/** Slides with previous and next controls and pagination. Without a height in `style` it is as high as its content. */
export function Carousel({
  children,
  slides,
  slideStyle,
  vertical,
  looping,
  controls,
  pagination,
  selectedIndex,
  kitStyle: carouselStyle,
  contentStyle,
  trackStyle,
  itemStyle,
  onChange,
  style,
  testID,
  ...rest
}: CarouselProps) {
  const views = slides ? [] : Children.toArray(children);
  return (
    <SlotHost
      style={style}
      testID={testID}
      native={CarouselNative as never}
      nativeProps={{
        ...rest,
        vertical,
        looping,
        controls: controls ?? true,
        pagination: pagination ?? true,
        selectedIndex,
        controlled: selectedIndex !== undefined,
        slides: slides ?? [],
        slideStyle: kitStyle(slideStyle),
        kitStyle: kitStyle(carouselStyle),
        contentStyle: kitStyle(contentStyle),
        trackStyle: kitStyle(trackStyle),
        itemStyle: kitStyle(itemStyle),
        onGpuiKitCarouselChange: onChange,
      }}
      slots={views.map((slide, index) => ({
        name: `slide-${index}`,
        content: slide,
      }))}
    />
  );
}
