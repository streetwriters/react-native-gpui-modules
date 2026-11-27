use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    div, px, AnyElement, App, Axis, IntoElement, ParentElement as _, SharedString, Styled as _,
    Window,
};
use gpui_component::group_box::GroupBoxVariant;
use gpui_component::setting::{
    NumberFieldOptions, SettingField, SettingGroup, SettingItem, SettingPage, Settings,
};
use gpui_component::text::markdown;
use gpui_component::{Icon, Sizable as _, Size};
use react_native_gpui::native_tree::ChildRenderer;
use serde::Deserialize;
use serde_json::Value;

use super::slots::Renderers;
use crate::*;

#[derive(Default, Deserialize)]
#[serde(default, rename_all = "camelCase")]
struct PageSpec {
    title: String,
    icon: String,
    description: String,
    resettable: Option<bool>,
    default_open: bool,
    groups: Vec<GroupSpec>,
}

#[derive(Default, Deserialize)]
#[serde(default, rename_all = "camelCase")]
struct GroupSpec {
    title: String,
    description: String,
    footer: String,
    items: Vec<ItemSpec>,
}

#[derive(Default, Deserialize)]
#[serde(default, rename_all = "camelCase")]
struct ItemSpec {
    /// `switch`, `checkbox`, `dropdown`, `number`, `input`, `field` (React
    /// Native control beside the title) or `render` (the whole row).
    kind: String,
    key: String,
    title: String,
    description: String,
    markdown: bool,
    keywords: Vec<String>,
    vertical: bool,
    disabled: bool,
    value: Value,
    default_value: Option<Value>,
    options: Vec<(String, String)>,
    scrollable: bool,
    min: Option<f64>,
    max: Option<f64>,
    step: Option<f64>,
    /// Width of the control, in points.
    width: Option<f64>,
    /// An item with React Native content shows the reset button while dirty.
    dirty: Option<bool>,
}

type Values = Rc<RefCell<HashMap<String, Value>>>;

pub struct GpuiKitSettings {
    id: String,
    values: Values,
    /// The values the props last gave, so a value set in the kit stays until
    /// the props change it.
    given: HashMap<String, Value>,
}

