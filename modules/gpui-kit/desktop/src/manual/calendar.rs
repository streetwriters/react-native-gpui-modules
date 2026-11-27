use chrono::{NaiveDate, Weekday};
use gpui::{AnyElement, AppContext as _, Entity, IntoElement, Subscription, Window};
use gpui_component::calendar::{Calendar, CalendarEvent, CalendarState, Date};

use crate::*;

pub struct GpuiKitCalendar {
    state: Option<Entity<CalendarState>>,
    subscription: Option<Subscription>,
    applied: Option<(String, String)>,
}

pub fn parse_date(text: &str) -> Option<NaiveDate> {
    NaiveDate::parse_from_str(text, "%Y-%m-%d").ok()
}

pub fn date_text(date: Option<NaiveDate>) -> String {
    date.map(|date| date.format("%Y-%m-%d").to_string())
        .unwrap_or_default()
}

pub fn split_date(date: Date) -> (String, String) {
    match date {
        Date::Single(date) => (date_text(date), String::new()),
        Date::Range(start, end) => (date_text(start), date_text(end)),
    }
}

impl GpuiKitCalendarSpec for GpuiKitCalendar {
    fn create(_props: &GpuiKitCalendarProps, _cx: &mut GpuiKitCalendarContext) -> Self {
        Self {
            state: None,
            subscription: None,
            applied: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitCalendarProps,
        _changed: GpuiKitCalendarChanged,
        _cx: &mut GpuiKitCalendarContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitCalendarProps,
        window: &mut Window,
        cx: &mut GpuiKitCalendarContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        if self.state.is_none() {
            let range = props.range();
            let state = app.new(|cx| {
                let weekdays: Vec<u32> = props
                    .disabled_weekdays()
                    .iter()
                    .map(|day| *day as u32)
                    .collect();
                let mut state = CalendarState::new(window, cx);
                if !weekdays.is_empty() {
                    state = state.disabled_matcher(weekdays);
                }
                if range {
                    state.set_date(Date::Range(None, None), window, cx);
                }
                state
            });
            self.subscription =
                Some(app.subscribe(&state, move |_, event: &CalendarEvent, _cx| {
                    let CalendarEvent::Selected(date) = event;
                    let (start, end) = split_date(*date);
                    sender.gpui_kit_calendar_change(OnGpuiKitCalendarChange { start, end });
                }));
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
        let mut element = Calendar::new(&state);
        if props.number_of_months() > 0 {
            element = element.number_of_months(props.number_of_months() as usize);
        }
        if props.first_day_of_week() >= 0 {
            if let Ok(day) = Weekday::try_from(props.first_day_of_week().clamp(0, 6) as u8) {
                element = element.first_day_of_week(day);
            }
        }
        element.into_any_element()
    }
}
