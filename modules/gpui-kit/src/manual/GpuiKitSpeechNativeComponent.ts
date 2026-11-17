import {
  codegenNativeComponent,
  codegenNativeCommands,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export interface NativeProps extends ViewProps {
  showWaveform?: CodegenTypes.WithDefault<boolean, true>;
  showTranscript?: CodegenTypes.WithDefault<boolean, true>;
  showWhenUnsupported?: CodegenTypes.WithDefault<boolean, true>;
  recognizer?: CodegenTypes.WithDefault<'system' | 'js', 'system'>;
  audioInput?: CodegenTypes.WithDefault<'microphone' | 'js', 'microphone'>;
  onGpuiKitSpeechRecognizerStart?: CodegenTypes.DirectEventHandler<
    Readonly<{ sampleRate: CodegenTypes.Int32; channels: CodegenTypes.Int32 }>
  >;
  onGpuiKitSpeechRecognizerFinish?: CodegenTypes.DirectEventHandler<
    Readonly<{}>
  >;
  onGpuiKitSpeechRecognizerEnd?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitSpeechAudioStart?: CodegenTypes.DirectEventHandler<
    Readonly<{ sampleRate: CodegenTypes.Int32; channels: CodegenTypes.Int32 }>
  >;
  onGpuiKitSpeechAudioStop?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitSpeechStatus?: CodegenTypes.DirectEventHandler<
    Readonly<{ status: string }>
  >;
  onGpuiKitSpeechTranscript?: CodegenTypes.DirectEventHandler<
    Readonly<{ text: string; done: boolean }>
  >;
  onGpuiKitSpeechError?: CodegenTypes.DirectEventHandler<
    Readonly<{ message: string }>
  >;
}

interface NativeCommands {
  start: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  stop: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  cancel: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  toggle: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  recognizerReady: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
  ) => void;
  pushHypothesis: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    text: string,
  ) => void;
  pushPhrase: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    text: string,
  ) => void;
  finishRecognition: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
  ) => void;
  failRecognition: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    message: string,
  ) => void;
  pushAudio: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    samples: string,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'start',
    'stop',
    'cancel',
    'toggle',
    'recognizerReady',
    'pushHypothesis',
    'pushPhrase',
    'finishRecognition',
    'failRecognition',
    'pushAudio',
  ],
});

export default codegenNativeComponent<NativeProps>('GpuiKitSpeech', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
