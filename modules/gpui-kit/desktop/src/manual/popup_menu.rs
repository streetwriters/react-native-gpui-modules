use gpui::{AnyElement, Entity, IntoElement, ParentElement as _, Styled as _, Window};
use gpui_component::menu::PopupMenu;

use super::trigger::{build_menu, MenuEntry};
use crate::*;

pub struct GpuiKitPopupMenu {
    menu: Option<Entity<PopupMenu>>,
    built_for: Vec<(String, String, bool, bool, bool)>,
}

impl GpuiKitPopupMenuSpec for GpuiKitPopupMenu {
    fn create(_props: &GpuiKitPopupMenuProps, _cx: &mut GpuiKitPopupMenuContext) -> Self {
        Self {
            menu: None,
            built_for: Vec::new(),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitPopupMenuProps,
        _changed: GpuiKitPopupMenuChanged,
        _cx: &mut GpuiKitPopupMenuContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitPopupMenuProps,
        window: &mut Window,
        cx: &mut GpuiKitPopupMenuContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let list = props.items();
        let entries: Vec<MenuEntry> = (0..list.len())
            .filter_map(|index| list.get(index))
            .map(|item| MenuEntry {
                label: item.label().to_string(),
                icon: item.icon().to_string(),
                checked: item.checked(),
                disabled: item.disabled(),
                separator: item.separator(),
            })
            .collect();
        let key: Vec<_> = entries
            .iter()
            .map(|e| {
                (
                    e.label.clone(),
                    e.icon.clone(),
                    e.checked,
                    e.disabled,
                    e.separator,
                )
            })
            .collect();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        if self.menu.is_none() || self.built_for != key {
            self.built_for = key;
            let menu = PopupMenu::build(window, app, move |menu, _window, _cx| {
                let sender = sender.clone();
                build_menu(menu, &entries, move |index| {
                    sender.gpui_kit_popup_menu_select(OnGpuiKitPopupMenuSelect {
                        index: index as i32,
                    });
                })
            });
            self.menu = Some(menu);
        }
        let mut frame = gpui::div().size_full();
        if let Some(menu) = &self.menu {
            frame = frame.child(menu.clone());
        }
        frame.into_any_element()
    }
}
