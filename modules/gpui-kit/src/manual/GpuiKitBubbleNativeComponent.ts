import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  text?: string;
  variant?: CodegenTypes.WithDefault<
    | 'unset'
    | 'filled'
    | 'secondary'
    | 'muted'
    | 'tinted'
    | 'outline'
    | 'ghost'
    | 'destructive',
    'unset'
  >;
  /** `start` or `end`; empty follows the message around it. */
  align?: string;
  /** Reactions as JSON: `{ side, align, text, action: { label, icon, tooltip, size } }`. */
  reactionsJson?: string;
  /** Refines the bubble's surface (a KitStyle as JSON). */
  contentStyle?: string;
  /** A group of plain bubbles as JSON, `[{ text, variant, align }]`, instead of one bubble. */
  groupJson?: string;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitBubble', {
  interfaceOnly: true,
});
