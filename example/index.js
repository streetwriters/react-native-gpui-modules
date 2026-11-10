/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

const fixtures = {
  GPUINotificationsFixture: () => require('./src/fixtures/NotificationsFixture').NotificationsFixture,
  GPUISpellcheckFixture: () => require('./src/fixtures/SpellcheckFixture').SpellcheckFixture,
  GPUIWebauthnFixture: () => require('./src/fixtures/WebauthnFixture').WebauthnFixture,
  GPUIImageManipulatorFixture: () => require('./src/fixtures/ImageManipulatorFixture').ImageManipulatorFixture,
  PdfTileFixture: () => require('./src/fixtures/PdfTileFixture').default,
  PdfViewerFixture: () => require('./src/fixtures/PdfViewerFixture').default,
};
for (const [name, load] of Object.entries(fixtures)) {
  AppRegistry.registerComponent(name, load);
}

const fsFixtures = {
  GPUISystemFixture: () => require('./src/fixtures/SystemFixture').SystemFixture,
  GPUIUpdaterFixture: () => require('./src/fixtures/UpdaterFixture').UpdaterFixture,
};
for (const [name, load] of Object.entries(fsFixtures)) {
  AppRegistry.registerComponent(name, () => {
    try {
      return load();
    } catch {
      return () => null;
    }
  });
}
