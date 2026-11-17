import React from 'react';
import type { ViewProps } from 'react-native';
import Native from './GpuiKitKbdNativeComponent';

export interface KbdProps extends ViewProps {
  /** A keystroke such as `cmd-shift-p` or `ctrl-,`. */
  keystroke?: string;
  /**
   * A registered action name such as `input::SelectAll`: shows the first
   * keybinding of the action instead of `keystroke`.
   */
  action?: string;
  /** The key context the binding must apply in (with `actionScope` `any`). */
  actionContext?: string;
  /**
   * `any`: the highest-precedence binding, in `actionContext` when set;
   * `global`: a binding without a key context; `focused`: a binding that
   * applies where focus is.
   */
  actionScope?: 'any' | 'global' | 'focused';
  /** Draw the key cap; `false` shows the bare keys. */
  appearance?: boolean;
  outline?: boolean;
}

export function Kbd({ keystroke = '', style, ...rest }: KbdProps) {
  const keys = Math.max(keystroke.split('-').length, rest.action ? 2 : 1);
  return (
    <Native
      {...rest}
      keystroke={keystroke}
      appearance={rest.appearance ?? true}
      style={[{ height: 20, width: Math.max(20, keys * 11 + 6) }, style]}
    />
  );
}
