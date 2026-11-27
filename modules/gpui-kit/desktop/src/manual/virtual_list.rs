use std::rc::Rc;

use gpui::{
    px, size, AnyElement, AppContext as _, Context, Entity, InteractiveElement as _, IntoElement,
    ParentElement as _, Pixels, Render, SharedString, Styled as _, Window,
};
use gpui_component::scroll::ScrollableElement as _;
use gpui_component::{h_virtual_list, v_virtual_list, VirtualListScrollHandle};
use react_native_gpui::native_tree::ChildRenderer;

use super::slots::Renderers;
use crate::*;

/// Generated rows: `columns` cells of `text`, with `{row}` and `{col}` filled in.
#[derive(serde::Deserialize, Default, Clone)]
#[serde(default, rename_all = "camelCase")]
struct Template {
    columns: usize,
    text: String,
    first_text: String,
    row_style: String,
    cell_style: String,
}

/// Holds the row renderers that the virtual list's visible-range callback reads.
struct Rows {
    renderers: Rc<dyn Fn(usize) -> Option<ChildRenderer>>,
    template: Option<Rc<Template>>,
    range: (usize, usize),
    sender: Option<GpuiKitVirtualListEventSender>,
}

fn template_row(template: &Template, row: usize) -> AnyElement {
    let row_style = crate::style::refinement(&template.row_style);
    let cell_style = crate::style::refinement(&template.cell_style);
    let mut element = gpui::div().flex().flex_row();
    if let Some(style) = &row_style {
        gpui::Refineable::refine(gpui::Styled::style(&mut element), style);
    }
    element
        .children((0..template.columns.max(1)).map(|col| {
            let text = if col == 0 {
                &template.first_text
            } else {
                &template.text
            };
            let text = text
                .replace("{row}", &row.to_string())
                .replace("{col}", &col.to_string());
            let mut cell = gpui::div().flex();
            if let Some(style) = &cell_style {
                gpui::Refineable::refine(gpui::Styled::style(&mut cell), style);
            }
            cell.child(text)
        }))
        .into_any_element()
}

impl Render for Rows {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        gpui::div()
    }
}

pub struct GpuiKitVirtualList {
    id: String,
    rows: Option<Entity<Rows>>,
    scroll: VirtualListScrollHandle,
    count: usize,
}

impl GpuiKitVirtualListSpec for GpuiKitVirtualList {
    fn create(_props: &GpuiKitVirtualListProps, cx: &mut GpuiKitVirtualListContext) -> Self {
        Self {
            id: format!("gpui_kit_virtual_list-{}", cx.tag()),
            rows: None,
            scroll: VirtualListScrollHandle::new(),
            count: 0,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitVirtualListProps,
        _changed: GpuiKitVirtualListChanged,
        _cx: &mut GpuiKitVirtualListContext,
    ) {
    }

    fn scroll_to_item(&mut self, index: i32, _cx: &mut GpuiKitVirtualListContext) {
        self.scroll
            .scroll_to_item(index.max(0) as usize, gpui::ScrollStrategy::Top);
    }

    fn scroll_to_item_with(
        &mut self,
        index: i32,
        strategy: String,
        _cx: &mut GpuiKitVirtualListContext,
    ) {
        let strategy = match strategy.as_str() {
            "center" => gpui::ScrollStrategy::Center,
            "bottom" => gpui::ScrollStrategy::Bottom,
            _ => gpui::ScrollStrategy::Top,
        };
        self.scroll.scroll_to_item(index.max(0) as usize, strategy);
    }

    fn scroll_to_end(&mut self, _cx: &mut GpuiKitVirtualListContext) {
        self.scroll.scroll_to_bottom();
    }

    fn render(
        &mut self,
        props: &GpuiKitVirtualListProps,
        _window: &mut Window,
        cx: &mut GpuiKitVirtualListContext,
    ) -> AnyElement {
        let renderers = Rc::new(Renderers::new(props.slots()));
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let lookup = {
            let renderers = renderers.clone();
            Rc::new(move |index: usize| renderers.get(&format!("row-{index}")))
                as Rc<dyn Fn(usize) -> Option<ChildRenderer>>
        };
        let rows = self
            .rows
            .get_or_insert_with(|| {
                app.new(|_| Rows {
                    renderers: lookup.clone(),
                    template: None,
                    range: (0, 0),
                    sender: None,
                })
            })
            .clone();
        let template = (!props.template_json().is_empty())
            .then(|| serde_json::from_str::<Template>(props.template_json()).ok())
            .flatten()
            .map(Rc::new);
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        rows.update(app, |rows, _| {
            rows.renderers = lookup;
            rows.template = template;
            rows.sender = Some(sender);
        });
        self.count = props.count().max(0) as usize;
        let item: Pixels = px(props.item_size() as f32);
        let cross: Pixels = px(props.cross_size() as f32);
        let horizontal = props.horizontal();
        let sizes = Rc::new(
            (0..self.count)
                .map(|_| {
                    if horizontal {
                        size(item, cross)
                    } else {
                        size(cross, item)
                    }
                })
                .collect::<Vec<_>>(),
        );
        let render_rows = move |this: &mut Rows,
                                range: std::ops::Range<usize>,
                                window: &mut Window,
                                cx: &mut Context<Rows>| {
            let bounds = (range.start, range.end);
            if this.range != bounds {
                this.range = bounds;
                if let Some(sender) = &this.sender {
                    sender.gpui_kit_virtual_list_visible_range(OnGpuiKitVirtualListVisibleRange {
                        start: bounds.0 as i32,
                        end: bounds.1 as i32,
                    });
                }
            }
            range
                .map(|index| match (&this.template, (this.renderers)(index)) {
                    (Some(template), _) => template_row(template, index),
                    (None, Some(render)) => render(window, cx),
                    (None, None) => gpui::div().into_any_element(),
                })
                .collect::<Vec<_>>()
        };
        let id = self.id.clone();
        let list = if horizontal {
            h_virtual_list(rows, id, sizes, render_rows)
        } else {
            v_virtual_list(rows, id, sizes, render_rows)
        };
        let mut list = list.track_scroll(&self.scroll);
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut list), &style);
        }
        let axis = match props.scrollbars() {
            "vertical" => Some(gpui_component::scroll::ScrollbarAxis::Vertical),
            "horizontal" => Some(gpui_component::scroll::ScrollbarAxis::Horizontal),
            "both" => Some(gpui_component::scroll::ScrollbarAxis::Both),
            _ => None,
        };
        match axis {
            Some(axis) => gpui::div()
                .id(SharedString::from(format!("{}-frame", self.id)))
                .relative()
                .size_full()
                .child(list)
                .scrollbar(&self.scroll, axis)
                .into_any_element(),
            None => list.into_any_element(),
        }
    }
}
