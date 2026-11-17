import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  value?: string;
  controlled?: boolean;
  language?: string;
  lineNumber?: boolean;
  softWrap?: boolean;
  bordered?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  highlightTheme?: CodegenTypes.WithDefault<'app' | 'light' | 'dark', 'app'>;
  editorStyleJson?: string;
  foldPlaceholder?: string;
  folding?: CodegenTypes.WithDefault<boolean, true>;
  indentGuides?: CodegenTypes.WithDefault<boolean, true>;
  scrollbarStyleJson?: string;
  onGpuiKitEditorChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ text: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitEditor', {
  interfaceOnly: true,
});
