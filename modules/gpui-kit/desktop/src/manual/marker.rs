use gpui::{AnyElement, IntoElement, ParentElement as _, SharedString, Window};
use gpui_component::marker::{
    Marker, MarkerAlignment, MarkerContent, MarkerIcon, MarkerLoadingStyle, MarkerVariant,
};
use gpui_component::shimmer::ShimmerStyle;
use gpui_component::Icon;

use super::slots::Slots;
use crate::*;

pub struct GpuiKitMarker {
    id: String,
}

impl GpuiKitMarkerSpec for GpuiKitMarker {
    fn create(_props: &GpuiKitMarkerProps, cx: &mut GpuiKitMarkerContext) -> Self {
        Self {
            id: format!("gpui_kit_marker-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitMarkerProps,
        _changed: GpuiKitMarkerChanged,
        _cx: &mut GpuiKitMarkerContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitMarkerProps,
        _window: &mut Window,
        cx: &mut GpuiKitMarkerContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut element = Marker::new().id(SharedString::from(self.id.clone()));
        match props.variant() {
            GpuiKitMarkerVariant::Unset => {}
            GpuiKitMarkerVariant::Plain => element = element.with_variant(MarkerVariant::Plain),
            GpuiKitMarkerVariant::Separator => {
                element = element.with_variant(MarkerVariant::Separator)
            }
            GpuiKitMarkerVariant::Border => element = element.with_variant(MarkerVariant::Border),
        }
        match props.alignment() {
            GpuiKitMarkerAlignment::Unset => {}
            GpuiKitMarkerAlignment::Start => element = element.alignment(MarkerAlignment::Start),
            GpuiKitMarkerAlignment::Center => element = element.alignment(MarkerAlignment::Center),
            GpuiKitMarkerAlignment::End => element = element.alignment(MarkerAlignment::End),
        }
        match props.loading_style() {
            GpuiKitMarkerLoadingStyle::Unset => {}
            GpuiKitMarkerLoadingStyle::Spinner => {
                element = element.with_loading_style(MarkerLoadingStyle::Spinner)
            }
            GpuiKitMarkerLoadingStyle::Shimmer => {
                element = element.with_loading_style(MarkerLoadingStyle::Shimmer)
            }
        }
        if props.loading() {
            element = element.loading(true);
        }
        if let Some(role) = crate::role::role_override(props.accessibility_role_override()) {
            element = element.role(role);
        }
        if let Some(style) = crate::style::refinement(props.separator_style()) {
            element = element.separator_style(style);
        }
        let mut shimmer = ShimmerStyle::new()
            .reverse(props.shimmer_reverse())
            .once(props.shimmer_once());
        if props.shimmer_duration() > 0.0 {
            shimmer = shimmer.duration(std::time::Duration::from_millis(
                props.shimmer_duration() as u64
            ));
        }
        if props.shimmer_highlight_color() != 0 {
            shimmer =
                shimmer.highlight_color(crate::color::hsla(props.shimmer_highlight_color() as u32));
        }
        if props.shimmer_spread() > 0.0 {
            shimmer = shimmer.spread(props.shimmer_spread() as f32);
        }
        element = element.with_shimmer_style(shimmer);
        if let Some(slot) = slots.take("icon") {
            element = element.icon(MarkerIcon::new().child(slot));
        } else if let Some(icon) = crate::generated::icons::parse(props.icon()) {
            element = element.icon(MarkerIcon::new().child(Icon::new(icon)));
        }
        let mut content = MarkerContent::new();
        if !props.text().is_empty() {
            content = content.text(props.text().to_string());
        }
        if let Some(slot) = slots.take("content") {
            content = content.child(slot);
        }
        element = element.content(content);
        if let Some(after) = slots.take("after") {
            element = element.child(after);
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        element.into_any_element()
    }
}
