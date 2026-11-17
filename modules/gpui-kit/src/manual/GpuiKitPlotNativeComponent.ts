import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type PlotPoint = Readonly<{
  label: string;
  value: CodegenTypes.Double;
}>;

export type PlotLayerDef = Readonly<{
  /** `grid`, `axis`, `line`, `area`, `dots`, `bar`, `pie`, `donut`, `radar` or `sankey`. */
  kind: string;
  color: CodegenTypes.Int32;
  width: CodegenTypes.Double;
}>;

export type PlotLink = Readonly<{
  source: CodegenTypes.Int32;
  target: CodegenTypes.Int32;
  value: CodegenTypes.Double;
}>;

export interface NativeProps extends ViewProps {
  links?: ReadonlyArray<PlotLink>;
  data?: ReadonlyArray<PlotPoint>;
  layers?: ReadonlyArray<PlotLayerDef>;
  curve?: CodegenTypes.WithDefault<'linear' | 'natural' | 'step', 'linear'>;
}

export default codegenNativeComponent<NativeProps>('GpuiKitPlot', {
  interfaceOnly: true,
}) as never;
