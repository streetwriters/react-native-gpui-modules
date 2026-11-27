use std::rc::Rc;

use gpui::{
    prelude::FluentBuilder as _, AnyElement, IntoElement, Keystroke, ParentElement, Styled,
};
use gpui_component::button::ButtonVariants as _;
use gpui_component::input::{
    InputGroup, InputGroupAddon, InputGroupAddonAlignment, InputGroupButton, InputGroupControl,
    InputGroupText,
};
use gpui_component::kbd::Kbd;
use gpui_component::label::Label;
use gpui_component::menu::{DropdownMenu as _, PopupMenuItem};
use gpui_component::popover::Popover;
use gpui_component::spinner::Spinner;
use gpui_component::{Disableable as _, Icon, Sizable as _, Size, StyledExt as _};
use serde::Deserialize;

use super::slots::{Renderers, Slots};

#[derive(Deserialize, Default)]
#[serde(default)]
struct Group {
    invalid: bool,
    addons: Vec<Addon>,
}

#[derive(Deserialize, Default)]
#[serde(default)]
struct Addon {
    align: String,
    style: String,
    items: Vec<Item>,
}

#[derive(Deserialize, Default)]
#[serde(default)]
struct Item {
    kind: String,
    text: String,
    icon: String,
    label: String,
    variant: String,
    tooltip: String,
    disabled: bool,
    loading: bool,
    color: Option<u32>,
    keys: String,
    push: bool,
    style: String,
    size: String,
    caret: bool,
    menu: Vec<Entry>,
    popover: bool,
    popover_width: f32,
}

#[derive(Deserialize, Default, Clone)]
#[serde(default)]
struct Entry {
    label: String,
    checked: bool,
    disabled: bool,
    separator: bool,
}

/// Whether `json` (the `addonsJson` prop) puts the control in an input group.
pub(crate) fn grouped(json: &str) -> bool {
    !json.is_empty()
}

