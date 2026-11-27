---
id: gpui-kit-theme-registry
title: ThemeRegistry
---

The kit's `ThemeRegistry`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name       | Type     |
| ---------- | -------- |
| `selected` | `string` |

## Native events

| Name                           | Type                                               |
| ------------------------------ | -------------------------------------------------- |
| `onGpuiKitThemeRegistryChange` | `DirectEventHandler< Readonly<{ json: string }> >` |

## Commands

- `apply`

## Coverage

- `ThemeRegistry::sorted_themes`: generated (onChange), the themes, with their mode
- `Theme::theme_name`: generated (onChange), the active theme
- `Theme::apply_config`: generated (apply()), command; also how a theme's colors are resolved over the default of its mode
- `ThemeRegistry::default_light_theme`: generated (onChange), the isolated colors a viewer draws with
- `ThemeRegistry::default_dark_theme`: generated (onChange), the isolated colors a viewer draws with
