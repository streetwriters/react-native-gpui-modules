import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type AvatarGroupItem = Readonly<{
  name: string;
  placeholder: string;
  src: string;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<AvatarGroupItem>;
  limit?: CodegenTypes.Int32;
  ellipsis?: boolean;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitAvatarGroup', {
  interfaceOnly: true,
});
