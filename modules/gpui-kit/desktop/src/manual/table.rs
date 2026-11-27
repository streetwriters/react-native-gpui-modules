use std::collections::HashMap;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    px, AnyElement, App, AppContext as _, Context, Div, Entity, FontWeight, Hsla, IntoElement,
    ParentElement as _, SharedString, Styled as _, Subscription, TextAlign, Window,
};
use gpui_component::menu::{PopupMenu, PopupMenuItem};
use gpui_component::table::{
    Column, ColumnFixed, ColumnGroup, ColumnSort, DataTable, TableDelegate, TableEvent, TableState,
};
use gpui_component::{ActiveTheme as _, Sizable as _, Size, StyleSized as _, StyledExt as _};
use react_native_gpui::native_tree::ChildRenderer;
use serde::Deserialize;

use super::slots::Renderers;
use crate::*;

struct Col {
    key: String,
    name: String,
    width: f32,
    sortable: bool,
    fixed: Option<ColumnFixed>,
    resizable: bool,
    min_width: f32,
    max_width: f32,
    align: TextAlign,
    flush: bool,
    truncate: bool,
}

#[derive(Deserialize)]
struct Group {
    label: String,
    span: usize,
}

#[derive(Clone, Default)]
struct CellStyle {
    color: Option<Hsla>,
    tint: Option<Hsla>,
    weight: Option<f32>,
}

fn named(name: &str, cx: &App) -> Option<Hsla> {
    let theme = cx.theme();
    Some(match name {
        "green" => theme.green,
        "red" => theme.red,
        "blue" => theme.blue,
        "magenta" => theme.magenta,
        "yellow" => theme.yellow,
        "cyan" => theme.cyan,
        "foreground" => theme.foreground,
        "muted-foreground" => theme.muted_foreground,
        _ => return None,
    })
}

fn tinted(name: &str, cx: &App) -> Option<Hsla> {
    let theme = cx.theme();
    Some(match name {
        "green" => theme.green_light,
        "red" => theme.red_light,
        "blue" => theme.blue_light,
        "magenta" => theme.magenta_light,
        "yellow" => theme.yellow_light,
        "cyan" => theme.cyan_light,
        _ => return None,
    })
}

fn parse_style(text: &str, cx: &App) -> CellStyle {
    let mut parts = text.split(';');
    let color = parts.next().and_then(|name| named(name, cx));
    let tint = parts
        .next()
        .and_then(|name| tinted(name, cx))
        .map(|color| color.alpha(0.05));
    let weight = parts.next().and_then(|weight| weight.parse().ok());
    CellStyle {
        color,
        tint,
        weight,
    }
}

fn parse_size(text: &str) -> Size {
    match text {
        "xsmall" => Size::XSmall,
        "small" => Size::Small,
        "large" => Size::Large,
        "" | "medium" => Size::Medium,
        other => other
            .parse::<f32>()
            .map(|value| Size::Size(px(value)))
            .unwrap_or_default(),
    }
}

struct KitTable {
    columns: Vec<Col>,
    cells: Vec<String>,
    styles: Vec<CellStyle>,
    rows: usize,
    renderers: HashMap<(usize, usize), ChildRenderer>,
    sort: Option<(usize, ColumnSort)>,
    size: Size,
    groups: Option<Vec<Vec<ColumnGroup>>>,
    loading: bool,
    has_more: bool,
    load_threshold: usize,
    menu: Vec<(String, bool)>,
    visible: (usize, usize, usize, usize),
    sender: GpuiKitTableEventSender,
}

impl KitTable {
    fn text(&self, row_ix: usize, col_ix: usize) -> Option<&String> {
        self.cells.get(row_ix * self.columns.len() + col_ix)
    }

    fn value_cell(&self, col_ix: usize) -> Div {
        let col = &self.columns[col_ix];
        gpui::div()
            .h_full()
            .h_flex()
            .items_center()
            .when(col.flush, |this| this.table_cell_size(self.size))
            .when(col.align == TextAlign::Right, |this| this.justify_end())
            .when(col.align == TextAlign::Center, |this| this.justify_center())
    }
}

impl TableDelegate for KitTable {
    fn columns_count(&self, _cx: &App) -> usize {
        self.columns.len()
    }

    fn rows_count(&self, _cx: &App) -> usize {
        self.rows
    }

