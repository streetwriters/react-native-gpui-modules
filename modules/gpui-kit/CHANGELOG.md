# Changelog

All notable changes to `@react-native-gpui/gpui-kit` are listed here. Each version's section becomes the notes of its GitHub release.

## Unreleased

- First version: `Button`, generated from gpui-kit 0.9.1.
- `Input`: a text input on the kit's `InputState`, controlled from JS (`value` with an event counter so fast typing is never overwritten) or uncontrolled (`defaultValue`), with `onChangeText`, `onSubmit`, `onFocus`, `onBlur` and the commands `focus`, `selectAll`, `unselect`, `clean`, `insert`, `replaceAll`.
- `Button` accepts React children; the chrome is native and the children are React views.
- Primitives: `Label`, `Icon`, `Badge`, `Tag`, `Avatar`, `Spinner`, `Skeleton`, `Link`, `Progress`, `ProgressCircle`, `ShimmerText`, `Alert` and `Toggle`, generated from gpui-kit 0.9.1.
- Colour props (`color`, `highlightColor`) and icon props (`icon`, `loadingIcon`, `placeholder`) are mapped: a colour is a React Native `ColorValue`, an icon is one of the kit's icon names (`IconName`).
