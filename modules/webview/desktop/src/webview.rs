use std::cell::RefCell;
use std::rc::Rc;

use gpui::{div, prelude::*, AnyElement, Window};
use react_native_gpui::native_surface::{Error, NativeViewHandle, NativeViewParent, Result};

use crate::{
    OnContentProcessDidTerminate, OnLoadingError, OnLoadingFinish, OnLoadingStart, OnMessage,
    RNCWebViewChanged, RNCWebViewContext, RNCWebViewEventSender, RNCWebViewProps, RNCWebViewSpec,
};

#[cfg(target_os = "macos")]
use crate::appkit;

#[derive(Clone, Debug, Default, PartialEq)]
pub struct Source {
    pub uri: String,
    pub html: String,
    pub base_url: String,
}

fn source_of(props: &RNCWebViewProps) -> Source {
    let source = props.source();
    let new_source = props.new_source();
    let pick = |a: &str, b: &str| if a.is_empty() { b.to_string() } else { a.to_string() };
    Source {
        uri: pick(source.uri(), new_source.uri()),
        html: pick(source.html(), new_source.html()),
        base_url: pick(source.base_url(), new_source.base_url()),
    }
}

#[derive(Clone, Debug, Default)]
pub struct PageState {
    pub url: String,
    pub title: String,
    pub loading: bool,
    pub can_go_back: bool,
    pub can_go_forward: bool,
}

pub enum PageEvent {
    Start,
    Finish,
    Fail { domain: String, code: i32, description: String },
    Terminated,
    Message(String),
}

pub struct WebView {
    view: Option<NativeViewHandle>,
    sender: RNCWebViewEventSender,
    loaded: Source,
    injected: Rc<RefCell<String>>,
}

impl RNCWebViewSpec for WebView {
    fn create(_props: &RNCWebViewProps, cx: &mut RNCWebViewContext) -> Self {
        Self {
            view: None,
            sender: cx.event_sender(),
            loaded: Source::default(),
            injected: Rc::new(RefCell::new(String::new())),
        }
    }

    fn update(
        &mut self,
        props: &RNCWebViewProps,
        _changed: RNCWebViewChanged,
        _cx: &mut RNCWebViewContext,
    ) {
        *self.injected.borrow_mut() = props.injected_java_script().to_string();
    }

    fn render(
        &mut self,
        _props: &RNCWebViewProps,
        _window: &mut Window,
        _cx: &mut RNCWebViewContext,
    ) -> AnyElement {
        div().size_full().into_any_element()
    }

    #[cfg(target_os = "macos")]
    fn create_view(
        &mut self,
        props: &RNCWebViewProps,
        _parent: &NativeViewParent<'_>,
        _window: &mut Window,
        _cx: &mut RNCWebViewContext,
    ) -> Result<NativeViewHandle> {
        let sender = self.sender.clone();
        let injected = self.injected.clone();
        *injected.borrow_mut() = props.injected_java_script().to_string();
        let view = appkit::create(
            props.injected_java_script_before_content_loaded(),
            props.messaging_enabled(),
            Box::new(move |view, event| {
                let state = appkit::state(view);
                match event {
                    PageEvent::Start => sender.loading_start(OnLoadingStart {
                        url: state.url,
                        loading: true,
                        title: state.title,
                        can_go_back: state.can_go_back,
                        can_go_forward: state.can_go_forward,
                        lock_identifier: 0.0,
                    }),
                    PageEvent::Finish => {
                        let script = injected.borrow().clone();
                        if !script.is_empty() {
                            appkit::evaluate(view, &script);
                        }
                        sender.loading_finish(OnLoadingFinish {
                            url: state.url,
                            loading: false,
                            title: state.title,
                            can_go_back: state.can_go_back,
                            can_go_forward: state.can_go_forward,
                            lock_identifier: 0.0,
                        })
                    }
                    PageEvent::Fail { domain, code, description } => {
                        sender.loading_error(OnLoadingError {
                            url: state.url,
                            loading: false,
                            title: state.title,
                            can_go_back: state.can_go_back,
                            can_go_forward: state.can_go_forward,
                            lock_identifier: 0.0,
                            domain,
                            code,
                            description,
                        })
                    }
                    PageEvent::Terminated => {
                        sender.content_process_did_terminate(OnContentProcessDidTerminate {
                            url: state.url,
                            loading: false,
                            title: state.title,
                            can_go_back: state.can_go_back,
                            can_go_forward: state.can_go_forward,
                            lock_identifier: 0.0,
                        })
                    }
                    PageEvent::Message(data) => sender.message(OnMessage {
                        url: state.url,
                        loading: state.loading,
                        title: state.title,
                        can_go_back: state.can_go_back,
                        can_go_forward: state.can_go_forward,
                        lock_identifier: 0.0,
                        data,
                    }),
                }
            }),
        );
        self.view = Some(view);
        self.loaded = source_of(props);
        appkit::load(view, &self.loaded);
        Ok(view)
    }

