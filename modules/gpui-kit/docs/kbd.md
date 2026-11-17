---
id: gpui-kit-kbd
title: Kbd
---

The kit's `Kbd`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name            | Type                                                 |
| --------------- | ---------------------------------------------------- |
| `keystroke`     | `string`                                             |
| `appearance`    | `WithDefault<boolean, true>`                         |
| `outline`       | `boolean`                                            |
| `action`        | `string`                                             |
| `actionContext` | `string`                                             |
| `actionScope`   | `WithDefault<'any' \| 'global' \| 'focused', 'any'>` |

## Coverage

- `Kbd::new`: generated (keystroke), Keystroke::parse takes a 'static string, so the source is interned in a small cache and parsed once
- `Kbd::appearance`: generated (appearance)
- `Kbd::outline`: generated (outline)
- `Kbd::binding_for_action`: generated (action), action with actionContext (actionScope any): a registered action name built with App::build_action
- `Kbd::binding_for_action_in`: generated (actionScope), actionScope focused: the binding that applies at the window focus
- `Kbd::global_binding_for_action`: generated (actionScope), actionScope global
- `Kbd::format`: skipped, a free function from a Keystroke to a string; it renders nothing, and Kbd shows the same text
- `Kbd::from(Keystroke)`: aliased (keystroke), covered by the keystroke prop
