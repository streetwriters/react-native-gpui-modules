use gpui::{AnyElement, IntoElement, SharedString, Window};
use gpui_component::tab::{Tab, TabBar, TabVariant};
use gpui_component::{Sizable as _, Size};

use crate::*;

pub struct GpuiKitTabBar {
    id: String,
}

impl GpuiKitTabBarSpec for GpuiKitTabBar {
    fn create(_props: &GpuiKitTabBarProps, cx: &mut GpuiKitTabBarContext) -> Self {
        Self {
            id: format!("gpui_kit_tab_bar-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitTabBarProps,
        _changed: GpuiKitTabBarChanged,
        _cx: &mut GpuiKitTabBarContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitTabBarProps,
        _window: &mut Window,
        cx: &mut GpuiKitTabBarContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let mut element = TabBar::new(SharedString::from(self.id.clone()))
            .selected_index(props.selected_index().max(0) as usize)
            .menu(props.menu());
        let list = props.items();
        for item in (0..list.len()).filter_map(|index| list.get(index)) {
            let mut tab = Tab::new()
                .label(item.label().to_string())
                .disabled(item.disabled());
            if let Some(icon) = crate::generated::icons::parse(item.icon()) {
                tab = tab.icon(icon);
            }
            element = element.child(tab);
        }
        match props.variant() {
            GpuiKitTabBarVariant::Unset | GpuiKitTabBarVariant::Tab => {}
            GpuiKitTabBarVariant::Outline => element = element.with_variant(TabVariant::Outline),
            GpuiKitTabBarVariant::Pill => element = element.with_variant(TabVariant::Pill),
            GpuiKitTabBarVariant::Segmented => {
                element = element.with_variant(TabVariant::Segmented)
            }
            GpuiKitTabBarVariant::Underline => {
                element = element.with_variant(TabVariant::Underline)
            }
            GpuiKitTabBarVariant::Folder => element = element.with_variant(TabVariant::Folder),
        }
        match props.size() {
            GpuiKitTabBarSize::Unset => {}
            GpuiKitTabBarSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitTabBarSize::Small => element = element.with_size(Size::Small),
            GpuiKitTabBarSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitTabBarSize::Large => element = element.with_size(Size::Large),
        }
        element
            .on_click(move |index, _window, _cx| {
                sender.gpui_kit_tab_bar_select(OnGpuiKitTabBarSelect {
                    index: *index as i32,
                });
            })
            .into_any_element()
    }
}
