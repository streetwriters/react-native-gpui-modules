use gpui::{AnyElement, IntoElement, ParentElement as _, Window};
use gpui_component::empty::{
    Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyMediaVariant, EmptyTitle,
};

use super::slots::Slots;
use crate::*;

pub struct GpuiKitEmpty;

impl GpuiKitEmptySpec for GpuiKitEmpty {
    fn create(_props: &GpuiKitEmptyProps, _cx: &mut GpuiKitEmptyContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitEmptyProps,
        _changed: GpuiKitEmptyChanged,
        _cx: &mut GpuiKitEmptyContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitEmptyProps,
        _window: &mut Window,
        cx: &mut GpuiKitEmptyContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut header = EmptyHeader::new();
        let media = slots.take("media");
        let icon = crate::generated::icons::parse(props.icon());
        if media.is_some() || icon.is_some() {
            let mut element = EmptyMedia::new();
            if let Some(media) = media {
                element = element.child(media);
            } else if let Some(icon) = icon {
                element = element
                    .with_variant(EmptyMediaVariant::Icon)
                    .child(gpui_component::Icon::new(icon));
            }
            header = header.media(element);
        }
        if let Some(style) = crate::style::refinement(props.header_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut header), &style);
        }
        if let Some(title) = slots.take("title") {
            header = header.title(EmptyTitle::new().child(title));
        } else if !props.title().is_empty() {
            header = header.title(EmptyTitle::new().child(props.title().to_string()));
        }
        if let Some(description) = slots.take("description") {
            header = header.description(EmptyDescription::new().child(description));
        } else if !props.description().is_empty() {
            header =
                header.description(EmptyDescription::new().child(props.description().to_string()));
        }
        let mut element = Empty::new().header(header);
        if let Some(content) = slots.take("content") {
            let mut content_box = EmptyContent::new();
            if let Some(style) = crate::style::refinement(props.content_style()) {
                gpui::Refineable::refine(gpui::Styled::style(&mut content_box), &style);
            }
            element = element.content(content_box.child(content));
        }
        if let Some(extra) = slots.take("extra") {
            element = element.child(extra);
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        element.into_any_element()
    }
}
