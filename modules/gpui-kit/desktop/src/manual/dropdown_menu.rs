use std::collections::HashMap;
use std::rc::Rc;

use gpui::{
    div, prelude::FluentBuilder as _, AnyElement, DismissEvent, InteractiveElement as _,
    IntoElement, ParentElement as _, SharedString, Window,
};
use gpui_component::menu::{ContextMenuExt as _, PopupMenu};
use gpui_component::popover::Popover;
use react_native_gpui::native_tree::ChildRenderer;

use super::menu_model::{self, MenuModel};
use super::slots::{Renderers, Slots};
use super::trigger::{anchor, SlotTrigger};
use crate::*;

pub struct GpuiKitDropdownMenu {
    id: String,
    menu: u64,
    json: String,
    submenus: menu_model::Submenus,
}

impl Drop for GpuiKitDropdownMenu {
    fn drop(&mut self) {
        menu_model::remove_picker(self.menu);
    }
}

/// The custom rows of a menu: slot `item-<id>` for each item drawn as content.
fn row_renderers(slots: &str) -> HashMap<usize, ChildRenderer> {
    let renderers = Renderers::new(slots);
    slots
        .split(',')
        .filter_map(|name| {
            let id = name.strip_prefix("item-")?.parse().ok()?;
            Some((id, renderers.get(name)?))
        })
        .collect()
}

impl GpuiKitDropdownMenuSpec for GpuiKitDropdownMenu {
    fn create(_props: &GpuiKitDropdownMenuProps, cx: &mut GpuiKitDropdownMenuContext) -> Self {
        Self {
            id: format!("gpui_kit_dropdown_menu-{}", cx.tag()),
            menu: menu_model::next_menu_id(),
            json: String::new(),
            submenus: Default::default(),
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
        let rows = Rc::new(row_renderers(props.slots()));
        let content = Slots::new(props.slots(), cx.children()).take("trigger");
        let sender = cx.event_sender();
        let model = Rc::new(MenuModel::parse(props.menu_json()));
        let menu_id = self.menu;
        {
            let select = sender.clone();
            menu_model::set_picker(
                menu_id,
                Rc::new(move |id| {
                    select.gpui_kit_dropdown_menu_select(OnGpuiKitDropdownMenuSelect {
                        index: id as i32,
                    })
                }),
            );
        }
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        model.bind_shortcuts(menu_id, app);
        let pick: Rc<dyn Fn(usize)> = {
            let select = sender.clone();
            Rc::new(move |id| {
                select
                    .gpui_kit_dropdown_menu_select(OnGpuiKitDropdownMenuSelect { index: id as i32 })
            })
        };
        if props.mode() == "context" {
            let (model, rows) = (model.clone(), rows.clone());
            return div()
                .id(SharedString::from(format!("{}-context", self.id)))
                .key_context(menu_model::key_context(menu_id).as_str())
                .when_some(content, |this, content| this.child(content))
                .context_menu({
                    let submenus = self.submenus.clone();
                    move |menu, window, cx| {
                        submenus.borrow_mut().clear();
                        model.build(menu, menu_id, &pick, &rows, &submenus, window, cx)
                    }
                })
                .into_any_element();
        }
        let menu_state =
            window.use_keyed_state(self.id.clone(), app, |_, _| None::<gpui::Entity<PopupMenu>>);
        let submenus = self.submenus.clone();
        if self.json != props.menu_json() {
            self.json = props.menu_json().to_string();
            if let Some(menu) = menu_state.read(app).clone() {
                let (model, pick, rows, submenus) =
                    (model.clone(), pick.clone(), rows.clone(), submenus.clone());
                window.defer(app, move |window, app| {
                    menu.update(app, |menu, cx| {
                        menu.rebuild(window, cx, move |menu, window, cx| {
                            model.build(menu, menu_id, &pick, &rows, &submenus, window, cx)
                        })
                    });
                });
            }
        }
        let change = sender;
        let mut element = Popover::new(format!("{}-popover", self.id))
            .appearance(false)
            .overlay_closable(false)
            .anchor(anchor(props.anchor()))
            .trigger(
                SlotTrigger::new(format!("{}-trigger", self.id), content)
                    .key_context(menu_model::key_context(menu_id).as_str()),
            )
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
                        let (model, pick, rows, submenus) =
                            (model.clone(), pick.clone(), rows.clone(), submenus.clone());
                        submenus.borrow_mut().clear();
                        let menu = PopupMenu::build(window, cx, move |menu, window, cx| {
                            model.build(menu, menu_id, &pick, &rows, &submenus, window, cx)
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
