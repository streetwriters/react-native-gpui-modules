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
            element = element.content(EmptyContent::new().child(content));
        }
        element.into_any_element()
    }
}
