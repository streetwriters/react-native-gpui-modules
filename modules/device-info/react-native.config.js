module.exports = {
  dependency: {
    platforms: {
      desktop: {
        crate: 'rn-gpui-device-info',
        // Metro: replace these files of the installed package for desktop.
        sourceOverrides: {
          'react-native-device-info/src/internal/nativeInterface.ts':
            './src/nativeInterface.desktop.ts',
          'react-native-device-info/src/internal/supported-platform-info.ts':
            './src/supported-platform-info.desktop.ts',
        },
      },
    },
  },
};
