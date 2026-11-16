import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';
import type { CodegenTypes } from 'react-native';

export type Point = Readonly<{
  x: CodegenTypes.Double;
  y: CodegenTypes.Double;
}>;

export interface NativeProps extends ViewProps {
  start?: Point;
  end?: Point;
  colors: ReadonlyArray<CodegenTypes.Double>;
  locations?: ReadonlyArray<CodegenTypes.Double>;
  useAngle?: CodegenTypes.WithDefault<boolean, false>;
  angleCenter?: Point;
  angle?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;
}

export default codegenNativeComponent<NativeProps>('BVLinearGradient', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
