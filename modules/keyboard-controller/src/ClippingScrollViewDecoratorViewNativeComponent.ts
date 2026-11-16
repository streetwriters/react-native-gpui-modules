import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { HostComponent } from 'react-native';
import type { ViewProps } from 'react-native';
import type { CodegenTypes } from 'react-native';

export interface NativeProps extends ViewProps {
  contentInsetBottom: CodegenTypes.Double;
  contentInsetTop: CodegenTypes.Double;
  applyWorkaroundForContentInsetHitTestBug?: boolean;
}

export default codegenNativeComponent<NativeProps>(
  'ClippingScrollViewDecoratorView',
  {
    interfaceOnly: true,
  },
) as HostComponent<NativeProps>;
