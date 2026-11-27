use gpui::{AnyElement, IntoElement, ParentElement as _, Window};
use gpui_component::badge::Badge;
use gpui_component::Sizable as _;

use super::slots::Slots;
use crate::*;

pub struct GpuiKitBadge;

impl GpuiKitBadgeSpec for GpuiKitBadge {
    fn create(_props: &GpuiKitBadgeProps, _cx: &mut GpuiKitBadgeContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitBadgeProps,
        _changed: GpuiKitBadgeChanged,
        _cx: &mut GpuiKitBadgeContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitBadgeProps,
        _window: &mut Window,
        cx: &mut GpuiKitBadgeContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut element = Badge::new();
        if props.dot() {
            element = element.dot();
        }
        if props.count() > 0 {
            element = element.count(props.count() as usize);
        }
        if let Some(icon) = crate::generated::icons::parse(props.icon()) {
            element = element.icon(icon);
        }
        if props.max() > 0 {
            element = element.max(props.max() as usize);
        }
        if let Some(color) = props.color() {
            element = element.color(crate::color::hsla(color));
        }
        element = match props.size() {
            GpuiKitBadgeSize::Unset => element,
            GpuiKitBadgeSize::Xsmall => element.with_size(gpui_component::Size::XSmall),
            GpuiKitBadgeSize::Small => element.with_size(gpui_component::Size::Small),
            GpuiKitBadgeSize::Medium => element.with_size(gpui_component::Size::Medium),
            GpuiKitBadgeSize::Large => element.with_size(gpui_component::Size::Large),
        };
        if let Some(child) = slots.take("child") {
            element = element.child(child);
        }
        element.into_any_element()
    }
}
