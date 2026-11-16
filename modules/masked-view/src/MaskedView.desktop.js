import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import RNCMaskedView from './RNCMaskedViewNativeComponent';

export default class MaskedView extends React.Component {
  _hasWarnedInvalidRenderMask = false;

  render() {
    const { maskElement, children, androidRenderingMode, ...otherViewProps } =
      this.props;

    if (!React.isValidElement(maskElement)) {
      if (!this._hasWarnedInvalidRenderMask) {
        console.warn(
          'MaskedView: Invalid `maskElement` prop was passed to MaskedView. ' +
            'Expected a React Element. No mask will render.',
        );
        this._hasWarnedInvalidRenderMask = true;
      }
      return React.createElement(View, otherViewProps, children);
    }

    return React.createElement(
      RNCMaskedView,
      otherViewProps,
      React.createElement(
        View,
        { pointerEvents: 'none', style: StyleSheet.absoluteFill },
        maskElement,
      ),
      children,
    );
  }
}
