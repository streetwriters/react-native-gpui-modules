import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  /** The entries as JSON: items, titled groups and separators. */
  entriesJson?: string;
  placeholder?: string;
  searchable?: CodegenTypes.WithDefault<boolean, true>;
  filterable?: CodegenTypes.WithDefault<boolean, true>;
  bordered?: CodegenTypes.WithDefault<boolean, true>;
  /** The tallest the list may be, in points; 0 for no limit. */
  listMaxHeight?: CodegenTypes.Double;
  /** Refines the palette (a KitStyle as JSON). */
  kitStyle?: string;
  /** Focuses the search field when the palette first shows. */
  autoFocus?: boolean;
  /** Shows the loading state, for results that are still being fetched. */
  loading?: boolean;
  slots?: string;
  onGpuiKitCommandSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
  onGpuiKitCommandConfirm?: CodegenTypes.DirectEventHandler<
    Readonly<{
      index: CodegenTypes.Int32;
      section: CodegenTypes.Int32;
      row: CodegenTypes.Int32;
    }>
  >;
  onGpuiKitCommandCancel?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitCommandQuery?: CodegenTypes.DirectEventHandler<
    Readonly<{ text: string; matched: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitCommand', {
  interfaceOnly: true,
});
