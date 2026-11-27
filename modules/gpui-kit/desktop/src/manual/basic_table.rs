use gpui::{px, AnyElement, IntoElement, ParentElement as _, Styled as _, Window};
use gpui_component::table::{
    Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow,
};
use gpui_component::{Sizable as _, Size, StyledExt as _};
use serde::Deserialize;

use super::slots::Slots;
use crate::*;

#[derive(Deserialize, Default)]
#[serde(default)]
struct Spec {
    caption: String,
    sections: Vec<Section>,
}

#[derive(Deserialize, Default)]
#[serde(default)]
struct Section {
    kind: String,
    rows: Vec<Row>,
}

#[derive(Deserialize, Default)]
#[serde(default)]
struct Row {
    style: String,
    cells: Vec<Cell>,
}

#[derive(Deserialize, Default)]
#[serde(default)]
struct Cell {
    head: bool,
    text: String,
    slot: bool,
    width: f32,
    col_span: usize,
    align: String,
    style: String,
}

pub struct GpuiKitBasicTable;

impl GpuiKitBasicTableSpec for GpuiKitBasicTable {
    fn create(_props: &GpuiKitBasicTableProps, _cx: &mut GpuiKitBasicTableContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitBasicTableProps,
        _changed: GpuiKitBasicTableChanged,
        _cx: &mut GpuiKitBasicTableContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitBasicTableProps,
        _window: &mut Window,
        cx: &mut GpuiKitBasicTableContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let spec: Spec = serde_json::from_str(props.spec()).unwrap_or_default();
        let size = match props.size() {
            GpuiKitBasicTableSize::Xsmall => Size::XSmall,
            GpuiKitBasicTableSize::Small => Size::Small,
            GpuiKitBasicTableSize::Large => Size::Large,
            _ => Size::Medium,
        };
        let mut table = Table::new().with_size(size);
        if !props.label().is_empty() {
            table = table.accessibility_label(props.label().to_string());
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            table = table.refine_style(&style);
        }
        for (s, section) in spec.sections.iter().enumerate() {
            let rows = section.rows.iter().enumerate().map(|(r, row)| {
                let mut element = TableRow::new();
                if let Some(style) = crate::style::refinement(&row.style) {
                    element = element.refine_style(&style);
                }
                for (c, cell) in row.cells.iter().enumerate() {
                    let content: AnyElement = if cell.slot {
                        slots
                            .take(&format!("cell-{s}-{r}-{c}"))
                            .unwrap_or_else(|| gpui::div().into_any_element())
                    } else {
                        cell.text.clone().into_any_element()
                    };
                    if cell.head {
                        let mut head = TableHead::new().child(content);
                        if cell.width > 0.0 {
                            head = head.w(px(cell.width));
                        }
                        if cell.col_span > 1 {
                            head = head.col_span(cell.col_span);
                        }
                        head = match cell.align.as_str() {
                            "center" => head.text_center(),
                            "right" => head.text_right(),
                            _ => head,
                        };
                        if let Some(style) = crate::style::refinement(&cell.style) {
                            head = head.refine_style(&style);
                        }
                        element = element.child(head);
                    } else {
                        let mut body = TableCell::new().child(content);
                        if cell.width > 0.0 {
                            body = body.w(px(cell.width));
                        }
                        if cell.col_span > 1 {
                            body = body.col_span(cell.col_span);
                        }
                        body = match cell.align.as_str() {
                            "center" => body.text_center(),
                            "right" => body.text_right(),
                            _ => body,
                        };
                        if let Some(style) = crate::style::refinement(&cell.style) {
                            body = body.refine_style(&style);
                        }
                        element = element.child(body);
                    }
                }
                element
            });
            let rows: Vec<TableRow> = rows.collect();
            table = match section.kind.as_str() {
                "header" => table.child(TableHeader::new().children(rows)),
                "footer" => table.child(TableFooter::new().children(rows)),
                _ => table.child(TableBody::new().children(rows)),
            };
        }
        if !spec.caption.is_empty() {
            table = table.child(TableCaption::new().child(spec.caption.clone()));
        }
        table.into_any_element()
    }
}
