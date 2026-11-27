use gpui::{
    AnyElement, InteractiveElement as _, IntoElement, ParentElement as _, SharedString,
    Styled as _, Window,
};
use gpui_component::scroll::ScrollableElement as _;
use gpui_component::text::TextView;

use super::slots::Slots;
use crate::*;

pub struct GpuiKitTextView {
    id: String,
}

impl GpuiKitTextViewSpec for GpuiKitTextView {
    fn create(_props: &GpuiKitTextViewProps, cx: &mut GpuiKitTextViewContext) -> Self {
        Self {
            id: format!("gpui_kit_text_view-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitTextViewProps,
        _changed: GpuiKitTextViewChanged,
        _cx: &mut GpuiKitTextViewContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitTextViewProps,
        _window: &mut Window,
        cx: &mut GpuiKitTextViewContext,
    ) -> AnyElement {
        let id = SharedString::from(self.id.clone());
        let source = SharedString::from(props.source().to_string());
        let mut view = match props.format() {
            GpuiKitTextViewFormat::Html => TextView::html(id, source),
            GpuiKitTextViewFormat::Unset | GpuiKitTextViewFormat::Markdown => {
                TextView::markdown(id, source)
            }
        }
        .selectable(props.selectable())
        .scrollable(props.scrollable());
        if props.max_lines() > 0 {
            view = view.max_lines(props.max_lines() as usize);
        }
        let _ = cx;
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut view), &style);
        }
        view.into_any_element()
    }
}

pub struct GpuiKitScrollArea {
    id: String,
}

impl GpuiKitScrollAreaSpec for GpuiKitScrollArea {
    fn create(_props: &GpuiKitScrollAreaProps, cx: &mut GpuiKitScrollAreaContext) -> Self {
        Self {
            id: format!("gpui_kit_scroll_area-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitScrollAreaProps,
        _changed: GpuiKitScrollAreaChanged,
        _cx: &mut GpuiKitScrollAreaContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitScrollAreaProps,
        _window: &mut Window,
        cx: &mut GpuiKitScrollAreaContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut area = gpui::div()
            .id(SharedString::from(self.id.clone()))
            .size_full();
        if let Some(body) = slots.take("body") {
            area = area.child(body);
        }
        match props.axis() {
            GpuiKitScrollAreaAxis::Horizontal => area.overflow_x_scrollbar().into_any_element(),
            GpuiKitScrollAreaAxis::Both => area.overflow_scrollbar().into_any_element(),
            GpuiKitScrollAreaAxis::Unset | GpuiKitScrollAreaAxis::Vertical => {
                area.overflow_y_scrollbar().into_any_element()
            }
        }
    }
}
