import { Children, isValidElement, type ReactNode } from 'react';

/** The props of each element child, in order; other children are ignored. */
export function childProps<T extends object>(children: ReactNode): T[] {
  return Children.toArray(children)
    .filter(isValidElement)
    .map(child => child.props as T);
}

export function indicesOf(list: string): number[] {
  return list === '' ? [] : list.split(',').map(Number);
}

export const syntheticPress = {
  nativeEvent: {
    x: 0,
    y: 0,
    rightClick: false,
    shift: false,
    control: false,
    alt: false,
    meta: false,
  },
};
