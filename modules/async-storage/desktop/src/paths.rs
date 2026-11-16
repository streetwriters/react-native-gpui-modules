use std::path::PathBuf;

fn sanitize(id: &str) -> String {
    id.trim()
        .chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' | '\0' => '-',
            other => other,
        })
        .collect::<String>()
        .trim_matches(|c| c == '.' || c == '-')
        .to_string()
}

fn app_id() -> String {
    let from_environment = std::env::var("RN_GPUI_APP_ID").ok();
    let from_executable = std::env::current_exe().ok().and_then(|exe| {
        exe.file_stem()
            .map(|stem| stem.to_string_lossy().into_owned())
    });
    [from_environment, from_executable]
        .into_iter()
        .flatten()
        .map(|id| sanitize(&id))
        .find(|id| !id.is_empty())
        .unwrap_or_else(|| "rn-gpui-app".to_string())
}

/// `<app data folder>/async-storage`, where the app data folder follows the
/// convention of the other desktop modules.
pub fn storage_directory() -> PathBuf {
    let id = app_id();
    let root = std::env::var_os("RN_GPUI_APP_DATA_DIR").filter(|root| !root.is_empty());
    let app_data = match root {
        Some(root) => PathBuf::from(root).join(id),
        None => dirs::data_dir()
            .unwrap_or_else(std::env::temp_dir)
            .join(id),
    };
    app_data.join("async-storage")
}
