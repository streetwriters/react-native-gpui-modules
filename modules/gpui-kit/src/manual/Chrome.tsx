import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import {
  useColorScheme,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import ThemeNative from './GpuiKitThemeNativeComponent';
import ThemeRegistryNative, {
  Commands as ThemeRegistryCommands,
} from './GpuiKitThemeRegistryNativeComponent';
import { Input } from '../generated/Input';
import type { InputAddon } from './addons';

export interface ThemeProps {
  /** `system` follows the app's colour scheme. */
  mode?: 'light' | 'dark' | 'system';
  /** The theme's `shadow` flag: whether buttons and inputs draw a shadow. */
  shadow?: boolean;
  /** Where notifications show (`theme.notification.placement`). */
  notificationPlacement?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'left-center'
    | 'right-center'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  /** How many notifications show at once (`theme.notification.max_items`). */
  notificationMaxItems?: number;
  /** The kit's theme changed; `dark` says which one it is now. */
  onChange?: (event: NativeSyntheticEvent<Readonly<{ dark: boolean }>>) => void;
}

const hidden = { position: 'absolute', width: 0, height: 0 } as const;

/** Switches the theme of every kit component in the window. */
export function Theme({
  mode = 'system',
  shadow = true,
  notificationPlacement,
  notificationMaxItems,
  onChange,
}: ThemeProps) {
  const scheme = useColorScheme();
  const resolved =
    mode === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : mode;
  return (
    <ThemeNative
      style={hidden}
      mode={resolved}
      shadow={shadow}
      notificationPlacement={notificationPlacement ?? ''}
      notificationMaxItems={notificationMaxItems ?? 0}
      onGpuiKitThemeChange={onChange as never}
    />
  );
}

type Size = 'xsmall' | 'small' | 'medium' | 'large';

interface Base {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface InputGroupProps extends Base {
  /** Controls the text; leave it out for the kit's own text. */
  value?: string;
  placeholder?: string;
  /** Text, or React Native content, before the input. */
  start?: ReactNode;
  /** Text, or React Native content, after the input. */
  end?: ReactNode;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  size?: Size;
  onChangeText?: (text: string) => void;
}

/**
 * An input with text or React Native content before and after it: an `Input`
 * whose `addons` are the kit's `InputGroup`.
 */
export function InputGroup({
  value,
  start,
  end,
  onChangeText,
  invalid,
  style,
  testID,
  ...rest
}: InputGroupProps) {
  const addon = (
    node: ReactNode,
    align: 'inline-start' | 'inline-end',
  ): InputAddon[] =>
    node == null || node === false
      ? []
      : [
          {
            align,
            items: [
              typeof node === 'string'
                ? { kind: 'text', text: node }
                : { kind: 'content', content: node },
            ],
          },
        ];
  return (
    <Input
      {...rest}
      style={[{ width: 280 }, style]}
      testID={testID}
      value={value}
      invalid={invalid}
      addons={[...addon(start, 'inline-start'), ...addon(end, 'inline-end')]}
      onChangeText={onChangeText}
    />
  );
}

/** The kit's theme registry, and the colors of one of its themes. */
export interface ThemeRegistryState {
  themes: { name: string; dark: boolean }[];
  /** The name of the theme in use. */
  active: string;
  /** The theme `colors` belong to. */
  selected: string;
  /** Every color of the selected theme, applied over the default theme of its mode, as `rrggbb[aa]` by key. */
  colors: Record<string, string>;
  /** The color keys the selected theme sets itself (the others are inherited). */
  explicit: string[];
  dark: boolean;
  /** Colors of the default theme of the selected theme's mode, to draw a viewer with. */
  isolated: { border: string; foreground: string; mutedForeground: string };
}

export interface ThemeRegistryHandle {
  /** Makes a registered theme the one in use. */
  apply(name: string): void;
}

export interface ThemeRegistryProps {
  /** The theme to report the colors of; the active theme by default. */
  selected?: string;
  onChange?: (state: ThemeRegistryState) => void;
}

/** Reports the kit's registered themes and applies one; it draws nothing. */
export const ThemeRegistry = forwardRef<
  ThemeRegistryHandle,
  ThemeRegistryProps
>(function ThemeRegistry({ selected, onChange }, ref) {
  const native = useRef<React.ElementRef<typeof ThemeRegistryNative>>(null);
  useImperativeHandle(ref, () => ({
    apply: name => {
      if (native.current) ThemeRegistryCommands.apply(native.current, name);
    },
  }));
  return (
    <ThemeRegistryNative
      ref={native}
      style={hidden}
      selected={selected ?? ''}
      onGpuiKitThemeRegistryChange={event =>
        onChange?.(JSON.parse(event.nativeEvent.json))
      }
    />
  );
});
