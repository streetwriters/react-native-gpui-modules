use gpui::{Anchor, AnyElement, IntoElement, SharedString, Window};
use gpui_component::button::{Button, ButtonVariant, ButtonVariants as _};
use gpui_component::notification::{Notification, NotificationType};
use gpui_component::WindowExt as _;

use super::slots::Shown;
use crate::*;

pub struct GpuiKitNotification {
    shown: Shown,
}

impl GpuiKitNotificationSpec for GpuiKitNotification {
    fn create(_props: &GpuiKitNotificationProps, _cx: &mut GpuiKitNotificationContext) -> Self {
        Self {
            shown: Shown::default(),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitNotificationProps,
        _changed: GpuiKitNotificationChanged,
        _cx: &mut GpuiKitNotificationContext,
    ) {
    }

    fn push(&mut self, json: String, cx: &mut GpuiKitNotificationContext) {
        let note = pushed_notification(&json, cx.event_sender());
        cx.with_window(|window, app| window.push_notification(note, app));
    }

    fn remove(&mut self, key: String, cx: &mut GpuiKitNotificationContext) {
        cx.with_window(|window, app| {
            window.remove_notification1::<GpuiKitNotification>(SharedString::from(key), app)
        });
    }

    fn clear(&mut self, cx: &mut GpuiKitNotificationContext) {
        cx.with_window(|window, app| window.clear_notifications(app));
    }

    fn render(
        &mut self,
        props: &GpuiKitNotificationProps,
        window: &mut Window,
        cx: &mut GpuiKitNotificationContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let (title, message) = (props.title().to_string(), props.message().to_string());
        let autohide = props.autohide();
        let kind = match props.kind() {
            GpuiKitNotificationKind::Success => NotificationType::Success,
            GpuiKitNotificationKind::Warning => NotificationType::Warning,
            GpuiKitNotificationKind::Error => NotificationType::Error,
            GpuiKitNotificationKind::Unset | GpuiKitNotificationKind::Info => {
                NotificationType::Info
            }
        };
        let placement = match props.placement() {
            GpuiKitNotificationPlacement::TopLeft => Some(Anchor::TopLeft),
            GpuiKitNotificationPlacement::TopRight => Some(Anchor::TopRight),
            GpuiKitNotificationPlacement::BottomLeft => Some(Anchor::BottomLeft),
            GpuiKitNotificationPlacement::BottomRight => Some(Anchor::BottomRight),
            GpuiKitNotificationPlacement::Unset => None,
        };
        if let Some(app) = cx.app() {
            let closed = self.shown.clone();
            self.shown.sync(
                props.open(),
                window,
                app,
                move |window, app| {
                    let closed = closed.clone();
                    let close = sender.clone();
                    let mut note = Notification::new()
                        .message(message.clone())
                        .with_type(kind)
                        .autohide(autohide)
                        .on_close(move |_, _| {
                            closed.0.set(false);
                            close.gpui_kit_notification_close();
                        });
                    if !title.is_empty() {
                        note = note.title(title.clone());
                    }
                    if let Some(placement) = placement {
                        note = note.placement(placement);
                    }
                    window.push_notification(note, app);
                },
                |window, app| window.clear_notifications(app),
            );
        }
        gpui::div().into_any_element()
    }
}

#[derive(serde::Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
struct Pushed {
    key: String,
    kind: String,
    title: String,
    message: String,
    markdown: String,
    autohide: Option<bool>,
    placement: String,
    action: Option<PushedAction>,
    delivery: String,
}

#[derive(serde::Deserialize, Default)]
#[serde(default)]
struct PushedAction {
    label: String,
    variant: String,
}

/// The kit's anchor for a placement name such as `top-center`.
pub(crate) fn anchor(name: &str) -> Option<Anchor> {
    Some(match name {
        "top-left" => Anchor::TopLeft,
        "top-center" => Anchor::TopCenter,
        "top-right" => Anchor::TopRight,
        "left-center" => Anchor::LeftCenter,
        "right-center" => Anchor::RightCenter,
        "bottom-left" => Anchor::BottomLeft,
        "bottom-center" => Anchor::BottomCenter,
        "bottom-right" => Anchor::BottomRight,
        _ => return None,
    })
}

fn pushed_notification(json: &str, sender: GpuiKitNotificationEventSender) -> Notification {
    let pushed: Pushed = serde_json::from_str(json).unwrap_or_default();
    let mut note = Notification::new();
    if !pushed.message.is_empty() {
        note = note.message(pushed.message.clone());
    }
    match pushed.kind.as_str() {
        "info" => note = note.with_type(NotificationType::Info),
        "success" => note = note.with_type(NotificationType::Success),
        "warning" => note = note.with_type(NotificationType::Warning),
        "error" => note = note.with_type(NotificationType::Error),
        _ => {}
    }
    if !pushed.title.is_empty() {
        note = note.title(pushed.title.clone());
    }
    if !pushed.markdown.is_empty() {
        let text = SharedString::from(pushed.markdown.clone());
        note = note.content(move |_, _, _| {
            gpui_component::text::markdown(text.clone()).into_any_element()
        });
    }
    if let Some(placement) = anchor(&pushed.placement) {
        note = note.placement(placement);
    }
    match pushed.delivery.as_str() {
        "system" => note = note.system(),
        "both" => note = note.in_app_and_system(),
        _ => {}
    }
    if !pushed.key.is_empty() {
        let key = pushed.key.clone();
        note = note.id1::<GpuiKitNotification>(SharedString::from(key.clone()));
        let click = sender.clone();
        let click_key = key.clone();
        note = note.on_click(move |_, _, _| {
            click.gpui_kit_notification_event(OnGpuiKitNotificationEvent {
                key: click_key.clone(),
                kind: "click".into(),
            });
        });
        let close = sender.clone();
        let close_key = key.clone();
        note = note.on_close(move |_, _| {
            close.gpui_kit_notification_event(OnGpuiKitNotificationEvent {
                key: close_key.clone(),
                kind: "close".into(),
            });
        });
    }
    if let Some(action) = pushed.action {
        let key = pushed.key.clone();
        note = note.action(move |_, _, cx| {
            let sender = sender.clone();
            let key = key.clone();
            let mut button = Button::new("action").label(action.label.clone());
            button = match action.variant.as_str() {
                "secondary" => button.with_variant(ButtonVariant::Secondary),
                "danger" => button.with_variant(ButtonVariant::Danger),
                "ghost" => button.with_variant(ButtonVariant::Ghost),
                "outline" => button.outline(),
                _ => button.with_variant(ButtonVariant::Primary),
            };
            button.on_click(cx.listener(move |this, _, window, cx| {
                sender.gpui_kit_notification_event(OnGpuiKitNotificationEvent {
                    key: key.clone(),
                    kind: "action".into(),
                });
                this.dismiss(window, cx);
            }))
        });
    }
    if let Some(autohide) = pushed.autohide {
        note = note.autohide(autohide);
    }
    note
}
