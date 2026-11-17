use gpui::{Anchor, AnyElement, IntoElement, Window};
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
