---
id: gpui-kit-editor
title: Editor
---

The kit's `Editor`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                           | Type                                             |
| ------------------------------ | ------------------------------------------------ |
| `value`                        | `string`                                         |
| `controlled`                   | `boolean`                                        |
| `language`                     | `string`                                         |
| `lineNumber`                   | `boolean`                                        |
| `softWrap`                     | `boolean`                                        |
| `bordered`                     | `boolean`                                        |
| `disabled`                     | `boolean`                                        |
| `readonly`                     | `boolean`                                        |
| `highlightTheme`               | `WithDefault<'app' \| 'light' \| 'dark', 'app'>` |
| `editorStyleJson`              | `string`                                         |
| `foldPlaceholder`              | `string`                                         |
| `folding`                      | `WithDefault<boolean, true>`                     |
| `indentGuides`                 | `WithDefault<boolean, true>`                     |
| `scrollbarStyleJson`           | `string`                                         |
| `defaultValue`                 | `string`                                         |
| `tabSize`                      | `Int32`                                          |
| `hardTabs`                     | `boolean`                                        |
| `fontFamily`                   | `string`                                         |
| `fontSize`                     | `Double`                                         |
| `decorationsJson`              | `string`                                         |
| `rangeDecorationsJson`         | `string`                                         |
| `gutterDecorationsJson`        | `string`                                         |
| `overviewRulerDecorationsJson` | `string`                                         |
| `completionsJson`              | `string`                                         |

## Native events

| Name                    | Type                                               |
| ----------------------- | -------------------------------------------------- |
| `onGpuiKitEditorChange` | `DirectEventHandler< Readonly<{ text: string }> >` |

## Coverage

- `Editor::new`: generated, the code editor; its `language` selects the kit's syntax highlighter, which is how Highlighter is exposed
- `InputBaseState::set_highlighter`: generated (language), changing language switches the kit highlighter
- `InputBaseState::set_highlighter_factory`: generated (language), the kit installs its own highlighter factory, which language selects from
- `InputBaseState::set_editor_style`: generated (editorStyle), highlightTheme picks the kit highlight theme; editorStyle overrides foreground, background, selection, caret, active line and gutter colors
- `InputBaseState::set_fold_placeholder_renderer`: generated (foldPlaceholder), the text drawn after a folded line
- `InputBaseState::set_scrollbar_renderer`: generated (scrollbarStyle), the kit Scrollbar with the style object
- `InputBaseState::set_folding`: generated (folding)
- `InputBaseState::set_indent_guides`: generated (indentGuides)
