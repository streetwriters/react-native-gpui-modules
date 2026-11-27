use gpui::{AnyElement, IntoElement, ParentElement as _, SharedString, Styled as _, Window};
use gpui_component::radio::{Radio, RadioGroup};
use gpui_component::{Sizable as _, Size};

use super::slots::Slots;
use crate::*;

pub struct GpuiKitRadioGroup {
    id: String,
}

impl GpuiKitRadioGroupSpec for GpuiKitRadioGroup {
    fn create(_props: &GpuiKitRadioGroupProps, cx: &mut GpuiKitRadioGroupContext) -> Self {
        Self {
            id: format!("gpui_kit_radio_group-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitRadioGroupProps,
        _changed: GpuiKitRadioGroupChanged,
        _cx: &mut GpuiKitRadioGroupContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitRadioGroupProps,
        _window: &mut Window,
        cx: &mut GpuiKitRadioGroupContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let mut slots = Slots::new(props.slots(), cx.children());
        let id = SharedString::from(self.id.clone());
        let mut element = match props.layout() {
            GpuiKitRadioGroupLayout::Horizontal => RadioGroup::horizontal(id),
            _ => RadioGroup::vertical(id),
        };
        let items = props.items();
        for index in 0..items.len() {
            let Some(item) = items.get(index) else {
                continue;
            };
            let mut radio = Radio::new(SharedString::from(format!("{}-{index}", self.id)))
                .disabled(item.disabled());
            if !item.label().is_empty() {
                radio = radio.label(item.label().to_string());
            }
            let size = match item.size() {
                "xsmall" => Some(Size::XSmall),
                "small" => Some(Size::Small),
                "medium" => Some(Size::Medium),
                "large" => Some(Size::Large),
                _ => None,
            };
            if let Some(size) = size {
                radio = radio.with_size(size);
            }
            if let Some(style) = crate::style::refinement(item.kit_style()) {
                gpui::Refineable::refine(gpui::Styled::style(&mut radio), &style);
            }
            if let Some(content) = slots.take(&format!("radio-{index}")) {
                radio = radio.child(content);
            }
            element = element.child(radio);
        }
        if props.selected_index() >= 0 {
            element = element.selected_index(Some(props.selected_index() as usize));
        }
        if props.disabled() {
            element = element.disabled(true);
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(element.style(), &style);
        }
        element
            .on_click(move |index, _window, _cx| {
                sender.gpui_kit_radio_group_change(OnGpuiKitRadioGroupChange {
                    index: *index as i32,
                });
            })
            .into_any_element()
    }
}
