module.exports = {
  dependency: {
    platforms: {
      desktop: {
        crate: 'rn-gpui-webview',
        cmake: 'desktop',
        cppProvider: 'create_web_view_module',
        hostComponents: [{ name: 'RNCWebView', nativeSurface: true }],
        sourceOverrides: {
          'react-native-webview/src/WebView.tsx': './src/WebView.desktop.js',
        },
      },
    },
  },
};
