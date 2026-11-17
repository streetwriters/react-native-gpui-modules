use gpui::{
    AnyElement, App, AppContext as _, Context, Entity, IntoElement, ParentElement as _,
    SharedString, Subscription, Window,
};
use gpui_component::list::{List, ListDelegate, ListEvent, ListItem, ListState};
use gpui_component::IndexPath;
use react_native_gpui::native_tree::ChildRenderer;

use super::slots::Renderers;
use crate::*;

struct Row {
    label: String,
    disabled: bool,
    content: Option<ChildRenderer>,
}

struct KitList {
    id: String,
    rows: Vec<Row>,
    visible: Vec<usize>,
    query: String,
    selected: Option<IndexPath>,
}

impl KitList {
    fn refilter(&mut self) {
        let query = self.query.to_lowercase();
        self.visible = self
            .rows
            .iter()
            .enumerate()
            .filter(|(_, row)| query.is_empty() || row.label.to_lowercase().contains(&query))
            .map(|(index, _)| index)
            .collect();
    }
}

impl ListDelegate for KitList {
    type Item = ListItem;

    fn items_count(&self, _section: usize, _cx: &App) -> usize {
        self.visible.len()
    }

    fn perform_search(
        &mut self,
        query: &str,
        _window: &mut Window,
        _cx: &mut Context<ListState<Self>>,
    ) -> gpui::Task<()> {
        self.query = query.to_string();
        self.refilter();
        gpui::Task::ready(())
    }

    fn render_item(
        &mut self,
        ix: IndexPath,
        window: &mut Window,
        cx: &mut Context<ListState<Self>>,
    ) -> Option<ListItem> {
        let row = self.rows.get(*self.visible.get(ix.row)?)?;
        let item = ListItem::new(SharedString::from(format!("{}-{}", self.id, ix.row)))
            .disabled(row.disabled)
            .selected(self.selected == Some(ix));
        Some(match &row.content {
            Some(render) => item.child(render(window, cx)),
            None => item.child(row.label.clone()),
        })
    }

    fn set_selected_index(
        &mut self,
        ix: Option<IndexPath>,
        _window: &mut Window,
        _cx: &mut Context<ListState<Self>>,
    ) {
        self.selected = ix;
    }
}

pub struct GpuiKitList {
    state: Option<Entity<ListState<KitList>>>,
    subscription: Option<Subscription>,
    id: String,
}

impl GpuiKitListSpec for GpuiKitList {
    fn create(_props: &GpuiKitListProps, cx: &mut GpuiKitListContext) -> Self {
        Self {
            state: None,
            subscription: None,
            id: format!("gpui_kit_list-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitListProps,
        _changed: GpuiKitListChanged,
        _cx: &mut GpuiKitListContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitListProps,
        window: &mut Window,
        cx: &mut GpuiKitListContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let list = props.items();
        let rows: Vec<Row> = (0..list.len())
            .filter_map(|index| list.get(index).map(|item| (index, item)))
            .map(|(index, item)| Row {
                label: item.label().to_string(),
                disabled: item.disabled(),
                content: renderers.get(&format!("row-{index}")),
            })
            .collect();
        let selected = (props.selected_index() >= 0)
            .then(|| IndexPath::default().row(props.selected_index() as usize));
        let id = self.id.clone();
        let searchable = props.searchable();
        let state = self
            .state
            .get_or_insert_with(|| {
                let state = app.new(|cx| {
                    ListState::new(
                        KitList {
                            id,
                            rows: Vec::new(),
                            visible: Vec::new(),
                            query: String::new(),
                            selected: None,
                        },
                        window,
                        cx,
                    )
                    .searchable(searchable)
                });
                state
            })
            .clone();
        if self.subscription.is_none() {
            let (select, confirm, cancel) = (sender.clone(), sender.clone(), sender);
            let watched = state.clone();
            let original = move |ix: &IndexPath, cx: &App| {
                let visible = &watched.read(cx).delegate().visible;
                visible.get(ix.row).copied().unwrap_or(ix.row) as i32
            };
            self.subscription =
                Some(
                    app.subscribe(&state, move |_, event: &ListEvent, cx| match event {
                        ListEvent::Select(ix) => select.gpui_kit_list_select(OnGpuiKitListSelect {
                            index: original(ix, cx),
                        }),
                        ListEvent::Confirm(ix) => {
                            confirm.gpui_kit_list_confirm(OnGpuiKitListConfirm {
                                index: original(ix, cx),
                            })
                        }
                        ListEvent::Cancel => cancel.gpui_kit_list_cancel(),
                    }),
                );
        }
        state.update(app, |state, cx| {
            let delegate = state.delegate_mut();
            delegate.rows = rows;
            delegate.refilter();
            if props.controlled() {
                delegate.selected = selected;
            }
            cx.notify();
        });
        List::new(&state).into_any_element()
    }
}
