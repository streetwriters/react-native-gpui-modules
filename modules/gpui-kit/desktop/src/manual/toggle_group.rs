use gpui::{AnyElement, IntoElement, SharedString, Window};
use gpui_component::button::{Toggle, ToggleGroup, ToggleVariant, ToggleVariants as _};
use gpui_component::{Disableable as _, Sizable as _, Size};

use crate::*;

pub struct GpuiKitToggleGroup {
    id: String,
}

impl GpuiKitToggleGroupSpec for GpuiKitToggleGroup {
    fn create(_props: &GpuiKitToggleGroupProps, cx: &mut GpuiKitToggleGroupContext) -> Self {
        Self {
            id: format!("gpui_kit_toggle_group-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitToggleGroupProps,
        _changed: GpuiKitToggleGroupChanged,
        _cx: &mut GpuiKitToggleGroupContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitToggleGroupProps,
        _window: &mut Window,
        cx: &mut GpuiKitToggleGroupContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let mut element = ToggleGroup::new(SharedString::from(self.id.clone()));
        let items = props.items();
        for (index, item) in (0..items.len())
            .filter_map(|index| items.get(index))
            .enumerate()
        {
            let mut toggle = Toggle::new(SharedString::from(format!("{}-{index}", self.id)))
                .checked(item.checked())
                .disabled(item.disabled());
            if !item.label().is_empty() {
                toggle = toggle.label(item.label().to_string());
            }
            if let Some(icon) = crate::generated::icons::parse(item.icon()) {
                toggle = toggle.icon(icon);
            }
            element = element.child(toggle);
        }
        if props.segmented() {
            element = element.segmented();
        }
        if props.single() {
            element = element.single();
        }
        if props.disabled() {
            element = element.disabled(true);
        }
        match props.variant() {
            GpuiKitToggleGroupVariant::Unset => {}
            GpuiKitToggleGroupVariant::Ghost => {
                element = element.with_variant(ToggleVariant::Ghost)
            }
            GpuiKitToggleGroupVariant::Outline => {
                element = element.with_variant(ToggleVariant::Outline)
            }
        }
        match props.size() {
            GpuiKitToggleGroupSize::Unset => {}
            GpuiKitToggleGroupSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitToggleGroupSize::Small => element = element.with_size(Size::Small),
            GpuiKitToggleGroupSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitToggleGroupSize::Large => element = element.with_size(Size::Large),
        }
        element
            .on_click(move |states, _window, _cx| {
                let checked = states
                    .iter()
                    .enumerate()
                    .filter(|(_, on)| **on)
                    .map(|(index, _)| index.to_string())
                    .collect::<Vec<_>>()
                    .join(",");
                sender.gpui_kit_toggle_group_change(OnGpuiKitToggleGroupChange { checked });
            })
            .into_any_element()
    }
}
