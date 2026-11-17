use gpui::{px, AnyElement, IntoElement, ParentElement as _, Window};
use gpui_component::dialog::DialogButtonProps;
use gpui_component::WindowExt as _;

use super::slots::{Renderers, Shown};
use crate::*;

pub struct GpuiKitDialog {
    shown: Shown,
}

impl GpuiKitDialogSpec for GpuiKitDialog {
    fn create(_props: &GpuiKitDialogProps, _cx: &mut GpuiKitDialogContext) -> Self {
        Self {
            shown: Shown::default(),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitDialogProps,
        _changed: GpuiKitDialogChanged,
        _cx: &mut GpuiKitDialogContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitDialogProps,
        window: &mut Window,
        cx: &mut GpuiKitDialogContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let sender = cx.event_sender();
        let title = props.title().to_string();
        let ok_text = props.ok_text().to_string();
        let cancel_text = props.cancel_text().to_string();
        let (width, margin_top) = (props.width(), props.margin_top());
        let (overlay, closable, keyboard, close_button) = (
            props.overlay(),
            props.overlay_closable(),
            props.keyboard(),
            props.close_button(),
        );
        let (centered, show_cancel) = (props.centered(), props.show_cancel());
        let shown = self.shown.clone();
        if let Some(app) = cx.app() {
            let closed = shown.clone();
            self.shown.sync(
                props.open(),
                window,
                app,
                move |window, app| {
                    let (title, ok_text, cancel_text) =
                        (title.clone(), ok_text.clone(), cancel_text.clone());
                    let renderers = (
                        renderers.get("title"),
                        renderers.get("body"),
                        renderers.get("footer"),
                    );
                    let (ok, cancel, close) = (sender.clone(), sender.clone(), sender.clone());
                    let closed = closed.clone();
                    window.open_dialog(app, move |dialog, _window, _cx| {
                        let mut buttons = DialogButtonProps::default().show_cancel(show_cancel);
                        if !ok_text.is_empty() {
                            buttons = buttons.ok_text(ok_text.clone());
                        }
                        if !cancel_text.is_empty() {
                            buttons = buttons.cancel_text(cancel_text.clone());
                        }
                        let (ok, cancel) = (ok.clone(), cancel.clone());
                        let buttons = buttons
                            .on_ok(move |_, _, _| {
                                ok.gpui_kit_dialog_ok();
                                true
                            })
                            .on_cancel(move |_, _, _| {
                                cancel.gpui_kit_dialog_cancel();
                                true
                            });
                        let mut dialog = dialog
                            .button_props(buttons)
                            .overlay(overlay)
                            .overlay_closable(closable)
                            .keyboard(keyboard)
                            .close_button(close_button);
                        if width > 0.0 {
                            dialog = dialog.w(px(width as f32));
                        }
                        if margin_top > 0.0 {
                            dialog = dialog.margin_top(px(margin_top as f32));
                        }
                        if centered {
                            dialog = dialog.centered();
                        }
                        let (close, closed) = (close.clone(), closed.clone());
                        dialog = dialog.on_close(move |_, _, _| {
                            closed.0.set(false);
                            close.gpui_kit_dialog_close();
                        });
                        match &renderers.0 {
                            Some(render) => {
                                let render = render.clone();
                                dialog = dialog.title(render(_window, _cx));
                            }
                            None if !title.is_empty() => dialog = dialog.title(title.clone()),
                            None => {}
                        }
                        if let Some(render) = renderers.2.clone() {
                            dialog = dialog.footer(render(_window, _cx));
                        }
                        let body = renderers.1.clone();
                        dialog.content(move |content, window, cx| match &body {
                            Some(render) => content.child(render(window, cx)),
                            None => content,
                        })
                    });
                },
                |window, app| window.close_dialog(app),
            );
        }
        gpui::div().into_any_element()
    }
}
