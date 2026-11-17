use gpui::{AnyElement, IntoElement, ParentElement as _, SharedString, Window};
use gpui_component::collapsible::Collapsible;

use super::slots::Slots;
use crate::*;

pub struct GpuiKitCollapsible {
    id: String,
}

impl GpuiKitCollapsibleSpec for GpuiKitCollapsible {
    fn create(_props: &GpuiKitCollapsibleProps, cx: &mut GpuiKitCollapsibleContext) -> Self {
        Self {
            id: format!("gpui_kit_collapsible-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitCollapsibleProps,
        _changed: GpuiKitCollapsibleChanged,
        _cx: &mut GpuiKitCollapsibleContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitCollapsibleProps,
        _window: &mut Window,
        cx: &mut GpuiKitCollapsibleContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut element = Collapsible::new()
            .motion_id(SharedString::from(self.id.clone()))
            .open(props.open());
        if let Some(trigger) = slots.take("trigger") {
            element = element.child(trigger);
        }
        if let Some(content) = slots.take("content") {
            element = element.content(content);
        }
        element.into_any_element()
    }
}
