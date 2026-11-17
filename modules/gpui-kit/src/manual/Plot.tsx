import React from 'react';
import { processColor, type StyleProp, type ViewStyle } from 'react-native';
import PlotNative from './GpuiKitPlotNativeComponent';

export type PlotLayerKind =
  | 'grid'
  | 'axis'
  | 'line'
  | 'area'
  | 'dots'
  | 'bar'
  | 'pie'
  | 'donut'
  | 'radar'
  | 'sankey';

export type PlotLayer =
  | PlotLayerKind
  | {
      kind: PlotLayerKind;
      color?: string;
      /** Stroke width in points. */
      width?: number;
    };

export interface PlotPoint {
  label: string;
  value: number;
}

export interface PlotLink {
  source: number;
  target: number;
  value: number;
}

export interface PlotProps {
  data: PlotPoint[];
  /** The primitives to draw, back to front. */
  layers?: PlotLayer[];
  curve?: 'linear' | 'natural' | 'step';
  /** Flows between points by index, for the sankey layer. */
  links?: PlotLink[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The kit's plot primitives, composed by hand: a point scale and a linear
 * scale with grid lines, an axis, a line, an area and dots drawn over them;
 * bars on a band scale; pie and donut arcs; a closed radial line (radar); and
 * a sankey layout of the points as nodes with `links` between them.
 */
export function Plot({
  data,
  layers = ['grid', 'axis', 'line'],
  curve,
  links = [],
  style,
  testID,
}: PlotProps) {
  const Native = PlotNative as React.ComponentType<Record<string, unknown>>;
  return (
    <Native
      testID={testID}
      style={[{ width: 320, height: 200 }, style]}
      data={data}
      links={links}
      curve={curve ?? 'linear'}
      layers={layers.map(layer => {
        const { kind, color, width } =
          typeof layer === 'string'
            ? { kind: layer, color: undefined, width: undefined }
            : layer;
        return {
          kind,
          color: color ? (processColor(color) as number) : 0,
          width: width ?? 0,
        };
      })}
    />
  );
}
