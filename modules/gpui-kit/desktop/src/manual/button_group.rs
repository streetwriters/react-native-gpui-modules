use gpui::{AnyElement, Axis, IntoElement, SharedString, Window};
use gpui_component::button::{Button, ButtonGroup, ButtonVariant, ButtonVariants as _};
use gpui_component::{Disableable as _, Selectable as _, Sizable as _, Size};

use crate::*;

pub struct GpuiKitButtonGroup {
    id: String,
}

pub(super) fn button_variant(name: &str) -> Option<ButtonVariant> {
    Some(match name {
        "default" => ButtonVariant::Default,
        "primary" => ButtonVariant::Primary,
        "secondary" => ButtonVariant::Secondary,
        "danger" => ButtonVariant::Danger,
        "info" => ButtonVariant::Info,
        "success" => ButtonVariant::Success,
        "warning" => ButtonVariant::Warning,
        "ghost" => ButtonVariant::Ghost,
        "link" => ButtonVariant::Link,
        "text" => ButtonVariant::Text,
        _ => return None,
    })
}

impl GpuiKitButtonGroupSpec for GpuiKitButtonGroup {
    fn create(_props: &GpuiKitButtonGroupProps, cx: &mut GpuiKitButtonGroupContext) -> Self {
        Self {
            id: format!("gpui_kit_button_group-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitButtonGroupProps,
        _changed: GpuiKitButtonGroupChanged,
        _cx: &mut GpuiKitButtonGroupContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitButtonGroupProps,
        _window: &mut Window,
        cx: &mut GpuiKitButtonGroupContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let mut element = ButtonGroup::new(SharedString::from(self.id.clone()));
        let items = props.items();
        for (index, item) in (0..items.len())
            .filter_map(|index| items.get(index))
            .enumerate()
        {
            let mut button = Button::new(SharedString::from(format!("{}-{index}", self.id)))
                .selected(item.selected())
                .disabled(item.disabled());
            if !item.label().is_empty() {
                button = button.label(item.label().to_string());
            }
            if let Some(icon) = crate::generated::icons::parse(item.icon()) {
                button = button.icon(icon);
            }
            if let Some(variant) = button_variant(item.variant()) {
                button = button.with_variant(variant);
            }
            element = element.child(button);
        }
        if props.multiple() {
            element = element.multiple(true);
        }
        if props.compact() {
            element = element.compact();
        }
        if props.outline() {
            element = element.outline();
        }
        if props.disabled() {
            element = element.disabled(true);
        }
        match props.layout() {
            GpuiKitButtonGroupLayout::Unset | GpuiKitButtonGroupLayout::Horizontal => {}
            GpuiKitButtonGroupLayout::Vertical => element = element.layout(Axis::Vertical),
        }
        match props.size() {
            GpuiKitButtonGroupSize::Unset => {}
            GpuiKitButtonGroupSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitButtonGroupSize::Small => element = element.with_size(Size::Small),
            GpuiKitButtonGroupSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitButtonGroupSize::Large => element = element.with_size(Size::Large),
        }
        if let Some(variant) = button_variant(props.variant()) {
            element = element.with_variant(variant);
        }
        element
            .on_click(move |indices, _window, _cx| {
                let pressed = indices
                    .iter()
                    .map(usize::to_string)
                    .collect::<Vec<_>>()
                    .join(",");
                sender.gpui_kit_button_group_press(OnGpuiKitButtonGroupPress { pressed });
            })
            .into_any_element()
    }
}
