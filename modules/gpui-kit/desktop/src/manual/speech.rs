use gpui::{
    AnyElement, AppContext as _, Entity, IntoElement, ParentElement as _, SharedString,
    Styled as _, Subscription, Window,
};
use std::cell::RefCell;
use std::rc::Rc;

use gpui_component::input::{Input, InputState};
use gpui_component::speech::{
    AudioFormat, AudioInput, AudioSink, RecognitionSession, SpeechButton, SpeechError, SpeechEvent,
    SpeechRecognizer, SpeechSink, SpeechState, SpeechStatus, SpeechWaveform,
};
use gpui_component::{h_flex, v_flex, ActiveTheme as _, Sizable as _};

use crate::*;

pub struct GpuiKitSpeech {
    state: Option<Entity<SpeechState>>,
    subscription: Option<Subscription>,
    status: SpeechStatus,
    mode: (bool, bool),
    speech_sink: Rc<RefCell<Option<SpeechSink>>>,
    audio_sink: Rc<RefCell<Option<AudioSink>>>,
    input: Option<(Entity<InputState>, Subscription)>,
}

/// A recognizer whose results come from JavaScript through commands.
struct JsRecognizer {
    sink: Rc<RefCell<Option<SpeechSink>>>,
    events: GpuiKitSpeechEventSender,
}

struct JsSession {
    sink: Rc<RefCell<Option<SpeechSink>>>,
    events: GpuiKitSpeechEventSender,
}

impl SpeechRecognizer for JsRecognizer {
    fn start(
        &self,
        sink: SpeechSink,
        _cx: &mut gpui::App,
    ) -> Result<Box<dyn RecognitionSession>, SpeechError> {
        *self.sink.borrow_mut() = Some(sink);
        let format = self.audio_format();
        self.events
            .gpui_kit_speech_recognizer_start(OnGpuiKitSpeechRecognizerStart {
                sample_rate: format.sample_rate() as i32,
                channels: format.channels() as i32,
            });
        Ok(Box::new(JsSession {
            sink: self.sink.clone(),
            events: self.events.clone(),
        }))
    }
}

impl RecognitionSession for JsSession {
    fn push_audio(&mut self, samples: &[i16], _cx: &mut gpui::App) {
        self.events
            .gpui_kit_speech_recognizer_audio(OnGpuiKitSpeechRecognizerAudio {
                samples: samples.len() as i32,
            });
    }

    fn finish(&mut self, _cx: &mut gpui::App) {
        self.events.gpui_kit_speech_recognizer_finish();
    }
}

impl Drop for JsSession {
    fn drop(&mut self) {
        self.sink.borrow_mut().take();
        self.events.gpui_kit_speech_recognizer_end();
    }
}

/// An audio source fed by JavaScript through `pushAudio`.
struct JsAudio {
    sink: Rc<RefCell<Option<AudioSink>>>,
    events: GpuiKitSpeechEventSender,
}

impl AudioInput for JsAudio {
    fn start(
        &self,
        format: AudioFormat,
        sink: AudioSink,
        _cx: &mut gpui::App,
    ) -> Result<Subscription, SpeechError> {
        *self.sink.borrow_mut() = Some(sink);
        self.events
            .gpui_kit_speech_audio_start(OnGpuiKitSpeechAudioStart {
                sample_rate: format.sample_rate() as i32,
                channels: format.channels() as i32,
            });
        let (slot, events) = (self.sink.clone(), self.events.clone());
        Ok(Subscription::new(move || {
            slot.borrow_mut().take();
            events.gpui_kit_speech_audio_stop();
        }))
    }
}

fn status_name(status: SpeechStatus) -> &'static str {
    match status {
        SpeechStatus::Idle => "idle",
        SpeechStatus::Connecting => "connecting",
        SpeechStatus::Recording => "recording",
        SpeechStatus::Stopping => "stopping",
    }
}

