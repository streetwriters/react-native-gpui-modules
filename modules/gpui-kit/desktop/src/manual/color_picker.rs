use gpui::{AnyElement, AppContext as _, Entity, Hsla, IntoElement, Rgba, Subscription, Window};
use gpui_component::color_picker::{ColorPicker, ColorPickerEvent, ColorPickerState};
use gpui_component::{Sizable as _, Size};

use crate::*;

pub struct GpuiKitColorPicker {
    state: Option<Entity<ColorPickerState>>,
    subscription: Option<Subscription>,
    applied: Option<i32>,
}

fn argb(color: Hsla) -> i32 {
    let rgba: Rgba = color.into();
    let channel = |value: f32| (value.clamp(0.0, 1.0) * 255.0).round() as u32;
    ((channel(rgba.a) << 24) | (channel(rgba.r) << 16) | (channel(rgba.g) << 8) | channel(rgba.b))
        as i32
}

impl GpuiKitColorPickerSpec for GpuiKitColorPicker {
    fn create(_props: &GpuiKitColorPickerProps, _cx: &mut GpuiKitColorPickerContext) -> Self {
        Self {
            state: None,
            subscription: None,
            applied: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitColorPickerProps,
        _changed: GpuiKitColorPickerChanged,
        _cx: &mut GpuiKitColorPickerContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitColorPickerProps,
        window: &mut Window,
        cx: &mut GpuiKitColorPickerContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        if self.state.is_none() {
            let state = app.new(|cx| ColorPickerState::new(window, cx));
            self.subscription = Some(app.subscribe(
                &state,
                move |_, event: &ColorPickerEvent, _cx| {
                    let ColorPickerEvent::Change(color) = event;
                    sender.gpui_kit_color_picker_change(OnGpuiKitColorPickerChange {
                        color: color.map(argb).unwrap_or(0),
                        cleared: color.is_none(),
                    });
                },
            ));
            self.state = Some(state);
        }
        let state = self.state.clone().unwrap();
        if props.controlled() && self.applied != Some(props.value()) {
            self.applied = Some(props.value());
            let color = crate::color::hsla(props.value() as u32);
            state.update(app, |state, cx| state.set_value(color, window, cx));
        }
        let mut element = ColorPicker::new(&state);
        if !props.label().is_empty() {
            element = element.label(props.label().to_string());
        }
        let featured = props.featured_colors();
        if !featured.is_empty() {
            element = element.featured_colors(
                featured
                    .iter()
                    .map(|color| crate::color::hsla(*color as u32))
                    .collect(),
            );
        }
        match props.size() {
            GpuiKitColorPickerSize::Unset => {}
            GpuiKitColorPickerSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitColorPickerSize::Small => element = element.with_size(Size::Small),
            GpuiKitColorPickerSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitColorPickerSize::Large => element = element.with_size(Size::Large),
        }
        element.into_any_element()
    }
}
