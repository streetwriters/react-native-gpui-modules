import {
  codegenNativeComponent,
  codegenNativeCommands,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export type QuestionnaireItemDef = Readonly<{
  name: string;
  label: string;
  description: string;
  required: boolean;
  multiple: boolean;
  disabled: boolean;
  /** A free-text answer beside the choices. */
  input: boolean;
  /** Validation rules as JSON, checked in Rust before the answer is accepted. */
  validation: string;
}>;

export type QuestionnaireChoiceDef = Readonly<{
  item: string;
  value: string;
  label: string;
  description: string;
  disabled: boolean;
  selected: boolean;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<QuestionnaireItemDef>;
  choices?: ReadonlyArray<QuestionnaireChoiceDef>;
  shortcuts?: CodegenTypes.WithDefault<'none' | 'numbers' | 'letters', 'none'>;
  showProgress?: CodegenTypes.WithDefault<boolean, true>;
  onGpuiKitQuestionnaireAnswer?: CodegenTypes.DirectEventHandler<
    Readonly<{ item: string; choices: string; freeform: string }>
  >;
  onGpuiKitQuestionnaireItemChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ current: string }>
  >;
  onGpuiKitQuestionnaireSubmit?: CodegenTypes.DirectEventHandler<
    Readonly<{ answers: string }>
  >;
}

interface NativeCommands {
  next: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  previous: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  skip: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  submit: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  reset: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['next', 'previous', 'skip', 'submit', 'reset'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitQuestionnaire', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
