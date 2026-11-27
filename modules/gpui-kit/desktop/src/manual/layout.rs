use gpui::Styled as _;
use gpui::{
    px, AnyElement, AppContext as _, Axis, Entity, IntoElement, ParentElement as _, SharedString,
    Subscription, Window,
};
use gpui_component::button::{Button, ButtonVariants as _, Toggle};
use gpui_component::carousel::{
    Carousel, CarouselContent, CarouselEvent, CarouselItem, CarouselNext, CarouselPagination,
    CarouselPaginationItem, CarouselPrevious, CarouselState,
};
use gpui_component::separator::Separator;
use gpui_component::status_bar::StatusBar;
use gpui_component::toolbar::{Toolbar, ToolbarGroup};
use gpui_component::{h_resizable, resizable_panel, v_resizable};
use gpui_component::{Disableable as _, Sizable as _, Size};

use super::slots::Slots;
use crate::*;

pub struct GpuiKitStatusBar;

impl GpuiKitStatusBarSpec for GpuiKitStatusBar {
    fn create(_props: &GpuiKitStatusBarProps, _cx: &mut GpuiKitStatusBarContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitStatusBarProps,
        _changed: GpuiKitStatusBarChanged,
        _cx: &mut GpuiKitStatusBarContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitStatusBarProps,
        _window: &mut Window,
        cx: &mut GpuiKitStatusBarContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut element = StatusBar::new();
        let parts = props.parts();
        for index in 0..parts.len() {
            let Some(part) = parts.get(index) else {
                continue;
            };
            let content = if part.text().is_empty() {
                match slots.take(&format!("part-{index}")) {
                    Some(content) => content,
                    None => continue,
                }
            } else {
                part.text().to_string().into_any_element()
            };
            element = match part.region() {
                "left" => element.left(content),
                "right" => element.right(content),
                _ => element.child(content),
            };
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        element.into_any_element()
    }
}

#[derive(serde::Deserialize, Default, Clone)]
#[serde(default)]
struct ToolbarItemModel {
    kind: String,
    id: i32,
    label: String,
    icon: String,
    tooltip: String,
    disabled: bool,
    checked: bool,
    gap: Option<f32>,
    items: Vec<ToolbarItemModel>,
}

/// The height of a control of `size`, which content items are centred in.
fn control_height(size: Size) -> gpui::Pixels {
    px(match size {
        Size::Large => 44.,
        Size::Small => 24.,
        Size::XSmall => 20.,
        _ => 32.,
    })
}

enum Built {
    Sized(Box<dyn FnOnce(Size) -> AnyElement>),
    Content(AnyElement),
}

fn toolbar_item(
    item: &ToolbarItemModel,
    size: Size,
    slots: &mut Slots,
    sender: &GpuiKitToolbarEventSender,
) -> Option<Built> {
    let id = item.id;
    Some(match item.kind.as_str() {
        "button" => {
            let mut button = Button::new(SharedString::from(format!("toolbar-item-{id}")))
                .disabled(item.disabled);
            if !item.label.is_empty() {
                button = button.label(item.label.clone());
            }
            if let Some(icon) = crate::generated::icons::parse(&item.icon) {
                button = button.icon(icon);
            }
            if !item.tooltip.is_empty() {
                button = button.tooltip(item.tooltip.clone());
            }
            let sender = sender.clone();
            let button = button.on_click(move |_, _, _| {
                sender.gpui_kit_toolbar_press(OnGpuiKitToolbarPress { id });
            });
            Built::Sized(Box::new(move |size| {
                gpui_component::Sizable::with_size(button.ghost().compact(), size)
                    .into_any_element()
            }))
        }
        "toggle" => {
            let mut toggle = Toggle::new(SharedString::from(format!("toolbar-item-{id}")))
                .checked(item.checked)
                .disabled(item.disabled);
            if !item.label.is_empty() {
                toggle = toggle.label(item.label.clone());
            }
            if let Some(icon) = crate::generated::icons::parse(&item.icon) {
                toggle = toggle.icon(icon);
            }
            if !item.tooltip.is_empty() {
                toggle = toggle.tooltip(item.tooltip.clone());
            }
            let sender = sender.clone();
            let toggle = toggle.on_click(move |checked, _, _| {
                sender.gpui_kit_toolbar_toggle(OnGpuiKitToolbarToggle {
                    id,
                    checked: *checked,
                });
            });
            Built::Sized(Box::new(move |size| {
                gpui_component::Sizable::with_size(toggle, size).into_any_element()
            }))
        }
        "separator" => Built::Content(Separator::vertical().h(px(20.)).into_any_element()),
        "spacer" => Built::Content(gpui::div().flex_1().into_any_element()),
        "group" => {
            let mut group = ToolbarGroup::new(SharedString::from(format!("toolbar-group-{id}")));
            if !item.label.is_empty() {
                group = group.label(item.label.clone());
            }
            if let Some(gap) = item.gap {
                group = group.gap(px(gap));
            }
            for child in &item.items {
                match toolbar_item(child, size, slots, sender)? {
                    Built::Sized(build) => group = group.child(SizedItem(Some(build), size)),
                    Built::Content(content) => group = group.content(content),
                }
            }
            Built::Content(gpui_component::Sizable::with_size(group, size).into_any_element())
        }
        _ => {
            let content = slots.take(&format!("item-{id}"))?;
            Built::Content(
                gpui::div()
                    .flex()
                    .items_center()
                    .h(control_height(size))
                    .child(content)
                    .into_any_element(),
            )
        }
    })
}

/// A control built for the toolbar's size, once that size is known.
#[derive(IntoElement)]
struct SizedItem(Option<Box<dyn FnOnce(Size) -> AnyElement>>, Size);

impl gpui_component::Sizable for SizedItem {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.1 = size.into();
        self
    }
}

