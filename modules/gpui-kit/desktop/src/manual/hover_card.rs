use std::time::Duration;

use gpui::{AnyElement, IntoElement, ParentElement as _, Styled as _, Window};
use gpui_component::hover_card::HoverCard;

use super::slots::Renderers;
use super::trigger::{anchor, SlotTrigger};
use crate::*;

pub struct GpuiKitHoverCard {
    id: String,
}

impl GpuiKitHoverCardSpec for GpuiKitHoverCard {
    fn create(_props: &GpuiKitHoverCardProps, cx: &mut GpuiKitHoverCardContext) -> Self {
        Self {
            id: format!("gpui_kit_hover_card-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitHoverCardProps,
        _changed: GpuiKitHoverCardChanged,
        _cx: &mut GpuiKitHoverCardContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitHoverCardProps,
        _window: &mut Window,
        cx: &mut GpuiKitHoverCardContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let trigger = cx.children().into_iter().next();
        let sender = cx.event_sender();
        let mut element = HoverCard::new(self.id.clone())
            .anchor(anchor(props.anchor()))
            .appearance(props.appearance())
            .trigger(SlotTrigger::new(format!("{}-trigger", self.id), trigger))
            .on_open_change(move |open, _window, _cx| {
                sender
                    .gpui_kit_hover_card_open_change(OnGpuiKitHoverCardOpenChange { open: *open });
            });
        if props.open_delay() >= 0.0 {
            element = element.open_delay(Duration::from_millis(props.open_delay() as u64));
        }
        if props.close_delay() >= 0.0 {
            element = element.close_delay(Duration::from_millis(props.close_delay() as u64));
        }
        if let Some(content) = renderers.get("content") {
            let width = gpui::px(if props.card_width() > 0.0 {
                props.card_width() as f32
            } else {
                240.0
            });
            element = element
                .content(move |_state, window, cx| gpui::div().w(width).child(content(window, cx)));
        }
        element.into_any_element()
    }
}
