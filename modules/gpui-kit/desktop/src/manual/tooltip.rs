use gpui::{
    AnyElement, InteractiveElement as _, IntoElement, ParentElement as _,
    StatefulInteractiveElement as _, Styled as _, Window,
};
use gpui_component::tooltip::Tooltip;

use super::slots::Renderers;
use super::trigger::SlotTrigger;
use crate::*;

pub struct GpuiKitTooltip {
    id: String,
}

impl GpuiKitTooltipSpec for GpuiKitTooltip {
    fn create(_props: &GpuiKitTooltipProps, cx: &mut GpuiKitTooltipContext) -> Self {
        Self {
            id: format!("gpui_kit_tooltip-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitTooltipProps,
        _changed: GpuiKitTooltipChanged,
        _cx: &mut GpuiKitTooltipContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitTooltipProps,
        _window: &mut Window,
        cx: &mut GpuiKitTooltipContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let trigger = cx.children().into_iter().next();
        let text = props.text().to_string();
        let width = gpui::px(if props.content_width() > 0.0 {
            props.content_width() as f32
        } else {
            200.0
        });
        let base = SlotTrigger::new(format!("{}-trigger", self.id), trigger)
            .into_base()
            .relative()
            .size_full();
        // The React Native views of the trigger cover it, so the hover and the
        // tooltip belong to a layer above them.
        let layer = gpui::div()
            .id(gpui::SharedString::from(format!("{}-hover", self.id)))
            .absolute()
            .top_0()
            .left_0()
            .size_full();
        match renderers.get("content") {
            Some(content) => base
                .child(layer.tooltip(move |window, cx| {
                    let content = content.clone();
                    Tooltip::element(move |window, cx| {
                        gpui::div().w(width).child(content(window, cx))
                    })
                    .build(window, cx)
                }))
                .into_any_element(),
            None => base
                .child(
                    layer.tooltip(move |window, cx| Tooltip::new(text.clone()).build(window, cx)),
                )
                .into_any_element(),
        }
    }
}