impl gpui::RenderOnce for SizedItem {
    fn render(mut self, _: &mut Window, _: &mut gpui::App) -> impl IntoElement {
        match self.0.take() {
            Some(build) => build(self.1),
            None => gpui::div().into_any_element(),
        }
    }
}

pub struct GpuiKitToolbar {
    id: String,
}

impl GpuiKitToolbarSpec for GpuiKitToolbar {
    fn create(_props: &GpuiKitToolbarProps, cx: &mut GpuiKitToolbarContext) -> Self {
        Self {
            id: format!("gpui_kit_toolbar-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitToolbarProps,
        _changed: GpuiKitToolbarChanged,
        _cx: &mut GpuiKitToolbarContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitToolbarProps,
        _window: &mut Window,
        cx: &mut GpuiKitToolbarContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let mut slots = Slots::new(props.slots(), cx.children());
        let size = match props.size() {
            "xsmall" => Size::XSmall,
            "small" => Size::Small,
            "large" => Size::Large,
            _ => Size::Medium,
        };
        let items: Vec<ToolbarItemModel> =
            serde_json::from_str(props.items_json()).unwrap_or_default();
        let mut element = Toolbar::new(SharedString::from(self.id.clone()))
            .disabled(props.disabled())
            .with_size(size);
        for item in &items {
            match toolbar_item(item, size, &mut slots, &sender) {
                Some(Built::Sized(build)) => element = element.child(SizedItem(Some(build), size)),
                Some(Built::Content(content)) => element = element.content(content),
                None => {}
            }
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        element.into_any_element()
    }
}

#[derive(serde::Deserialize, Default, Clone)]
#[serde(default, rename_all = "camelCase")]
struct PanelModel {
    size: f32,
    min: f32,
    max: f32,
    fixed: bool,
    flex_none: bool,
    visible: bool,
    label: String,
    vertical: bool,
    panels: Option<Vec<PanelModel>>,
    slot: Option<usize>,
}

fn resizable_group(
    id: SharedString,
    vertical: bool,
    panels: &[PanelModel],
    slots: &mut Slots,
) -> gpui_component::ResizablePanelGroup {
    let mut group = if vertical {
        v_resizable(id.clone())
    } else {
        h_resizable(id.clone())
    };
    for (index, spec) in panels.iter().enumerate() {
        let mut panel = resizable_panel();
        if spec.size > 0.0 {
            panel = panel.size(px(spec.size));
        }
        if spec.min > 0.0 || spec.max > 0.0 {
            let max = if spec.max > 0.0 {
                spec.max
            } else {
                f32::MAX / 4.0
            };
            panel = panel.size_range(px(spec.min)..px(max));
        }
        if spec.fixed {
            panel = panel.fixed();
        }
        if spec.flex_none {
            panel = panel.flex_none();
        }
        panel = panel.visible(spec.visible);
        if let Some(children) = &spec.panels {
            let nested = resizable_group(
                SharedString::from(format!("{id}-{index}")),
                spec.vertical,
                children,
                slots,
            );
            group = group.child(nested);
            continue;
        }
        if !spec.label.is_empty() {
            panel = panel.child(gpui::div().p_4().size_full().child(spec.label.clone()));
        }
        if let Some(content) = spec
            .slot
            .and_then(|slot| slots.take(&format!("panel-{slot}")))
        {
            panel = panel.child(content);
        }
        group = group.child(panel);
    }
    group
}

pub struct GpuiKitResizable {
    id: String,
    state: Option<Entity<gpui_component::ResizableState>>,
}

impl GpuiKitResizableSpec for GpuiKitResizable {
    fn create(_props: &GpuiKitResizableProps, cx: &mut GpuiKitResizableContext) -> Self {
        Self {
            id: format!("gpui_kit_resizable-{}", cx.tag()),
            state: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitResizableProps,
        _changed: GpuiKitResizableChanged,
        _cx: &mut GpuiKitResizableContext,
    ) {
    }

    fn resize_panel(&mut self, index: i32, size: f64, cx: &mut GpuiKitResizableContext) {
        let Some(state) = self.state.clone() else {
            return;
        };
        cx.with_window(|window, app| {
            state.update(app, |state, cx| {
                state.resize_panel(index.max(0) as usize, px(size as f32), window, cx)
            })
        });
    }

    fn render(
        &mut self,
        props: &GpuiKitResizableProps,
        _window: &mut Window,
        cx: &mut GpuiKitResizableContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let mut slots = Slots::new(props.slots(), cx.children());
        let panels: Vec<PanelModel> = serde_json::from_str(props.panels_json()).unwrap_or_default();
        if self.state.is_none() {
            if let Some(app) = cx.app() {
                self.state = Some(app.new(|_| gpui_component::ResizableState::default()));
            }
        }
        let mut group = resizable_group(
            SharedString::from(self.id.clone()),
            props.vertical(),
            &panels,
            &mut slots,
        );
        if let Some(state) = &self.state {
            group = group.with_state(state);
        }
        group
            .on_resize(move |state, _window, cx| {
                let sizes = state
                    .read(cx)
                    .sizes()
                    .iter()
                    .map(|size| f32::from(*size).to_string())
                    .collect::<Vec<_>>()
                    .join(",");
                sender.gpui_kit_resizable_resize(OnGpuiKitResizableResize { sizes });
            })
            .into_any_element()
    }
}

pub struct GpuiKitCarousel {
    id: String,
    state: Option<Entity<CarouselState>>,
    subscription: Option<Subscription>,
    count: usize,
}

impl GpuiKitCarouselSpec for GpuiKitCarousel {
    fn create(_props: &GpuiKitCarouselProps, cx: &mut GpuiKitCarouselContext) -> Self {
        Self {
            id: format!("gpui_kit_carousel-{}", cx.tag()),
            state: None,
            subscription: None,
            count: 0,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitCarouselProps,
        _changed: GpuiKitCarouselChanged,
        _cx: &mut GpuiKitCarouselContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitCarouselProps,
        _window: &mut Window,
        cx: &mut GpuiKitCarouselContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let children = cx.children();
        let count = if props.slides().len() > 0 {
            props.slides().len()
        } else {
            children.len()
        };
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let axis = if props.vertical() {
            Axis::Vertical
        } else {
            Axis::Horizontal
        };
        let looping = props.looping();
        let state = self
            .state
            .get_or_insert_with(|| {
                app.new(|_| {
                    CarouselState::new(count)
                        .with_axis(axis)
                        .with_looping(looping)
                })
            })
            .clone();
        if self.subscription.is_none() {
            self.subscription =
                Some(app.subscribe(&state, move |_, event: &CarouselEvent, _cx| {
                    let CarouselEvent::Change(index) = event;
                    sender.gpui_kit_carousel_change(OnGpuiKitCarouselChange {
                        index: *index as i32,
                    });
                }));
        }
        if self.count != count {
            self.count = count;
            state.update(app, |state, cx| state.set_item_count(count, cx));
        }
        if props.controlled()
            && state.read(app).selected_index() != Some(props.selected_index().max(0) as usize)
        {
            let wanted = props.selected_index().max(0) as usize;
            state.update(app, |state, cx| state.set_selected_index(wanted, cx));
        }
        let size = match props.size() {
            "xsmall" => Some(Size::XSmall),
            "small" => Some(Size::Small),
            "medium" => Some(Size::Medium),
            "large" => Some(Size::Large),
            _ => None,
        };
        let item_style = crate::style::refinement(props.item_style());
        let slide_style = crate::style::refinement(props.slide_style());
        let mut content = CarouselContent::new(&state);
        if let Some(style) = crate::style::refinement(props.content_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut content), &style);
        }
        if let Some(style) = crate::style::refinement(props.track_style()) {
            content = content.track_style(style);
        }
        let slides = props.slides();
        let native: Vec<AnyElement> = (0..slides.len())
            .filter_map(|index| slides.get(index))
            .map(|text| {
                let mut slide = gpui::div().w_full().flex().items_center().justify_center();
                if let Some(style) = &slide_style {
                    gpui::Refineable::refine(gpui::Styled::style(&mut slide), style);
                }
                slide.child(text.to_string()).into_any_element()
            })
            .collect();
        let items = if native.is_empty() { children } else { native };
        for (index, child) in items.into_iter().enumerate() {
            let mut item = CarouselItem::new(format!("{}-{index}", self.id), index, &state);
            if let Some(style) = &item_style {
                gpui::Refineable::refine(gpui::Styled::style(&mut item), style);
            }
            content = content.child(item.child(child));
        }
        let mut element = Carousel::new(SharedString::from(self.id.clone()), &state).child(content);
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        if props.controls() {
            let mut previous = CarouselPrevious::new(&state);
            let mut next = CarouselNext::new(&state);
            if let Some(size) = size {
                previous = previous.with_size(size);
                next = next.with_size(size);
            }
            if !props.previous_label().is_empty() {
                previous = previous.child(props.previous_label().to_string());
            }
            if !props.next_label().is_empty() {
                next = next.child(props.next_label().to_string());
            }
            if !props.previous_accessibility_label().is_empty() {
                previous =
                    previous.accessibility_label(props.previous_accessibility_label().to_string());
            }
            if !props.next_accessibility_label().is_empty() {
                next = next.accessibility_label(props.next_accessibility_label().to_string());
            }
            element = element.child(previous).child(next);
        }
        if props.pagination() {
            let mut pagination = CarouselPagination::new();
            for index in 0..self.count {
                let mut dot =
                    CarouselPaginationItem::new(format!("{}-dot-{index}", self.id), index, &state);
                if let Some(size) = size {
                    dot = dot.with_size(size);
                }
                if props.pagination_labels() {
                    dot = dot.child((index + 1).to_string());
                }
                pagination = pagination.child(dot);
            }
            element = element.child(pagination);
        }
        element.into_any_element()
    }
}
