import {
  codegenNativeComponent,
  codegenNativeCommands,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export interface NativeProps extends ViewProps {
  /** The questions as JSON (see `Questionnaire.tsx`). */
  itemsJson?: string;
  shortcuts?: CodegenTypes.WithDefault<'none' | 'numbers' | 'letters', 'none'>;
  showProgress?: CodegenTypes.WithDefault<boolean, true>;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  /** The kit's buttons to show, comma-separated (`previous,skip,next,submit`); empty for all, `none` for none. */
  kitActions?: string;
  kitStyle?: string;
  slots?: string;
  onGpuiKitQuestionnaireAnswer?: CodegenTypes.DirectEventHandler<
    Readonly<{
      item: string;
      status: string;
      choices: string;
      freeform: string;
    }>
  >;
  onGpuiKitQuestionnaireItemChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ current: string }>
  >;
  onGpuiKitQuestionnaireSubmit?: CodegenTypes.DirectEventHandler<
    Readonly<{ answers: string; items: string }>
  >;
  onGpuiKitQuestionnaireComplete?: CodegenTypes.DirectEventHandler<
    Readonly<{ answers: string; items: string }>
  >;
  /** What the questionnaire shows, as JSON, whenever it changes. */
  onGpuiKitQuestionnaireStateChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ state: string }>
  >;
}

interface NativeCommands {
  next: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  previous: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  skip: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  submit: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  reset: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  setExternalError: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    item: string,
    message: string,
  ) => void;
  clearExternalError: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    item: string,
  ) => void;
  setAnswer: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    item: string,
    answer: string,
  ) => void;
  setCurrentItem: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    item: string,
  ) => void;
  setItemDisabled: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    item: string,
    disabled: boolean,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'next',
    'previous',
    'skip',
    'submit',
    'reset',
    'setExternalError',
    'clearExternalError',
    'setAnswer',
    'setCurrentItem',
    'setItemDisabled',
  ],
});

export default codegenNativeComponent<NativeProps>('GpuiKitQuestionnaire', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
