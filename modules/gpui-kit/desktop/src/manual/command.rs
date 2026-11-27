use std::collections::HashMap;
use std::rc::Rc;

use gpui::{
    div, px, AnyElement, AppContext as _, Entity, InteractiveElement as _, IntoElement,
    ParentElement as _, Styled as _, Window,
};
use gpui_component::command::{Command, CommandGroup, CommandItem, CommandState};
use gpui_component::{Disableable as _, IndexPath};
use serde::Deserialize;

use super::menu_model::{self, MenuItemModel, MenuModel};
use super::slots::Renderers;
use crate::*;

#[derive(Deserialize, Default, Clone)]
#[serde(default)]
struct EntryModel {
    /// `item`, `group` or `separator`.
    kind: String,
    id: usize,
    label: String,
    icon: String,
    checked: bool,
    disabled: bool,
    keywords: Vec<String>,
    shortcut: String,
    /// The row is the React Native content of slot `item-<id>`.
    content: bool,
    items: Vec<EntryModel>,
}

pub struct GpuiKitCommand {
    state: Option<Entity<CommandState>>,
    menu: u64,
    focused: bool,
}

impl Drop for GpuiKitCommand {
    fn drop(&mut self) {
        menu_model::remove_picker(self.menu);
    }
}

fn command_item(entry: &EntryModel, menu: u64, renderers: &Renderers) -> CommandItem {
    let mut item = CommandItem::new()
        .label(entry.label.clone())
        .checked(entry.checked)
        .disabled(entry.disabled)
        .keywords(entry.keywords.clone());
    if let Some(icon) = crate::generated::icons::parse(&entry.icon) {
        item = item.icon(icon);
    }
    if !entry.shortcut.is_empty() {
        item = item.action(Box::new(menu_model::MenuPick::new(menu, entry.id)));
    }
    if entry.content {
        if let Some(render) = renderers.get(&format!("item-{}", entry.id)) {
            item = item.child(move |window, cx| render(window, cx));
        }
    }
    item
}

impl GpuiKitCommandSpec for GpuiKitCommand {
    fn create(_props: &GpuiKitCommandProps, _cx: &mut GpuiKitCommandContext) -> Self {
        Self {
            state: None,
            menu: menu_model::next_menu_id(),
            focused: false,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitCommandProps,
        _changed: GpuiKitCommandChanged,
        _cx: &mut GpuiKitCommandContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitCommandProps,
        window: &mut Window,
        cx: &mut GpuiKitCommandContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let renderers = Renderers::new(props.slots());
        let entries: Vec<EntryModel> =
            serde_json::from_str(props.entries_json()).unwrap_or_default();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let state = self
            .state
            .get_or_insert_with(|| app.new(|cx| CommandState::new(window, cx)))
            .clone();
        if state.read(app).is_loading() != props.loading() {
            let (state, loading) = (state.clone(), props.loading());
            window.defer(app, move |window, cx| {
                state.update(cx, |state, cx| state.set_loading(loading, window, cx))
            });
        }
        if props.auto_focus() && !self.focused {
            self.focused = true;
            let state = state.clone();
            window.defer(app, move |window, cx| {
                let handle = gpui::Focusable::focus_handle(state.read(cx), cx);
                handle.focus(window, cx);
            });
        }
        let menu = self.menu;
        {
            let pick = sender.clone();
            menu_model::set_picker(
                menu,
                Rc::new(move |id| {
                    pick.gpui_kit_command_confirm(OnGpuiKitCommandConfirm {
                        index: id as i32,
                        section: -1,
                        row: -1,
                    })
                }),
            );
        }
        let shortcuts = MenuModel {
            items: entries
                .iter()
                .flat_map(|entry| std::iter::once(entry).chain(entry.items.iter()))
                .filter(|entry| !entry.shortcut.is_empty())
                .map(|entry| MenuItemModel {
                    id: entry.id,
                    shortcut: entry.shortcut.clone(),
                    ..MenuItemModel::default()
                })
                .collect(),
            ..MenuModel::default()
        };
        shortcuts.bind_shortcuts(menu, app);
        let mut element = Command::new(&state)
            .searchable(props.searchable())
            .filterable(props.filterable())
            .bordered(props.bordered());
        if !props.placeholder().is_empty() {
            element = element.placeholder(props.placeholder().to_string());
        }
        if props.list_max_height() > 0.0 {
            element = element.max_h(px(props.list_max_height() as f32));
        }
        let ungrouped = entries.iter().any(|entry| entry.kind == "item");
        let mut paths: HashMap<(usize, usize), usize> = HashMap::new();
        let mut section = usize::from(ungrouped);
        let mut row = 0;
        for entry in &entries {
            match entry.kind.as_str() {
                "separator" => element = element.separator(),
                "group" => {
                    let mut group = CommandGroup::new().label(entry.label.clone());
                    for (index, item) in entry.items.iter().enumerate() {
                        paths.insert((section, index), item.id);
                        group = group.item(command_item(item, menu, &renderers));
                    }
                    element = element.group(group);
                    section += 1;
                }
                _ => {
                    paths.insert((0, row), entry.id);
                    row += 1;
                    element = element.item(command_item(entry, menu, &renderers));
                }
            }
        }
        if let Some(header) = renderers.get("header") {
            element = element.header(move |_, window, cx| header(window, cx));
        }
        if let Some(empty) = renderers.get("empty") {
            element = element.empty(move |_, window, cx| empty(window, cx));
        }
        if let Some(footer) = renderers.get("footer") {
            element = element.footer(move |_, window, cx| footer(window, cx));
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        let paths = Rc::new(paths);
        let id_of = move |path: IndexPath| paths.get(&(path.section, path.row)).copied();
        let (select, confirm, cancel, query) =
            (sender.clone(), sender.clone(), sender.clone(), sender);
        let (select_id, confirm_id) = (id_of.clone(), id_of);
        let matched = state.clone();
        div()
            .key_context(menu_model::key_context(menu).as_str())
            .w_full()
            .child(
                element
                    .on_select(move |path, _window, _cx| {
                        if let Some(id) = select_id(path) {
                            select.gpui_kit_command_select(OnGpuiKitCommandSelect {
                                index: id as i32,
                            });
                        }
                    })
                    .on_confirm(move |path, _window, _cx| {
                        if let Some(id) = confirm_id(path) {
                            confirm.gpui_kit_command_confirm(OnGpuiKitCommandConfirm {
                                index: id as i32,
                                section: path.section as i32,
                                row: path.row as i32,
                            });
                        }
                    })
                    .on_cancel(move |_window, _cx| {
                        cancel.gpui_kit_command_cancel();
                    })
                    .on_query(move |text, _window, cx| {
                        query.gpui_kit_command_query(OnGpuiKitCommandQuery {
                            text: text.to_string(),
                            matched: matched.read(cx).matched_count() as i32,
                        });
                    }),
            )
            .into_any_element()
    }
}
