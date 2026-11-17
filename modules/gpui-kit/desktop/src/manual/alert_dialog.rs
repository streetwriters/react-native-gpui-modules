use gpui::{px, AnyElement, IntoElement, Window};
use gpui_component::dialog::AlertDialog;
use gpui_component::WindowExt as _;

use super::slots::{Renderers, Shown};
use crate::*;

pub struct GpuiKitAlertDialog {
    shown: Shown,
}

impl GpuiKitAlertDialogSpec for GpuiKitAlertDialog {
    fn create(_props: &GpuiKitAlertDialogProps, _cx: &mut GpuiKitAlertDialogContext) -> Self {
        Self {
            shown: Shown::default(),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitAlertDialogProps,
        _changed: GpuiKitAlertDialogChanged,
        _cx: &mut GpuiKitAlertDialogContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitAlertDialogProps,
        window: &mut Window,
        cx: &mut GpuiKitAlertDialogContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let sender = cx.event_sender();
        let (title, description) = (props.title().to_string(), props.description().to_string());
        let (ok_text, cancel_text) = (props.ok_text().to_string(), props.cancel_text().to_string());
        let (width, confirm, keyboard, centered) = (
            props.width(),
            props.confirm(),
            props.keyboard(),
            props.centered(),
        );
        if let Some(app) = cx.app() {
            let closed = self.shown.clone();
            self.shown.sync(
                props.open(),
                window,
                app,
                move |window, app| {
                    let (title, description, ok_text, cancel_text) = (
                        title.clone(),
                        description.clone(),
                        ok_text.clone(),
                        cancel_text.clone(),
                    );
                    let (title_slot, description_slot, icon_slot) = (
                        renderers.get("title"),
                        renderers.get("description"),
                        renderers.get("icon"),
                    );
                    let (ok, cancel, close) = (sender.clone(), sender.clone(), sender.clone());
                    let closed = closed.clone();
                    window.open_alert_dialog(app, move |dialog: AlertDialog, window, cx| {
                        let (ok, cancel, close, closed) =
                            (ok.clone(), cancel.clone(), close.clone(), closed.clone());
                        let mut dialog = dialog.keyboard(keyboard);
                        if confirm {
                            dialog = dialog.confirm();
                        }
                        if centered {
                            dialog = dialog.centered();
                        }
                        if width > 0.0 {
                            dialog = dialog.width(px(width as f32));
                        }
                        if !ok_text.is_empty() {
                            dialog = dialog.ok_text(ok_text.clone());
                        }
                        if !cancel_text.is_empty() {
                            dialog = dialog.cancel_text(cancel_text.clone());
                        }
                        match &title_slot {
                            Some(render) => dialog = dialog.title(render(window, cx)),
                            None if !title.is_empty() => dialog = dialog.title(title.clone()),
                            None => {}
                        }
                        match &description_slot {
                            Some(render) => dialog = dialog.description(render(window, cx)),
                            None if !description.is_empty() => {
                                dialog = dialog.description(description.clone())
                            }
                            None => {}
                        }
                        if let Some(render) = &icon_slot {
                            dialog = dialog.icon(render(window, cx));
                        }
                        dialog
                            .on_ok(move |_, _, _| {
                                ok.gpui_kit_alert_dialog_ok();
                                true
                            })
                            .on_cancel(move |_, _, _| {
                                cancel.gpui_kit_alert_dialog_cancel();
                                true
                            })
                            .on_close(move |_, _, _| {
                                closed.0.set(false);
                                close.gpui_kit_alert_dialog_close();
                            })
                    });
                },
                |window, app| window.close_dialog(app),
            );
        }
        gpui::div().into_any_element()
    }
}
