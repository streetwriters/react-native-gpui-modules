use gpui::{px, AnyElement, IntoElement, ParentElement as _, SharedString, Styled as _, Window};
use gpui_component::button::{Button, ButtonVariants as _};
use gpui_component::dialog::{
    AlertDialog, DialogAction, DialogClose, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle,
};
use gpui_component::WindowExt as _;
use serde::Deserialize;

use super::button_group::button_variant;
use super::slots::{Renderers, Shown};
use crate::*;

/// One button of a composed dialog's footer.
#[derive(Deserialize, Default, Clone)]
#[serde(default, rename_all = "camelCase")]
pub(super) struct FooterButton {
    /// `ok` confirms, `cancel` closes.
    role: String,
    label: String,
    variant: String,
    outline: bool,
    flex: bool,
    full_width: bool,
}

pub(super) fn footer_button(index: usize, spec: &FooterButton) -> AnyElement {
    let mut button =
        Button::new(SharedString::from(format!("footer-{index}"))).label(spec.label.clone());
    if let Some(variant) = button_variant(&spec.variant) {
        button = button.with_variant(variant);
    }
    if spec.outline {
        button = button.outline();
    }
    if spec.flex {
        button = button.flex_1();
    }
    if spec.full_width {
        button = button.w_full();
    }
    if spec.role == "cancel" {
        DialogClose::new().child(button).into_any_element()
    } else {
        DialogAction::new().child(button).into_any_element()
    }
}

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
        let (ok_variant, cancel_variant) = (
            button_variant(props.ok_variant()),
            button_variant(props.cancel_variant()),
        );
        let (width, confirm, keyboard, centered) = (
            props.dialog_width(),
            props.confirm(),
            props.keyboard(),
            props.centered(),
        );
        let (close_button, close_on_ok, close_on_cancel) = (
            props.close_button(),
            props.close_on_ok(),
            props.close_on_cancel(),
        );
        let style = crate::style::refinement(props.kit_style());
        let header_style = crate::style::refinement(props.header_style());
        let footer_style = crate::style::refinement(props.footer_style());
        let buttons: Vec<FooterButton> =
            serde_json::from_str(props.buttons_json()).unwrap_or_default();
        let composed = header_style.is_some() || footer_style.is_some() || !buttons.is_empty();
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
                    let (style, header_style, footer_style, buttons) = (
                        style.clone(),
                        header_style.clone(),
                        footer_style.clone(),
                        buttons.clone(),
                    );
                    let (title_slot, description_slot, icon_slot, body_slot, footer_slot) = (
                        renderers.get("title"),
                        renderers.get("description"),
                        renderers.get("icon"),
                        renderers.get("body"),
                        renderers.get("footer"),
                    );
                    let (ok, cancel, close) = (sender.clone(), sender.clone(), sender.clone());
                    let closed = closed.clone();
                    window.open_alert_dialog(app, move |dialog: AlertDialog, window, cx| {
                        let (ok, cancel, close, closed) =
                            (ok.clone(), cancel.clone(), close.clone(), closed.clone());
                        let mut dialog = dialog.keyboard(keyboard).close_button(close_button);
                        if confirm {
                            dialog = dialog.confirm();
                        }
                        if centered {
                            dialog = dialog.centered();
                        }
                        if width > 0.0 {
                            dialog = dialog.width(px(width as f32));
                        }
                        if let Some(style) = &style {
                            gpui::Refineable::refine(gpui::Styled::style(&mut dialog), style);
                        }
                        if !ok_text.is_empty() {
                            dialog = dialog.ok_text(ok_text.clone());
                        }
                        if !cancel_text.is_empty() {
                            dialog = dialog.cancel_text(cancel_text.clone());
                        }
                        if let Some(variant) = ok_variant {
                            dialog = dialog.ok_variant(variant);
                        }
                        if let Some(variant) = cancel_variant {
                            dialog = dialog.cancel_variant(variant);
                        }
                        if composed {
                            let (title, description) = (title.clone(), description.clone());
                            let (title_slot, description_slot, icon_slot) = (
                                title_slot.clone(),
                                description_slot.clone(),
                                icon_slot.clone(),
                            );
                            let header_style = header_style.clone();
                            // The footer goes through `footer`, not the content:
                            // a dialog without one gets the default OK row.
                            let mut footer = DialogFooter::new();
                            if let Some(style) = &footer_style {
                                gpui::Refineable::refine(footer.style(), style);
                            }
                            match &footer_slot {
                                Some(render) => footer = footer.child(render(window, cx)),
                                None => {
                                    for (index, spec) in buttons.iter().enumerate() {
                                        footer = footer.child(footer_button(index, spec));
                                    }
                                }
                            }
                            dialog = dialog.footer(footer);
                            dialog = dialog.content(move |content, window, cx| {
                                let mut header = DialogHeader::new();
                                if let Some(style) = &header_style {
                                    gpui::Refineable::refine(header.style(), style);
                                }
                                if let Some(render) = &icon_slot {
                                    header = header.child(render(window, cx));
                                }
                                match &title_slot {
                                    Some(render) => {
                                        header = header
                                            .child(DialogTitle::new().child(render(window, cx)))
                                    }
                                    None if !title.is_empty() => {
                                        header =
                                            header.child(DialogTitle::new().child(title.clone()))
                                    }
                                    None => {}
                                }
                                match &description_slot {
                                    Some(render) => {
                                        header = header.child(
                                            DialogDescription::new().child(render(window, cx)),
                                        )
                                    }
                                    None if !description.is_empty() => {
                                        header = header.child(
                                            DialogDescription::new().child(description.clone()),
                                        )
                                    }
                                    None => {}
                                }
                                content.child(header)
                            });
                        } else {
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
                            if let Some(render) = &body_slot {
                                dialog = dialog.child(render(window, cx));
                            }
                            if let Some(render) = &footer_slot {
                                dialog =
                                    dialog.footer(DialogFooter::new().child(render(window, cx)));
                            }
                        }
                        dialog
                            .on_ok(move |_, _, _| {
                                ok.gpui_kit_alert_dialog_ok();
                                close_on_ok
                            })
                            .on_cancel(move |_, _, _| {
                                cancel.gpui_kit_alert_dialog_cancel();
                                close_on_cancel
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
