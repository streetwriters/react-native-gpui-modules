import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  open?: boolean;
  title?: string;
  dialogWidth?: CodegenTypes.Double;
  offsetTop?: CodegenTypes.Double;
  overlay?: CodegenTypes.WithDefault<boolean, true>;
  overlayClosable?: CodegenTypes.WithDefault<boolean, true>;
  keyboard?: CodegenTypes.WithDefault<boolean, true>;
  closeButton?: CodegenTypes.WithDefault<boolean, true>;
  centered?: boolean;
  showCancel?: boolean;
  okText?: string;
  cancelText?: string;
  description?: string;
  /** `slide-down` (default), `fade`, `fade-slide` or `none`. */
  entrance?: string;
  /** Refines the dialog (a KitStyle as JSON). */
  kitStyle?: string;
  /** Refines the header; set, the dialog is composed of a header, the body and a footer. */
  headerStyle?: string;
  /** Refines the footer; set, the dialog is composed of a header, the body and a footer. */
  footerStyle?: string;
  /** The footer's buttons as JSON: `[{ role, label, variant, outline, flex, fullWidth }]`. */
  buttonsJson?: string;
  slots?: string;
  onGpuiKitDialogOk?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitDialogCancel?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitDialogClose?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
}

export default codegenNativeComponent<NativeProps>('GpuiKitDialog', {
  interfaceOnly: true,
});
