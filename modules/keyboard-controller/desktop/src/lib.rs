rn_gpui_module::include_specs!();

use gpui::{div, prelude::*, AnyElement, Window};

macro_rules! passthrough_containers {
    ($($component:ident => ($spec:ident, $props:ident, $context:ident, $changed:ident, $register:ident);)*) => {
        $(
            pub struct $component;

            impl $spec for $component {
                fn create(_props: &$props, _cx: &mut $context) -> Self {
                    Self
                }

                fn update(&mut self, _props: &$props, _changed: $changed, _cx: &mut $context) {}

                fn render(&mut self, _props: &$props, _window: &mut Window, _cx: &mut $context) -> AnyElement {
                    div().into_any_element()
                }
            }
        )*

        fn register_passthrough_containers() {
            $(
                react_native_gpui::host_component::register_component($register::<$component>());
            )*
        }
    };
}

passthrough_containers! {
    OverKeyboardViewHost => (OverKeyboardViewSpec, OverKeyboardViewProps, OverKeyboardViewContext, OverKeyboardViewChanged, over_keyboard_view_component);
    KeyboardBackgroundViewHost => (KeyboardBackgroundViewSpec, KeyboardBackgroundViewProps, KeyboardBackgroundViewContext, KeyboardBackgroundViewChanged, keyboard_background_view_component);
    ClippingScrollViewDecoratorViewHost => (ClippingScrollViewDecoratorViewSpec, ClippingScrollViewDecoratorViewProps, ClippingScrollViewDecoratorViewContext, ClippingScrollViewDecoratorViewChanged, clipping_scroll_view_decorator_view_component);
    KeyboardToolbarGroupViewHost => (KeyboardToolbarGroupViewSpec, KeyboardToolbarGroupViewProps, KeyboardToolbarGroupViewContext, KeyboardToolbarGroupViewChanged, keyboard_toolbar_group_view_component);
}

/// The keyboard view has no keyboard to synchronize with on desktop.
pub struct KeyboardControllerViewHost;

impl KeyboardControllerViewSpec for KeyboardControllerViewHost {
    fn create(_props: &KeyboardControllerViewProps, _cx: &mut KeyboardControllerViewContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &KeyboardControllerViewProps,
        _changed: KeyboardControllerViewChanged,
        _cx: &mut KeyboardControllerViewContext,
    ) {
    }

    fn render(
        &mut self,
        _props: &KeyboardControllerViewProps,
        _window: &mut Window,
        _cx: &mut KeyboardControllerViewContext,
    ) -> AnyElement {
        div().into_any_element()
    }

    fn synchronize_focused_input_layout(&mut self, _cx: &mut KeyboardControllerViewContext) {}
}

pub fn rn_gpui_register() {
    react_native_gpui::host_component::register_component(
        keyboard_controller_view_component::<KeyboardControllerViewHost>(),
    );
    register_passthrough_containers();
}
