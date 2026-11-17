---
id: gpui-kit-editor
title: Editor
---

The kit's `Editor`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name         | Type      |
| ------------ | --------- |
| `value`      | `string`  |
| `controlled` | `boolean` |
| `language`   | `string`  |
| `lineNumber` | `boolean` |
| `softWrap`   | `boolean` |
| `bordered`   | `boolean` |
| `disabled`   | `boolean` |
| `readonly`   | `boolean` |

## Native events

| Name                    | Type                                               |
| ----------------------- | -------------------------------------------------- |
| `onGpuiKitEditorChange` | `DirectEventHandler< Readonly<{ text: string }> >` |

## Coverage

- `Editor::new`: generated, the code editor; its `language` selects the kit's syntax highlighter, which is how Highlighter is exposed
