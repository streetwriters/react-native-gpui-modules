use std::fmt::Write as _;
use std::path::PathBuf;

fn main() {
    rn_gpui_module_build::generate(&["../src/NativeConfigModule.ts"]);

    println!("cargo:rerun-if-env-changed=ENVFILE");
    println!("cargo:rerun-if-env-changed=RN_GPUI_PROJECT_ROOT");
    println!("cargo:rerun-if-env-changed=RN_GPUI_AUTOLINK_CMAKE");

    let file = std::env::var_os("ENVFILE")
        .map(PathBuf::from)
        .unwrap_or_else(|| project_root().join(".env"));
    println!("cargo:rerun-if-changed={}", file.display());

    let mut entries = String::new();
    if let Ok(text) = std::fs::read_to_string(&file) {
        for (key, value) in parse(&text) {
            let _ = writeln!(entries, "    ({key:?}, {value:?}),");
        }
    }
    let out = PathBuf::from(std::env::var_os("OUT_DIR").expect("OUT_DIR"));
    std::fs::write(
        out.join("config_env.rs"),
        format!("pub const ENTRIES: &[(&str, &str)] = &[\n{entries}];\n"),
    )
    .expect("write config_env.rs");
}

/// The app root, the folder that holds `desktop/autolink/`, as the core does it.
fn project_root() -> PathBuf {
    if let Some(root) = std::env::var_os("RN_GPUI_PROJECT_ROOT") {
        return PathBuf::from(root);
    }
    std::env::var_os("RN_GPUI_AUTOLINK_CMAKE")
        .map(PathBuf::from)
        .and_then(|cmake| cmake.parent()?.parent()?.parent().map(PathBuf::from))
        .unwrap_or_else(|| PathBuf::from("."))
}

fn parse(text: &str) -> Vec<(String, String)> {
    text.lines()
        .filter_map(|line| {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                return None;
            }
            let line = line.strip_prefix("export ").unwrap_or(line);
            let (key, value) = line.split_once('=')?;
            let value = value.trim();
            let value = match value.as_bytes() {
                [quote @ (b'"' | b'\''), .., last] if quote == last => &value[1..value.len() - 1],
                _ => value.split(" #").next().unwrap_or(value).trim(),
            };
            Some((key.trim().to_string(), value.replace("\\n", "\n")))
        })
        .collect()
}
