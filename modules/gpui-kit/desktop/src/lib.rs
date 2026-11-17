rn_gpui_module::include_specs!();

mod color;
mod generated;
mod manual;
mod role;
mod style;

pub fn rn_gpui_register() {
    use gpui::AppContext as _;
    react_native_gpui::register_asset_source(gpui_kit_assets::Assets);
    react_native_gpui::register_app_init(std::sync::Arc::new(|cx| {
        gpui_component::init(cx);
        gpui_base::Root::register_plugin::<MotionSync>(cx, |_, _| MotionSync { driver: false });
    }));
    react_native_gpui::register_root_wrapper(|inner, window, cx| {
        cx.new(|cx| gpui_base::Root::new(inner, window, cx))
    });
    generated::register();
}

/// Makes the kit's transitions follow the test driver's animation switch, the
/// way they follow the system's reduce-motion setting.
struct MotionSync {
    driver: bool,
}

impl gpui::Render for MotionSync {
    fn render(
        &mut self,
        _window: &mut gpui::Window,
        _cx: &mut gpui::Context<Self>,
    ) -> impl gpui::IntoElement {
        gpui::div()
    }
}

impl gpui_base::RootPlugin for MotionSync {
    fn prepare(&mut self, _window: &mut gpui::Window, cx: &mut gpui::Context<Self>) {
        let disabled = react_native_gpui::animations_disabled();
        if disabled != self.driver {
            self.driver = disabled;
            cx.set_reduce_motion(disabled);
        }
    }
}
