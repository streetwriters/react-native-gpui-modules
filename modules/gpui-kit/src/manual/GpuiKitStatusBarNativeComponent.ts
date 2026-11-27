import { codegenNativeComponent, type ViewProps } from 'react-native';

export type StatusBarPart = Readonly<{
  /** `left`, `center` or `right`. */
  region: string;
  /** Plain text in the bar's own type; empty for the slot of the same index. */
  text: string;
}>;

export interface NativeProps extends ViewProps {
  parts?: ReadonlyArray<StatusBarPart>;
  kitStyle?: string;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitStatusBar', {
  interfaceOnly: true,
});
