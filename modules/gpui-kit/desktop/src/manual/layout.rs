use gpui::{
    px, AnyElement, AppContext as _, Axis, Entity, IntoElement, ParentElement as _, SharedString,
    Subscription, Window,
};
use gpui_component::carousel::{
    Carousel, CarouselContent, CarouselEvent, CarouselItem, CarouselNext, CarouselPagination,
    CarouselPaginationItem, CarouselPrevious, CarouselState,
};
use gpui_component::status_bar::StatusBar;
use gpui_component::toolbar::Toolbar;
use gpui_component::{h_resizable, resizable_panel, v_resizable};

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
        if let Some(left) = slots.take("left") {
            element = element.left(left);
        }
        if let Some(right) = slots.take("right") {
            element = element.right(right);
        }
        element.into_any_element()
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
        let slots = cx.children();
        let mut element =
            Toolbar::new(SharedString::from(self.id.clone())).disabled(props.disabled());
        if !slots.is_empty() {
            element = element.contents(slots);
        }
        element.into_any_element()
    }
}

pub struct GpuiKitResizable {
    id: String,
}

impl GpuiKitResizableSpec for GpuiKitResizable {
    fn create(_props: &GpuiKitResizableProps, cx: &mut GpuiKitResizableContext) -> Self {
        Self {
            id: format!("gpui_kit_resizable-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitResizableProps,
        _changed: GpuiKitResizableChanged,
        _cx: &mut GpuiKitResizableContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitResizableProps,
        _window: &mut Window,
        cx: &mut GpuiKitResizableContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let children = cx.children();
        let id = SharedString::from(self.id.clone());
        let mut group = if props.vertical() {
            v_resizable(id)
        } else {
            h_resizable(id)
        };
        let panels = props.panels();
        for (index, child) in children.into_iter().enumerate() {
            let mut panel = resizable_panel();
            if let Some(spec) = panels.get(index) {
                if spec.size > 0.0 {
                    panel = panel.size(px(spec.size as f32));
                }
                if spec.min > 0.0 || spec.max > 0.0 {
                    let max = if spec.max > 0.0 {
                        spec.max as f32
                    } else {
                        f32::MAX / 4.0
                    };
                    panel = panel.size_range(px(spec.min as f32)..px(max));
                }
                if spec.fixed {
                    panel = panel.fixed();
                }
                panel = panel.visible(spec.visible);
            }
            group = group.child(panel.child(child));
        }
        let sender = sender.clone();
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
        let count = children.len();
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
        let mut content = CarouselContent::new(&state);
        for (index, child) in children.into_iter().enumerate() {
            content = content.child(
                CarouselItem::new(format!("{}-{index}", self.id), index, &state).child(child),
            );
        }
        let mut element = Carousel::new(SharedString::from(self.id.clone()), &state).child(content);
        if props.controls() {
            element = element
                .child(CarouselPrevious::new(&state))
                .child(CarouselNext::new(&state));
        }
        if props.pagination() {
            let mut pagination = CarouselPagination::new();
            for index in 0..count {
                pagination = pagination.child(CarouselPaginationItem::new(
                    format!("{}-dot-{index}", self.id),
                    index,
                    &state,
                ));
            }
            element = element.child(pagination);
        }
        element.into_any_element()
    }
}
