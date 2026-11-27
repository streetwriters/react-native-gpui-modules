use std::cell::RefCell;
use std::rc::Rc;

use gpui::{
    AnyElement, AppContext as _, Entity, IntoElement, ParentElement as _, SharedString,
    Subscription, Window,
};
use gpui_component::input::{Input, InputEvent, InputState};
use gpui_component::input::{
    InputGroup, InputGroupAddon, InputGroupAddonAlignment, InputGroupText,
};
use gpui_component::{Sizable as _, Size, Theme, ThemeMode};

use super::slots::Slots;
use crate::*;

pub struct GpuiKitTheme {
    applied: Option<String>,
    shadow: Option<bool>,
    notification: Option<(String, i32)>,
}

impl GpuiKitThemeSpec for GpuiKitTheme {
    fn create(_props: &GpuiKitThemeProps, _cx: &mut GpuiKitThemeContext) -> Self {
        Self {
            applied: None,
            shadow: None,
            notification: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitThemeProps,
        _changed: GpuiKitThemeChanged,
        _cx: &mut GpuiKitThemeContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitThemeProps,
        window: &mut Window,
        cx: &mut GpuiKitThemeContext,
    ) -> AnyElement {
        let mode = props.mode().to_string();
        if self.applied.as_deref() != Some(&mode) {
            self.applied = Some(mode.clone());
            let sender = cx.event_sender();
            if let Some(app) = cx.app() {
                window.defer(app, move |window, app| {
                    match mode.as_str() {
                        "dark" => Theme::change(ThemeMode::Dark, Some(window), app),
                        "light" => Theme::change(ThemeMode::Light, Some(window), app),
                        _ => Theme::sync_system_appearance(Some(window), app),
                    }
                    let dark = Theme::global(app).is_dark();
                    sender.gpui_kit_theme_change(OnGpuiKitThemeChange { dark });
                    window.refresh();
                });
            }
        }
        let shadow = props.shadow();
        if self.shadow != Some(shadow) {
            self.shadow = Some(shadow);
            if let Some(app) = cx.app() {
                window.defer(app, move |window, app| {
                    Theme::global_mut(app).shadow = shadow;
                    window.refresh();
                });
            }
        }
        let notification = (
            props.notification_placement().to_string(),
            props.notification_max_items(),
        );
        if self.notification.as_ref() != Some(&notification) {
            self.notification = Some(notification.clone());
            if let Some(app) = cx.app() {
                window.defer(app, move |window, app| {
                    let settings = &mut Theme::global_mut(app).notification;
                    if let Some(placement) = super::notification::anchor(&notification.0) {
                        settings.placement = placement;
                    }
                    if notification.1 > 0 {
                        settings.max_items = notification.1 as usize;
                    }
                    window.refresh();
                });
            }
        }
        gpui::div().into_any_element()
    }
}

pub struct GpuiKitInputGroup {
    id: String,
    state: Option<Entity<InputState>>,
    subscription: Option<Subscription>,
    last: Rc<RefCell<String>>,
}

impl GpuiKitInputGroupSpec for GpuiKitInputGroup {
    fn create(_props: &GpuiKitInputGroupProps, cx: &mut GpuiKitInputGroupContext) -> Self {
        Self {
            id: format!("gpui_kit_input_group-{}", cx.tag()),
            state: None,
            subscription: None,
            last: Rc::new(RefCell::new(String::new())),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitInputGroupProps,
        _changed: GpuiKitInputGroupChanged,
        _cx: &mut GpuiKitInputGroupContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitInputGroupProps,
        window: &mut Window,
        cx: &mut GpuiKitInputGroupContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let placeholder = props.placeholder().to_string();
        let state = self
            .state
            .get_or_insert_with(|| {
                app.new(|cx| {
                    let state = InputState::new(window, cx);
                    if placeholder.is_empty() {
                        state
                    } else {
                        state.placeholder(placeholder.clone())
                    }
                })
            })
            .clone();
        if self.subscription.is_none() {
            let last = self.last.clone();
            self.subscription =
                Some(app.subscribe(&state, move |state, event: &InputEvent, cx| {
                    if let InputEvent::Change = event {
                        let text = state.read(cx).value().to_string();
                        *last.borrow_mut() = text.clone();
                        sender.gpui_kit_input_group_change(OnGpuiKitInputGroupChange { text });
                    }
                }));
        }
        if props.controlled() && *self.last.borrow() != props.value() {
            let wanted = props.value().to_string();
            *self.last.borrow_mut() = wanted.clone();
            state.update(app, |state, cx| state.set_value(wanted, window, cx));
        }
        let mut group = InputGroup::new(SharedString::from(self.id.clone()))
            .input(Input::new(&state))
            .disabled(props.disabled())
            .readonly(props.readonly())
            .invalid(props.invalid());
        let (start_text, end_text) = (props.start_text().to_string(), props.end_text().to_string());
        let mut start = InputGroupAddon::new(format!("{}-start", self.id))
            .align(InputGroupAddonAlignment::InlineStart);
        let mut has_start = false;
        if let Some(slot) = slots.take("start") {
            start = start.child(slot);
            has_start = true;
        } else if !start_text.is_empty() {
            start = start.child(InputGroupText::new().child(start_text));
            has_start = true;
        }
        if has_start {
            group = group.addon(start);
        }
        let mut end = InputGroupAddon::new(format!("{}-end", self.id))
            .align(InputGroupAddonAlignment::InlineEnd);
        let mut has_end = false;
        if let Some(slot) = slots.take("end") {
            end = end.child(slot);
            has_end = true;
        } else if !end_text.is_empty() {
            end = end.child(InputGroupText::new().child(end_text));
            has_end = true;
        }
        if has_end {
            group = group.addon(end);
        }
        match props.size() {
            GpuiKitInputGroupSize::Unset => {}
            GpuiKitInputGroupSize::Xsmall => group = group.with_size(Size::XSmall),
            GpuiKitInputGroupSize::Small => group = group.with_size(Size::Small),
            GpuiKitInputGroupSize::Medium => group = group.with_size(Size::Medium),
            GpuiKitInputGroupSize::Large => group = group.with_size(Size::Large),
        }
        group.into_any_element()
    }
}
