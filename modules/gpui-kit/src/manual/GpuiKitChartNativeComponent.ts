import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type ChartPoint = Readonly<{
  label: string;
  value: CodegenTypes.Double;
  open: CodegenTypes.Double;
  high: CodegenTypes.Double;
  low: CodegenTypes.Double;
  close: CodegenTypes.Double;
}>;

export type ChartLink = Readonly<{
  source: CodegenTypes.Int32;
  target: CodegenTypes.Int32;
  value: CodegenTypes.Double;
}>;

export interface NativeProps extends ViewProps {
  kind?: CodegenTypes.WithDefault<
    | 'unset'
    | 'line'
    | 'area'
    | 'bar'
    | 'pie'
    | 'candlestick'
    | 'radar'
    | 'sankey',
    'unset'
  >;
  data?: ReadonlyArray<ChartPoint>;
  nodes?: ReadonlyArray<string>;
  links?: ReadonlyArray<ChartLink>;
  color?: CodegenTypes.Int32;
  grid?: boolean;
  xAxis?: boolean;
  yAxis?: boolean;
  dots?: boolean;
  smooth?: boolean;
  innerRadius?: CodegenTypes.Double;
  outerRadius?: CodegenTypes.Double;
}

export default codegenNativeComponent<NativeProps>('GpuiKitChart', {
  interfaceOnly: true,
});
