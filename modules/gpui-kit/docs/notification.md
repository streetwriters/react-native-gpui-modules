---
id: gpui-kit-notification
title: Notification
---

The kit's `Notification`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name        | Type                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------ |
| `open`      | `boolean`                                                                                        |
| `title`     | `string`                                                                                         |
| `message`   | `string`                                                                                         |
| `kind`      | `WithDefault< 'unset' \| 'info' \| 'success' \| 'warning' \| 'error', 'unset' >`                 |
| `placement` | `WithDefault< 'unset' \| 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right', 'unset' ` |
| `autohide`  | `WithDefault<boolean, true>`                                                                     |

## Native events

| Name                         | Type                               |
| ---------------------------- | ---------------------------------- |
| `onGpuiKitNotificationClose` | `DirectEventHandler<Readonly<{}>>` |

## Commands

- `push`
- `remove`
- `clear`

## Coverage

- `Notification::new`: generated, constructor
