import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  open?: boolean;
  controlled?: boolean;
  anchor?: string;
  /** `dropdown` opens below the trigger; `context` opens where it is right-clicked. */
  mode?: string;
  /** The menu as JSON: `{ items, minWidth, maxHeight, scrollable, checkSide, externalLinkIcon }`. */
  menuJson?: string;
  slots?: string;
  onGpuiKitDropdownMenuOpenChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ open: boolean }>
  >;
  onGpuiKitDropdownMenuSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitDropdownMenu', {
  interfaceOnly: true,
});