    #[cfg(not(target_os = "macos"))]
    fn create_view(
        &mut self,
        _props: &RNCWebViewProps,
        _parent: &NativeViewParent<'_>,
        _window: &mut Window,
        _cx: &mut RNCWebViewContext,
    ) -> Result<NativeViewHandle> {
        Err(Error::msg("the web view has no OS view on this platform yet"))
    }

    #[cfg(target_os = "macos")]
    fn update_view(
        &mut self,
        view: NativeViewHandle,
        props: &RNCWebViewProps,
        changed: RNCWebViewChanged,
        _cx: &mut RNCWebViewContext,
    ) {
        if changed.source() || changed.new_source() {
            let source = source_of(props);
            if source != self.loaded {
                self.loaded = source;
                appkit::load(view, &self.loaded);
            }
        }
    }

    #[cfg(target_os = "macos")]
    fn go_back(&mut self, _cx: &mut RNCWebViewContext) {
        if let Some(view) = self.view {
            appkit::go_back(view);
        }
    }

    #[cfg(target_os = "macos")]
    fn go_forward(&mut self, _cx: &mut RNCWebViewContext) {
        if let Some(view) = self.view {
            appkit::go_forward(view);
        }
    }

    #[cfg(target_os = "macos")]
    fn reload(&mut self, _cx: &mut RNCWebViewContext) {
        if let Some(view) = self.view {
            appkit::reload(view);
        }
    }

    #[cfg(target_os = "macos")]
    fn stop_loading(&mut self, _cx: &mut RNCWebViewContext) {
        if let Some(view) = self.view {
            appkit::stop_loading(view);
        }
    }

    #[cfg(target_os = "macos")]
    fn inject_java_script(&mut self, javascript: String, _cx: &mut RNCWebViewContext) {
        if let Some(view) = self.view {
            appkit::run(view, &javascript);
        }
    }

    #[cfg(target_os = "macos")]
    fn request_focus(&mut self, _cx: &mut RNCWebViewContext) {
        if let Some(view) = self.view {
            appkit::focus(view);
        }
    }

    #[cfg(target_os = "macos")]
    fn post_message(&mut self, data: String, _cx: &mut RNCWebViewContext) {
        if let Some(view) = self.view {
            let payload = serde_json::Value::String(data);
            appkit::run(
                view,
                &format!("window.dispatchEvent(new MessageEvent('message', {{ data: {payload} }}));"),
            );
        }
    }

    #[cfg(not(target_os = "macos"))]
    fn go_back(&mut self, _cx: &mut RNCWebViewContext) {}
    #[cfg(not(target_os = "macos"))]
    fn go_forward(&mut self, _cx: &mut RNCWebViewContext) {}
    #[cfg(not(target_os = "macos"))]
    fn reload(&mut self, _cx: &mut RNCWebViewContext) {}
    #[cfg(not(target_os = "macos"))]
    fn stop_loading(&mut self, _cx: &mut RNCWebViewContext) {}
    #[cfg(not(target_os = "macos"))]
    fn inject_java_script(&mut self, _javascript: String, _cx: &mut RNCWebViewContext) {}
    #[cfg(not(target_os = "macos"))]
    fn request_focus(&mut self, _cx: &mut RNCWebViewContext) {}
    #[cfg(not(target_os = "macos"))]
    fn post_message(&mut self, _data: String, _cx: &mut RNCWebViewContext) {}
}
