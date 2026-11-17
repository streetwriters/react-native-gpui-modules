use std::rc::Rc;

use gpui::{
    px, size, AnyElement, AppContext as _, Context, Entity, IntoElement, Pixels, Render, Window,
};
use gpui_component::{h_virtual_list, v_virtual_list, VirtualListScrollHandle};
use react_native_gpui::native_tree::ChildRenderer;

use super::slots::Renderers;
use crate::*;

/// Holds the row renderers that the virtual list's visible-range callback reads.
struct Rows {
    renderers: Rc<dyn Fn(usize) -> Option<ChildRenderer>>,
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
                })
            })
            .clone();
        rows.update(app, |rows, _| rows.renderers = lookup);
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
            range
                .map(|index| match (this.renderers)(index) {
                    Some(render) => render(window, cx),
                    None => gpui::div().into_any_element(),
                })
                .collect::<Vec<_>>()
        };
        let id = self.id.clone();
        let list = if horizontal {
            h_virtual_list(rows, id, sizes, render_rows)
        } else {
            v_virtual_list(rows, id, sizes, render_rows)
        };
        list.with_scroll_handle(&self.scroll).into_any_element()
    }
}
