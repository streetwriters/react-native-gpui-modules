---
id: gpui-kit-attachment
title: Attachment
---

The kit's `Attachment`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name        | Type      |
| ----------- | --------- |
| `itemsJson` | `string`  |
| `asGroup`   | `boolean` |
| `edgeFade`  | `Int32`   |

## Native events

| Name                        | Type                                               |
| --------------------------- | -------------------------------------------------- |
| `onGpuiKitAttachmentPress`  | `DirectEventHandler< Readonly<{ index: Int32 }> >` |
| `onGpuiKitAttachmentRemove` | `DirectEventHandler< Readonly<{ index: Int32 }> >` |
| `onGpuiKitAttachmentRetry`  | `DirectEventHandler< Readonly<{ index: Int32 }> >` |

## Coverage

- `Attachment::new`: generated, constructor; React Native views are the slots
