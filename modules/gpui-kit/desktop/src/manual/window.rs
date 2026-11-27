use gpui::{
    AnyElement, AppContext as _, Axis, Entity, IntoElement, ParentElement as _, SharedString,
    Styled as _, Subscription, Window,
};
use gpui_component::grid_layout::{
    grid_drag_handle, grid_layout, GridArea, GridItem, GridLayoutEvent, GridLayoutState,
};
use gpui_component::{v_flex, window_border, TitleBar};

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
    /// The settings last given to the state, so a prop change reaches it once.
    applied: Option<(usize, bool, bool, Option<Axis>, bool)>,
}

#[derive(Default, serde::Deserialize)]
#[serde(default, rename_all = "camelCase")]
struct ItemSpec {
    id: String,
    label: String,
    drag_handle_only: bool,
    kit_style: String,
    card_style: String,
    handle_style: String,
}

fn areas_of(json: &str) -> Vec<GridArea> {
    serde_json::from_str(json).unwrap_or_default()
}

fn compaction_of(value: &str) -> Option<Axis> {
    match value {
        "none" => None,
        "horizontal" => Some(Axis::Horizontal),
        _ => Some(Axis::Vertical),
    }
}

fn layout_json(areas: &[GridArea]) -> String {
    serde_json::to_string(areas).unwrap_or_default()
}

impl GpuiKitGridLayoutSpec for GpuiKitGridLayout {
    fn create(_props: &GpuiKitGridLayoutProps, cx: &mut GpuiKitGridLayoutContext) -> Self {
        Self {
            id: format!("gpui_kit_grid_layout-{}", cx.tag()),
            state: None,
            subscription: None,
            applied: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitGridLayoutProps,
        _changed: GpuiKitGridLayoutChanged,
        _cx: &mut GpuiKitGridLayoutContext,
    ) {
    }

    fn set_areas(&mut self, areas: String, cx: &mut GpuiKitGridLayoutContext) {
        let (Some(state), Some(app)) = (self.state.clone(), cx.app()) else {
            return;
        };
        let areas = areas_of(&areas);
        state.update(app, |state, cx| state.set_areas(areas, cx));
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
        let settings = (
            props.columns().max(1) as usize,
            props.items_draggable(),
            props.items_resizable(),
            compaction_of(props.compaction()),
            props.prevent_collision(),
        );
        let (cols, draggable, resizable, compaction, prevent_collision) = settings;
        let state = match self.state.clone() {
            Some(state) => state,
            None => {
                let initial = areas_of(props.areas_json());
                let state = app.new(|cx| {
                    GridLayoutState::new(cx)
                        .cols(cols)
                        .draggable(draggable)
                        .resizable(resizable)
                        .compaction(compaction)
                        .prevent_collision(prevent_collision)
                        .default_areas(initial)
                });
                self.applied = Some(settings);
                self.state = Some(state.clone());
                state
            }
        };
        if self.applied != Some(settings) {
            self.applied = Some(settings);
            state.update(app, |state, cx| {
                if state.column_count() != cols {
                    state.set_cols(cols, cx);
                }
                if state.is_draggable() != draggable {
                    state.set_draggable(draggable, cx);
                }
                if state.is_resizable() != resizable {
                    state.set_resizable(resizable, cx);
                }
                if state.compaction_axis() != compaction {
                    state.set_compaction(compaction, cx);
                }
                if state.is_collision_prevented() != prevent_collision {
                    state.set_prevent_collision(prevent_collision, cx);
                }
            });
        }
        if self.subscription.is_none() {
            self.subscription = Some(app.subscribe(
                &state,
                move |_, event: &GridLayoutEvent, _cx| match event {
                    GridLayoutEvent::Change(areas) => {
                        sender.gpui_kit_grid_layout_change(OnGpuiKitGridLayoutChange {
                            layout: layout_json(areas),
                        });
                    }
                    GridLayoutEvent::Select(id) => {
                        sender.gpui_kit_grid_layout_select(OnGpuiKitGridLayoutSelect {
                            id: id.as_ref().map(|id| id.to_string()).unwrap_or_default(),
                        });
                    }
                    _ => {}
                },
            ));
        }
        let items: Vec<ItemSpec> = serde_json::from_str(props.items_json()).unwrap_or_default();
        let mut grid = grid_layout(SharedString::from(self.id.clone()), &state, app);
        if props.reflow() > 0 {
            grid = grid.reflow(props.reflow() as usize);
        }
        if props.row_height() > 0.0 {
            grid = grid.row_height(gpui::rems(props.row_height() as f32 / 16.0));
        }
        if !props.label().is_empty() {
            grid = grid.accessibility_label(props.label().to_string());
        }
        for (index, spec) in items.into_iter().enumerate() {
            let mut item = GridItem::new(spec.id.clone()).drag_handle_only(spec.drag_handle_only);
            if !spec.label.is_empty() {
                item = item.accessibility_label(spec.label.clone());
            }
            if let Some(style) = crate::style::refinement(&spec.kit_style) {
                gpui::Refineable::refine(gpui::Styled::style(&mut item), &style);
            }
            let mut card = v_flex().size_full();
            if let Some(style) = crate::style::refinement(&spec.card_style) {
                gpui::Refineable::refine(gpui::Styled::style(&mut card), &style);
            }
            if let Some(handle) = slots.take(&format!("handle-{index}")) {
                let mut bar = grid_drag_handle(&state, spec.id.clone()).child(handle);
                if let Some(style) = crate::style::refinement(&spec.handle_style) {
                    gpui::Refineable::refine(gpui::Styled::style(&mut bar), &style);
                }
                card = card.child(bar);
            }
            if let Some(content) = slots.take(&format!("item-{index}")) {
                card = card.child(v_flex().flex_1().min_h_0().child(content));
            }
            grid = grid.item(item.child(card));
        }
        grid.into_any_element()
    }
}
