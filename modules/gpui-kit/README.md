# @react-native-gpui/gpui-kit

Adapter for [GPUI Kit](https://github.com/longbridge/gpui-component) (`gpui-kit` on crates.io, Apache-2.0): its components, drawn natively by the kit, as React Native components on desktop.

## About

This package wraps [GPUI Kit](https://gpui-kit.com) 0.9 by Longbridge, a component library for GPUI ([repository](https://github.com/longbridge/gpui-component)). The kit is a Rust crate, so nothing is installed next to this package; it builds the kit from source and uses the crates from crates.io unchanged. GPUI Kit is licensed under the Apache License 2.0.

Versions follow gpui-kit's `<major>.<minor>`: `0.9.x` wraps gpui-kit `0.9.1`.

## Usage

```tsx
import { Button, GroupBox, Checkbox } from '@react-native-gpui/gpui-kit';

<Button label="Save" variant="primary" onPress={() => save()} />;

<GroupBox
  variant="outline"
  style={{ width: 360, height: 180 }}
  title={<Text>Any React Native view</Text>}
  footer={<Button label="Done" onPress={done} />}
>
  <Checkbox label="A kit view inside a kit view" />
  <Text>A React Native view</Text>
</GroupBox>;
```

## Components

Generated from the kit's rustdoc (`tools/gpui-kit-gen`): `Button`, `Input`, `Label`, `Icon`, `Badge`, `Tag`, `Avatar`, `Spinner`, `Skeleton`, `Link`, `Progress`, `ProgressCircle`, `Toggle`, `Alert`, `ShimmerText`, `Checkbox`, `Radio`, `Switch`, `Rating`, `Textarea`, `NumberInput`, `OtpInput`, `Slider`, `Pagination`, `Clipboard` and `Separator`.

Written by hand on the same specification: `Kbd`, `Marker`, `GroupBox`, `Empty`, `DescriptionList`, `Collapsible`, `Accordion`, `Dialog`, `AlertDialog`, `Sheet`, `Notification`, `AvatarGroup`, `ToggleGroup`, `ButtonGroup`, `Breadcrumb`, `Stepper`, `DropdownButton`, `Popover`, `HoverCard`, `Tooltip`, `DropdownMenu`, `ContextMenu`, `PopupMenu`, `Command`, `Select`, `Combobox`, `Table`, `List`, `Tree`, `Calendar`, `DatePicker`, `TimeField`, `ColorPicker`, `Tabs`, `Sidebar`, `Carousel`, `Resizable`, `Toolbar`, `StatusBar`, `Form`, `InputGroup`, `Chart` and `Theme`, `Message`, `Bubble`, `Attachment`, `MessageScroller`, `TextView`, `ScrollArea`, `Editor`, `Diff`, `TitleBar`, `WindowBorder`, `GridLayout`, `Chart`, `Dock`, `VirtualList`, `SearchableList`, `Settings`, `Questionnaire`, `Plot`, `Speech`, `History`, `Inspector`, `SidebarToggle` and `ThemeRegistry`.

Each component's props, events and what was left out, with the reason, are in [`docs`](docs) and in `tools/gpui-kit-gen/COVERAGE.md`. Every component of the kit is wrapped.

### Actions, roles and style refinements

- A prop that takes a kit action (`Button` `tooltipAction`, `Kbd` `action`, `DropdownButton` item `action`, `Input` `contextMenu` items) takes the name an action is registered under, such as `input::SelectAll`; the module builds it with `App::build_action`, so the kit shows its keybinding and dispatches it.
- `accessibilityRoleOverride` takes `implicit`, `presentational` or an ARIA role name (`button`, `checkbox`, `menuitem`, ...).
- A `*Style` prop of a kit part (`GroupBox` `titleStyle`, `Accordion` `itemHoverStyle`, ...) takes a `KitStyle`: background, text and border colors, border width and radius, padding, font size and weight, and opacity.

### Sizes

A kit view is drawn by the kit, inside a box that React Native lays out. Components with text (`Button`, `Checkbox`, `Tag`, ...) measure it with core's `measure_text`, per size, like the kit. Components built as a native tree (`GroupBox`, `Stepper`, `Menu`s, `Command`, `Message`, ...) are as high as their content when `style` has no height, and the ones that size to their content (`Calendar`, `DropdownButton`, `Attachment`, ...) are as wide as it when `style` has no width, shrinking to the kit's minimum width when their row has less room. A `style` with a size always wins.

## Mixed views

Kit views and React Native views mix freely:

- **Next to each other:** a kit view is a normal React Native component, so it sits in any `View` next to `Text`, `Pressable` and the rest.
- **React Native views inside a kit view:** `Button` takes React children and draws only its chrome around them. `GroupBox`, `Empty`, `DescriptionList`, `Marker`, `Collapsible` and `Accordion` render a native tree (core's `NativeRoot`) and put React Native views in named slots: `title`, `body` and `footer` of a `GroupBox`, `media`, `title`, `description` and the content of an `Empty`, an item's `value` in a `DescriptionList`, the `icon` and the content of a `Marker`. A slot is a `NativeSlot`, so the views in it keep their context, take presses and focus, scroll, and are laid out by the kit component.
- **Kit views inside React Native views:** any kit view can be a child of a `View`, a `ScrollView` or a list item.
- **Nested:** a slot can hold a kit view that has slots of its own (`GroupBox` in `GroupBox`), a `Button` with React children, or a `DescriptionList` whose value is a `Button`.
- **Groups:** `ButtonGroup`, `ToggleGroup` and `AvatarGroup` take `Button`, `Toggle` and `Avatar` elements as children. Their props are read into the native group, and each element's own `onPress` or `onChange` is called when the group reports it.

The generated components also run inside a `NativeRoot` of your own, where kit components nest as native elements.

## Focus

`Button` is a tab stop with `tabStop` and takes the keyboard focus programmatically with `focusable` and the `focus()` method of its ref, which tracks a `FocusHandle` that is a tab stop of the window. `Input`, `Textarea`, `NumberInput` and `OtpInput` have a `focus` command and `onFocus` and `onBlur` events.

## Validation

`Input`, `Textarea`, `NumberInput` and `Questionnaire` questions take `validation`, a set of rules (`required`, `minLength`, `maxLength`, `pattern`, `min`, `max`) with a `message`. The kit asks its validator synchronously on every edit or answer, so the rules are checked in Rust; an `Input` reports a rejected edit with `onValidationFail`. A JavaScript validator is not offered: core has no way for a host component to call JavaScript synchronously on the UI thread (JavaScript runs on its own thread and events reach it asynchronously), and the worklets UI runtime belongs to the `react-native-worklets` adapter, which exposes no entry point for a Rust host component to run a worklet.

## Overlays

`Dialog`, `AlertDialog`, `Sheet` and `Notification` are shown on gpui-kit's `Root`, which this module registers as the window root, and are driven by an `open` prop. Their React Native content is rebuilt on every frame, so it keeps its state and events. `Popover`, `HoverCard`, `Tooltip`, `DropdownMenu`, `ContextMenu`, `PopupMenu` and `Command` are anchored popups; give a popup's content a `width`.

`DropdownButton` builds its menu from an `items` array, drives the kit's popup menu, and reports the chosen index through `onSelect` and the item's `onSelect`. Tooltips are string props (`tooltip`, `tooltipPlacement`, `tooltipShowDelay`) on the components that have them.

## Gallery

[`gpui-kit-example`](../../gpui-kit-example) is the module's gallery app: the stories of gpui-component's own gallery, rebuilt with this module, in the same order and under the same titles, so the two galleries can be compared page by page. Run it from the repository root:

```sh
npm install
cd gpui-kit-example
npx react-native run-desktop
```

Its README describes the parity tests, which compare each story with the official story drawn by `tools/gpui-kit-gen/reference`.

## Development

- `tools/gpui-kit-gen` generates everything under `src/generated`, `desktop/src/generated` and `docs` from the rustdoc JSON of the gpui-kit 0.9.1 crates, which this module depends on unchanged. See its README.
- A native prop must not be named like a style key or a view prop (`width`, `maxWidth`, `marginTop`, `draggable`, ...): Fabric flattens `style` into the props, so such a prop is also read as the view's style. The generator refuses these names.
- `src/manual` and `desktop/src/manual` hold the components that the generator cannot derive (element slots, item groups, an overlay, a keystroke parsed from a string); they are listed in `tools/gpui-kit-gen/manual.json` so that coverage and registration stay in one place.
- The kit builds on core's GPUI through gpui-fast's `gpui-pre-*` compatibility crates; autolink writes the `[patch.crates-io]` entries.
- Every app and tool in the repository builds into one Cargo target directory, `target/` at the repository root (set in the root `.cargo/config.toml`), so the core runtime and the kit are compiled once. App binaries are `target/debug/<app>`, such as `target/debug/gpui-kit-example` and `target/debug/gpui-kit-reference`.

## Licence

MIT for this package. gpui-kit is Apache-2.0 and Lucide icons are ISC; see the notices shipped with the crates.
