rn_gpui_module::include_specs!();

mod webview;
#[cfg(target_os = "macos")]
mod appkit;

use react_native_gpui::host_component::register_component;

pub fn rn_gpui_register() {
    register_component(rnc_web_view_component::<webview::WebView>());
}
