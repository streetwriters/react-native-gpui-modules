use gpui::{AnyElement, IntoElement, ParentElement as _, SharedString, Window};
use gpui_component::accordion::Accordion;
use gpui_component::{Sizable as _, Size};

use super::slots::Slots;
use crate::*;

pub struct GpuiKitAccordion {
    id: String,
}

impl GpuiKitAccordionSpec for GpuiKitAccordion {
    fn create(_props: &GpuiKitAccordionProps, cx: &mut GpuiKitAccordionContext) -> Self {
        Self {
            id: format!("gpui_kit_accordion-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitAccordionProps,
        _changed: GpuiKitAccordionChanged,
        _cx: &mut GpuiKitAccordionContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitAccordionProps,
        _window: &mut Window,
        cx: &mut GpuiKitAccordionContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut element = Accordion::new(SharedString::from(self.id.clone()))
            .multiple(props.multiple())
            .bordered(props.bordered())
            .disabled(props.disabled());
        let title_style = crate::style::refinement(props.title_style());
        let content_style = crate::style::refinement(props.content_style());
        let hover_style = crate::style::refinement(props.item_hover_style());
        let items = props.items();
        for (index, item) in (0..items.len())
            .filter_map(|index| items.get(index))
            .enumerate()
        {
            let content = slots.take(&format!("item-{index}"));
            let title_content = slots.take(&format!("title-{index}"));
            let text = item.text().to_string();
            let item_title_style = crate::style::refinement(item.title_style());
            let item_content_style = crate::style::refinement(item.content_style());
            let title = item.title().to_string();
            let icon = crate::generated::icons::parse(item.icon());
            let (open, disabled) = (item.open(), item.disabled());
            let (title_style, content_style, hover_style) = (
                title_style.clone(),
                content_style.clone(),
                hover_style.clone(),
            );
            element = element.item(move |mut entry| {
                entry = match title_content {
                    Some(title) => entry.title(title),
                    None => entry.title(title),
                }
                .open(open)
                .disabled(disabled);
                if let Some(icon) = icon {
                    entry = entry.icon(icon);
                }
                if let Some(style) = title_style {
                    entry = entry.title_style(style);
                }
                if let Some(style) = content_style {
                    entry = entry.content_style(style);
                }
                if let Some(style) = item_title_style {
                    entry = entry.title_style(style);
                }
                if let Some(style) = item_content_style {
                    entry = entry.content_style(style);
                }
                if let Some(style) = hover_style {
                    entry = entry.hover(move |_| style);
                }
                match content {
                    Some(content) => entry.child(content),
                    None if !text.is_empty() => entry.child(text),
                    None => entry,
                }
            });
        }
        match props.size() {
            GpuiKitAccordionSize::Unset => {}
            GpuiKitAccordionSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitAccordionSize::Small => element = element.with_size(Size::Small),
            GpuiKitAccordionSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitAccordionSize::Large => element = element.with_size(Size::Large),
        }
        element
            .on_toggle_click(move |open, _window, _cx| {
                let open = open
                    .iter()
                    .map(usize::to_string)
                    .collect::<Vec<_>>()
                    .join(",");
                sender.gpui_kit_accordion_toggle(OnGpuiKitAccordionToggle { open });
            })
            .into_any_element()
    }
}
