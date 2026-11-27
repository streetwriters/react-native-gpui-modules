use chrono::{NaiveTime, Timelike};
use gpui::{AnyElement, AppContext as _, Entity, IntoElement, Subscription, Window};
use gpui_component::time_field::{
    HourCycle, TimeField, TimeFieldEvent, TimeFieldState, TimePrecision,
};
use gpui_component::{Disableable as _, Sizable as _, Size};

use crate::*;

pub struct GpuiKitTimeField {
    state: Option<Entity<TimeFieldState>>,
    subscription: Option<Subscription>,
    applied: Option<String>,
}

fn text(time: NaiveTime) -> String {
    format!(
        "{:02}:{:02}:{:02}",
        time.hour(),
        time.minute(),
        time.second()
    )
}

impl GpuiKitTimeFieldSpec for GpuiKitTimeField {
    fn create(_props: &GpuiKitTimeFieldProps, _cx: &mut GpuiKitTimeFieldContext) -> Self {
        Self {
            state: None,
            subscription: None,
            applied: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitTimeFieldProps,
        _changed: GpuiKitTimeFieldChanged,
        _cx: &mut GpuiKitTimeFieldContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitTimeFieldProps,
        window: &mut Window,
        cx: &mut GpuiKitTimeFieldContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        if self.state.is_none() {
            let precision = match props.precision() {
                GpuiKitTimeFieldPrecision::Second => TimePrecision::Second,
                _ => TimePrecision::Minute,
            };
            let hour_cycle = match props.hour_cycle() {
                GpuiKitTimeFieldHourCycle::H12 => HourCycle::H12,
                _ => HourCycle::H23,
            };
            let state = app.new(|cx| {
                TimeFieldState::new(window, cx)
                    .precision(precision)
                    .hour_cycle(hour_cycle)
            });
            self.subscription = Some(app.subscribe(
                &state,
                move |_, event: &TimeFieldEvent, _cx| {
                    let TimeFieldEvent::Change(time) = event;
                    sender
                        .gpui_kit_time_field_change(OnGpuiKitTimeFieldChange { time: text(*time) });
                },
            ));
            self.state = Some(state);
        }
        let state = self.state.clone().unwrap();
        if props.controlled() || (self.applied.is_none() && !props.time().is_empty()) {
            let wanted = props.time().to_string();
            if self.applied.as_ref() != Some(&wanted) {
                self.applied = Some(wanted.clone());
                if let Ok(time) = NaiveTime::parse_from_str(&wanted, "%H:%M:%S")
                    .or_else(|_| NaiveTime::parse_from_str(&wanted, "%H:%M"))
                {
                    state.update(app, |state, cx| state.set_time(time, window, cx));
                }
            }
        }
        let mut element = TimeField::new(&state)
            .disabled(props.disabled())
            .invalid(props.invalid());
        match props.size() {
            GpuiKitTimeFieldSize::Unset => {}
            GpuiKitTimeFieldSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitTimeFieldSize::Small => element = element.with_size(Size::Small),
            GpuiKitTimeFieldSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitTimeFieldSize::Large => element = element.with_size(Size::Large),
        }
        element.into_any_element()
    }
}
