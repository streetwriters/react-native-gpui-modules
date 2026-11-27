use gpui::{AnyElement, AppContext as _, Entity, IntoElement, Subscription, Window};
use gpui_component::calendar::Date;
use gpui_component::date_picker::{DatePicker, DatePickerEvent, DatePickerState, DateRangePreset};
use gpui_component::time_field::{HourCycle, TimePrecision};
use gpui_component::{Sizable as _, Size};
use serde_json::Value;

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
            let options = options(props.options());
            let state = app.new(|cx| {
                let mut state = if range {
                    DatePickerState::range(window, cx)
                } else {
                    DatePickerState::new(window, cx)
                };
                if !format.is_empty() {
                    state = state.date_format(format);
                }
                configure(state, &options, window, cx)
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
        let presets = presets(props.options());
        if !presets.is_empty() {
            element = element.presets(presets);
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

fn options(json: &str) -> Value {
    serde_json::from_str(json).unwrap_or(Value::Null)
}

fn date_at(value: &Value, key: &str) -> Option<chrono::NaiveDate> {
    value.get(key).and_then(Value::as_str).and_then(parse_date)
}

/// Applies the `options` that configure the picker's state: disabled dates,
/// the year range, the time of day and the first value.
fn configure(
    mut state: DatePickerState,
    options: &Value,
    window: &mut Window,
    cx: &mut gpui::Context<DatePickerState>,
) -> DatePickerState {
    use gpui_component::calendar::Matcher;
    if let Some(disabled) = options.get("disabled") {
        let matcher = if let Some(days) = disabled.get("weekdays").and_then(Value::as_array) {
            Some(Matcher::from(
                days.iter()
                    .filter_map(Value::as_u64)
                    .map(|d| d as u32)
                    .collect::<Vec<_>>(),
            ))
        } else if let Some(range) = disabled.get("range") {
            Some(Matcher::range(date_at(range, "from"), date_at(range, "to")))
        } else if let Some(interval) = disabled.get("interval") {
            Some(Matcher::interval(
                date_at(interval, "before"),
                date_at(interval, "after"),
            ))
        } else if let Some(days) = disabled.get("daysOfMonth").and_then(Value::as_array) {
            let days: Vec<u32> = days
                .iter()
                .filter_map(Value::as_u64)
                .map(|d| d as u32)
                .collect();
            Some(Matcher::custom(move |date: &chrono::NaiveDate| {
                use chrono::Datelike as _;
                days.contains(&date.day())
            }))
        } else {
            None
        };
        if let Some(matcher) = matcher {
            state = state.disabled_matcher(matcher);
        }
    }
    if let Some(time) = options.get("time") {
        state = state.time_precision(match time.get("precision").and_then(Value::as_str) {
            Some("second") => TimePrecision::Second,
            _ => TimePrecision::Minute,
        });
        if time.get("hourCycle").and_then(Value::as_str) == Some("h12") {
            state = state.hour_cycle(HourCycle::H12);
        }
        if let Some(default) = time
            .get("default")
            .and_then(Value::as_str)
            .and_then(|t| chrono::NaiveTime::parse_from_str(t, "%H:%M:%S").ok())
        {
            state = state.default_time(default);
        }
    }
    if let Some(years) = options.get("yearRange").and_then(Value::as_array) {
        if let (Some(from), Some(to)) = (
            years.first().and_then(Value::as_i64),
            years.get(1).and_then(Value::as_i64),
        ) {
            state.set_year_range((from as i32, to as i32), cx);
        }
    }
    if let Some(value) = options
        .get("dateTime")
        .and_then(Value::as_str)
        .and_then(|t| chrono::NaiveDateTime::parse_from_str(t, "%Y-%m-%dT%H:%M:%S").ok())
    {
        state.set_date_time(value, window, cx);
    } else if let Some(date) = date_at(options, "date") {
        state.set_date(date, window, cx);
    } else if let (Some(start), Some(end)) = (date_at(options, "start"), date_at(options, "end")) {
        state.set_date(Date::Range(Some(start), Some(end)), window, cx);
    }
    state
}

fn presets(json: &str) -> Vec<DateRangePreset> {
    let options = options(json);
    let Some(list) = options.get("presets").and_then(Value::as_array) else {
        return Vec::new();
    };
    list.iter()
        .filter_map(|preset| {
            let label = preset.get("label")?.as_str()?.to_string();
            let start = date_at(preset, "start")?;
            Some(match date_at(preset, "end") {
                Some(end) => DateRangePreset::range(label, start, end),
                None => DateRangePreset::single(label, start),
            })
        })
        .collect()
}
