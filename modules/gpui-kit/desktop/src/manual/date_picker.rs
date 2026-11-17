use gpui::{AnyElement, AppContext as _, Entity, IntoElement, Subscription, Window};
use gpui_component::calendar::Date;
use gpui_component::date_picker::{DatePicker, DatePickerEvent, DatePickerState};
use gpui_component::{Sizable as _, Size};

use super::calendar::{parse_date, split_date};
use crate::*;

pub struct GpuiKitDatePicker {
    state: Option<Entity<DatePickerState>>,
    subscription: Option<Subscription>,
    applied: Option<(String, String)>,
}

impl GpuiKitDatePickerSpec for GpuiKitDatePicker {
    fn create(_props: &GpuiKitDatePickerProps, _cx: &mut GpuiKitDatePickerContext) -> Self {
        Self {
            state: None,
            subscription: None,
            applied: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitDatePickerProps,
        _changed: GpuiKitDatePickerChanged,
        _cx: &mut GpuiKitDatePickerContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitDatePickerProps,
        window: &mut Window,
        cx: &mut GpuiKitDatePickerContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        if self.state.is_none() {
            let (range, format) = (props.range(), props.date_format().to_string());
            let state = app.new(|cx| {
                let state = if range {
                    DatePickerState::range(window, cx)
                } else {
                    DatePickerState::new(window, cx)
                };
                if format.is_empty() {
                    state
                } else {
                    state.date_format(format)
                }
            });
            self.subscription = Some(app.subscribe(
                &state,
                move |_, event: &DatePickerEvent, _cx| {
                    let DatePickerEvent::Change(value) = event;
                    let (start, end) = split_date(value.date());
                    sender.gpui_kit_date_picker_change(OnGpuiKitDatePickerChange { start, end });
                },
            ));
            self.state = Some(state);
        }
        let state = self.state.clone().unwrap();
        if props.controlled() {
            let wanted = (props.date().to_string(), props.end_date().to_string());
            if self.applied.as_ref() != Some(&wanted) {
                let date = if props.range() {
                    Date::Range(parse_date(&wanted.0), parse_date(&wanted.1))
                } else {
                    Date::Single(parse_date(&wanted.0))
                };
                self.applied = Some(wanted);
                state.update(app, |state, cx| state.set_date(date, window, cx));
            }
        }
        let mut element = DatePicker::new(&state)
            .cleanable(props.cleanable())
            .appearance(props.appearance());
        if !props.placeholder().is_empty() {
            element = element.placeholder(props.placeholder().to_string());
        }
        if props.number_of_months() > 0 {
            element = element.number_of_months(props.number_of_months() as usize);
        }
        match props.size() {
            GpuiKitDatePickerSize::Unset => {}
            GpuiKitDatePickerSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitDatePickerSize::Small => element = element.with_size(Size::Small),
            GpuiKitDatePickerSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitDatePickerSize::Large => element = element.with_size(Size::Large),
        }
        element.into_any_element()
    }
}
