use gpui::{px, AnyElement, IntoElement, ParentElement as _, Styled as _, Window};
use gpui_component::popover::Popover;

use super::slots::Renderers;
use super::trigger::{anchor, SlotTrigger};
use crate::*;

pub struct GpuiKitPopover {
    id: String,
}

impl GpuiKitPopoverSpec for GpuiKitPopover {
    fn create(_props: &GpuiKitPopoverProps, cx: &mut GpuiKitPopoverContext) -> Self {
        Self {
            id: format!("gpui_kit_popover-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitPopoverProps,
        _changed: GpuiKitPopoverChanged,
        _cx: &mut GpuiKitPopoverContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitPopoverProps,
        _window: &mut Window,
        cx: &mut GpuiKitPopoverContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let trigger = cx.children().into_iter().next();
        let sender = cx.event_sender();
        let mut element = Popover::new(self.id.clone())
            .anchor(anchor(props.anchor()))
            .arrow(props.arrow())
            .appearance(props.appearance())
            .overlay_closable(props.overlay_closable())
            .trigger(SlotTrigger::new(format!("{}-trigger", self.id), trigger))
            .on_open_change(move |open, _window, _cx| {
                sender.gpui_kit_popover_open_change(OnGpuiKitPopoverOpenChange { open: *open });
            });
        if props.offset() > 0.0 {
            element = element.offset(px(props.offset() as f32));
        }
        if props.controlled() {
            element = element.open(props.open());
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        let width = match props.content_width() {
            width if width > 0.0 => Some(px(width as f32)),
            width if width < 0.0 => None,
            _ => Some(px(240.0)),
        };
        if let Some(content) = renderers.get("content") {
            element = element.content(move |_state, window, cx| {
                let content = gpui::div().child(content(window, cx));
                match width {
                    Some(width) => content.w(width),
                    None => content,
                }
            });
        }
        element.into_any_element()
    }
}
