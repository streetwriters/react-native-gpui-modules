import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { HostComponent } from 'react-native';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';
import type { CodegenTypes } from 'react-native';

type KeyboardMoveEvent = Readonly<{
  height: CodegenTypes.Double;
  progress: CodegenTypes.Double;
  duration: CodegenTypes.Int32;
  target: CodegenTypes.Int32;
}>;

type FocusedInputLayoutChangedEvent = Readonly<{
  target: CodegenTypes.Int32;
  parentScrollViewTarget: CodegenTypes.Int32;
  layout: {
    x: CodegenTypes.Double;
    y: CodegenTypes.Double;
    width: CodegenTypes.Double;
    height: CodegenTypes.Double;
    absoluteX: CodegenTypes.Double;
    absoluteY: CodegenTypes.Double;
    contentX: CodegenTypes.Double;
    contentY: CodegenTypes.Double;
  };
}>;

type FocusedInputTextChangedEvent = Readonly<{
  text: string;
}>;

type FocusedInputSelectionChangedEvent = Readonly<{
  target: CodegenTypes.Int32;
  selection: {
    start: {
      x: CodegenTypes.Double;
      y: CodegenTypes.Double;
      position: CodegenTypes.Int32;
    };
    end: {
      x: CodegenTypes.Double;
      y: CodegenTypes.Double;
      position: CodegenTypes.Int32;
    };
  };
}>;

export interface NativeProps extends ViewProps {
  // props
  enabled?: boolean;
  statusBarTranslucent?: boolean;
  navigationBarTranslucent?: boolean;
  preserveEdgeToEdge?: boolean;
  // callbacks
  /// keyboard
  onKeyboardMoveStart?: CodegenTypes.DirectEventHandler<KeyboardMoveEvent>;
  onKeyboardMove?: CodegenTypes.DirectEventHandler<KeyboardMoveEvent>;
  onKeyboardMoveEnd?: CodegenTypes.DirectEventHandler<KeyboardMoveEvent>;
  onKeyboardMoveInteractive?: CodegenTypes.DirectEventHandler<KeyboardMoveEvent>;
  /// focused input
  onFocusedInputLayoutChanged?: CodegenTypes.DirectEventHandler<FocusedInputLayoutChangedEvent>;
  onFocusedInputTextChanged?: CodegenTypes.DirectEventHandler<FocusedInputTextChangedEvent>;
  onFocusedInputSelectionChanged?: CodegenTypes.DirectEventHandler<FocusedInputSelectionChangedEvent>;
}

interface NativeCommands {
  synchronizeFocusedInputLayout: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['synchronizeFocusedInputLayout'],
});

export default codegenNativeComponent<NativeProps>('KeyboardControllerView', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
