use std::collections::HashMap;
use std::sync::{Mutex, OnceLock};

use gpui::{div, AnyElement, IntoElement, Keystroke, Window};
use gpui_component::kbd::Kbd;

use crate::*;

/// `Keystroke::parse` takes a `'static` string, so each distinct source is
/// leaked once and reused.
pub(crate) fn interned(source: &str) -> &'static str {
    static CACHE: OnceLock<Mutex<HashMap<String, &'static str>>> = OnceLock::new();
    let mut cache = CACHE
        .get_or_init(Default::default)
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    if let Some(leaked) = cache.get(source) {
        return leaked;
    }
    let leaked: &'static str = Box::leak(source.to_string().into_boxed_str());
    cache.insert(source.to_string(), leaked);
    leaked
}

pub struct GpuiKitKbd {
    source: String,
    parsed: Option<Keystroke>,
}

impl GpuiKitKbd {
    fn parse(&mut self, source: &str) {
        if self.source != source {
            self.source = source.to_string();
            self.parsed = Keystroke::parse(interned(source)).ok();
        }
    }
}

impl GpuiKitKbdSpec for GpuiKitKbd {
    fn create(_props: &GpuiKitKbdProps, _cx: &mut GpuiKitKbdContext) -> Self {
        Self {
            source: String::new(),
            parsed: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitKbdProps,
        _changed: GpuiKitKbdChanged,
        _cx: &mut GpuiKitKbdContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitKbdProps,
        window: &mut Window,
        cx: &mut GpuiKitKbdContext,
    ) -> AnyElement {
        if !props.action().is_empty() {
            let action = cx
                .app()
                .and_then(|app| app.build_action(props.action(), None).ok());
            let context = props.action_context();
            let kbd = action.and_then(|action| match props.action_scope() {
                GpuiKitKbdActionScope::Global => Kbd::global_binding_for_action(&*action, window),
                GpuiKitKbdActionScope::Focused => {
                    let focused = cx.app().and_then(|app| window.focused(app))?;
                    Kbd::binding_for_action_in(&*action, &focused, window)
                }
                _ => Kbd::binding_for_action(
                    &*action,
                    (!context.is_empty()).then_some(context),
                    window,
                ),
            });
            let Some(mut element) = kbd else {
                return div().into_any_element();
            };
            element = element.appearance(props.appearance());
            if props.outline() {
                element = element.outline();
            }
            return element.into_any_element();
        }
        self.parse(props.keystroke());
        let Some(keystroke) = self.parsed.clone() else {
            return div().into_any_element();
        };
        let mut element = Kbd::new(keystroke).appearance(props.appearance());
        if props.outline() {
            element = element.outline();
        }
        element.into_any_element()
    }
}
