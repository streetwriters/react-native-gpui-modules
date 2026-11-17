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
        eprintln!(
            "POPDBG render slots={} open={} controlled={} content={}",
            props.slots(),
            props.open(),
            props.controlled(),
            renderers.get("content").is_some()
        );
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
        let width = px(if props.width() > 0.0 {
            props.width() as f32
        } else {
            240.0
        });
        if let Some(content) = renderers.get("content") {
            element = element
                .content(move |_state, window, cx| gpui::div().w(width).child(content(window, cx)));
        }
        element.into_any_element()
    }
}
