---
id: gpui-kit-diff
title: Diff
---

The kit's `Diff`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                  | Type                         |
| --------------------- | ---------------------------- |
| `patch`               | `string`                     |
| `filesJson`           | `string`                     |
| `lineNumbers`         | `boolean`                    |
| `syntaxHighlight`     | `boolean`                    |
| `header`              | `boolean`                    |
| `softWrap`            | `boolean`                    |
| `mode`                | `string`                     |
| `contextLines`        | `WithDefault<Int32, -2>`     |
| `inlineUnit`          | `string`                     |
| `hunkSeparator`       | `string`                     |
| `changeIndicator`     | `string`                     |
| `changeBackground`    | `WithDefault<boolean, true>` |
| `hoverHighlight`      | `string`                     |
| `decorationsJson`     | `string`                     |
| `markersJson`         | `string`                     |
| `annotationsJson`     | `string`                     |
| `addAnnotationEvents` | `boolean`                    |
| `kitStyle`            | `string`                     |

## Native events

| Name                         | Type                                                      |
| ---------------------------- | --------------------------------------------------------- |
| `onGpuiKitDiffFilesChange`   | `DirectEventHandler< Readonly<{ hasChanges: boolean }> >` |
| `onGpuiKitDiffAddAnnotation` | `DirectEventHandler< Readonly<{ path: string`             |

## Commands

- `nextChange`
- `previousChange`
- `expandUnchanged`
- `collapseUnchanged`

## Coverage

- `Diff::new`: generated, a unified patch shown as a diff, with syntax highlighting from the kit's highlighter
