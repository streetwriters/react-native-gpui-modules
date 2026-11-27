use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    div, px, AnyElement, App, AppContext as _, Context, DragMoveEvent, Entity,
    InteractiveElement as _, IntoElement, ParentElement as _, Render, SharedString,
    StatefulInteractiveElement as _, Styled as _, Subscription, Window,
};
use gpui_component::list::{List, ListDelegate, ListEvent, ListItem, ListState};
use gpui_component::ActiveTheme as _;
use gpui_component::IndexPath;
use react_native_gpui::native_tree::ChildRenderer;

use super::slots::Renderers;
use crate::*;

struct Row {
    label: String,
    disabled: bool,
    section: usize,
    content: Option<ChildRenderer>,
}

/// Where a dragged row goes relative to the row it is over.
#[derive(Clone, Copy, PartialEq, Eq)]
enum DropPosition {
    Before,
    After,
}

impl DropPosition {
    /// The insertion gap (0..=len) this position is for `row`.
    fn gap(self, row: usize) -> usize {
        match self {
            DropPosition::Before => row,
            DropPosition::After => row + 1,
        }
    }
}

/// The row being dragged, drawn under the pointer.
#[derive(Clone)]
struct DragRow {
    ix: IndexPath,
    label: SharedString,
}

impl Render for DragRow {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        div()
            .px_2()
            .py_1()
            .text_sm()
            .bg(cx.theme().accent)
            .text_color(cx.theme().accent_foreground)
            .rounded(cx.theme().radius)
            .shadow_md()
            .child(self.label.clone())
    }
}

type Moved = Rc<dyn Fn(usize, usize, DropPosition)>;

struct KitList {
    id: String,
    rows: Vec<Row>,
    /// The rows shown in each section, by their index in `rows`.
    visible: Vec<Vec<usize>>,
    sections: usize,
    headers: Vec<Option<ChildRenderer>>,
    footers: Vec<Option<ChildRenderer>>,
    item_style: Option<gpui::StyleRefinement>,
    loading: bool,
    query: String,
    selected: Option<IndexPath>,
    has_more: bool,
    threshold: usize,
    load_more: Option<Rc<dyn Fn()>>,
    draggable: bool,
    drop_target: Option<(IndexPath, DropPosition)>,
    moved: Option<Moved>,
}

impl KitList {
    fn update_drop_target(&mut self, ix: IndexPath, position: Option<DropPosition>) -> bool {
        match position {
            Some(position) if self.drop_target != Some((ix, position)) => {
                self.drop_target = Some((ix, position));
                true
            }
            None if self.drop_target.is_some_and(|(target, _)| target == ix) => {
                self.drop_target = None;
                true
            }
            _ => false,
        }
    }

    fn refilter(&mut self) {
        let query = self.query.to_lowercase();
        let mut visible = vec![Vec::new(); self.sections.max(1)];
        for (index, row) in self.rows.iter().enumerate() {
            if query.is_empty() || row.label.to_lowercase().contains(&query) {
                if let Some(section) = visible.get_mut(row.section) {
                    section.push(index);
                }
            }
        }
        self.visible = visible;
    }

    fn original(&self, ix: IndexPath) -> Option<usize> {
        self.visible.get(ix.section)?.get(ix.row).copied()
    }
}

impl ListDelegate for KitList {
    type Item = ListItem;

    fn sections_count(&self, _cx: &App) -> usize {
        self.sections.max(1)
    }

    fn items_count(&self, section: usize, _cx: &App) -> usize {
        self.visible.get(section).map_or(0, Vec::len)
    }

    fn render_section_header(
        &mut self,
        section: usize,
        window: &mut Window,
        cx: &mut Context<ListState<Self>>,
    ) -> Option<impl IntoElement> {
        let render = self.headers.get(section)?.clone()?;
        Some(render(window, cx))
    }

    fn render_section_footer(
        &mut self,
        section: usize,
        window: &mut Window,
        cx: &mut Context<ListState<Self>>,
    ) -> Option<impl IntoElement> {
        let render = self.footers.get(section)?.clone()?;
        Some(render(window, cx))
    }

