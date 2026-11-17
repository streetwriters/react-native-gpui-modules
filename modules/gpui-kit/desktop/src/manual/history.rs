use gpui::{AnyElement, IntoElement, Window};
use gpui_base::History;

use crate::*;

pub struct GpuiKitHistory {
    history: History<String>,
}

impl GpuiKitHistory {
    fn report(&self, cx: &mut GpuiKitHistoryContext, moved: &str) {
        cx.event_sender()
            .gpui_kit_history_change(OnGpuiKitHistoryChange {
                current: self.history.current().cloned().unwrap_or_default(),
                can_back: self.history.can_back(),
                can_forward: self.history.can_forward(),
                length: (self.history.entries().len() + self.history.forward_entries().len())
                    as i32,
                moved: moved.to_string(),
            });
    }
}

impl GpuiKitHistorySpec for GpuiKitHistory {
    fn create(props: &GpuiKitHistoryProps, _cx: &mut GpuiKitHistoryContext) -> Self {
        Self {
            history: Self::sized(props),
        }
    }

    fn update(
        &mut self,
        props: &GpuiKitHistoryProps,
        changed: GpuiKitHistoryChanged,
        _cx: &mut GpuiKitHistoryContext,
    ) {
        if changed.max_entries() {
            let entries: Vec<String> = self.history.entries().cloned().collect();
            self.history = Self::sized(props);
            for entry in entries {
                self.history.push(entry);
            }
        }
    }

    fn push(&mut self, entry: String, cx: &mut GpuiKitHistoryContext) {
        self.history.push(entry);
        self.report(cx, "push");
    }

    fn replace_current(&mut self, entry: String, cx: &mut GpuiKitHistoryContext) {
        self.history.replace_current(entry);
        self.report(cx, "replace");
    }

    fn back(&mut self, cx: &mut GpuiKitHistoryContext) {
        self.history.back();
        self.report(cx, "back");
    }

    fn forward(&mut self, cx: &mut GpuiKitHistoryContext) {
        self.history.forward();
        self.report(cx, "forward");
    }

    fn clear(&mut self, cx: &mut GpuiKitHistoryContext) {
        self.history.clear();
        self.report(cx, "clear");
    }

    fn render(
        &mut self,
        _props: &GpuiKitHistoryProps,
        _window: &mut Window,
        _cx: &mut GpuiKitHistoryContext,
    ) -> AnyElement {
        gpui::div().into_any_element()
    }
}

impl GpuiKitHistory {
    fn sized(props: &GpuiKitHistoryProps) -> History<String> {
        let history = History::new();
        if props.max_entries() > 0 {
            history.max_entries(props.max_entries() as usize)
        } else {
            history
        }
    }
}
