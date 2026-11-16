module.exports = {
  dependency: {
    platforms: {
      desktop: {
        crate: 'rn-gpui-linear-gradient',
        hostComponents: [{ name: 'BVLinearGradient', container: true }],
        sourceOverrides: {
          'react-native-linear-gradient/index.js':
            './src/LinearGradient.desktop.js',
        },
      },
    },
  },
};
