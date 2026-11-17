---
id: gpui-kit-speech
title: Speech
---

The kit's `Speech`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name                  | Type                         |
| --------------------- | ---------------------------- |
| `showWaveform`        | `WithDefault<boolean, true>` |
| `showTranscript`      | `WithDefault<boolean, true>` |
| `showWhenUnsupported` | `WithDefault<boolean, true>` |

## Native events

| Name                    | Type                                                  |
| ----------------------- | ----------------------------------------------------- |
| `onGpuiKitSpeechStatus` | `DirectEventHandler< Readonly<{ status: string }> >`  |
| `onGpuiKitSpeechError`  | `DirectEventHandler< Readonly<{ message: string }> >` |

## Commands

- `start`
- `stop`
- `cancel`
- `toggle`

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
- `SpeechState::recognizer`: skipped, a custom recognizer is a Rust trait implementation; JS cannot provide one, the system recognizer is used
- `SpeechState::input`: skipped, a custom audio source is a Rust trait implementation; the microphone is used
