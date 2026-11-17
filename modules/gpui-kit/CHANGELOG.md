# Changelog

All notable changes to `@react-native-gpui/gpui-kit` are listed here. Each version's section becomes the notes of its GitHub release.

## Unreleased

- First version: `Button`, generated from gpui-kit 0.9.1.
- `Input`: a text input on the kit's `InputState`, controlled from JS (`value` with an event counter so fast typing is never overwritten) or uncontrolled (`defaultValue`), with `onChangeText`, `onSubmit`, `onFocus`, `onBlur` and the commands `focus`, `selectAll`, `unselect`, `clean`, `insert`, `replaceAll`.
- `Button` accepts React children; the chrome is native and the children are React views.
- Primitives: `Label`, `Icon`, `Badge`, `Tag`, `Avatar`, `Spinner`, `Skeleton`, `Link`, `Progress`, `ProgressCircle`, `ShimmerText`, `Alert` and `Toggle`, generated from gpui-kit 0.9.1.
- Colour props (`color`, `highlightColor`) and icon props (`icon`, `loadingIcon`, `placeholder`) are mapped: a colour is a React Native `ColorValue`, an icon is one of the kit's icon names (`IconName`).
- Inputs: `Checkbox`, `Radio`, `Switch`, `Rating`, `Textarea`, `NumberInput`, `OtpInput` and `Slider`, with controlled values and the same event counter as `Input`; `Textarea`, `NumberInput`, `OtpInput` and `Slider` run on the kit's state entities.
- `Pagination`, `Clipboard` and `Separator`, generated from gpui-kit 0.9.1.
- Written by hand on the same specification: `Kbd` (the keystroke is parsed from a string and cached), `Marker`, `GroupBox`, `Empty`, `DescriptionList`, `Collapsible` and `Accordion` with React Native views in named slots (a native tree with `NativeSlot`), `AvatarGroup`, `ToggleGroup` and `ButtonGroup` that read the props of their `Avatar`, `Toggle` and `Button` children, `Breadcrumb`, `Stepper`, and `DropdownButton` whose menu is built from an `items` array.
- Mixed views: kit views sit next to, inside and around React Native views, nested to any depth, through `Button` children and the slots above; every generated component also runs as an element of a `NativeRoot`.
- `Button` has `focusable` and a `focus()` method on its ref, backed by a `FocusHandle` that is a tab stop.
- Tooltip props (`tooltip`, `tooltipShowDelay`) on `Checkbox`, `Radio`, `Switch`, `Toggle` and `Clipboard`.
- `tools/gpui-kit-gen/COVERAGE.md` lists every method of the wrapped components with what became of it, and the components of the kit that are not wrapped yet with the reason.
- `Dialog`, `AlertDialog`, `Sheet` and `Notification` on the window root: the module registers gpui-kit's `Root` as the window root, with React Native views in their title, body and footer slots (rebuilt on every frame through core's `child_renderers`).
- Slot components (`GroupBox`, `Empty`, `DescriptionList`, `Marker`, `Collapsible`, `Accordion`) are as high as their content when `style` has no height.
- The kit's transitions follow the test driver's `setAnimationsEnabled(false)`, and `Collapsible` animates its reveal.
- Needs the core changes listed in core's `## Unreleased`: `NativeRoot` sized by its content, `child_renderers()` and a public `animations_disabled()`.
- Popups: `Popover`, `HoverCard`, `Tooltip` (with React Native content), `DropdownMenu`, `ContextMenu`, `PopupMenu` and `Command`. Content is built through core's `child_renderers`, and a trigger of React Native content opens its popup from a press.
- Data: `Select`, `Combobox`, `Table` (cells as React Native content), `List` (rows as React Native content), `Tree`, `Calendar`, `DatePicker`, `TimeField` and `ColorPicker`.
- Layout: `Tabs` (the kit's tab bar with the panel of the selected tab), `Sidebar`, `Carousel`, `Resizable`, `Toolbar`, `StatusBar`, `Form`, `InputGroup`, `Chart` (line, area, bar and pie) and `Theme` (switches the kit theme and follows the app colour scheme).
- Needs the core codegen fix for the default of a prop in a native tree.
- Chat: `Message`, `Bubble`, `Attachment` and `MessageScroller` (rows as React Native views, `scrollToEnd` and `scrollToItem`). Content: `TextView` (markdown and HTML), `ScrollArea`, `Editor` and `Diff`. Window: `TitleBar`, `WindowBorder` and `GridLayout`. `Chart` also draws candlestick, radar and sankey charts.
- Icons draw: the module registers the kit's icon assets with core's `register_asset_source`. `Icon` takes a `color`, and `Avatar` and `AvatarGroup` items take a `src` (a web address or a file path).
- Text components (`Button`, `Label`, `Tag`, `Link`, `ShimmerText`, `Checkbox`, `Radio`, `Switch`, `Toggle`) are measured with core's `measure_text` instead of estimated.
- Reveal animations and tooltip delays run on frames, which a window that is not shown never gets; their specs launch a shown window with animations enabled.
- The component pages are in `docs/` of the package.
- `Dock` (panels in tab groups of a center and docks, with React Native content), `VirtualList`, `SearchableList`, `Settings`, `Questionnaire`, `Plot` (the plot primitives composed by layer), `Speech`, `History` and `Inspector`. Every component of the kit is wrapped.
- `Rating` events carry `value` instead of `page`.
- `Button` and `ButtonContainer` with a `tooltip` no longer crash: the kit's tooltip owns the element's hover handler, so `onHoverChange` is not sent while a `tooltip` is set.
- Coverage: 125 of the 157 skipped items are mapped (32 remain, each with the reason it has no meaning in React Native). New props and commands:
  - `accessibilityRoleOverride` (the kit's `RoleOverride`: `implicit`, `presentational` or a role name), `tabOrder` (`tab_index`), `focusRing` and `Button` `customColor` with `customForeground`, `customHover`, `customActive` and `customShadow`.
  - `Button` `tooltipAction` and `Kbd` `action`: a registered action name (built with `App::build_action`), shown with its keybinding; `Kbd` `actionScope` picks the global, focused or context binding.
  - `Input` and `NumberInput` `prefix` and `suffix` slots of React Native content; `Input` and `Textarea` `contextMenu` items (a label and an action name), `onPaste`, `onTokenClick`, `onTokenHover` and the `insertToken` command.
  - Input state: `textAlign`, `contextMenuEnabled`, `maskPattern`, `pattern`, `min`, `max`, `step`, `tabSize` with `hardTabs`, `scrollBeyondLastLine`, `cursorSurroundingLines` and `foldBackground`, and the commands `setCursorPosition`, `setScrollOffset`, `setSelectedRange`, `setSelectedRangeWithDirection`, `setSearchQuery` and `Textarea` `setAutoGrow`.
  - `Label` `highlights`, `Icon` `path`, `svg`, `rotate` and `scale`, `Tag` `radius`, `Spinner` `easing`, `ShimmerText` `spread` and `spreadPixels`.
  - Style refinements from a `KitStyle` object: `GroupBox` `titleStyle` and `contentStyle`, `Accordion` `titleStyle`, `contentStyle` and `itemHoverStyle`, `Breadcrumb` item `style` and `Marker` `separatorStyle`; `Marker` also has the shimmer props and `accessibilityRoleOverride`.
  - `DropdownButton` items take `children` (a submenu), `action` and `content` (React Native content drawn as the item).
  - `Plot` layers `bar`, `pie`, `donut`, `radar` and `sankey` (with `links`).
- Optional state values (`min`, `max`, `step`, ...) are unset when the prop is `undefined`, instead of being skipped.
- Every generated component has its own e2e spec (`gpui-kit-c-*.e2e.ts`) on its generated tester screen, which now also has a button per command.
- `tools/gpui-kit-gen/reference` is a plain GPUI app that draws the cases of `example/src/fixtures/gpuiKitParityCases.json` with gpui-kit directly; `gpui-kit-parity.e2e.ts` compares the React Native drawing and interactions of each case with it.
