use gpui::{AnyElement, DismissEvent, IntoElement, Window};
use gpui_component::menu::PopupMenu;
use gpui_component::popover::Popover;

use super::trigger::{anchor, build_menu, MenuEntry, SlotTrigger};
use crate::*;

pub struct GpuiKitDropdownMenu {
    id: String,
}

impl GpuiKitDropdownMenuSpec for GpuiKitDropdownMenu {
    fn create(_props: &GpuiKitDropdownMenuProps, cx: &mut GpuiKitDropdownMenuContext) -> Self {
        Self {
            id: format!("gpui_kit_dropdown_menu-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitDropdownMenuProps,
        _changed: GpuiKitDropdownMenuChanged,
        _cx: &mut GpuiKitDropdownMenuContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitDropdownMenuProps,
        window: &mut Window,
        cx: &mut GpuiKitDropdownMenuContext,
    ) -> AnyElement {
        let trigger = cx.children().into_iter().next();
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
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let menu_state =
            window.use_keyed_state(self.id.clone(), app, |_, _| None::<gpui::Entity<PopupMenu>>);
        let (select, change) = (sender.clone(), sender);
        let mut element = Popover::new(format!("{}-popover", self.id))
            .appearance(false)
            .overlay_closable(false)
            .anchor(anchor(props.anchor()))
            .trigger(SlotTrigger::new(format!("{}-trigger", self.id), trigger))
            .on_open_change({
                let change = change.clone();
                move |open, _window, _cx| {
                    change.gpui_kit_dropdown_menu_open_change(OnGpuiKitDropdownMenuOpenChange {
                        open: *open,
                    });
                }
            })
            .content(move |_, window, cx| {
                let menu = match menu_state.read(cx).clone() {
                    Some(menu) => menu,
                    None => {
                        let (entries, select) = (entries.clone(), select.clone());
                        let menu = PopupMenu::build(window, cx, move |menu, _window, _cx| {
                            let select = select.clone();
                            build_menu(menu, &entries, move |index| {
                                select.gpui_kit_dropdown_menu_select(OnGpuiKitDropdownMenuSelect {
                                    index: index as i32,
                                });
                            })
                        });
                        menu_state.update(cx, |state, _| *state = Some(menu.clone()));
                        gpui::Focusable::focus_handle(&menu, cx).focus(window, cx);
                        let (menu_state, change) = (menu_state.downgrade(), change.clone());
                        window
                            .subscribe(&menu, cx, move |_, _: &DismissEvent, _window, cx| {
                                let _ = menu_state.update(cx, |state, _| *state = None);
                                change.gpui_kit_dropdown_menu_open_change(
                                    OnGpuiKitDropdownMenuOpenChange { open: false },
                                );
                            })
                            .detach();
                        menu
                    }
                };
                menu
            });
        if props.controlled() {
            element = element.open(props.open());
        }
        element.into_any_element()
    }
}
