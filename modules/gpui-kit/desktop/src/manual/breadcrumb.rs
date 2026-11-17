use gpui::{AnyElement, IntoElement, Window};
use gpui_component::breadcrumb::{Breadcrumb, BreadcrumbItem};

use crate::*;

pub struct GpuiKitBreadcrumb;

impl GpuiKitBreadcrumbSpec for GpuiKitBreadcrumb {
    fn create(_props: &GpuiKitBreadcrumbProps, _cx: &mut GpuiKitBreadcrumbContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitBreadcrumbProps,
        _changed: GpuiKitBreadcrumbChanged,
        _cx: &mut GpuiKitBreadcrumbContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitBreadcrumbProps,
        _window: &mut Window,
        cx: &mut GpuiKitBreadcrumbContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let items = props.items();
        let mut element = Breadcrumb::new();
        for (index, item) in (0..items.len())
            .filter_map(|index| items.get(index))
            .enumerate()
        {
            let sender = sender.clone();
            let mut entry = BreadcrumbItem::new(item.label().to_string());
            if let Some(style) = crate::style::refinement(item.style()) {
                gpui::Refineable::refine(gpui::Styled::style(&mut entry), &style);
            }
            element = element.child(entry.disabled(item.disabled()).on_click(
                move |_, _window, _cx| {
                    sender.gpui_kit_breadcrumb_press(OnGpuiKitBreadcrumbPress {
                        index: index as i32,
                    });
                },
            ));
        }
        element.into_any_element()
    }
}
