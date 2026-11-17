use gpui::{AnyElement, Axis, IntoElement, ParentElement as _, SharedString, Window};
use gpui_component::stepper::{Stepper, StepperItem};
use gpui_component::{Sizable as _, Size};

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
        let items = props.items();
        for item in (0..items.len()).filter_map(|index| items.get(index)) {
            let mut entry = StepperItem::new().disabled(item.disabled());
            if let Some(icon) = crate::generated::icons::parse(item.icon()) {
                entry = entry.icon(icon);
            }
            if !item.title().is_empty() {
                entry = entry.child(item.title().to_string());
            }
            element = element.item(entry);
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
