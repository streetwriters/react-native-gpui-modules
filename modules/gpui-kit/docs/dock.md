---
id: gpui-kit-dock
title: Dock
---

The kit's `Dock`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                  | Type                                                      |
| --------------------- | --------------------------------------------------------- |
| `panels`              | `ReadonlyArray<DockPanel>`                                |
| `centerAxis`          | `WithDefault< 'horizontal' \| 'vertical', 'horizontal' >` |
| `locked`              | `boolean`                                                 |
| `dockSize`            | `WithDefault<Double, 240>`                                |
| `dockSizes`           | `string`                                                  |
| `collapsible`         | `string`                                                  |
| `toggleButtonVisible` | `WithDefault<boolean, true>`                              |
| `closeButtonVisible`  | `boolean`                                                 |
| `layout`              | `string`                                                  |

## Native events

| Name                        | Type                                                 |
| --------------------------- | ---------------------------------------------------- |
| `onGpuiKitDockLayoutChange` | `DirectEventHandler< Readonly<{ layout: string }> >` |

## Commands

- `toggleDock`
- `selectPanel`
- `restoreLayout`

## Coverage

- `DockArea::new`: generated, constructor
- `DockArea::set_center`: generated (panels), panels with placement `center`
- `DockArea::set_dock`: generated (panels), panels with placement `left`, `right` or `bottom`
- `DockLayout::tabs`: generated (panels), panels with the same group share a tab bar
- `DockLayout::h_split`: generated (centerAxis)
- `DockLayout::v_split`: generated (centerAxis)
- `DockArea::set_locked`: generated (locked)
- `DockArea::set_dock_size`: generated (dockSize)
- `DockArea::toggle_dock`: generated (toggleDock()), command
- `DockArea::select_panel`: generated (selectPanel()), command
- `DockEvent`: generated (onLayoutChange)
- `DockToggleEvent`: generated (onDockToggle)
- `DockArea::dump`: generated (onLayoutChange), onLayoutChange carries the dump as JSON with panels named by their id; layout and restoreLayout load one back, mounting the same panels