    fn column(&self, col_ix: usize, _cx: &App) -> Column {
        let col = &self.columns[col_ix];
        let mut column = Column::new(col.key.clone(), col.name.clone());
        if col.width > 0.0 {
            column = column.width(px(col.width));
        }
        if col.min_width > 0.0 {
            column = column.min_width(px(col.min_width));
        }
        if col.max_width > 0.0 {
            column = column.max_width(px(col.max_width));
        }
        if let Some(fixed) = col.fixed {
            column = column.fixed(fixed);
        }
        column = column.resizable(col.resizable);
        column = match col.align {
            TextAlign::Right => column.text_right(),
            TextAlign::Center => column.text_center(),
            _ => column,
        };
        if col.flush {
            column = column.p_0();
        }
        if col.sortable {
            column = match self.sort {
                Some((ix, ColumnSort::Ascending)) if ix == col_ix => column.ascending(),
                Some((ix, ColumnSort::Descending)) if ix == col_ix => column.descending(),
                _ => column.sortable(),
            };
        }
        column
    }

    fn group_headers(&self, _cx: &App) -> Option<Vec<Vec<ColumnGroup>>> {
        self.groups.clone()
    }

    fn render_th(
        &mut self,
        col_ix: usize,
        _window: &mut Window,
        _cx: &mut Context<TableState<Self>>,
    ) -> impl IntoElement {
        let col = &self.columns[col_ix];
        gpui::div()
            .when(col.flush, |this| this.table_cell_size(self.size))
            .when(col.align == TextAlign::Center, |this| {
                this.h_flex().w_full().justify_center()
            })
            .when(col.align == TextAlign::Right, |this| {
                this.h_flex().w_full().justify_end()
            })
            .child(SharedString::from(col.name.clone()))
    }

    fn perform_sort(
        &mut self,
        col_ix: usize,
        sort: ColumnSort,
        _window: &mut Window,
        _cx: &mut Context<TableState<Self>>,
    ) {
        self.sort = Some((col_ix, sort));
        let direction = match sort {
            ColumnSort::Ascending => "ascending",
            ColumnSort::Descending => "descending",
            ColumnSort::Default => "none",
        };
        self.sender.gpui_kit_table_sort(OnGpuiKitTableSort {
            column: col_ix as i32,
            direction: direction.to_string(),
        });
    }

    fn move_column(
        &mut self,
        col_ix: usize,
        to_ix: usize,
        _window: &mut Window,
        _cx: &mut Context<TableState<Self>>,
    ) {
        self.sender
            .gpui_kit_table_move_column(OnGpuiKitTableMoveColumn {
                from: col_ix as i32,
                to: to_ix as i32,
            });
    }

    fn context_menu(
        &mut self,
        row_ix: usize,
        mut menu: PopupMenu,
        _window: &mut Window,
        _cx: &mut Context<TableState<Self>>,
    ) -> PopupMenu {
        for (item, (label, separator)) in self.menu.iter().enumerate() {
            if *separator {
                menu = menu.separator();
                continue;
            }
            let sender = self.sender.clone();
            menu = menu.item(
                PopupMenuItem::new(label.replace("{row}", &row_ix.to_string())).on_click(
                    move |_, _, _| {
                        sender.gpui_kit_table_menu(OnGpuiKitTableMenu {
                            row: row_ix as i32,
                            item: item as i32,
                        })
                    },
                ),
            );
        }
        menu
    }

    fn loading(&self, _cx: &App) -> bool {
        self.loading
    }

    fn has_more(&self, _cx: &App) -> bool {
        self.has_more
    }

    fn load_more_threshold(&self) -> usize {
        self.load_threshold
    }

    fn load_more(&mut self, _window: &mut Window, _cx: &mut Context<TableState<Self>>) {
        self.sender
            .gpui_kit_table_load_more(OnGpuiKitTableLoadMore {
                rows: self.rows as i32,
            });
    }

    fn visible_rows_changed(
        &mut self,
        range: std::ops::Range<usize>,
        _window: &mut Window,
        _cx: &mut Context<TableState<Self>>,
    ) {
        self.visible.0 = range.start;
        self.visible.1 = range.end;
        self.emit_visible();
    }

    fn visible_columns_changed(
        &mut self,
        range: std::ops::Range<usize>,
        _window: &mut Window,
        _cx: &mut Context<TableState<Self>>,
    ) {
        self.visible.2 = range.start;
        self.visible.3 = range.end;
        self.emit_visible();
    }

