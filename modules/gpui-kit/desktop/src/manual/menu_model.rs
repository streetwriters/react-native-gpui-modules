//! A popup menu given as JSON (`menuJson`): items, labels, links, custom rows,
//! submenus and shortcuts, with the menu's own width, height and check side.

use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::rc::Rc;

use gpui::{
    prelude::FluentBuilder as _, px, Action, App, Context, KeyBinding, SharedString, WeakEntity,
    Window,
};
use gpui_component::menu::{PopupMenu, PopupMenuItem};
use gpui_component::Side;
use react_native_gpui::native_tree::ChildRenderer;
use serde::Deserialize;

#[derive(Deserialize, Default, Clone)]
#[serde(default, rename_all = "camelCase")]
pub struct MenuModel {
    pub items: Vec<MenuItemModel>,
    pub min_width: Option<f32>,
    pub max_width: Option<f32>,
    pub max_height: Option<f32>,
    pub scrollable: bool,
    pub check_side: String,
    pub external_link_icon: Option<bool>,
}

#[derive(Deserialize, Default, Clone)]
#[serde(default, rename_all = "camelCase")]
pub struct MenuItemModel {
    /// `item`, `separator`, `label`, `link` or `submenu`.
    pub kind: String,
    /// What a pick reports.
    pub id: usize,
    pub label: String,
    pub icon: String,
    pub checked: bool,
    pub disabled: bool,
    pub href: String,
    /// A keystroke such as `cmd-c` that picks the item while focus is inside
    /// the menu's trigger, shown beside the item.
    pub shortcut: String,
    /// The row is the React Native content of slot `item-<id>`.
    pub content: bool,
    pub children: Vec<MenuItemModel>,
}

/// What a menu item with a shortcut dispatches.
#[derive(Action, Clone, PartialEq)]
#[action(namespace = gpui_kit, no_json)]
pub struct MenuPick {
    menu: u64,
    id: usize,
}

impl MenuPick {
    pub fn new(menu: u64, id: usize) -> Self {
        Self { menu, id }
    }
}

pub type Picker = Rc<dyn Fn(usize)>;

/// The submenus of an open menu by item id, so a rebuild keeps them open.
pub type Submenus = Rc<RefCell<HashMap<usize, WeakEntity<PopupMenu>>>>;

thread_local! {
    static PICKERS: RefCell<HashMap<u64, Picker>> = RefCell::new(HashMap::new());
    static BOUND: RefCell<HashSet<(u64, usize, String)>> = RefCell::new(HashSet::new());
}

static NEXT_MENU: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(1);

/// A new id for a menu whose shortcuts are dispatched as [`MenuPick`].
pub fn next_menu_id() -> u64 {
    NEXT_MENU.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
}

/// The key context the trigger of menu `menu` carries, which its shortcuts
/// are bound in.
pub fn key_context(menu: u64) -> String {
    format!("gpui_kit_menu_{menu}")
}

pub fn set_picker(menu: u64, pick: Picker) {
    PICKERS.with(|pickers| pickers.borrow_mut().insert(menu, pick));
}

/// Called from the `Drop` of the components that own a menu, which also runs as
/// the thread exits, after `PICKERS` may already be gone.
pub fn remove_picker(menu: u64) {
    let _ = PICKERS.try_with(|pickers| pickers.borrow_mut().remove(&menu));
}

pub(crate) fn init(cx: &mut App) {
    cx.on_action(|pick: &MenuPick, _cx| {
        let picker = PICKERS.with(|pickers| pickers.borrow().get(&pick.menu).cloned());
        if let Some(picker) = picker {
            picker(pick.id);
        }
    });
}

impl MenuModel {
    pub fn parse(json: &str) -> Self {
        serde_json::from_str(json).unwrap_or_default()
    }

    /// Binds the shortcuts of the items in the menu's key context, once each.
    pub fn bind_shortcuts(&self, menu: u64, cx: &mut App) {
        fn walk(items: &[MenuItemModel], out: &mut Vec<(usize, String)>) {
            for item in items {
                if !item.shortcut.is_empty() {
                    out.push((item.id, item.shortcut.clone()));
                }
                walk(&item.children, out);
            }
        }
        let mut shortcuts = Vec::new();
        walk(&self.items, &mut shortcuts);
        let Ok(context) = gpui::KeyBindingContextPredicate::parse(&key_context(menu)) else {
            return;
        };
        let context = Rc::new(context);
        let bindings: Vec<KeyBinding> = shortcuts
            .into_iter()
            .filter(|(id, keys)| {
                BOUND.with(|bound| bound.borrow_mut().insert((menu, *id, keys.clone())))
            })
            .filter_map(|(id, keys)| {
                KeyBinding::load(
                    &keys,
                    Box::new(MenuPick { menu, id }),
                    Some(context.clone()),
                    false,
                    None,
                    cx,
                )
                .ok()
            })
            .collect();
        if !bindings.is_empty() {
            cx.bind_keys(bindings);
        }
    }

