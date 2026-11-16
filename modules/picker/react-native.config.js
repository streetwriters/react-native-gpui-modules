module.exports = {
  dependency: {
    platforms: {
      desktop: {
        crate: 'rn-gpui-picker',
        hostComponents: [{ name: 'RNCPicker' }],
        sourceOverrides: {
          '@react-native-picker/picker/js/Picker.js': './src/Picker.desktop.js',
        },
      },
    },
  },
};
