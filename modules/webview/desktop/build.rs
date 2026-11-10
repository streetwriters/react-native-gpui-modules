fn main() {
    rn_gpui_module_build::generate(&["../src/RNCWebViewNativeComponent.ts"]);

    println!("cargo:rerun-if-env-changed=DEP_RN_GPUI_CORE_RPATHS");
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows") {
        return;
    }
    if let Ok(dirs) = std::env::var("DEP_RN_GPUI_CORE_RPATHS") {
        for dir in dirs.split('|').filter(|dir| !dir.is_empty()) {
            println!("cargo:rustc-link-arg=-Wl,-rpath,{dir}");
        }
    }
}
