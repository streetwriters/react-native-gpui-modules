import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

export interface NitroFixtureViewProps extends HybridViewProps {
  color: string;
  label: string;
}

export interface NitroFixtureViewMethods extends HybridViewMethods {
  getAppliedColor(): string;
  getUpdateCount(): number;
  isNativeViewCreated(): boolean;
}

export type NitroFixtureView = HybridView<
  NitroFixtureViewProps,
  NitroFixtureViewMethods,
  { ios: 'swift'; android: 'kotlin' }
>;