impl GpuiKitSettingsSpec for GpuiKitSettings {
    fn create(_props: &GpuiKitSettingsProps, cx: &mut GpuiKitSettingsContext) -> Self {
        Self {
            id: format!("gpui_kit_settings-{}", cx.tag()),
            values: Rc::default(),
            given: HashMap::new(),
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
        cx: &mut GpuiKitSettingsContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let sender = cx.event_sender();
        let pages: Vec<PageSpec> = serde_json::from_str(props.pages_json()).unwrap_or_default();
        for item in pages
            .iter()
            .flat_map(|page| &page.groups)
            .flat_map(|group| &group.items)
        {
            if item.key.is_empty() || item.value.is_null() {
                continue;
            }
            if self.given.get(&item.key) != Some(&item.value) {
                self.given.insert(item.key.clone(), item.value.clone());
                self.values
                    .borrow_mut()
                    .insert(item.key.clone(), item.value.clone());
            }
        }
        let builder = Builder {
            values: self.values.clone(),
            renderers: &renderers,
            sender,
        };
        let mut settings = Settings::new(self.id.clone()).pages(
            pages
                .into_iter()
                .enumerate()
                .map(|(p, page)| builder.page(p, page)),
        );
        if props.sidebar_width() > 0.0 {
            settings = settings.sidebar_width(px(props.sidebar_width() as f32));
        }
        match props.group_variant() {
            "normal" => settings = settings.with_group_variant(GroupBoxVariant::Normal),
            "outline" => settings = settings.with_group_variant(GroupBoxVariant::Outline),
            "fill" => settings = settings.with_group_variant(GroupBoxVariant::Fill),
            _ => {}
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

struct Builder<'a> {
    values: Values,
    renderers: &'a Renderers,
    sender: GpuiKitSettingsEventSender,
}

type ResetHandlers = (
    Box<dyn Fn(&App) -> bool + 'static>,
    Box<dyn Fn(&mut Window, &mut App) + 'static>,
);

impl Builder<'_> {
    fn page(&self, p: usize, spec: PageSpec) -> SettingPage {
        let mut page = SettingPage::new(spec.title).default_open(spec.default_open);
        if let Some(resettable) = spec.resettable {
            page = page.resettable(resettable);
        }
        if let Some(icon) = crate::generated::icons::parse(&spec.icon) {
            page = page.icon(Icon::new(icon));
        }
        if !spec.description.is_empty() {
            page = page.description(spec.description);
        }
        if let Some(suffix) = self.renderers.get(&format!("page-{p}-suffix")) {
            page = page.title_suffix(move |window, cx| suffix(window, cx));
        }
        page.groups(
            spec.groups
                .into_iter()
                .enumerate()
                .map(|(g, group)| self.group(p, g, group)),
        )
    }

    fn group(&self, p: usize, g: usize, spec: GroupSpec) -> SettingGroup {
        let mut group = SettingGroup::new();
        if !spec.title.is_empty() {
            group = group.title(spec.title);
        }
        if !spec.description.is_empty() {
            group = group.description(spec.description);
        }
        if let Some(footer) = self.renderers.get(&format!("group-{p}-{g}-footer")) {
            group = group.footer(move |window, cx| footer(window, cx));
        } else if !spec.footer.is_empty() {
            let footer = SharedString::from(spec.footer);
            group = group.footer(move |_, _| footer.clone());
        }
        group.items(spec.items.into_iter().enumerate().map(|(i, item)| {
            let content = self.renderers.get(&format!("item-{p}-{g}-{i}"));
            self.item(item, content)
        }))
    }

    fn reset(&self, spec: &ItemSpec) -> Option<ResetHandlers> {
        let dirty = spec.dirty?;
        let sender = self.sender.clone();
        let key = spec.key.clone();
        Some((
            Box::new(move |_| dirty),
            Box::new(move |_, _| {
                sender.gpui_kit_settings_reset(OnGpuiKitSettingsReset { key: key.clone() });
            }),
        ))
    }

    fn item(&self, spec: ItemSpec, content: Option<ChildRenderer>) -> SettingItem {
        let reset = self.reset(&spec);
        let width = spec.width.map(|width| px(width as f32));
        if spec.kind == "render" {
            let mut item = SettingItem::render(move |_options, window, cx| {
                div()
                    .w_full()
                    .children(content.as_ref().map(|content| content(window, cx)))
            })
            .disabled(spec.disabled)
            .keywords(spec.keywords);
            if let Some((dirty, reset)) = reset {
                item = item.on_reset(dirty, reset);
            }
            return item;
        }
        let key = spec.key.clone();
        let item = match spec.kind.as_str() {
            "switch" | "checkbox" => {
                let (get, set) = self.accessors(&key, Value::as_bool, Value::Bool);
                let get = move |_: &App| get().unwrap_or(false);
                let mut field = if spec.kind == "switch" {
                    SettingField::switch(get, set)
                } else {
                    SettingField::checkbox(get, set)
                };
                if let Some(value) = spec.default_value.as_ref().and_then(Value::as_bool) {
                    field = field.default_value(value);
                }
                SettingItem::new(spec.title, field)
            }
            "number" => {
                let (get, set) = self.accessors(&key, Value::as_f64, |value: f64| {
                    serde_json::Number::from_f64(value).map_or(Value::Null, Value::Number)
                });
                let defaults = NumberFieldOptions::default();
                let options = NumberFieldOptions {
                    min: spec.min.unwrap_or(defaults.min),
                    max: spec.max.unwrap_or(defaults.max),
                    step: spec.step.unwrap_or(defaults.step),
                };
                let mut field =
                    SettingField::number_input(options, move |_| get().unwrap_or(0.0), set);
                if let Some(value) = spec.default_value.as_ref().and_then(Value::as_f64) {
                    field = field.default_value(value);
                }
                if let Some(width) = width {
                    field = field.w(width);
                }
                SettingItem::new(spec.title, field)
            }
            "input" | "dropdown" => {
                let (get, set) = self.accessors(
                    &key,
                    |value: &Value| value.as_str().map(SharedString::from),
                    |value: SharedString| Value::String(value.to_string()),
                );
                let get = move |_: &App| get().unwrap_or_default();
                let mut field = if spec.kind == "input" {
                    SettingField::input(get, set)
                } else {
                    let options: Vec<(SharedString, SharedString)> = spec
                        .options
                        .into_iter()
                        .map(|(value, label)| (value.into(), label.into()))
                        .collect();
                    if spec.scrollable {
                        SettingField::scrollable_dropdown(options, get, set)
                    } else {
                        SettingField::dropdown(options, get, set)
                    }
                };
                if let Some(value) = spec.default_value.as_ref().and_then(Value::as_str) {
                    field = field.default_value(value.to_string());
                }
                if let Some(width) = width {
                    field = field.w(width);
                }
                SettingItem::new(spec.title, field)
            }
            _ => {
                let mut field =
                    SettingField::<SharedString>::render(move |_options, window, cx| {
                        div()
                            .when_some(width, |this, width| this.w(width))
                            .children(content.as_ref().map(|content| content(window, cx)))
                    });
                if let Some((dirty, reset)) = reset {
                    field = field.on_reset(dirty, reset);
                }
                SettingItem::new(spec.title, field)
            }
        };
        let mut item = item
            .layout(if spec.vertical {
                Axis::Vertical
            } else {
                Axis::Horizontal
            })
            .disabled(spec.disabled)
            .keywords(spec.keywords);
        if !spec.description.is_empty() {
            item = if spec.markdown {
                item.description(markdown(spec.description))
            } else {
                item.description(SharedString::from(spec.description))
            };
        }
        item
    }

    /// The getter and setter of a kit field over the item's value: the setter
    /// keeps the value and reports it.
    #[allow(clippy::type_complexity)]
    fn accessors<T: 'static>(
        &self,
        key: &str,
        read: impl Fn(&Value) -> Option<T> + 'static,
        write: impl Fn(T) -> Value + 'static,
    ) -> (
        impl Fn() -> Option<T> + 'static,
        impl Fn(T, &mut App) + 'static,
    ) {
        let values = self.values.clone();
        let key = key.to_string();
        let get = {
            let values = values.clone();
            let key = key.clone();
            move || values.borrow().get(&key).and_then(&read)
        };
        let sender = self.sender.clone();
        let set = move |value: T, _: &mut App| {
            let value = write(value);
            values.borrow_mut().insert(key.clone(), value.clone());
            sender.gpui_kit_settings_change(OnGpuiKitSettingsChange {
                key: key.clone(),
                value: value.to_string(),
            });
        };
        (get, set)
    }
}