    fn render_td(
        &mut self,
        row_ix: usize,
        col_ix: usize,
        window: &mut Window,
        cx: &mut Context<TableState<Self>>,
    ) -> impl IntoElement {
        if let Some(render) = self.renderers.get(&(row_ix, col_ix)) {
            return gpui::div()
                .w_full()
                .child(render(window, cx))
                .into_any_element();
        }
        let text = SharedString::from(self.text(row_ix, col_ix).cloned().unwrap_or_default());
        let style = self
            .styles
            .get(row_ix * self.columns.len() + col_ix)
            .cloned()
            .unwrap_or_default();
        let truncate = self.columns[col_ix].truncate;
        self.value_cell(col_ix)
            .when_some(style.color, |this, color| this.text_color(color))
            .when_some(style.tint, |this, tint| this.bg(tint))
            .when_some(style.weight, |this, weight| {
                this.font_weight(FontWeight(weight))
            })
            .when(truncate, |this| {
                this.child(gpui::div().truncate().child(text.clone()))
            })
            .when(!truncate, |this| this.child(text.clone()))
            .into_any_element()
    }

    fn cell_label(&self, row_ix: usize, col_ix: usize, _cx: &App) -> Option<SharedString> {
        self.text(row_ix, col_ix)
            .map(|text| SharedString::from(text.clone()))
    }
}

impl KitTable {
    fn emit_visible(&mut self) {
        let (row_start, row_end, column_start, column_end) = self.visible;
        self.sender
            .gpui_kit_table_visible_range(OnGpuiKitTableVisibleRange {
                row_start: row_start as i32,
                row_end: row_end as i32,
                column_start: column_start as i32,
                column_end: column_end as i32,
            });
    }
}

pub struct GpuiKitTable {
    state: Option<Entity<TableState<KitTable>>>,
    subscription: Option<Subscription>,
}

