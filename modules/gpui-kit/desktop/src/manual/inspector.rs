use gpui::{AnyElement, IntoElement, Window};

use crate::*;

pub struct GpuiKitInspector {
    shown: bool,
}

impl GpuiKitInspectorSpec for GpuiKitInspector {
    fn create(_props: &GpuiKitInspectorProps, _cx: &mut GpuiKitInspectorContext) -> Self {
        Self { shown: false }
    }

    fn update(
        &mut self,
        _props: &GpuiKitInspectorProps,
        _changed: GpuiKitInspectorChanged,
        _cx: &mut GpuiKitInspectorContext,
    ) {
    }

    fn toggle(&mut self, cx: &mut GpuiKitInspectorContext) {
        self.shown = !self.shown;
        if let Some(app) = cx.app() {
            toggle_inspector(app);
        }
    }

    fn render(
        &mut self,
        props: &GpuiKitInspectorProps,
        _window: &mut Window,
        cx: &mut GpuiKitInspectorContext,
    ) -> AnyElement {
        if props.open() != self.shown {
            self.shown = props.open();
            if let Some(app) = cx.app() {
                toggle_inspector(app);
            }
        }
        gpui::div().into_any_element()
    }
}

fn toggle_inspector(app: &mut gpui::App) {
    app.defer(|app| {
        if let Some(window) = app.windows().into_iter().next() {
            let _ = window.update(app, |_, window, cx| window.toggle_inspector(cx));
        }
    });
}
