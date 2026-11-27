use std::cell::{Cell, RefCell};
use std::collections::HashMap;
use std::rc::Rc;

use gpui::{
    div, point, px, Action, AnyElement, App, Bounds, InteractiveElement as _, IntoElement,
    MouseButton, MouseDownEvent, ParentElement as _, Pixels, Window,
};
use gpui_base::ElementExt as _;
use gpui_component::native_menu::NativeMenu;
use gpui_component::Icon;

use super::slots::Slots;
use crate::*;

/// What a native menu item dispatches: the menu it belongs to and its index.
#[derive(Action, Clone, PartialEq)]
#[action(namespace = gpui_kit, no_json)]
struct NativeMenuPick {
    menu: u64,
    index: usize,
}

thread_local! {
    static SENDERS: RefCell<HashMap<u64, GpuiKitNativeMenuEventSender>> =
        RefCell::new(HashMap::new());
}

static NEXT_MENU: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(1);

/// Routes picks from native menus to the component that opened them.
pub(crate) fn init(cx: &mut App) {
    cx.on_action(|pick: &NativeMenuPick, _cx| {
        SENDERS.with(|senders| {
            if let Some(sender) = senders.borrow().get(&pick.menu) {
                sender.gpui_kit_native_menu_select(OnGpuiKitNativeMenuSelect {
                    index: pick.index as i32,
                });
            }
        });
    });
}

#[derive(Clone)]
struct Entry {
    label: String,
    icon: String,
    icon_svg: String,
    checked: bool,
    disabled: bool,
    separator: bool,
    parent: i32,
}

fn build(entries: &[Entry], parent: i32, menu_id: u64) -> NativeMenu {
    let mut menu = NativeMenu::new();
    for (index, entry) in entries.iter().enumerate() {
        if entry.parent != parent {
            continue;
        }
        if entry.separator {
            menu = menu.separator();
            continue;
        }
        if entries.iter().any(|other| other.parent == index as i32) {
            menu = menu.submenu(entry.label.clone(), build(entries, index as i32, menu_id));
            continue;
        }
        let action = Box::new(NativeMenuPick {
            menu: menu_id,
            index,
        });
        let icon = if !entry.icon_svg.is_empty() {
            Some(Icon::default().data(entry.icon_svg.as_bytes()))
        } else {
            crate::generated::icons::parse(&entry.icon).map(Icon::from)
        };
        menu = match icon {
            Some(icon) => {
                menu.menu_with_icon_disabled(entry.label.clone(), icon, entry.disabled, action)
            }
            None if entry.checked => menu.menu_with_check(entry.label.clone(), true, action),
            None => menu.menu_with_disabled(entry.label.clone(), entry.disabled, action),
        };
    }
    menu
}

pub struct GpuiKitNativeMenu {
    menu: u64,
    entries: Rc<RefCell<Vec<Entry>>>,
    bounds: Rc<Cell<Bounds<Pixels>>>,
}

impl Drop for GpuiKitNativeMenu {
    fn drop(&mut self) {
        let _ = SENDERS.try_with(|senders| senders.borrow_mut().remove(&self.menu));
    }
}

impl GpuiKitNativeMenuSpec for GpuiKitNativeMenu {
    fn create(_props: &GpuiKitNativeMenuProps, cx: &mut GpuiKitNativeMenuContext) -> Self {
        let menu = NEXT_MENU.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        SENDERS.with(|senders| senders.borrow_mut().insert(menu, cx.event_sender()));
        Self {
            menu,
            entries: Rc::default(),
            bounds: Rc::default(),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitNativeMenuProps,
        _changed: GpuiKitNativeMenuChanged,
        _cx: &mut GpuiKitNativeMenuContext,
    ) {
    }

    fn open(&mut self, cx: &mut GpuiKitNativeMenuContext) {
        let bounds = self.bounds.get();
        let menu = build(&self.entries.borrow(), -1, self.menu);
        cx.with_window(|window, app| {
            menu.show(
                point(
                    bounds.origin.x,
                    bounds.origin.y + bounds.size.height + px(8.),
                ),
                window,
                app,
            )
        });
    }

    fn render(
        &mut self,
        props: &GpuiKitNativeMenuProps,
        _window: &mut Window,
        cx: &mut GpuiKitNativeMenuContext,
    ) -> AnyElement {
        let list = props.items();
        *self.entries.borrow_mut() = (0..list.len())
            .filter_map(|index| list.get(index))
            .map(|item| Entry {
                label: item.label().to_string(),
                icon: item.icon().to_string(),
                icon_svg: item.icon_svg().to_string(),
                checked: item.checked(),
                disabled: item.disabled(),
                separator: item.separator(),
                parent: item.parent(),
            })
            .collect();
        let mut slots = Slots::new(props.slots(), cx.children());
        let bounds = self.bounds.clone();
        let mut element = div().on_prepaint(move |rect, _, _| bounds.set(rect));
        if props.context_menu() {
            let entries = self.entries.clone();
            let menu = self.menu;
            element = element.on_mouse_down(
                MouseButton::Right,
                move |event: &MouseDownEvent, window, cx| {
                    let position = point(event.position.x + px(4.), event.position.y);
                    build(&entries.borrow(), -1, menu).show(position, window, cx);
                },
            );
        }
        if let Some(content) = slots.take("content") {
            element = element.child(content);
        }
        element.into_any_element()
    }
}
