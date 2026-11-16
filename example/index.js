/**
 * @format
 */

import React from 'react';
import { AppRegistry, View } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

const fixtures = {
  GPUINotificationsFixture: () =>
    require('./src/fixtures/NotificationsFixture').NotificationsFixture,
  GPUISpellcheckFixture: () =>
    require('./src/fixtures/SpellcheckFixture').SpellcheckFixture,
  GPUIWebauthnFixture: () =>
    require('./src/fixtures/WebauthnFixture').WebauthnFixture,
  GPUIImageManipulatorFixture: () =>
    require('./src/fixtures/ImageManipulatorFixture').ImageManipulatorFixture,
  PdfTileFixture: () => require('./src/fixtures/PdfTileFixture').default,
  PdfViewerFixture: () => require('./src/fixtures/PdfViewerFixture').default,
  GPUISystemFixture: () =>
    require('./src/fixtures/SystemFixture').SystemFixture,
  GPUINitroFixture: () =>
    require('./src/fixtures/NitroFixtureScreen').NitroFixtureScreen,
  GPUIUnistylesFixture: () =>
    require('./src/fixtures/unistyles/UnistylesFixtureScreen')
      .UnistylesFixtureScreen,
  GPUIMmkvFixture: () =>
    require('./src/fixtures/MmkvFixtureScreen').MmkvFixtureScreen,
  GPUIAsyncStorageFixture: () =>
    require('./src/fixtures/AsyncStorageFixtureScreen')
      .AsyncStorageFixtureScreen,
  GPUIKeyboardControllerFixture: () =>
    require('./src/fixtures/KeyboardControllerFixtureScreen')
      .KeyboardControllerFixtureScreen,
  GPUISliderFixture: () =>
    require('./src/fixtures/SliderFixtureScreen').SliderFixtureScreen,
  GPUIPickerFixture: () =>
    require('./src/fixtures/PickerFixtureScreen').PickerFixtureScreen,
  GPUILinearGradientFixture: () =>
    require('./src/fixtures/LinearGradientFixtureScreen')
      .LinearGradientFixtureScreen,
  GPUIMaskedViewFixture: () =>
    require('./src/fixtures/MaskedViewFixtureScreen').MaskedViewFixtureScreen,
  GPUILocalizeFixture: () =>
    require('./src/fixtures/LocalizeFixtureScreen').LocalizeFixtureScreen,
  GPUIHapticFeedbackFixture: () =>
    require('./src/fixtures/HapticFeedbackFixtureScreen')
      .HapticFeedbackFixtureScreen,
  GPUIConfigFixture: () =>
    require('./src/fixtures/ConfigFixtureScreen').ConfigFixtureScreen,
  GPUICalendarsFixture: () =>
    require('./src/fixtures/CalendarsFixtureScreen').CalendarsFixtureScreen,
  SystemPanel: () => require('./src/fixtures/SystemFixture').SystemPanel,
  GPUIUpdaterFixture: () =>
    require('./src/fixtures/UpdaterFixture').UpdaterFixture,
  GPUIFileSystemFixture: () =>
    require('./src/fixtures/FileSystemFixture').FileSystemFixture,
  GPUIDownloadFixture: () =>
    require('./src/fixtures/DownloadFixture').DownloadFixture,
  GPUIFontFixture: () => props =>
    React.createElement(require('./src/fixtures/FontFixture').default, {
      ...props,
      fontSource: require('./desktop/assets/fonts/Inter-Regular.ttf'),
    }),
  GPUISvgFixture: () => require('./src/fixtures/SvgFixture').default,
  GPUISvgEdgeFixture: () =>
    require('./src/fixtures/SvgEdgeFixture').SvgEdgeFixture,
  GPUISvgFilterFixture: () =>
    require('./src/fixtures/SvgFilterFixture').SvgFilterFixture,
  CssAnimationsFixture: () => () =>
    React.createElement(
      View,
      { testID: 'css-animations-screen', style: { flex: 1 } },
      React.createElement(
        require('./src/fixtures/CssAnimationsFixture').default,
      ),
    ),
  GestureFixture: () => require('./src/fixtures/GestureFixture').default,
  NativeGestureFixture: () =>
    require('./src/fixtures/NativeGestureFixture').default,
  NativeGestureBasicFixture: () =>
    require('./src/fixtures/NativeGestureBasicFixture').default,
  GestureButtonsFixture: () =>
    require('./src/fixtures/GestureButtonsFixture').default,
  GestureRelationsFixture: () =>
    require('./src/fixtures/GestureRelationsFixture').default,
  ReanimatedDemo: () => require('./src/fixtures/ReanimatedDemo').default,
  NavigationFixture: () => props =>
    React.createElement(
      require('./src/fixtures/navigation/NavigationFixture').default,
      { testMode: true, ...props },
    ),
};
for (const [name, load] of Object.entries(fixtures)) {
  AppRegistry.registerComponent(name, load);
}
