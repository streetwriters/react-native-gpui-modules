import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type ResizablePanelSpec = Readonly<{
  size: CodegenTypes.Double;
  min: CodegenTypes.Double;
  max: CodegenTypes.Double;
  fixed: boolean;
  visible: boolean;
}>;

export interface NativeProps extends ViewProps {
  vertical?: boolean;
  panels?: ReadonlyArray<ResizablePanelSpec>;
  slots?: string;
  onGpuiKitResizableResize?: CodegenTypes.DirectEventHandler<
    Readonly<{ sizes: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitResizable', {
  interfaceOnly: true,
});
