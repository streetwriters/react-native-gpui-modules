import React, { Component } from 'react';
import { ContextMenu } from '@react-native-gpui/core/desktop';
import NativePicker from './RNCPickerNativeComponent';

class PickerItem extends Component {
  render() {
    throw null;
  }
}

export default class Picker extends Component {
  static Item = PickerItem;

  openMenu = async ({ x, y }) => {
    const { enabled = true, onValueChange } = this.props;
    if (!enabled) return;
    const items = this.items();
    const id = await ContextMenu.show(
      items.map((item, index) => ({ id: String(index), label: item.label })),
      { x, y },
    );
    if (id == null) return;
    const index = Number(id);
    const item = items[index];
    if (item && onValueChange) {
      onValueChange(item.value, index);
    }
  };

  items() {
    return React.Children.toArray(this.props.children)
      .filter(child => React.isValidElement(child))
      .map(child => ({
        label: String(child.props.label),
        value: child.props.value ?? child.props.label,
        testID: child.props.testID,
      }));
  }

  render() {
    const {
      style,
      selectedValue,
      enabled = true,
      color,
      placeholder,
      testID,
      accessibilityLabel,
    } = this.props;
    const items = this.items();
    const selectedIndex = items.findIndex(item => item.value === selectedValue);

    return React.createElement(NativePicker, {
      style: [{ minHeight: 32 }, style],
      items: items.map(({ label, testID: itemTestID }) => ({
        label,
        testID: itemTestID,
      })),
      selectedIndex,
      enabled,
      color: color,
      placeholder,
      testID,
      accessibilityLabel,
      onRNCPickerOpen: event => this.openMenu(event.nativeEvent),
    });
  }
}
