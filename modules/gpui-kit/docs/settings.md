---
id: gpui-kit-settings
title: Settings
---

The kit's `Settings`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name           | Type                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| `pagesJson`    | `string`                                                                        |
| `size`         | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |
| `groupVariant` | `string`                                                                        |
| `sidebarWidth` | `Double`                                                                        |

## Native events

| Name                     | Type                                              |
| ------------------------ | ------------------------------------------------- |
| `onGpuiKitSettingsReset` | `DirectEventHandler< Readonly<{ key: string }> >` |

## Coverage

- `Settings::new`: generated, constructor; the entries are the pages, groups and items
- `SettingPage`: generated (entries), entries with the same `page` form one sidebar page
- `SettingGroup`: generated (entries), consecutive entries with the same `group` form one group
- `SettingItem::render`: generated (entries), each entry draws its title, description and React Native control
- `SettingItem::new`: generated (entries), an entry with kind field is a kit setting item whose custom SettingField renders the React Native control
- `Settings::sidebar_width`: generated (sidebarWidth)
- `Settings::with_size`: generated (size)
