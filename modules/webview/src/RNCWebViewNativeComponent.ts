import {
  codegenNativeComponent,
  codegenNativeCommands,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';

type Double = CodegenTypes.Double;
type Int32 = CodegenTypes.Int32;

type NativeEvent = Readonly<{
  url: string;
  loading: boolean;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  lockIdentifier: Double;
}>;

type MessageEvent = Readonly<{
  url: string;
  loading: boolean;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  lockIdentifier: Double;
  data: string;
}>;

type ErrorEvent = Readonly<{
  url: string;
  loading: boolean;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  lockIdentifier: Double;
  domain?: string;
  code: Int32;
  description: string;
}>;

type ProgressEvent = Readonly<{
  url: string;
  loading: boolean;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  lockIdentifier: Double;
  progress: Double;
}>;

type Source = Readonly<{
  uri?: string;
  html?: string;
  baseUrl?: string;
}>;

export interface NativeProps extends ViewProps {
  source?: Source;
  newSource?: Source;
  messagingEnabled: boolean;
  injectedJavaScript?: string;
  injectedJavaScriptBeforeContentLoaded?: string;
  javaScriptEnabled?: boolean;
  onLoadingStart?: CodegenTypes.DirectEventHandler<NativeEvent>;
  onLoadingFinish?: CodegenTypes.DirectEventHandler<NativeEvent>;
  onLoadingError: CodegenTypes.DirectEventHandler<ErrorEvent>;
  onLoadingProgress?: CodegenTypes.DirectEventHandler<ProgressEvent>;
  onMessage: CodegenTypes.DirectEventHandler<MessageEvent>;
  onContentProcessDidTerminate?: CodegenTypes.DirectEventHandler<NativeEvent>;
}

export type WebViewNativeComponentType = HostComponent<NativeProps>;

interface NativeCommands {
  goBack: (viewRef: React.ElementRef<WebViewNativeComponentType>) => void;
  goForward: (viewRef: React.ElementRef<WebViewNativeComponentType>) => void;
  reload: (viewRef: React.ElementRef<WebViewNativeComponentType>) => void;
  stopLoading: (viewRef: React.ElementRef<WebViewNativeComponentType>) => void;
  injectJavaScript: (
    viewRef: React.ElementRef<WebViewNativeComponentType>,
    javascript: string,
  ) => void;
  requestFocus: (viewRef: React.ElementRef<WebViewNativeComponentType>) => void;
  postMessage: (
    viewRef: React.ElementRef<WebViewNativeComponentType>,
    data: string,
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'goBack',
    'goForward',
    'reload',
    'stopLoading',
    'injectJavaScript',
    'requestFocus',
    'postMessage',
  ],
});

export default codegenNativeComponent<NativeProps>('RNCWebView', {
  interfaceOnly: true,
});
