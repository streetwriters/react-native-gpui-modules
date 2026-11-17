---
id: gpui-kit-dock
title: Dock
---

The kit's `Dock`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name         | Type                                                      |
| ------------ | --------------------------------------------------------- |
| `panels`     | `ReadonlyArray<DockPanel>`                                |
| `centerAxis` | `WithDefault< 'horizontal' \| 'vertical', 'horizontal' >` |
| `locked`     | `boolean`                                                 |
| `dockSize`   | `WithDefault<Double, 240>`                                |

## Native events

| Name                        | Type                               |
| --------------------------- | ---------------------------------- |
| `onGpuiKitDockLayoutChange` | `DirectEventHandler<Readonly<{}>>` |

## Commands

- `toggleDock`
- `selectPanel`

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
- `DockArea::dump`: skipped, restoring a dump needs a Rust registry that rebuilds panels by name; React Native panels are rebuilt from props, so a dump could not be loaded back