    /// Fills `menu` with the model's items, labels, links and separators, for a
    /// menu built without a menu context (a context menu of a kit part).
    /// Submenus and custom rows are left out.
    pub fn build_flat(&self, mut menu: PopupMenu, pick: Picker) -> PopupMenu {
        for item in &self.items {
            match item.kind.as_str() {
                "separator" => menu = menu.separator(),
                "label" => menu = menu.label(item.label.clone()),
                "submenu" => {}
                kind => {
                    let link = kind == "link";
                    let (pick, id, href) = (pick.clone(), item.id, item.href.clone());
                    let mut entry = if link {
                        PopupMenuItem::link(item.label.clone(), item.href.clone())
                    } else {
                        PopupMenuItem::new(item.label.clone())
                    }
                    .checked(item.checked)
                    .disabled(item.disabled)
                    .on_click(move |_, _, cx| {
                        if link {
                            cx.open_url(&href);
                        }
                        pick(id);
                    });
                    if let Some(icon) = crate::generated::icons::parse(&item.icon) {
                        entry = entry.icon(icon);
                    }
                    menu = menu.item(entry);
                }
            }
        }
        menu
    }

    /// Fills `menu` with the model.
    pub fn build(
        &self,
        menu: PopupMenu,
        menu_id: u64,
        pick: &Picker,
        renderers: &Rc<HashMap<usize, ChildRenderer>>,
        submenus: &Submenus,
        window: &mut Window,
        cx: &mut Context<PopupMenu>,
    ) -> PopupMenu {
        let mut menu = fill(
            menu,
            &self.items,
            menu_id,
            pick,
            renderers,
            submenus,
            window,
            cx,
        );
        if let Some(width) = self.min_width {
            menu = menu.min_w(px(width));
        }
        if let Some(width) = self.max_width {
            menu = menu.max_w(px(width));
        }
        if let Some(height) = self.max_height {
            menu = menu.max_h(px(height));
        }
        if self.scrollable {
            menu = menu.scrollable(true);
        }
        match self.check_side.as_str() {
            "left" => menu = menu.check_side(Side::Left),
            "right" => menu = menu.check_side(Side::Right),
            _ => {}
        }
        if let Some(visible) = self.external_link_icon {
            menu = menu.external_link_icon(visible);
        }
        menu
    }
}

#[allow(clippy::too_many_arguments)]
fn fill(
    mut menu: PopupMenu,
    items: &[MenuItemModel],
    menu_id: u64,
    pick: &Picker,
    renderers: &Rc<HashMap<usize, ChildRenderer>>,
    submenus: &Submenus,
    window: &mut Window,
    cx: &mut Context<PopupMenu>,
) -> PopupMenu {
    for item in items {
        let icon = crate::generated::icons::parse(&item.icon);
        match item.kind.as_str() {
            "separator" => menu = menu.separator(),
            "label" => menu = menu.label(item.label.clone()),
            "submenu" => {
                let label = SharedString::from(item.label.clone());
                let id = item.id;
                let (children, pick, renderers, cache) = (
                    item.children.clone(),
                    pick.clone(),
                    renderers.clone(),
                    submenus.clone(),
                );
                let open = submenus.borrow().get(&id).and_then(WeakEntity::upgrade);
                if let Some(submenu) = open {
                    submenu.update(cx, |submenu, cx| {
                        submenu.rebuild(window, cx, move |menu, window, cx| {
                            fill(
                                menu, &children, menu_id, &pick, &renderers, &cache, window, cx,
                            )
                        })
                    });
                    menu = menu.item(
                        PopupMenuItem::submenu(label, submenu)
                            .when_some(icon, |this, icon| this.icon(icon)),
                    );
                } else {
                    menu = menu.submenu_with_icon(
                        icon.map(Into::into),
                        label,
                        window,
                        cx,
                        move |menu, window, cx| {
                            cache.borrow_mut().insert(id, cx.entity().downgrade());
                            fill(
                                menu, &children, menu_id, &pick, &renderers, &cache, window, cx,
                            )
                        },
                    );
                }
            }
            kind => {
                let mut entry = match renderers.get(&item.id).cloned() {
                    Some(render) => {
                        PopupMenuItem::element(move |window: &mut Window, app: &mut App| {
                            render(window, app)
                        })
                    }
                    None if kind == "link" => {
                        PopupMenuItem::link(item.label.clone(), item.href.clone())
                    }
                    None => PopupMenuItem::new(item.label.clone()),
                }
                .checked(item.checked)
                .disabled(item.disabled);
                if let Some(icon) = icon {
                    entry = entry.icon(icon);
                }
                if !item.shortcut.is_empty() {
                    entry = entry.action(Box::new(MenuPick {
                        menu: menu_id,
                        id: item.id,
                    }));
                } else {
                    let (pick, id) = (pick.clone(), item.id);
                    let link = kind == "link";
                    let href = item.href.clone();
                    entry = entry.on_click(move |_, _, cx| {
                        if link {
                            cx.open_url(&href);
                        }
                        pick(id);
                    });
                }
                menu = menu.item(entry);
            }
        }
    }
    menu
}