impl GpuiKitSpeechSpec for GpuiKitSpeech {
    fn create(_props: &GpuiKitSpeechProps, _cx: &mut GpuiKitSpeechContext) -> Self {
        Self {
            state: None,
            subscription: None,
            status: SpeechStatus::Idle,
            mode: (false, false),
            speech_sink: Rc::default(),
            audio_sink: Rc::default(),
            input: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitSpeechProps,
        _changed: GpuiKitSpeechChanged,
        _cx: &mut GpuiKitSpeechContext,
    ) {
    }

    fn start(&mut self, cx: &mut GpuiKitSpeechContext) {
        self.with_state(cx, |state, cx| state.start(cx));
    }

    fn stop(&mut self, cx: &mut GpuiKitSpeechContext) {
        self.with_state(cx, |state, cx| state.stop(cx));
    }

    fn cancel(&mut self, cx: &mut GpuiKitSpeechContext) {
        self.with_state(cx, |state, cx| state.cancel(cx));
    }

    fn toggle(&mut self, cx: &mut GpuiKitSpeechContext) {
        self.with_state(cx, |state, cx| state.toggle(cx));
    }

    fn recognizer_ready(&mut self, cx: &mut GpuiKitSpeechContext) {
        self.with_sink(cx, |sink, app| sink.ready(app));
    }

    fn push_hypothesis(&mut self, text: String, cx: &mut GpuiKitSpeechContext) {
        self.with_sink(cx, move |sink, app| sink.hypothesis(text, app));
    }

    fn push_phrase(&mut self, text: String, cx: &mut GpuiKitSpeechContext) {
        self.with_sink(cx, move |sink, app| sink.phrase(text, app));
    }

    fn finish_recognition(&mut self, cx: &mut GpuiKitSpeechContext) {
        self.with_sink(cx, |sink, app| sink.finish(app));
    }

    fn fail_recognition(&mut self, message: String, cx: &mut GpuiKitSpeechContext) {
        self.with_sink(cx, move |sink, app| {
            sink.error(SpeechError::recognizer(anyhow_message(message)), app)
        });
    }

    fn push_audio(&mut self, samples: String, cx: &mut GpuiKitSpeechContext) {
        let Some(sink) = self.audio_sink.borrow().clone() else {
            return;
        };
        let samples: Vec<i16> = samples
            .split(',')
            .filter_map(|s| s.trim().parse::<i32>().ok())
            .map(|s| s.clamp(i16::MIN as i32, i16::MAX as i32) as i16)
            .collect();
        if let Some(app) = cx.app() {
            sink.push(samples, app);
        }
    }

    fn render(
        &mut self,
        props: &GpuiKitSpeechProps,
        window: &mut Window,
        cx: &mut GpuiKitSpeechContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let mode = (
            matches!(props.recognizer(), GpuiKitSpeechRecognizer::Js),
            matches!(props.audio_input(), GpuiKitSpeechAudioInput::Js),
        );
        if self.mode != mode {
            self.mode = mode;
            self.state = None;
            self.subscription = None;
            self.input = None;
        }
        let (speech_sink, audio_sink) = (self.speech_sink.clone(), self.audio_sink.clone());
        let state = self
            .state
            .get_or_insert_with(|| {
                app.new(|cx| {
                    let mut state = SpeechState::new(cx);
                    if mode.0 {
                        state = state.recognizer(JsRecognizer {
                            sink: speech_sink,
                            events: sender.clone(),
                        });
                    }
                    if mode.1 {
                        state = state.input(JsAudio {
                            sink: audio_sink,
                            events: sender.clone(),
                        });
                    }
                    state
                })
            })
            .clone();
        if self.subscription.is_none() {
            let events = sender.clone();
            self.subscription =
                Some(
                    app.subscribe(&state, move |_, event: &SpeechEvent, _cx| match event {
                        SpeechEvent::Started => {}
                        SpeechEvent::Partial(text) => {
                            events.gpui_kit_speech_transcript(OnGpuiKitSpeechTranscript {
                                text: text.to_string(),
                                done: false,
                            })
                        }
                        SpeechEvent::Final(text) => {
                            events.gpui_kit_speech_transcript(OnGpuiKitSpeechTranscript {
                                text: text.to_string(),
                                done: true,
                            })
                        }
                        SpeechEvent::Cancelled => {
                            events.gpui_kit_speech_transcript(OnGpuiKitSpeechTranscript {
                                text: String::new(),
                                done: true,
                            })
                        }
                        SpeechEvent::Error(error) => {
                            events.gpui_kit_speech_error(OnGpuiKitSpeechError {
                                message: error.to_string(),
                            })
                        }
                    }),
                );
        }
        let status = state.read(app).status();
        if status != self.status {
            self.status = status;
            sender.gpui_kit_speech_status(OnGpuiKitSpeechStatus {
                status: status_name(status).to_string(),
            });
        }
        let transcript: SharedString = state.read(app).transcript();
        let theme = app.theme().clone();
        if matches!(props.variant(), GpuiKitSpeechVariant::Dictation) {
            if self.input.is_none() {
                let placeholder = props.placeholder().to_string();
                let input = app.new(|cx| InputState::new(window, cx).placeholder(placeholder));
                let target = input.clone();
                let subscription = app.subscribe(&state, move |_, event: &SpeechEvent, cx| {
                    if let SpeechEvent::Final(text) = event {
                        if !text.is_empty() {
                            let text = text.clone();
                            let target = target.clone();
                            cx.defer(move |cx| {
                                if let Some(window) = cx.windows().into_iter().next() {
                                    let _ = window.update(cx, |_, window, cx| {
                                        target
                                            .update(cx, |input, cx| input.insert(text, window, cx))
                                    });
                                }
                            });
                        }
                    }
                });
                self.input = Some((input, subscription));
            }
            let input = self.input.as_ref().unwrap().0.clone();
            let capturing = status.is_capturing();
            let mut suffix = h_flex().gap_2();
            if capturing {
                suffix = suffix.child(SpeechWaveform::new(&state).w(gpui::px(48.)).xsmall());
            }
            suffix = suffix.child(
                SpeechButton::new(&state)
                    .xsmall()
                    .show_when_unsupported(props.show_when_unsupported()),
            );
            let mut column = v_flex()
                .w_full()
                .gap_2()
                .child(Input::new(&input).suffix(suffix));
            if capturing {
                column = column.child(SpeechWaveform::new(&state).liquid().w_full().large());
            }
            if status.is_active() {
                column = column.child(
                    gpui::div()
                        .text_sm()
                        .text_color(theme.muted_foreground)
                        .child(transcript),
                );
            }
            return column.into_any_element();
        }
        let mut row =
            h_flex().size_full().items_center().gap_3().child(
                SpeechButton::new(&state).show_when_unsupported(props.show_when_unsupported()),
            );
        if props.show_waveform() {
            row = row.child(SpeechWaveform::new(&state));
        }
        if props.show_transcript() {
            row = row.child(
                gpui::div()
                    .flex_1()
                    .text_color(theme.foreground)
                    .child(transcript),
            );
        }
        row.into_any_element()
    }
}

fn anyhow_message(message: String) -> std::io::Error {
    std::io::Error::other(message)
}

impl GpuiKitSpeech {
    fn with_sink(
        &self,
        cx: &mut GpuiKitSpeechContext,
        action: impl FnOnce(&SpeechSink, &mut gpui::App),
    ) {
        let Some(sink) = self.speech_sink.borrow().clone() else {
            return;
        };
        if let Some(app) = cx.app() {
            action(&sink, app);
        }
    }

    fn with_state(
        &self,
        cx: &mut GpuiKitSpeechContext,
        action: impl FnOnce(&mut SpeechState, &mut gpui::Context<SpeechState>),
    ) {
        let Some(state) = self.state.clone() else {
            return;
        };
        if let Some(app) = cx.app() {
            state.update(app, action);
        }
    }
}
