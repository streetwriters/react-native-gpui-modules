---
id: gpui-kit-speech
title: Speech
---

The kit's `Speech`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                  | Type                                              |
| --------------------- | ------------------------------------------------- |
| `showWaveform`        | `WithDefault<boolean, true>`                      |
| `showTranscript`      | `WithDefault<boolean, true>`                      |
| `showWhenUnsupported` | `WithDefault<boolean, true>`                      |
| `recognizer`          | `WithDefault<'system' \| 'js', 'system'>`         |
| `audioInput`          | `WithDefault<'microphone' \| 'js', 'microphone'>` |
| `variant`             | `WithDefault<'row' \| 'dictation', 'row'>`        |
| `placeholder`         | `string`                                          |

## Native events

| Name                              | Type                                                  |
| --------------------------------- | ----------------------------------------------------- |
| `onGpuiKitSpeechRecognizerFinish` | `DirectEventHandler< Readonly<{}> >`                  |
| `onGpuiKitSpeechRecognizerEnd`    | `DirectEventHandler<Readonly<{}>>`                    |
| `onGpuiKitSpeechRecognizerAudio`  | `DirectEventHandler< Readonly<{ samples: Int32 }> >`  |
| `onGpuiKitSpeechAudioStop`        | `DirectEventHandler<Readonly<{}>>`                    |
| `onGpuiKitSpeechStatus`           | `DirectEventHandler< Readonly<{ status: string }> >`  |
| `onGpuiKitSpeechError`            | `DirectEventHandler< Readonly<{ message: string }> >` |

## Commands

- `start`
- `stop`
- `cancel`
- `toggle`
- `recognizerReady`
- `pushHypothesis`
- `pushPhrase`
- `finishRecognition`
- `failRecognition`
- `pushAudio`

## Coverage

- `SpeechState::new`: generated, constructor; the component owns the state
- `SpeechState::start`: generated (start()), command
- `SpeechState::stop`: generated (stop()), command
- `SpeechState::cancel`: generated (cancel()), command
- `SpeechState::toggle`: generated (toggle()), command
- `SpeechEvent`: generated (onStatusChange, onTranscript, onError), events
- `SpeechButton::show_when_unsupported`: generated (showWhenUnsupported)
- `SpeechWaveform::new`: generated (showWaveform)
- `SpeechState::transcript`: generated (showTranscript), drawn beside the button and reported by onTranscript
- `SpeechState::recognizer`: generated (recognizer), recognizer js: a recognizer whose results JavaScript pushes with pushHypothesis, pushPhrase and finishRecognition, with onRecognizerStart, onRecognizerFinish and onRecognizerEnd
- `SpeechState::input`: generated (audioInput), audioInput js: an audio source fed 16-bit PCM by pushAudio, between onAudioStart and onAudioStop
