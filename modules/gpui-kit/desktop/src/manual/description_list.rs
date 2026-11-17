use gpui::{px, AnyElement, Axis, IntoElement, SharedString, Window};
use gpui_component::description_list::{DescriptionItem, DescriptionList};
use gpui_component::{Sizable as _, Size};

use super::slots::Slots;
use crate::*;

pub struct GpuiKitDescriptionList;

impl GpuiKitDescriptionListSpec for GpuiKitDescriptionList {
    fn create(
        _props: &GpuiKitDescriptionListProps,
        _cx: &mut GpuiKitDescriptionListContext,
    ) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitDescriptionListProps,
        _changed: GpuiKitDescriptionListChanged,
        _cx: &mut GpuiKitDescriptionListContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitDescriptionListProps,
        _window: &mut Window,
        cx: &mut GpuiKitDescriptionListContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let mut element = DescriptionList::new().bordered(props.bordered());
        match props.layout() {
            GpuiKitDescriptionListLayout::Unset | GpuiKitDescriptionListLayout::Horizontal => {}
            GpuiKitDescriptionListLayout::Vertical => element = element.layout(Axis::Vertical),
        }
        if props.columns() > 0 {
            element = element.columns(props.columns() as usize);
        }
        if props.label_width() > 0.0 {
            element = element.label_width(px(props.label_width() as f32));
        }
        match props.size() {
            GpuiKitDescriptionListSize::Unset => {}
            GpuiKitDescriptionListSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitDescriptionListSize::Small => element = element.with_size(Size::Small),
            GpuiKitDescriptionListSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitDescriptionListSize::Large => element = element.with_size(Size::Large),
        }
        let items = props.items();
        for (index, item) in (0..items.len())
            .filter_map(|index| items.get(index))
            .enumerate()
        {
            if item.separator() {
                element = element.separator();
                continue;
            }
            let mut entry = DescriptionItem::new(SharedString::from(item.label().to_string()));
            entry = match slots.take(&format!("value-{index}")) {
                Some(value) => entry.value(value),
                None => entry.value(SharedString::from(item.value().to_string())),
            };
            if item.span() > 1 {
                entry = entry.span(item.span() as usize);
            }
            element = element.child(entry);
        }
        element.into_any_element()
    }
}