/// Places `control` in the kit's `InputGroup` described by `json`; items of
/// kind `content` take the React Native slot `addon-<addon>-<item>`.
#[allow(clippy::too_many_arguments)]
pub(crate) fn wrap(
    control: impl Into<InputGroupControl>,
    id: String,
    json: &str,
    size: Option<Size>,
    disabled: bool,
    readonly: bool,
    slot_names: &str,
    slots: &mut Slots,
    on_press: Rc<dyn Fn(i32, i32, i32)>,
) -> AnyElement {
    let group: Group = serde_json::from_str(json).unwrap_or_default();
    let renderers = Renderers::new(slot_names);
    let mut element = InputGroup::new(gpui::SharedString::from(id.clone()))
        .input(control)
        .disabled(disabled)
        .readonly(readonly)
        .invalid(group.invalid);
    if let Some(size) = size {
        element = element.with_size(size);
    }
    for (a, addon) in group.addons.iter().enumerate() {
        if addon.items.is_empty() {
            continue;
        }
        let mut target = InputGroupAddon::new(gpui::SharedString::from(format!("{id}-addon-{a}")))
            .align(match addon.align.as_str() {
                "inline-end" => InputGroupAddonAlignment::InlineEnd,
                "block-start" => InputGroupAddonAlignment::BlockStart,
                "block-end" => InputGroupAddonAlignment::BlockEnd,
                _ => InputGroupAddonAlignment::InlineStart,
            });
        if let Some(style) = crate::style::refinement(&addon.style) {
            target = target.refine_style(&style);
        }
        for (i, item) in addon.items.iter().enumerate() {
            let icon = crate::generated::icons::parse(&item.icon).map(Icon::new);
            let child: Option<AnyElement> = match item.kind.as_str() {
                "content" => slots.take(&format!("addon-{a}-{i}")),
                "icon" => icon.map(|icon| {
                    icon.size_4()
                        .when_some(item.color, |icon, color| {
                            icon.text_color(crate::color::hsla(color))
                        })
                        .into_any_element()
                }),
                "kbd" => Keystroke::parse(super::kbd::interned(&item.keys))
                    .ok()
                    .map(|keys| Kbd::new(keys).into_any_element()),
                "spinner" => Some(Spinner::new().small().into_any_element()),
                "label" => Some(
                    Label::new(item.text.clone())
                        .when_some(item.color, |label, color| {
                            label.text_color(crate::color::hsla(color))
                        })
                        .into_any_element(),
                ),
                "button" => {
                    let on_press = on_press.clone();
                    let (a, i) = (a as i32, i as i32);
                    let mut button = InputGroupButton::new(gpui::SharedString::from(format!(
                        "{id}-addon-{a}-{i}"
                    )))
                    .disabled(item.disabled)
                    .loading(item.loading)
                    .dropdown_caret(item.caret);
                    if item.menu.is_empty() && !item.popover {
                        let on_press = on_press.clone();
                        button = button.on_click(move |_, _, _| on_press(a, i, -1));
                    }
                    if !item.label.is_empty() {
                        button = button.label(item.label.clone());
                    }
                    if let Some(icon) = icon {
                        button = button.icon(icon);
                    }
                    if !item.tooltip.is_empty() {
                        button = button
                            .tooltip(item.tooltip.clone())
                            .accessibility_label(item.tooltip.clone());
                    }
                    if item.variant == "outline" {
                        button = button.outline();
                    }
                    button = match item.variant.as_str() {
                        "primary" => button.primary(),
                        "secondary" => button.secondary(),
                        "danger" => button.danger(),
                        _ => button,
                    };
                    if let Some(color) = item.color {
                        button = button.text_color(crate::color::hsla(color));
                    }
                    if let Some(style) = crate::style::refinement(&item.style) {
                        button = button.refine_style(&style);
                    }
                    button = match item.size.as_str() {
                        "small" => button.small(),
                        "xsmall" => button.xsmall(),
                        _ => button,
                    };
                    let button = button.when(item.push, |b| b.ml_auto());
                    if !item.menu.is_empty() {
                        let entries = item.menu.clone();
                        Some(
                            button
                                .dropdown_menu(move |mut menu, _, _| {
                                    for (index, entry) in entries.iter().enumerate() {
                                        if entry.separator {
                                            menu = menu.separator();
                                            continue;
                                        }
                                        let on_press = on_press.clone();
                                        menu = menu.item(
                                            PopupMenuItem::new(entry.label.clone())
                                                .checked(entry.checked)
                                                .disabled(entry.disabled)
                                                .on_click(move |_, _, _| {
                                                    on_press(a, i, index as i32)
                                                }),
                                        );
                                    }
                                    menu
                                })
                                .into_any_element(),
                        )
                    } else if let Some(content) = renderers
                        .get(&format!("addon-{a}-{i}-popover"))
                        .filter(|_| item.popover)
                    {
                        let width = item.popover_width;
                        Some(
                            Popover::new(gpui::SharedString::from(format!("{id}-popover-{a}-{i}")))
                                .trigger(button)
                                .content(move |_, window, cx| {
                                    gpui::div()
                                        .when(width > 0.0, |d| d.w(gpui::px(width)))
                                        .child(content(window, cx))
                                })
                                .into_any_element(),
                        )
                    } else {
                        Some(button.into_any_element())
                    }
                }
                _ => {
                    let mut text = InputGroupText::new();
                    if let Some(icon) = icon {
                        text = text.child(icon.size_4());
                    }
                    if !item.text.is_empty() {
                        text = text.child(item.text.clone());
                    }
                    if let Some(color) = item.color {
                        text = text.text_color(crate::color::hsla(color));
                    }
                    if let Some(style) = crate::style::refinement(&item.style) {
                        text = text.refine_style(&style);
                    }
                    Some(text.when(item.push, |t| t.ml_auto()).into_any_element())
                }
            };
            if let Some(child) = child {
                target = target.child(child);
            }
        }
        element = element.addon(target);
    }
    element.into_any_element()
}
