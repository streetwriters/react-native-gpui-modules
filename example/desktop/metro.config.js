const path = require('path');
const { makeMetroConfig } = require('@react-native-gpui/core/metro.config');
const withPdfRuntime = require('@react-native-gpui/pdf/metro.cjs');

module.exports = withPdfRuntime(
  makeMetroConfig({
    projectRoot: path.resolve(__dirname, '..'),
  }),
);
