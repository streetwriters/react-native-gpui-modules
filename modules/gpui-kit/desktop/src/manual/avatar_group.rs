use gpui::{AnyElement, IntoElement, Window};
use gpui_component::avatar::{Avatar, AvatarGroup};
use gpui_component::{Sizable as _, Size};

use crate::*;

pub struct GpuiKitAvatarGroup;

impl GpuiKitAvatarGroupSpec for GpuiKitAvatarGroup {
    fn create(_props: &GpuiKitAvatarGroupProps, _cx: &mut GpuiKitAvatarGroupContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitAvatarGroupProps,
        _changed: GpuiKitAvatarGroupChanged,
        _cx: &mut GpuiKitAvatarGroupContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitAvatarGroupProps,
        _window: &mut Window,
        _cx: &mut GpuiKitAvatarGroupContext,
    ) -> AnyElement {
        let mut element = AvatarGroup::new();
        let items = props.items();
        for item in (0..items.len()).filter_map(|index| items.get(index)) {
            let mut avatar = Avatar::new();
            if !item.name().is_empty() {
                avatar = avatar.name(item.name().to_string());
            }
            if let Some(icon) = crate::generated::icons::parse(item.placeholder()) {
                avatar = avatar.placeholder(icon);
            }
            if !item.src().is_empty() {
                avatar = avatar.src(crate::color::image_source(item.src()));
            }
            element = element.child(avatar);
        }
        if props.limit() > 0 {
            element = element.limit(props.limit() as usize);
        }
        if props.ellipsis() {
            element = element.ellipsis();
        }
        match props.size() {
            GpuiKitAvatarGroupSize::Unset => {}
            GpuiKitAvatarGroupSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitAvatarGroupSize::Small => element = element.with_size(Size::Small),
            GpuiKitAvatarGroupSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitAvatarGroupSize::Large => element = element.with_size(Size::Large),
        }
        element.into_any_element()
    }
}
