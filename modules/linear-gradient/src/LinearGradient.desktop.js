import React, { Component } from 'react';
import { processColor } from 'react-native';
import NativeLinearGradient from './BVLinearGradientNativeComponent';

const toPoint = (name, point) => {
  if (Array.isArray(point)) {
    console.warn(
      `LinearGradient '${name}' property should be an object with fields 'x' and 'y', Array type is deprecated.`,
    );
    return { x: point[0], y: point[1] };
  }
  return point;
};

export class LinearGradient extends Component {
  static defaultProps = {
    start: { x: 0.5, y: 0.0 },
    end: { x: 0.5, y: 1.0 },
  };

  render() {
    const {
      children,
      start,
      end,
      colors,
      locations,
      useAngle,
      angleCenter,
      angle,
      ...otherProps
    } = this.props;
    if (colors && locations && colors.length !== locations.length) {
      console.warn(
        'LinearGradient colors and locations props should be arrays of the same length',
      );
    }

    return React.createElement(
      NativeLinearGradient,
      {
        ...otherProps,
        start: toPoint('start', start),
        end: toPoint('end', end),
        colors: colors.map(color => processColor(color)),
        locations: locations ? locations.slice(0, colors.length) : undefined,
        useAngle,
        angleCenter: toPoint('angleCenter', angleCenter),
        angle,
      },
      children,
    );
  }
}

export default LinearGradient;
