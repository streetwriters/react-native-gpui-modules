import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  open?: boolean;
  title?: string;
  description?: string;
  dialogWidth?: CodegenTypes.Double;
  confirm?: boolean;
  keyboard?: CodegenTypes.WithDefault<boolean, true>;
  centered?: boolean;
  okText?: string;
  cancelText?: string;
  okVariant?: string;
  cancelVariant?: string;
  closeButton?: boolean;
  /** Pressing OK closes the dialog. */
  closeOnOk?: CodegenTypes.WithDefault<boolean, true>;
  /** Pressing Cancel closes the dialog. */
  closeOnCancel?: CodegenTypes.WithDefault<boolean, true>;
  /** Refines the dialog (a KitStyle as JSON). */
  kitStyle?: string;
  /** Refines the header; set, the dialog is composed of a header and a footer. */
  headerStyle?: string;
  /** Refines the footer; set, the dialog is composed of a header and a footer. */
  footerStyle?: string;
  /** The footer's buttons as JSON: `[{ role, label, variant, outline, flex, fullWidth }]`. */
  buttonsJson?: string;
  slots?: string;
  onGpuiKitAlertDialogOk?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitAlertDialogCancel?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitAlertDialogClose?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
}

export default codegenNativeComponent<NativeProps>('GpuiKitAlertDialog', {
  interfaceOnly: true,
});
