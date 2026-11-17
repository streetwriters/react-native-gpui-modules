use gpui::{px, AnyElement, Axis, IntoElement, ParentElement as _, Window};
use gpui_component::form::{Field, Form};

use super::slots::Slots;
use crate::*;

pub struct GpuiKitForm;

impl GpuiKitFormSpec for GpuiKitForm {
    fn create(_props: &GpuiKitFormProps, _cx: &mut GpuiKitFormContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitFormProps,
        _changed: GpuiKitFormChanged,
        _cx: &mut GpuiKitFormContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitFormProps,
        _window: &mut Window,
        cx: &mut GpuiKitFormContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut form = if props.horizontal() {
            Form::horizontal()
        } else {
            Form::vertical()
        };
        if props.label_width() > 0.0 {
            form = form.label_width(px(props.label_width() as f32));
        }
        if props.columns() > 0 {
            form = form.columns(props.columns() as usize);
        }
        let list = props.fields();
        for index in 0..list.len() {
            let Some(spec) = list.get(index) else {
                continue;
            };
            let mut field = Field::new()
                .required(spec.required())
                .visible(spec.visible());
            if !spec.label().is_empty() {
                field = field.label(spec.label().to_string());
            }
            if !spec.description().is_empty() {
                field = field.description(spec.description().to_string());
            }
            if spec.col_span() > 1 {
                field = field.col_span(spec.col_span() as u16);
            }
            if let Some(control) = slots.take(&format!("field-{index}")) {
                field = field.child(control);
            }
            form = form.child(field);
        }
        if let Some(footer) = slots.take("footer") {
            form = form.footer(footer);
        }
        let _ = Axis::Vertical;
        form.into_any_element()
    }
}
