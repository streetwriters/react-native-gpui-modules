use gpui::{AnyElement, IntoElement, ParentElement as _, SharedString, Window};
use gpui_component::group_box::{GroupBox, GroupBoxVariant, GroupBoxVariants as _};

use super::slots::Slots;
use crate::*;

pub struct GpuiKitGroupBox {
    id: String,
}

impl GpuiKitGroupBoxSpec for GpuiKitGroupBox {
    fn create(_props: &GpuiKitGroupBoxProps, cx: &mut GpuiKitGroupBoxContext) -> Self {
        Self {
            id: format!("gpui_kit_group_box-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitGroupBoxProps,
        _changed: GpuiKitGroupBoxChanged,
        _cx: &mut GpuiKitGroupBoxContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitGroupBoxProps,
        _window: &mut Window,
        cx: &mut GpuiKitGroupBoxContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut element = GroupBox::new().id(SharedString::from(self.id.clone()));
        match props.variant() {
            GpuiKitGroupBoxVariant::Unset => {}
            GpuiKitGroupBoxVariant::Normal => {
                element = element.with_variant(GroupBoxVariant::Normal)
            }
            GpuiKitGroupBoxVariant::Fill => element = element.with_variant(GroupBoxVariant::Fill),
            GpuiKitGroupBoxVariant::Outline => {
                element = element.with_variant(GroupBoxVariant::Outline)
            }
        }
        if let Some(style) = crate::style::refinement(props.title_style()) {
            element = element.title_style(style);
        }
        if let Some(style) = crate::style::refinement(props.content_style()) {
            element = element.content_style(style);
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        if let Some(title) = slots.take("title") {
            element = element.title(title);
        } else if !props.title().is_empty() {
            element = element.title(props.title().to_string());
        }
        if let Some(footer) = slots.take("footer") {
            element = element.footer(footer);
        } else if !props.footer().is_empty() {
            element = element.footer(props.footer().to_string());
        }
        if let Some(body) = slots.take("body") {
            element = element.child(body);
        }
        element.into_any_element()
    }
}
