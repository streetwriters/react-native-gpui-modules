import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
} from 'react';
import {
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import SpeechNative, { Commands } from './GpuiKitSpeechNativeComponent';

export interface SpeechHandle {
  start(): void;
  stop(): void;
  cancel(): void;
  toggle(): void;
  /** With `recognizer="js"`: the service accepts audio. */
  recognizerReady(): void;
  /** With `recognizer="js"`: replaces the hypothesis of the phrase being spoken. */
  pushHypothesis(text: string): void;
  /** With `recognizer="js"`: commits a phrase; phrases are joined verbatim. */
  pushPhrase(text: string): void;
  /** With `recognizer="js"`: the session is complete. */
  finishRecognition(): void;
  /** With `recognizer="js"`: the session failed. */
  failRecognition(message: string): void;
  /** With `audioInput="js"`: interleaved 16-bit PCM in the format of `onAudioStart`. */
  pushAudio(samples: ArrayLike<number>): void;
}

export type SpeechStatus = 'idle' | 'connecting' | 'recording' | 'stopping';

export interface SpeechProps extends Omit<ViewProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  showWaveform?: boolean;
  showTranscript?: boolean;
  /** Draws the button although the system has no recognizer. */
  showWhenUnsupported?: boolean;
  onStatusChange?: (status: SpeechStatus) => void;
  /** The transcript so far; `done` is true for the final one of a session. */
  onTranscript?: (text: string, done: boolean) => void;
  onError?: (message: string) => void;
  /**
   * `js` recognizes speech in JavaScript: a session fires
   * `onRecognizerStart`, results go back through `pushHypothesis`,
   * `pushPhrase` and `finishRecognition`, `onRecognizerFinish` asks for the
   * last result when the user stops, and `onRecognizerEnd` ends the session.
   */
  recognizer?: 'system' | 'js';
  /**
   * `js` takes audio from `pushAudio` instead of the microphone, between
   * `onAudioStart` and `onAudioStop`.
   */
  audioInput?: 'microphone' | 'js';
  onRecognizerStart?: (format: { sampleRate: number; channels: number }) => void;
  onRecognizerFinish?: () => void;
  onRecognizerEnd?: () => void;
  onAudioStart?: (format: { sampleRate: number; channels: number }) => void;
  onAudioStop?: () => void;
}

type Format = NativeSyntheticEvent<{ sampleRate: number; channels: number }>;

/** A speech input: a microphone button, a waveform and the transcript. */
export const Speech = forwardRef<SpeechHandle, SpeechProps>(function Speech(
  {
    style,
    onStatusChange,
    onTranscript,
    onError,
    showWaveform,
    showTranscript,
    showWhenUnsupported,
    onRecognizerStart,
    onRecognizerFinish,
    onRecognizerEnd,
    onAudioStart,
    onAudioStop,
    ...view
  },
  ref,
) {
  const native = useRef<ComponentRef<typeof SpeechNative>>(null);
  useImperativeHandle(ref, () => ({
    start: () => native.current && Commands.start(native.current),
    stop: () => native.current && Commands.stop(native.current),
    cancel: () => native.current && Commands.cancel(native.current),
    toggle: () => native.current && Commands.toggle(native.current),
    recognizerReady: () =>
      native.current && Commands.recognizerReady(native.current),
    pushHypothesis: (text: string) =>
      native.current && Commands.pushHypothesis(native.current, text),
    pushPhrase: (text: string) =>
      native.current && Commands.pushPhrase(native.current, text),
    finishRecognition: () =>
      native.current && Commands.finishRecognition(native.current),
    failRecognition: (message: string) =>
      native.current && Commands.failRecognition(native.current, message),
    pushAudio: (samples: ArrayLike<number>) =>
      native.current &&
      Commands.pushAudio(native.current, Array.from(samples).join(',')),
  }));
  return (
    <SpeechNative
      {...view}
      ref={native}
      style={[{ width: 320, height: 56 }, style]}
      showWaveform={showWaveform ?? true}
      showTranscript={showTranscript ?? true}
      showWhenUnsupported={showWhenUnsupported ?? true}
      onGpuiKitSpeechStatus={(
        event: NativeSyntheticEvent<{ status: string }>,
      ) => onStatusChange?.(event.nativeEvent.status as SpeechStatus)}
      onGpuiKitSpeechTranscript={(
        event: NativeSyntheticEvent<{ text: string; done: boolean }>,
      ) => onTranscript?.(event.nativeEvent.text, event.nativeEvent.done)}
      onGpuiKitSpeechError={(
        event: NativeSyntheticEvent<{ message: string }>,
      ) => onError?.(event.nativeEvent.message)}
      onGpuiKitSpeechRecognizerStart={(event: Format) =>
        onRecognizerStart?.(event.nativeEvent)
      }
      onGpuiKitSpeechRecognizerFinish={() => onRecognizerFinish?.()}
      onGpuiKitSpeechRecognizerEnd={() => onRecognizerEnd?.()}
      onGpuiKitSpeechAudioStart={(event: Format) =>
        onAudioStart?.(event.nativeEvent)
      }
      onGpuiKitSpeechAudioStop={() => onAudioStop?.()}
    />
  );
});
