---
id: gpui-kit-history
title: History
---

The kit's `History`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name         | Type    |
| ------------ | ------- |
| `maxEntries` | `Int32` |

## Native events

| Name                     | Type                                             |
| ------------------------ | ------------------------------------------------ |
| `onGpuiKitHistoryChange` | `DirectEventHandler< Readonly<{ current: string` |

## Commands

- `push`
- `replaceCurrent`
- `back`
- `forward`
- `clear`

## Coverage

- `History::new`: generated, constructor
- `History::max_entries`: generated (maxEntries)
- `History::push`: generated (push()), command
- `History::replace_current`: generated (replaceCurrent()), command
- `History::back`: generated (back()), command
- `History::forward`: generated (forward()), command
- `History::clear`: generated (clear()), command
- `History::current`: generated (onChange), reported with every change
- `History::can_back`: generated (onChange), reported with every change
- `History::can_forward`: generated (onChange), reported with every change
- `History::entries`: generated (onChange), its length is reported; entries are strings
