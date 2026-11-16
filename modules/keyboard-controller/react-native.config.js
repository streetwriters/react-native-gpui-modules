module.exports = {
  dependency: {
    platforms: {
      desktop: {
        crate: 'rn-gpui-keyboard-controller',
        hostComponents: [
          { name: 'KeyboardControllerView', container: true },
          { name: 'OverKeyboardView', container: true },
          { name: 'KeyboardBackgroundView', container: true },
          { name: 'ClippingScrollViewDecoratorView', container: true },
          { name: 'KeyboardToolbarGroupView', container: true },
        ],
        sourceOverrides: {
          'react-native-keyboard-controller/src/specs/NativeKeyboardController.ts':
            './src/NativeKeyboardController.desktop.js',
        },
      },
    },
  },
};
