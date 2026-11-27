const { fixupConfigRules } = require('@eslint/compat');
const reactNativeConfig = require('@react-native/eslint-config/flat');

module.exports = [
  {
    ignores: [
      '**/node_modules/',
      '**/target/',
      '**/build/',
      '.local/',
      'example/desktop/autolink/',
      'example/android/',
      'example/ios/',
      'gpui-kit-example/desktop/autolink/',
      'modules/*/desktop/patches/',
      'modules/gpui-kit/src/generated/',
    ],
  },
  ...fixupConfigRules(reactNativeConfig),
  {
    files: [
      '**/.prettierrc.js',
      '**/.eslintrc.js',
      'example/index.js',
      'gpui-kit-example/index.js',
      '**/*.mjs',
      '**/*.cjs',
      '**/*.config.js',
      '**/react-native.config.js',
      'modules/*/desktop/**/*.js',
      'modules/*/src/**/*.js',
    ],
    languageOptions: {
      sourceType: 'module',
      parserOptions: { requireConfigFile: false },
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'writable',
      },
    },
  },
  {
    files: [
      'example/**/*.{ts,tsx,js}',
      'gpui-kit-example/**/*.{ts,tsx,js}',
      'modules/gpui-kit/src/manual/**',
    ],
    rules: { 'react-native/no-inline-styles': 'off' },
  },
];