impl GpuiKitTableSpec for GpuiKitTable {
    fn create(_props: &GpuiKitTableProps, _cx: &mut GpuiKitTableContext) -> Self {
        Self {
            state: None,
            subscription: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitTableProps,
        _changed: GpuiKitTableChanged,
        _cx: &mut GpuiKitTableContext,
    ) {
    }

    fn scroll_to_row(&mut self, row: i32, cx: &mut GpuiKitTableContext) {
        if let (Some(state), Some(app)) = (self.state.clone(), cx.app()) {
            state.update(app, |state, cx| {
                state.scroll_to_row(row.max(0) as usize, cx)
            });
        }
    }

    fn select_cell(&mut self, row: i32, column: i32, cx: &mut GpuiKitTableContext) {
        if let (Some(state), Some(app)) = (self.state.clone(), cx.app()) {
            state.update(app, |state, cx| {
                state.set_selected_cell(row.max(0) as usize, column.max(0) as usize, cx)
            });
        }
    }

    fn clear_selection(&mut self, cx: &mut GpuiKitTableContext) {
        if let (Some(state), Some(app)) = (self.state.clone(), cx.app()) {
            state.update(app, |state, cx| state.clear_selection(cx));
        }
    }

    fn render(
        &mut self,
        props: &GpuiKitTableProps,
        window: &mut Window,
        cx: &mut GpuiKitTableContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let columns = props.columns();
        let columns: Vec<Col> = (0..columns.len())
            .filter_map(|index| columns.get(index))
            .map(|col| Col {
                key: col.key().to_string(),
                name: col.title().to_string(),
                width: col.width() as f32,
                sortable: col.sortable(),
                fixed: match col.fixed() {
                    "left" => Some(ColumnFixed::Left),
                    "right" => Some(ColumnFixed::Right),
                    _ => None,
                },
                resizable: col.resizable(),
                min_width: col.min_width() as f32,
                max_width: col.max_width() as f32,
                align: match col.align() {
                    "right" => TextAlign::Right,
                    "center" => TextAlign::Center,
                    _ => TextAlign::Left,
                },
                flush: col.flush(),
                truncate: col.truncate(),
            })
            .collect();
        let width = columns.len();
        let flat = props.cells();
        let cells: Vec<String> = (0..flat.len())
            .filter_map(|index| flat.get(index))
            .map(|cell| cell.to_string())
            .collect();
        let rows = if width == 0 { 0 } else { cells.len() / width };
        let style_list = props.cell_styles();
        let styles: Vec<CellStyle> = (0..style_list.len())
            .filter_map(|index| style_list.get(index))
            .map(|text| {
                if text.is_empty() {
                    CellStyle::default()
                } else {
                    parse_style(text, app)
                }
            })
            .collect();
        let mut slots = HashMap::new();
        for row in 0..rows {
            for col in 0..width {
                if let Some(render) = renderers.get(&format!("cell-{row}-{col}")) {
                    slots.insert((row, col), render);
                }
            }
        }
        let groups = serde_json::from_str::<Vec<Vec<Group>>>(props.group_headers())
            .ok()
            .map(|rows| {
                rows.into_iter()
                    .map(|row| {
                        row.into_iter()
                            .map(|group| ColumnGroup {
                                label: group.label.into(),
                                span: group.span,
                            })
                            .collect()
                    })
                    .collect()
            });
        let menu_entries = props.context_menu();
        let menu: Vec<(String, bool)> = (0..menu_entries.len())
            .filter_map(|index| menu_entries.get(index))
            .map(|entry| (entry.label().to_string(), entry.separator()))
            .collect();
        let size = parse_size(props.size());
        let state = self
            .state
            .get_or_insert_with(|| {
                let delegate = KitTable {
                    columns: Vec::new(),
                    cells: Vec::new(),
                    styles: Vec::new(),
                    rows: 0,
                    renderers: HashMap::new(),
                    sort: None,
                    size,
                    groups: None,
                    loading: false,
                    has_more: false,
                    load_threshold: 20,
                    menu: Vec::new(),
                    visible: (usize::MAX, usize::MAX, usize::MAX, usize::MAX),
                    sender: sender.clone(),
                };
                app.new(|cx| TableState::new(delegate, window, cx))
            })
            .clone();
        if self.subscription.is_none() {
            let sender = sender.clone();
            self.subscription = Some(app.subscribe(&state, move |_, event: &TableEvent, _cx| {
                match event {
                    TableEvent::SelectRow(row) => sender
                        .gpui_kit_table_select_row(OnGpuiKitTableSelectRow { row: *row as i32 }),
                    TableEvent::DoubleClickedRow(row) => {
                        sender.gpui_kit_table_open_row(OnGpuiKitTableOpenRow { row: *row as i32 })
                    }
                    TableEvent::SelectCell(row, column) => {
                        sender.gpui_kit_table_select_cell(OnGpuiKitTableSelectCell {
                            row: *row as i32,
                            column: *column as i32,
                        })
                    }
                    TableEvent::SelectColumn(column) => {
                        sender.gpui_kit_table_select_column(OnGpuiKitTableSelectColumn {
                            column: *column as i32,
                        })
                    }
                    TableEvent::ClearSelection => {
                        sender.gpui_kit_table_clear_selection(OnGpuiKitTableClearSelection {
                            cleared: true,
                        })
                    }
                    _ => {}
                }
            }));
        }
        let (loop_selection, col_resizable, col_movable, sortable) = (
            props.loop_selection(),
            props.col_resizable(),
            props.col_movable(),
            props.sortable(),
        );
        let (col_selectable, row_selectable, cell_selectable, row_header, col_fixed) = (
            props.col_selectable(),
            props.row_selectable(),
            props.cell_selectable(),
            props.row_header(),
            props.col_fixed(),
        );
        let (loading, has_more, threshold) = (
            props.loading(),
            props.has_more(),
            props.load_more_threshold().max(0) as usize,
        );
        state.update(app, |state, cx| {
            state.loop_selection = loop_selection;
            state.col_resizable = col_resizable;
            state.col_movable = col_movable;
            state.sortable = sortable;
            state.col_selectable = col_selectable;
            state.row_selectable = row_selectable;
            state.cell_selectable = cell_selectable;
            state.row_header = row_header;
            state.col_fixed = col_fixed;
            let delegate = state.delegate_mut();
            delegate.columns = columns;
            delegate.cells = cells;
            delegate.styles = styles;
            delegate.rows = rows;
            delegate.renderers = slots;
            delegate.size = size;
            delegate.groups = groups;
            delegate.loading = loading;
            delegate.has_more = has_more;
            delegate.load_threshold = threshold;
            delegate.menu = menu;
            state.refresh(cx);
        });
        let header_row_height = props.header_row_height() as f32;
        DataTable::new(&state)
            .with_size(size)
            .when(header_row_height > 0.0, |this| {
                this.header_row_height(px(header_row_height))
            })
            .stripe(props.stripe())
            .bordered(props.bordered())
            .into_any_element()
    }
}
