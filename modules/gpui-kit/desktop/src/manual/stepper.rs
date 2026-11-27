use gpui::{
    prelude::FluentBuilder as _, AnyElement, Axis, IntoElement, ParentElement as _, SharedString,
    Styled as _, Window,
};
use gpui_component::stepper::{Stepper, StepperItem};
use gpui_component::{v_flex, Sizable as _, Size};

use super::slots::Slots;

use crate::*;

pub struct GpuiKitStepper {
    id: String,
}

impl GpuiKitStepperSpec for GpuiKitStepper {
    fn create(_props: &GpuiKitStepperProps, cx: &mut GpuiKitStepperContext) -> Self {
        Self {
            id: format!("gpui_kit_stepper-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitStepperProps,
        _changed: GpuiKitStepperChanged,
        _cx: &mut GpuiKitStepperContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitStepperProps,
        _window: &mut Window,
        cx: &mut GpuiKitStepperContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let mut element = Stepper::new(SharedString::from(self.id.clone()))
            .selected_index(props.selected_index().max(0) as usize)
            .text_center(props.text_center())
            .disabled(props.disabled());
        let mut slots = Slots::new(props.slots(), cx.children());
        let items = props.items();
        for index in 0..items.len() {
            let Some(item) = items.get(index) else {
                continue;
            };
            let mut entry = StepperItem::new().disabled(item.disabled());
            if let Some(icon) = crate::generated::icons::parse(item.icon()) {
                entry = entry.icon(icon);
            }
            if let Some(content) = slots.take(&format!("step-{index}")) {
                entry = entry.child(content);
            } else if !item.description().is_empty() {
                let content = v_flex()
                    .when(props.text_center(), |this| this.items_center())
                    .child(item.title().to_string())
                    .child(item.description().to_string());
                entry = entry.child(content);
            } else if !item.title().is_empty() {
                entry = entry.child(item.title().to_string());
            }
            if let Some(style) = crate::style::refinement(item.kit_style()) {
                gpui::Refineable::refine(gpui::Styled::style(&mut entry), &style);
            }
            element = element.item(entry);
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        match props.layout() {
            GpuiKitStepperLayout::Unset | GpuiKitStepperLayout::Horizontal => {
                element = element.layout(Axis::Horizontal)
            }
            GpuiKitStepperLayout::Vertical => element = element.layout(Axis::Vertical),
        }
        match props.size() {
            GpuiKitStepperSize::Unset => {}
            GpuiKitStepperSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitStepperSize::Small => element = element.with_size(Size::Small),
            GpuiKitStepperSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitStepperSize::Large => element = element.with_size(Size::Large),
        }
        element
            .on_click(move |index, _window, _cx| {
                sender.gpui_kit_stepper_select(OnGpuiKitStepperSelect {
                    index: *index as i32,
                });
            })
            .into_any_element()
    }
}
