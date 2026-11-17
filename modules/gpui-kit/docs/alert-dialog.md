---
id: gpui-kit-alert-dialog
title: AlertDialog
---

The kit's `AlertDialog`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name          | Type                         |
| ------------- | ---------------------------- |
| `open`        | `boolean`                    |
| `title`       | `string`                     |
| `description` | `string`                     |
| `width`       | `Double`                     |
| `confirm`     | `boolean`                    |
| `keyboard`    | `WithDefault<boolean, true>` |
| `centered`    | `boolean`                    |
| `okText`      | `string`                     |
| `cancelText`  | `string`                     |

## Native events

| Name                         | Type                               |
| ---------------------------- | ---------------------------------- |
| `onGpuiKitAlertDialogOk`     | `DirectEventHandler<Readonly<{}>>` |
| `onGpuiKitAlertDialogCancel` | `DirectEventHandler<Readonly<{}>>` |
| `onGpuiKitAlertDialogClose`  | `DirectEventHandler<Readonly<{}>>` |

## Coverage

- `AlertDialog::new`: generated, constructor
