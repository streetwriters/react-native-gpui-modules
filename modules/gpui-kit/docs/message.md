---
id: gpui-kit-message
title: Message
---

The kit's `Message`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name           | Type      |
| -------------- | --------- |
| `messagesJson` | `string`  |
| `grouped`      | `boolean` |

## Native events

| Name                     | Type                                            |
| ------------------------ | ----------------------------------------------- |
| `onGpuiKitMessageAction` | `DirectEventHandler< Readonly<{ id: Int32 }> >` |

## Coverage

- `Message::new`: generated, constructor; React Native views are the slots
