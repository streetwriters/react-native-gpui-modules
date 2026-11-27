use gpui::{
    AnyElement, AppContext as _, Entity, IntoElement, ParentElement as _, SharedString,
    Styled as _, Subscription, Window,
};
use gpui_component::list::ListItem;
use gpui_component::menu::PopupMenuItem;
use gpui_component::tree::{tree, TreeEvent, TreeItem, TreeState};
use gpui_component::{h_flex, Icon, IconName, StyledExt as _};

use crate::*;

pub struct GpuiKitTree {
    state: Option<Entity<TreeState>>,
    subscription: Option<Subscription>,
    built_for: String,
}

/// Items arrive flattened as `id`, `label`, `depth`, `expanded`, `disabled` in pre-order.
fn build(list: &GpuiKitTreeItemsSlice<'_>) -> Vec<TreeItem> {
    struct Node {
        depth: i32,
        item: TreeItem,
    }
    let mut stack: Vec<Node> = Vec::new();
    let mut roots: Vec<TreeItem> = Vec::new();
    let close = |stack: &mut Vec<Node>, roots: &mut Vec<TreeItem>, until: i32| {
        while stack.last().is_some_and(|top| top.depth >= until) {
            let done = stack.pop().unwrap();
            match stack.last_mut() {
                Some(parent) => {
                    parent.item =
                        std::mem::replace(&mut parent.item, TreeItem::new("", "")).child(done.item)
                }
                None => roots.push(done.item),
            }
        }
    };
    for index in 0..list.len() {
        let Some(entry) = list.get(index) else {
            continue;
        };
        close(&mut stack, &mut roots, entry.depth());
        let item = TreeItem::new(entry.id().to_string(), entry.label().to_string())
            .expanded(entry.expanded())
            .disabled(entry.disabled());
        stack.push(Node {
            depth: entry.depth(),
            item,
        });
    }
    close(&mut stack, &mut roots, 0);
    roots
}

impl GpuiKitTreeSpec for GpuiKitTree {
    fn create(_props: &GpuiKitTreeProps, _cx: &mut GpuiKitTreeContext) -> Self {
        Self {
            state: None,
            subscription: None,
            built_for: String::new(),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitTreeProps,
        _changed: GpuiKitTreeChanged,
        _cx: &mut GpuiKitTreeContext,
    ) {
    }

    fn select_item(&mut self, id: String, cx: &mut GpuiKitTreeContext) {
        let Some(state) = self.state.clone() else {
            return;
        };
        if let Some(app) = cx.app() {
            state.update(app, |state, cx| {
                let item = state
                    .index_of(&SharedString::from(id.clone()))
                    .and_then(|ix| state.entry(ix))
                    .map(|entry| entry.item().clone());
                state.set_selected_item(item.as_ref(), cx);
            });
        }
    }

    fn render(
        &mut self,
        props: &GpuiKitTreeProps,
        _window: &mut Window,
        cx: &mut GpuiKitTreeContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let list = props.items();
        let items = build(&list);
        let key: String = (0..list.len())
            .filter_map(|index| list.get(index))
            .map(|e| {
                format!(
                    "{}|{}|{}|{}|{};",
                    e.id(),
                    e.label(),
                    e.depth(),
                    e.expanded(),
                    e.disabled()
                )
            })
            .collect();
        let state = self
            .state
            .get_or_insert_with(|| app.new(|cx| TreeState::new(cx)))
            .clone();
        if self.subscription.is_none() {
            let (expanded, collapsed) = (sender.clone(), sender);
            self.subscription =
                Some(
                    app.subscribe(&state, move |_, event: &TreeEvent, _cx| match event {
                        TreeEvent::Expanded(id) => {
                            expanded.gpui_kit_tree_toggle(OnGpuiKitTreeToggle {
                                id: id.to_string(),
                                expanded: true,
                            })
                        }
                        TreeEvent::Collapsed(id) => {
                            collapsed.gpui_kit_tree_toggle(OnGpuiKitTreeToggle {
                                id: id.to_string(),
                                expanded: false,
                            })
                        }
                    }),
                );
        }
        if self.built_for != key {
            self.built_for = key;
            state.update(app, |state, cx| state.set_items(items, cx));
        }
        let select = {
            let sender = cx.event_sender();
            let state = state.clone();
            std::rc::Rc::new(move |ix: usize, app: &mut gpui::App| {
                let id = state
                    .read(app)
                    .entry(ix)
                    .map(|entry| entry.item().id.to_string())
                    .unwrap_or_default();
                sender.gpui_kit_tree_select(OnGpuiKitTreeSelect {
                    index: ix as i32,
                    id,
                });
            })
        };
        let (indent, offset) = (props.indent() as f32, props.indent_offset() as f32);
        let row_style = crate::style::refinement(props.row_style());
        let menu = props.context_menu();
        let entries: Vec<(String, bool, bool)> = (0..menu.len())
            .filter_map(|index| menu.get(index))
            .map(|e| (e.label().to_string(), e.separator(), e.files_only()))
            .collect();
        let menu_sender = cx.event_sender();
        let mut element = tree(&state, move |ix, entry, selected, _window, _app| {
            let select = select.clone();
            let mut row = ListItem::new(ix);
            if let Some(style) = &row_style {
                row = row.refine_style(style);
            }
            row.selected(selected)
                .disabled(entry.is_disabled())
                .pl(gpui::px(indent * entry.depth() as f32 + offset))
                .on_click(move |_, _window, app| select(ix, app))
                .child(
                    h_flex()
                        .gap_2()
                        .child(Icon::new(if entry.is_folder() {
                            if entry.is_expanded() {
                                IconName::FolderOpen
                            } else {
                                IconName::Folder
                            }
                        } else {
                            IconName::File
                        }))
                        .child(SharedString::from(entry.item().label.to_string())),
                )
        });
        if !entries.is_empty() {
            element = element.context_menu(move |_ix, entry, mut menu, _window, _cx| {
                let folder = entry.is_folder();
                let id = entry.item().id.to_string();
                for (item, (label, separator, files_only)) in entries.iter().enumerate() {
                    if *files_only && folder {
                        continue;
                    }
                    if *separator {
                        menu = menu.separator();
                        continue;
                    }
                    let sender = menu_sender.clone();
                    let id = id.clone();
                    menu = menu.item(PopupMenuItem::new(label.clone()).on_click(move |_, _, _| {
                        sender.gpui_kit_tree_menu(OnGpuiKitTreeMenu {
                            id: id.clone(),
                            item: item as i32,
                        })
                    }));
                }
                menu
            });
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            element = element.refine_style(&style);
        }
        element.into_any_element()
    }
}
