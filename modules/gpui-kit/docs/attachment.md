---
id: gpui-kit-attachment
title: Attachment
---

The kit's `Attachment`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name          | Type                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `title`       | `string`                                                                                          |
| `description` | `string`                                                                                          |
| `tooltip`     | `string`                                                                                          |
| `progress`    | `WithDefault<Double, -1>`                                                                         |
| `status`      | `WithDefault< 'unset' \| 'pending' \| 'uploading' \| 'processing' \| 'failed' \| 'complete', 'un` |

## Native events

| Name                        | Type                               |
| --------------------------- | ---------------------------------- |
| `onGpuiKitAttachmentPress`  | `DirectEventHandler<Readonly<{}>>` |
| `onGpuiKitAttachmentRemove` | `DirectEventHandler<Readonly<{}>>` |
| `onGpuiKitAttachmentRetry`  | `DirectEventHandler<Readonly<{}>>` |

## Coverage

- `Attachment::new`: generated, constructor; React Native views are the slots
