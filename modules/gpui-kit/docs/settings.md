---
id: gpui-kit-settings
title: Settings
---

The kit's `Settings`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name           | Type                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| `items`        | `ReadonlyArray<SettingsItem>`                                                   |
| `size`         | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |
| `sidebarWidth` | `Double`                                                                        |
| `fieldWidth`   | `WithDefault<Double, 220>`                                                      |

## Coverage

- `Settings::new`: generated, constructor; the entries are the pages, groups and items
- `SettingPage`: generated (entries), entries with the same `page` form one sidebar page
- `SettingGroup`: generated (entries), consecutive entries with the same `group` form one group
- `SettingItem::render`: generated (entries), each entry draws its title, description and React Native control
- `SettingItem::new`: skipped, a typed field reads and writes its value through Rust closures over app state; Settings takes React Native controls as items instead
- `Settings::sidebar_width`: generated (sidebarWidth)
- `Settings::with_size`: generated (size)
