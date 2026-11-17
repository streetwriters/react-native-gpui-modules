import React from 'react';
import { processColor, type ColorValue, type ViewProps } from 'react-native';
import Native from './GpuiKitChartNativeComponent';

export interface ChartPoint {
  label: string;
  value?: number;
  /** Candlestick values. */
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export interface ChartLink {
  /** The index in `nodes`. */
  source: number;
  target: number;
  value: number;
}

export interface ChartProps extends ViewProps {
  kind?: 'line' | 'area' | 'bar' | 'pie' | 'candlestick' | 'radar' | 'sankey';
  /** The node names of a sankey chart. */
  nodes?: string[];
  links?: ChartLink[];
  data?: ChartPoint[];
  color?: ColorValue;
  grid?: boolean;
  xAxis?: boolean;
  yAxis?: boolean;
  /** Dots on a line chart. */
  dots?: boolean;
  /** A smooth curve instead of straight segments. */
  smooth?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function Chart({
  kind = 'line',
  data = [],
  nodes,
  links,
  color,
  grid,
  xAxis,
  yAxis,
  style,
  ...rest
}: ChartProps) {
  return (
    <Native
      {...rest}
      style={[{ width: 320, height: 200 }, style]}
      kind={kind}
      data={data.map(point => ({
        label: point.label,
        value: point.value ?? 0,
        open: point.open ?? 0,
        high: point.high ?? 0,
        low: point.low ?? 0,
        close: point.close ?? 0,
      }))}
      nodes={nodes}
      links={links}
      color={color === undefined ? undefined : (processColor(color) as number)}
      grid={grid ?? true}
      xAxis={xAxis ?? true}
      yAxis={yAxis ?? false}
    />
  );
}
