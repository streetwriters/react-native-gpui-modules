module.exports = {
  dependency: {
    platforms: {
      desktop: {
        hostComponents: [{ name: 'RNCMaskedView', maskChildren: true }],
        sourceOverrides: {
          '@react-native-masked-view/masked-view/js/MaskedView.js':
            './src/MaskedView.desktop.js',
        },
      },
    },
  },
};
