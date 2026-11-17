use gpui::{
    AnyElement, AppContext as _, Entity, IntoElement, ParentElement as _, SharedString,
    Subscription, Window,
};
use gpui_component::grid_layout::{
    grid_layout, GridArea, GridItem, GridLayoutEvent, GridLayoutState,
};
use gpui_component::{window_border, TitleBar};

use super::slots::Slots;
use crate::*;

pub struct GpuiKitTitleBar;

impl GpuiKitTitleBarSpec for GpuiKitTitleBar {
    fn create(_props: &GpuiKitTitleBarProps, _cx: &mut GpuiKitTitleBarContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitTitleBarProps,
        _changed: GpuiKitTitleBarChanged,
        _cx: &mut GpuiKitTitleBarContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitTitleBarProps,
        _window: &mut Window,
        cx: &mut GpuiKitTitleBarContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut bar = TitleBar::new();
        if let Some(content) = slots.take("content") {
            bar = bar.child(content);
        }
        bar.into_any_element()
    }
}

pub struct GpuiKitWindowBorder;

impl GpuiKitWindowBorderSpec for GpuiKitWindowBorder {
    fn create(_props: &GpuiKitWindowBorderProps, _cx: &mut GpuiKitWindowBorderContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitWindowBorderProps,
        _changed: GpuiKitWindowBorderChanged,
        _cx: &mut GpuiKitWindowBorderContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitWindowBorderProps,
        _window: &mut Window,
        cx: &mut GpuiKitWindowBorderContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut border = window_border();
        if let Some(content) = slots.take("content") {
            border = border.child(content);
        }
        border.into_any_element()
    }
}

pub struct GpuiKitGridLayout {
    id: String,
    state: Option<Entity<GridLayoutState>>,
    subscription: Option<Subscription>,
}

impl GpuiKitGridLayoutSpec for GpuiKitGridLayout {
    fn create(_props: &GpuiKitGridLayoutProps, cx: &mut GpuiKitGridLayoutContext) -> Self {
        Self {
            id: format!("gpui_kit_grid_layout-{}", cx.tag()),
            state: None,
            subscription: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitGridLayoutProps,
        _changed: GpuiKitGridLayoutChanged,
        _cx: &mut GpuiKitGridLayoutContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitGridLayoutProps,
        _window: &mut Window,
        cx: &mut GpuiKitGridLayoutContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let list = props.areas();
        let areas: Vec<GridArea> = (0..list.len())
            .filter_map(|index| list.get(index))
            .map(|spec| {
                let mut area = GridArea::new(spec.id().to_string());
                area.col = spec.col().max(0) as usize;
                area.row = spec.row().max(0) as usize;
                area.col_span = spec.col_span().max(1) as usize;
                area.row_span = spec.row_span().max(1) as usize;
                area
            })
            .collect();
        let (cols, draggable, resizable) = (
            props.columns().max(1) as usize,
            props.draggable(),
            props.resizable(),
        );
        let initial = areas.clone();
        let state = self
            .state
            .get_or_insert_with(|| {
                app.new(|cx| {
                    GridLayoutState::new(cx)
                        .cols(cols)
                        .draggable(draggable)
                        .resizable(resizable)
                        .default_areas(initial)
                })
            })
            .clone();
        if self.subscription.is_none() {
            self.subscription = Some(app.subscribe(
                &state,
                move |_, event: &GridLayoutEvent, _cx| {
                    if let GridLayoutEvent::Change(areas) = event {
                        let layout = areas
                            .iter()
                            .map(|a| {
                                format!(
                                    "{}:{}:{}:{}:{}",
                                    a.id, a.col, a.row, a.col_span, a.row_span
                                )
                            })
                            .collect::<Vec<_>>()
                            .join(",");
                        sender.gpui_kit_grid_layout_change(OnGpuiKitGridLayoutChange { layout });
                    }
                },
            ));
        }
        let mut grid = grid_layout(SharedString::from(self.id.clone()), &state, app);
        for index in 0..areas.len() {
            let mut item = GridItem::new(areas[index].id.clone());
            if let Some(content) = slots.take(&format!("item-{index}")) {
                item = item.child(content);
            }
            grid = grid.item(item);
        }
        grid.into_any_element()
    }
}
