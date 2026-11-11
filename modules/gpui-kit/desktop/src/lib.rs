rn_gpui_module::include_specs!();

mod color;
mod generated;

pub fn rn_gpui_register() {
    react_native_gpui::register_app_init(std::sync::Arc::new(|cx| {
        gpui_component::init(cx);
    }));
    generated::register();
}
