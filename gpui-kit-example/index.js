import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

// Screens the e2e specs open on their own, by `RN_GPUI_MODULE`.
const fixtures = {
  GPUIKitChartsFixture: () =>
    require('./src/fixtures/GpuiKitChartsFixture').GpuiKitChartsFixture,
  GPUIKitComponentFixture: () =>
    require('./src/fixtures/GpuiKitComponentFixture').GpuiKitComponentFixture,
  GPUIKitContentFixture: () =>
    require('./src/fixtures/GpuiKitContentFixture').GpuiKitContentFixture,
  GPUIKitCoverageFixture: () =>
    require('./src/fixtures/GpuiKitCoverageFixture').GpuiKitCoverageFixture,
  GPUIKitDataFixture: () =>
    require('./src/fixtures/GpuiKitDataFixture').GpuiKitDataFixture,
  GPUIKitGapsFixture: () =>
    require('./src/fixtures/GpuiKitGapsFixture').GpuiKitGapsFixture,
  GPUIKitGroupsFixture: () =>
    require('./src/fixtures/GpuiKitGroupsFixture').GpuiKitGroupsFixture,
  GPUIKitInputsFixture: () =>
    require('./src/fixtures/GpuiKitInputsFixture').GpuiKitInputsFixture,
  GPUIKitLayoutFixture: () =>
    require('./src/fixtures/GpuiKitLayoutFixture').GpuiKitLayoutFixture,
  GPUIKitMixedFixture: () =>
    require('./src/fixtures/GpuiKitMixedFixture').GpuiKitMixedFixture,
  GPUIKitMoreFixture: () =>
    require('./src/fixtures/GpuiKitMoreFixture').GpuiKitMoreFixture,
  GPUIKitOverlaysFixture: () =>
    require('./src/fixtures/GpuiKitOverlaysFixture').GpuiKitOverlaysFixture,
  GPUIKitPanelsFixture: () =>
    require('./src/fixtures/GpuiKitPanelsFixture').GpuiKitPanelsFixture,
  GPUIKitParityFixture: () =>
    require('./src/fixtures/GpuiKitParityFixture').GpuiKitParityFixture,
  GPUIKitPrimitivesFixture: () =>
    require('./src/fixtures/GpuiKitPrimitivesFixture').GpuiKitPrimitivesFixture,
  GPUIKitSettingsFixture: () =>
    require('./src/fixtures/GpuiKitSettingsFixture').GpuiKitSettingsFixture,
  GPUIKitSlotsFixture: () =>
    require('./src/fixtures/GpuiKitSlotsFixture').GpuiKitSlotsFixture,
  GPUIKitStoryFixture: () =>
    require('./src/fixtures/GpuiKitStoryFixture').GpuiKitStoryFixture,
  GPUIKitToolsFixture: () =>
    require('./src/fixtures/GpuiKitToolsFixture').GpuiKitToolsFixture,
  GPUIKitChecksFixture: () => require('./src/KitChecks').KitChecksFixture,
};
for (const [name, load] of Object.entries(fixtures)) {
  AppRegistry.registerComponent(name, load);
}
