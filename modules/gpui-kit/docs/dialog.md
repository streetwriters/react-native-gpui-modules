---
id: gpui-kit-dialog
title: Dialog
---

The kit's `Dialog`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name              | Type                         |
| ----------------- | ---------------------------- |
| `open`            | `boolean`                    |
| `title`           | `string`                     |
| `width`           | `Double`                     |
| `marginTop`       | `Double`                     |
| `overlay`         | `WithDefault<boolean, true>` |
| `overlayClosable` | `WithDefault<boolean, true>` |
| `keyboard`        | `WithDefault<boolean, true>` |
| `closeButton`     | `WithDefault<boolean, true>` |
| `centered`        | `boolean`                    |
| `showCancel`      | `boolean`                    |
| `okText`          | `string`                     |
| `cancelText`      | `string`                     |

## Native events

| Name                    | Type                               |
| ----------------------- | ---------------------------------- |
| `onGpuiKitDialogOk`     | `DirectEventHandler<Readonly<{}>>` |
| `onGpuiKitDialogCancel` | `DirectEventHandler<Readonly<{}>>` |
| `onGpuiKitDialogClose`  | `DirectEventHandler<Readonly<{}>>` |

## Coverage

- `Dialog::new`: generated, constructor
