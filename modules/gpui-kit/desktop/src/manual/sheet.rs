use gpui::{px, AnyElement, IntoElement, ParentElement as _, Window};
use gpui_component::{Placement, WindowExt as _};

use super::slots::{Renderers, Shown};
use crate::*;

pub struct GpuiKitSheet {
    shown: Shown,
}

impl GpuiKitSheetSpec for GpuiKitSheet {
    fn create(_props: &GpuiKitSheetProps, _cx: &mut GpuiKitSheetContext) -> Self {
        Self {
            shown: Shown::default(),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitSheetProps,
        _changed: GpuiKitSheetChanged,
        _cx: &mut GpuiKitSheetContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitSheetProps,
        window: &mut Window,
        cx: &mut GpuiKitSheetContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let sender = cx.event_sender();
        let title = props.title().to_string();
        let (size, resizable, overlay, closable) = (
            props.size(),
            props.resizable(),
            props.overlay(),
            props.overlay_closable(),
        );
        let placement = match props.placement() {
            GpuiKitSheetPlacement::Top => Placement::Top,
            GpuiKitSheetPlacement::Bottom => Placement::Bottom,
            GpuiKitSheetPlacement::Left => Placement::Left,
            GpuiKitSheetPlacement::Unset | GpuiKitSheetPlacement::Right => Placement::Right,
        };
        if let Some(app) = cx.app() {
            let closed = self.shown.clone();
            self.shown.sync(
                props.open(),
                window,
                app,
                move |window, app| {
                    let title = title.clone();
                    let (title_slot, body, footer) = (
                        renderers.get("title"),
                        renderers.get("body"),
                        renderers.get("footer"),
                    );
                    let (close, closed) = (sender.clone(), closed.clone());
                    window.open_sheet_at(placement, app, move |sheet, window, cx| {
                        let (close, closed) = (close.clone(), closed.clone());
                        let mut sheet = sheet
                            .resizable(resizable)
                            .overlay(overlay)
                            .overlay_closable(closable);
                        if size > 0.0 {
                            sheet = sheet.size(px(size as f32));
                        }
                        match &title_slot {
                            Some(render) => sheet = sheet.title(render(window, cx)),
                            None if !title.is_empty() => sheet = sheet.title(title.clone()),
                            None => {}
                        }
                        if let Some(render) = &footer {
                            sheet = sheet.footer(render(window, cx));
                        }
                        if let Some(render) = &body {
                            sheet = sheet.child(render(window, cx));
                        }
                        sheet.on_close(move |_, _, _| {
                            closed.0.set(false);
                            close.gpui_kit_sheet_close();
                        })
                    });
                },
                |window, app| window.close_sheet(app),
            );
        }
        gpui::div().into_any_element()
    }
}
