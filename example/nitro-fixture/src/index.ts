import { NitroModules, getHostComponent } from 'react-native-nitro-modules';
import type { NitroFixture as NitroFixtureSpec } from './specs/NitroFixture.nitro';
import type {
  NitroFixtureViewMethods,
  NitroFixtureViewProps,
} from './specs/NitroFixtureView.nitro';
import NitroFixtureViewConfig from '../nitrogen/generated/shared/json/NitroFixtureViewConfig.json';

export type { NitroFixtureSpec as NitroFixtureType };
export type { NitroFixtureViewMethods, NitroFixtureViewProps };

export const NitroFixture =
  NitroModules.createHybridObject<NitroFixtureSpec>('NitroFixture');

export const NitroFixtureView = getHostComponent<
  NitroFixtureViewProps,
  NitroFixtureViewMethods
>('NitroFixtureView', () => NitroFixtureViewConfig);
