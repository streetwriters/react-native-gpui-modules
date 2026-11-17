import { codegenNativeComponent, type ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  patch?: string;
  lineNumbers?: boolean;
  syntaxHighlight?: boolean;
  header?: boolean;
  softWrap?: boolean;
}

export default codegenNativeComponent<NativeProps>('GpuiKitDiff', {
  interfaceOnly: true,
});
