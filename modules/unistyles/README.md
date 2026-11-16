# @react-native-gpui/unistyles

Adapter for [`react-native-unistyles`](https://github.com/jpudysz/react-native-unistyles) (MIT): themes, breakpoints, media queries and runtime values on the desktop renderer.

Part of [react-native-gpui](https://github.com/streetwriters/react-native-gpui), React Native for macOS, Windows and Linux.

## Install

Install it next to `react-native-unistyles` and the Nitro adapter it builds on:

```sh
npm install react-native-unistyles@3.8.x react-native-nitro-modules@0.37.x @react-native-gpui/nitro-modules @react-native-gpui/unistyles
```

Keep using `react-native-unistyles` as you do on iOS and Android; its JavaScript API is unchanged. Autolinking builds the desktop side when the app is built.

Add Unistyles' Babel plugin to `babel.config.js`, exactly as its documentation says:

```js
module.exports = {
  plugins: [['react-native-unistyles/plugin', { root: 'src' }]],
};
```

Unistyles' C++ updates styles on the shadow tree directly, so the plugin is what lets a style change without a React render.

## Supported

StyleSheet with themes, adaptive themes (the system color scheme and `Appearance.setColorScheme`), breakpoints, media queries, variants and dynamic functions; the `UnistylesRuntime` values (color scheme, theme, breakpoint, screen size, pixel ratio, font scale, content size category, insets, right to left, orientation); `useUnistyles` and `withUnistyles`; style updates through the shadow tree.

Screen dimensions and breakpoints follow the window, so resizing it updates styles.

## Not supported

These are no-ops on desktop: the status bar, the navigation bar, immersive mode, the root view background color and the IME insets.

## Documentation

[Supported libraries](https://streetwriters.github.io/react-native-gpui/docs/supported-libraries)

## License

MIT. See [LICENSE](LICENSE). `react-native-unistyles` is MIT, copyright Jacek Pudysz.
