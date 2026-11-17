use gpui::prelude::FluentBuilder as _;
use gpui::{
    div, px, AnyElement, Axis, IntoElement, ParentElement as _, SharedString, Styled as _, Window,
};
use gpui_component::setting::{SettingField, SettingGroup, SettingItem, SettingPage, Settings};
use gpui_component::{h_flex, v_flex, ActiveTheme as _, Sizable as _, Size};

use super::slots::Renderers;
use crate::*;

pub struct GpuiKitSettings {
    id: String,
}

impl GpuiKitSettingsSpec for GpuiKitSettings {
    fn create(_props: &GpuiKitSettingsProps, cx: &mut GpuiKitSettingsContext) -> Self {
        Self {
            id: format!("gpui_kit_settings-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitSettingsProps,
        _changed: GpuiKitSettingsChanged,
        _cx: &mut GpuiKitSettingsContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitSettingsProps,
        _window: &mut Window,
        _cx: &mut GpuiKitSettingsContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let field_width = px(props.field_width() as f32);
        let entries = props.items();
        let mut pages: Vec<(String, Vec<(String, Vec<SettingItem>)>)> = Vec::new();
        for index in 0..entries.len() {
            let Some(entry) = entries.get(index) else {
                continue;
            };
            let page = entry.page().to_string();
            let group = entry.group().to_string();
            let item = self.item(
                &entry,
                renderers.get(&format!("field-{index}")),
                field_width,
            );
            if pages.last().map(|(name, _)| name != &page).unwrap_or(true) {
                pages.push((page, Vec::new()));
            }
            let groups = &mut pages.last_mut().expect("a page").1;
            if groups
                .last()
                .map(|(name, _)| name != &group)
                .unwrap_or(true)
            {
                groups.push((group, Vec::new()));
            }
            groups.last_mut().expect("a group").1.push(item);
        }
        let mut settings =
            Settings::new(self.id.clone()).pages(pages.into_iter().map(|(page, groups)| {
                SettingPage::new(page).groups(groups.into_iter().map(|(group, items)| {
                    let mut group_view = SettingGroup::new();
                    if !group.is_empty() {
                        group_view = group_view.title(group);
                    }
                    group_view.items(items)
                }))
            }));
        if props.sidebar_width() > 0.0 {
            settings = settings.sidebar_width(px(props.sidebar_width() as f32));
        }
        match props.size() {
            GpuiKitSettingsSize::Unset => {}
            GpuiKitSettingsSize::Xsmall => settings = settings.with_size(Size::XSmall),
            GpuiKitSettingsSize::Small => settings = settings.with_size(Size::Small),
            GpuiKitSettingsSize::Medium => settings = settings.with_size(Size::Medium),
            GpuiKitSettingsSize::Large => settings = settings.with_size(Size::Large),
        }
        settings.into_any_element()
    }
}

impl GpuiKitSettings {
    fn item(
        &self,
        entry: &GpuiKitSettingsItems,
        field: Option<react_native_gpui::native_tree::ChildRenderer>,
        field_width: gpui::Pixels,
    ) -> SettingItem {
        let title = entry.title().to_string();
        let description = entry.description().to_string();
        let vertical = entry.vertical();
        let disabled = entry.disabled();
        if entry.kit_field() {
            let field = SettingField::<SharedString>::render(move |_options, window, cx| {
                let control = field.as_ref().map(|field| field(window, cx));
                div().w(field_width).children(control)
            });
            let mut item = SettingItem::new(title, field)
                .layout(if vertical { Axis::Vertical } else { Axis::Horizontal })
                .disabled(disabled);
            if !description.is_empty() {
                item = item.description(description);
            }
            return item;
        }
        SettingItem::render(move |_options, window, cx| {
            let heading = v_flex()
                .flex_1()
                .gap_1()
                .child(div().child(title.clone()))
                .when(!description.is_empty(), |heading| {
                    heading.child(
                        div()
                            .text_sm()
                            .text_color(cx.theme().muted_foreground)
                            .child(description.clone()),
                    )
                });
            let control = field
                .as_ref()
                .map(|field| div().w(field_width).child(field(window, cx)));
            if vertical {
                v_flex().gap_2().child(heading).children(control)
            } else {
                h_flex()
                    .gap_3()
                    .justify_between()
                    .items_center()
                    .child(heading)
                    .children(control)
            }
        })
        .disabled(disabled)
    }
}
