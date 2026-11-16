fn main() {
    rn_gpui_module_build::generate(&["../src/BVLinearGradientNativeComponent.ts"]);
    test_rpaths();
}

/// Core's runtime is shared libraries (`libjsi.dylib`, ...). Core puts their
/// directories on the app's rpath only, so this crate's test binary gets them here.
fn test_rpaths() {
    println!("cargo:rerun-if-env-changed=DEP_RN_GPUI_CORE_RPATHS");
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows") {
        return;
    }
    let Ok(dirs) = std::env::var("DEP_RN_GPUI_CORE_RPATHS") else {
        return;
    };
    for dir in dirs.split('|').filter(|dir| !dir.is_empty()) {
        println!("cargo:rustc-link-arg=-Wl,-rpath,{dir}");
    }
}
