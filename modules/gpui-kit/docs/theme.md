---
id: gpui-kit-theme
title: Theme
---

The kit's `Theme`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                    | Type                         |
| ----------------------- | ---------------------------- |
| `mode`                  | `string`                     |
| `shadow`                | `WithDefault<boolean, true>` |
| `notificationPlacement` | `string`                     |
| `notificationMaxItems`  | `Int32`                      |

## Native events

| Name                   | Type                                                |
| ---------------------- | --------------------------------------------------- |
| `onGpuiKitThemeChange` | `DirectEventHandler< Readonly<{ dark: boolean }> >` |

## Coverage

- `Theme::new`: generated, constructor
