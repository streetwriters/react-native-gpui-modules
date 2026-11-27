import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
  type ReactNode,
} from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import Native, { Commands } from './GpuiKitDockNativeComponent';
import { SlotHost, type SlotHostProps } from './SlotHost';

export type DockPlacement = 'center' | 'left' | 'right' | 'bottom';

export interface DockPanelEntry {
  id: string;
  title: string;
  /** The panel's React Native content. */
  content: ReactNode;
  /** The dock it is in; the center by default. */
  placement?: DockPlacement;
  /** Panels of one placement with the same group share a tab bar. */
  group?: string;
  closable?: boolean;
  /** The size of the panel's group within its split, in points. */
  size?: number;
}

export interface DockHandle {
  toggleDock(placement: Exclude<DockPlacement, 'center'>): void;
  selectPanel(id: string): void;
  /** Loads a layout from `onLayoutChange`; panels are matched by `id`. */
  restoreLayout(layout: string): void;
}

export interface DockProps extends SlotHostProps {
  panels: DockPanelEntry[];
  /** How the groups of the center are split. */
  centerAxis?: 'horizontal' | 'vertical';
  /** Stops the user dragging panels and groups. */
  locked?: boolean;
  /** The size of the left, right and bottom docks. */
  dockSize?: number;
  /** Sizes of single docks, overriding `dockSize`. */
  dockSizes?: Partial<Record<Exclude<DockPlacement, 'center'>, number>>;
  /** Docks the user can collapse. */
  collapsible?: Exclude<DockPlacement, 'center'>[];
  /** Shows the dock toggle buttons (default true). */
  toggleButtonVisible?: boolean;
  /** Shows a close button on every tab. */
  closeButtonVisible?: boolean;
  /**
   * A layout from `onLayoutChange` to start from. Its panels are matched to
   * `panels` by `id`, so the same React Native content mounts where the
   * layout puts it.
   */
  layout?: string;
  /**
   * The user moved, resized or closed something, or a layout was restored.
   * `layout` is the kit's dump of the dock area as JSON, with each panel
   * named by its `id`.
   */
  onLayoutChange?: (layout: string) => void;
  /** The user opened or closed a dock. */
  onDockToggle?: (placement: DockPlacement, open: boolean) => void;
}

/**
 * The kit's dock area: tab groups of panels in a center and in docks that
 * resize, collapse and take dragged panels. Panels hold React Native views.
 */
export const Dock = forwardRef<DockHandle, DockProps>(function Dock(
  {
    panels,
    centerAxis,
    locked,
    dockSize,
    dockSizes,
    collapsible,
    toggleButtonVisible,
    closeButtonVisible,
    layout,
    onLayoutChange,
    onDockToggle,
    style,
    ...view
  },
  ref,
) {
  const native = useRef<ComponentRef<typeof Native>>(null);
  useImperativeHandle(ref, () => ({
    toggleDock: placement =>
      native.current && Commands.toggleDock(native.current, placement),
    selectPanel: id =>
      native.current && Commands.selectPanel(native.current, id),
    restoreLayout: value =>
      native.current && Commands.restoreLayout(native.current, value),
  }));
  return (
    <SlotHost
      {...view}
      style={[{ width: 640, height: 400 }, style]}
      native={Native as never}
      nativeRef={native as never}
      nativeProps={{
        panels: panels.map(panel => ({
          id: panel.id,
          title: panel.title,
          placement: panel.placement ?? 'center',
          group: panel.group ?? '',
          closable: panel.closable ?? true,
          size: panel.size ?? 0,
        })),
        centerAxis: centerAxis ?? 'horizontal',
        locked: locked ?? false,
        dockSize: dockSize ?? 240,
        dockSizes: JSON.stringify(dockSizes ?? {}),
        collapsible: (collapsible ?? ['left', 'right', 'bottom']).join(','),
        toggleButtonVisible: toggleButtonVisible ?? true,
        closeButtonVisible: closeButtonVisible ?? false,
        layout: layout ?? '',
        onGpuiKitDockLayoutChange: (
          event: NativeSyntheticEvent<{ layout: string }>,
        ) => onLayoutChange?.(event.nativeEvent.layout),
        onGpuiKitDockToggle: (
          event: NativeSyntheticEvent<{ placement: string; open: boolean }>,
        ) =>
          onDockToggle?.(
            event.nativeEvent.placement as DockPlacement,
            event.nativeEvent.open,
          ),
      }}
      slots={panels.map(panel => ({
        name: `panel-${panel.id}`,
        content: panel.content,
      }))}
    />
  );
});
