rn_gpui_module::include_specs!();

use std::rc::Rc;

use gpui::{div, prelude::*, px, rgba, AnyElement, MouseButton, Window};

const TEXT: u32 = 0x1f2937ff;
const BORDER: u32 = 0xd4d4d8ff;
const SURFACE: u32 = 0xffffffff;
const MUTED: u32 = 0x6b7280ff;

/// A React Native color, `0xAARRGGBB`, as GPUI's `0xRRGGBBAA`.
fn color(argb: Option<u32>, fallback: u32) -> u32 {
    argb.map_or(fallback, |argb| argb.rotate_left(8))
}

pub struct Picker {
    sender: Rc<RNCPickerEventSender>,
}

impl RNCPickerSpec for Picker {
    fn create(_props: &RNCPickerProps, cx: &mut RNCPickerContext) -> Self {
        Self {
            sender: Rc::new(cx.event_sender()),
        }
    }

    fn update(&mut self, _props: &RNCPickerProps, _changed: RNCPickerChanged, _cx: &mut RNCPickerContext) {}

    fn render(&mut self, props: &RNCPickerProps, _window: &mut Window, _cx: &mut RNCPickerContext) -> AnyElement {
        let items = props.items();
        let selected = usize::try_from(props.selected_index()).ok();
        let label = selected
            .and_then(|index| items.get(index))
            .map(|item| item.label().to_string())
            .filter(|label| !label.is_empty())
            .unwrap_or_else(|| props.placeholder().to_string());
        let enabled = props.enabled();
        let font_size = props.font_size().max(1.0) as f32;
        let text = rgba(color(props.color(), TEXT));
        let text = if label.is_empty() || selected.is_none() { rgba(color(None, MUTED)) } else { text };

        let root = div()
            .flex()
            .flex_row()
            .items_center()
            .justify_between()
            .size_full()
            .px(px(10.0))
            .rounded(px(6.0))
            .border_1()
            .border_color(rgba(BORDER))
            .bg(rgba(SURFACE))
            .opacity(if enabled { 1.0 } else { 0.5 })
            .text_size(px(font_size))
            .text_color(text)
            .child(div().overflow_hidden().whitespace_nowrap().child(label))
            .child(div().ml(px(8.0)).text_color(rgba(MUTED)).child("\u{25BE}"));

        if !enabled {
            return root.into_any_element();
        }

        let sender = self.sender.clone();
        root.on_mouse_down(MouseButton::Left, move |event, _window, _cx| {
            sender.rnc_picker_open(OnRNCPickerOpen {
                x: f64::from(f32::from(event.position.x)),
                y: f64::from(f32::from(event.position.y)),
            });
        })
        .into_any_element()
    }
}

pub fn rn_gpui_register() {
    react_native_gpui::host_component::register_component(rnc_picker_component::<Picker>());
}
