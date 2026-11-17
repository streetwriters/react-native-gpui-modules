use std::collections::HashMap;

use gpui::{
    px, AnyElement, App, AppContext as _, Context, Entity, IntoElement, ParentElement as _,
    SharedString, Styled as _, Subscription, Window,
};
use gpui_component::table::{Column, ColumnSort, DataTable, TableDelegate, TableEvent, TableState};
use react_native_gpui::native_tree::ChildRenderer;

use super::slots::Renderers;
use crate::*;

struct Col {
    key: String,
    name: String,
    width: f32,
    sortable: bool,
}

struct KitTable {
    columns: Vec<Col>,
    rows: Vec<Vec<String>>,
    cells: HashMap<(usize, usize), ChildRenderer>,
    sort: Option<(usize, ColumnSort)>,
    sender: GpuiKitTableEventSender,
}

impl TableDelegate for KitTable {
    fn columns_count(&self, _cx: &App) -> usize {
        self.columns.len()
    }

    fn rows_count(&self, _cx: &App) -> usize {
        self.rows.len()
    }

    fn column(&self, col_ix: usize, _cx: &App) -> Column {
        let col = &self.columns[col_ix];
        let mut column = Column::new(col.key.clone(), col.name.clone());
        if col.width > 0.0 {
            column = column.width(px(col.width));
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

    fn render_td(
        &mut self,
        row_ix: usize,
        col_ix: usize,
        window: &mut Window,
        cx: &mut Context<TableState<Self>>,
    ) -> impl IntoElement {
        match self.cells.get(&(row_ix, col_ix)) {
            Some(render) => gpui::div()
                .w_full()
                .child(render(window, cx))
                .into_any_element(),
            None => {
                let text = self
                    .rows
                    .get(row_ix)
                    .and_then(|row| row.get(col_ix))
                    .cloned()
                    .unwrap_or_default();
                gpui::div()
                    .child(SharedString::from(text))
                    .into_any_element()
            }
        }
    }

    fn cell_label(&self, row_ix: usize, col_ix: usize, _cx: &App) -> Option<SharedString> {
        self.rows
            .get(row_ix)
            .and_then(|row| row.get(col_ix))
            .map(|text| SharedString::from(text.clone()))
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
            })
            .collect();
        let width = columns.len();
        let flat = props.cells();
        let rows: Vec<Vec<String>> = if width == 0 {
            Vec::new()
        } else {
            let all: Vec<String> = (0..flat.len())
                .filter_map(|index| flat.get(index))
                .map(|cell| cell.to_string())
                .collect();
            all.chunks(width).map(|row| row.to_vec()).collect()
        };
        let mut cells = HashMap::new();
        for row in 0..rows.len() {
            for col in 0..width {
                if let Some(render) = renderers.get(&format!("cell-{row}-{col}")) {
                    cells.insert((row, col), render);
                }
            }
        }
        let state = self
            .state
            .get_or_insert_with(|| {
                let delegate = KitTable {
                    columns: Vec::new(),
                    rows: Vec::new(),
                    cells: HashMap::new(),
                    sort: None,
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
                    _ => {}
                }
            }));
        }
        state.update(app, |state, cx| {
            let delegate = state.delegate_mut();
            delegate.columns = columns;
            delegate.rows = rows;
            delegate.cells = cells;
            state.refresh(cx);
        });
        DataTable::new(&state)
            .stripe(props.stripe())
            .bordered(props.bordered())
            .into_any_element()
    }
}
