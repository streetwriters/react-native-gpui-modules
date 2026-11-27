use std::rc::Rc;

use gpui::{Anchor, AnyElement, App, Context, IntoElement, SharedString, Window};
use gpui_component::button::{Button, ButtonVariants as _, DropdownButton};
use gpui_component::menu::{PopupMenu, PopupMenuItem};
use gpui_component::{Disableable as _, Selectable as _, Sizable as _, Size};
use react_native_gpui::native_tree::ChildRenderer;

use super::button_group::button_variant;
use super::slots::Renderers;
use crate::*;

pub struct GpuiKitDropdownButton {
    id: String,
}

impl GpuiKitDropdownButtonSpec for GpuiKitDropdownButton {
    fn create(_props: &GpuiKitDropdownButtonProps, cx: &mut GpuiKitDropdownButtonContext) -> Self {
        Self {
            id: format!("gpui_kit_dropdown_button-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitDropdownButtonProps,
        _changed: GpuiKitDropdownButtonChanged,
        _cx: &mut GpuiKitDropdownButtonContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitDropdownButtonProps,
        _window: &mut Window,
        cx: &mut GpuiKitDropdownButtonContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let mut element = DropdownButton::new(SharedString::from(self.id.clone()));
        let mut button = Button::new(SharedString::from(format!("{}-button", self.id)));
        if !props.label().is_empty() {
            button = button.label(props.label().to_string());
        }
        if let Some(icon) = crate::generated::icons::parse(props.icon()) {
            button = button.icon(icon);
        }
        if props.loading() {
            button = button.loading(true);
        }
        if props.compact() {
            button = button.compact();
        }
        if !props.tooltip().is_empty() {
            button = button.tooltip(props.tooltip().to_string());
        }
        if let Some(variant) = button_variant(props.button_variant()) {
            button = button.with_variant(variant);
        }
        match props.button_size() {
            "xsmall" => button = button.with_size(Size::XSmall),
            "small" => button = button.with_size(Size::Small),
            "medium" => button = button.with_size(Size::Medium),
            "large" => button = button.with_size(Size::Large),
            _ => {}
        }
        {
            let sender = sender.clone();
            button = button.on_click(move |_, _window, _cx| {
                sender.gpui_kit_dropdown_button_press();
            });
        }
        element = element.button(button);
        if props.selected() {
            element = element.selected(true);
        }
        if props.disabled() {
            element = element.disabled(true);
        }
        if props.outline() {
            element = element.outline();
        }
        if !props.menu_accessibility_label().is_empty() {
            element =
                element.menu_accessibility_label(props.menu_accessibility_label().to_string());
        }
        if let Some(variant) = button_variant(props.variant()) {
            element = element.with_variant(variant);
        }
        match props.size() {
            GpuiKitDropdownButtonSize::Unset => {}
            GpuiKitDropdownButtonSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitDropdownButtonSize::Small => element = element.with_size(Size::Small),
            GpuiKitDropdownButtonSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitDropdownButtonSize::Large => element = element.with_size(Size::Large),
        }
        let list = props.items();
        let renderers = Renderers::new(props.slots());
        let items: Rc<Vec<MenuEntry>> = Rc::new(
            (0..list.len())
                .filter_map(|index| list.get(index))
                .enumerate()
                .map(|(index, item)| MenuEntry {
                    label: item.label().to_string(),
                    icon: item.icon().to_string(),
                    checked: item.checked(),
                    disabled: item.disabled(),
                    separator: item.separator(),
                    action: item.action().to_string(),
                    parent: item.parent(),
                    content: renderers.get(&format!("item-{index}")),
                })
                .collect(),
        );
        let anchor = match props.anchor() {
            GpuiKitDropdownButtonAnchor::TopLeft => Anchor::TopLeft,
            GpuiKitDropdownButtonAnchor::BottomLeft => Anchor::BottomLeft,
            GpuiKitDropdownButtonAnchor::BottomRight => Anchor::BottomRight,
            GpuiKitDropdownButtonAnchor::Unset | GpuiKitDropdownButtonAnchor::TopRight => {
                Anchor::TopRight
            }
        };
        element
            .dropdown_menu_with_anchor(anchor, move |menu, window, cx| {
                fill(menu, &items, -1, &sender, window, cx)
            })
            .into_any_element()
    }
}

struct MenuEntry {
    label: String,
    icon: String,
    checked: bool,
    disabled: bool,
    separator: bool,
    action: String,
    parent: i32,
    content: Option<ChildRenderer>,
}

/// Adds the entries whose parent is `parent`; an entry that is the parent of
/// others becomes a submenu.
fn fill(
    mut menu: PopupMenu,
    items: &Rc<Vec<MenuEntry>>,
    parent: i32,
    sender: &GpuiKitDropdownButtonEventSender,
    window: &mut Window,
    cx: &mut Context<PopupMenu>,
) -> PopupMenu {
    for (index, entry) in items.iter().enumerate() {
        if entry.parent != parent {
            continue;
        }
        if entry.separator {
            menu = menu.separator();
            continue;
        }
        let icon = crate::generated::icons::parse(&entry.icon);
        if items.iter().any(|other| other.parent == index as i32) {
            let (items, sender) = (items.clone(), sender.clone());
            menu = menu.submenu_with_icon(
                icon.map(Into::into),
                entry.label.clone(),
                window,
                cx,
                move |menu, window, cx| fill(menu, &items, index as i32, &sender, window, cx),
            );
            continue;
        }
        let sender = sender.clone();
        let mut item = match entry.content.clone() {
            Some(render) => PopupMenuItem::element(move |window: &mut Window, app: &mut App| {
                render(window, app)
            }),
            None => PopupMenuItem::new(entry.label.clone()),
        }
        .checked(entry.checked)
        .disabled(entry.disabled)
        .on_click(move |_, _window, _cx| {
            sender.gpui_kit_dropdown_button_select(OnGpuiKitDropdownButtonSelect {
                index: index as i32,
            });
        });
        if let Some(icon) = icon {
            item = item.icon(icon);
        }
        if !entry.action.is_empty() {
            if let Ok(action) = cx.build_action(&entry.action, None) {
                item = item.action(action);
            }
        }
        menu = menu.item(item);
    }
    menu
}
