---
id: gpui-kit-alert-dialog
title: AlertDialog
---

The kit's `AlertDialog`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name            | Type                         |
| --------------- | ---------------------------- |
| `open`          | `boolean`                    |
| `title`         | `string`                     |
| `description`   | `string`                     |
| `dialogWidth`   | `Double`                     |
| `confirm`       | `boolean`                    |
| `keyboard`      | `WithDefault<boolean, true>` |
| `centered`      | `boolean`                    |
| `okText`        | `string`                     |
| `cancelText`    | `string`                     |
| `okVariant`     | `string`                     |
| `cancelVariant` | `string`                     |
| `closeButton`   | `boolean`                    |
| `closeOnOk`     | `WithDefault<boolean, true>` |
| `closeOnCancel` | `WithDefault<boolean, true>` |
| `kitStyle`      | `string`                     |
| `headerStyle`   | `string`                     |
| `footerStyle`   | `string`                     |
| `buttonsJson`   | `string`                     |

## Native events

| Name                         | Type                               |
| ---------------------------- | ---------------------------------- |
| `onGpuiKitAlertDialogOk`     | `DirectEventHandler<Readonly<{}>>` |
| `onGpuiKitAlertDialogCancel` | `DirectEventHandler<Readonly<{}>>` |
| `onGpuiKitAlertDialogClose`  | `DirectEventHandler<Readonly<{}>>` |

## Coverage

- `AlertDialog::new`: generated, constructor