    fn loading(&self, _cx: &App) -> bool {
        self.loading
    }

    fn has_more(&self, _cx: &App) -> bool {
        self.has_more && !self.loading
    }

    fn load_more_threshold(&self) -> usize {
        self.threshold
    }

    fn load_more(&mut self, _window: &mut Window, _cx: &mut Context<ListState<Self>>) {
        if let Some(load_more) = &self.load_more {
            load_more();
        }
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
        let row = self.rows.get(self.original(ix)?)?;
        let mut item = ListItem::new(SharedString::from(format!(
            "{}-{}-{}",
            self.id, ix.section, ix.row
        )))
        .disabled(row.disabled)
        .selected(self.selected == Some(ix));
        if let Some(style) = &self.item_style {
            gpui::Refineable::refine(gpui::Styled::style(&mut item), style);
        }
        let item = match &row.content {
            Some(render) => item.child(render(window, cx)),
            None => item.child(row.label.clone()),
        };
        if !self.draggable {
            return Some(item);
        }
        let count = self.visible.get(ix.section).map_or(0, Vec::len);
        // The indicator shows at the insertion gap, whichever of the two rows
        // around it the pointer is over.
        let indicator = self.drop_target.and_then(|(target, position)| {
            if target.section != ix.section {
                return None;
            }
            let gap = position.gap(target.row);
            if gap == ix.row {
                Some(DropPosition::Before)
            } else if gap == count && ix.row + 1 == count {
                Some(DropPosition::After)
            } else {
                None
            }
        });
        let drag = DragRow {
            ix,
            label: row.label.clone().into(),
        };
        let state = cx.entity().downgrade();
        let (moving, dropping) = (state.clone(), state.clone());
        let blue = cx.theme().blue;
        Some(
            item.relative()
                .when_some(
                    indicator.filter(|_| cx.has_active_drag()),
                    |this, position| {
                        let line = div()
                            .absolute()
                            .left_0()
                            .right_0()
                            .h(px(2.))
                            .rounded(px(1.))
                            .bg(blue);
                        this.child(match position {
                            DropPosition::Before => line.top(px(-5.)),
                            DropPosition::After => line.bottom(px(-5.)),
                        })
                    },
                )
                .on_drag(drag, move |drag, _, _, cx| {
                    _ = state.update(cx, |list, cx| {
                        if list.delegate_mut().drop_target.take().is_some() {
                            cx.notify();
                        }
                    });
                    cx.new(|_| drag.clone())
                })
                .on_drag_move(move |event: &DragMoveEvent<DragRow>, _, cx| {
                    let bounds = event.bounds;
                    let from = event.drag(cx).ix;
                    let position = bounds.contains(&event.event.position).then(|| {
                        if event.event.position.y < bounds.center().y {
                            DropPosition::Before
                        } else {
                            DropPosition::After
                        }
                    });
                    // The gaps beside the dragged row move nothing.
                    let position = position.filter(|position| {
                        let gap = position.gap(ix.row);
                        from.section != ix.section || (gap != from.row && gap != from.row + 1)
                    });
                    _ = moving.update(cx, |list, cx| {
                        if list.delegate_mut().update_drop_target(ix, position) {
                            cx.notify();
                        }
                    });
                })
                .on_drop(move |drag: &DragRow, _, cx| {
                    _ = dropping.update(cx, |list, cx| {
                        let delegate = list.delegate_mut();
                        let Some(position) = delegate
                            .drop_target
                            .take()
                            .filter(|(target, _)| *target == ix)
                            .map(|(_, position)| position)
                        else {
                            return;
                        };
                        let (from, to) = (delegate.original(drag.ix), delegate.original(ix));
                        if let (Some(from), Some(to), Some(moved)) = (from, to, &delegate.moved) {
                            moved(from, to, position);
                        }
                        cx.notify();
                    });
                }),
        )
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
    flags: Option<(bool, bool)>,
    subscription: Option<Subscription>,
    id: String,
}

impl GpuiKitListSpec for GpuiKitList {
    fn create(_props: &GpuiKitListProps, cx: &mut GpuiKitListContext) -> Self {
        Self {
            state: None,
            flags: None,
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

    fn scroll_to_item(
        &mut self,
        section: i32,
        row: i32,
        strategy: String,
        cx: &mut GpuiKitListContext,
    ) {
        let Some(state) = self.state.clone() else {
            return;
        };
        let strategy = match strategy.as_str() {
            "center" => gpui::ScrollStrategy::Center,
            "bottom" => gpui::ScrollStrategy::Bottom,
            _ => gpui::ScrollStrategy::Top,
        };
        let ix = IndexPath::new(row.max(0) as usize).section(section.max(0) as usize);
        cx.with_window(|window, app| {
            state.update(app, |state, cx| {
                state.scroll_to_item(ix, strategy, window, cx)
            })
        });
    }

    fn scroll_to_selected(&mut self, cx: &mut GpuiKitListContext) {
        let Some(state) = self.state.clone() else {
            return;
        };
        cx.with_window(|window, app| {
            state.update(app, |state, cx| state.scroll_to_selected_item(window, cx))
        });
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
                section: item.section().max(0) as usize,
                content: renderers.get(&format!("row-{index}")),
            })
            .collect();
        let sections = props.section_count().max(1) as usize;
        let headers: Vec<_> = (0..sections)
            .map(|section| renderers.get(&format!("section-header-{section}")))
            .collect();
        let footers: Vec<_> = (0..sections)
            .map(|section| renderers.get(&format!("section-footer-{section}")))
            .collect();
        let item_style = crate::style::refinement(props.item_style());
        let loading = props.loading();
        let selected_row = props.selected_index();
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
                            sections: 1,
                            headers: Vec::new(),
                            footers: Vec::new(),
                            item_style: None,
                            loading: false,
                            query: String::new(),
                            selected: None,
                            has_more: false,
                            threshold: 20,
                            load_more: None,
                            draggable: false,
                            drop_target: None,
                            moved: None,
                        },
                        window,
                        cx,
                    )
                    .searchable(searchable)
                });
                state
            })
            .clone();
        let load_more: Rc<dyn Fn()> = {
            let sender = sender.clone();
            Rc::new(move || sender.gpui_kit_list_load_more())
        };
        let moved: Moved = {
            let sender = sender.clone();
            Rc::new(move |from, to, position| {
                sender.gpui_kit_list_move(OnGpuiKitListMove {
                    from: from as i32,
                    to: to as i32,
                    position: match position {
                        DropPosition::Before => "before",
                        DropPosition::After => "after",
                    }
                    .to_string(),
                })
            })
        };
        if self.subscription.is_none() {
            let (select, confirm, cancel) = (sender.clone(), sender.clone(), sender);
            let watched = state.clone();
            let original = move |ix: &IndexPath, cx: &App| {
                watched.read(cx).delegate().original(*ix).unwrap_or(ix.row) as i32
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
        let flags = (props.searchable(), props.selectable());
        let changed = self.flags.replace(flags) != Some(flags);
        state.update(app, |state, cx| {
            if changed {
                state.set_searchable(flags.0, cx);
                state.set_selectable(flags.1, cx);
            }
            let delegate = state.delegate_mut();
            delegate.rows = rows;
            delegate.sections = sections;
            delegate.headers = headers;
            delegate.footers = footers;
            delegate.item_style = item_style;
            delegate.loading = loading;
            delegate.has_more = props.has_more();
            delegate.threshold = props.load_more_threshold().max(0) as usize;
            delegate.load_more = Some(load_more);
            delegate.draggable = props.rows_draggable();
            delegate.moved = Some(moved);
            delegate.refilter();
            if props.controlled() {
                let selected = (selected_row >= 0)
                    .then(|| {
                        let row = selected_row as usize;
                        delegate
                            .visible
                            .iter()
                            .enumerate()
                            .find_map(|(section, rows)| {
                                rows.iter()
                                    .position(|&index| index == row)
                                    .map(|position| IndexPath::new(position).section(section))
                            })
                    })
                    .flatten();
                delegate.selected = selected;
            }
            cx.notify();
        });
        let mut element = List::new(&state);
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        element.into_any_element()
    }
}
