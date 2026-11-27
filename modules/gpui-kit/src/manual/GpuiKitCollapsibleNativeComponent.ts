import { codegenNativeComponent, type ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  open?: boolean;
  /** Animates the content's height (`Collapsible::motion_id`). */
  animated?: boolean;
  /** Refines the collapsible (a KitStyle as JSON). */
  kitStyle?: string;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitCollapsible', {
  interfaceOnly: true,
});
