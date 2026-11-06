rn_gpui_module::include_specs!();

use rn_gpui_module::ModuleError;

pub struct DeviceInfo;

#[cfg(target_os = "macos")]
fn sysctl(name: &str) -> Option<String> {
    let name = std::ffi::CString::new(name).ok()?;
    let mut size = 0usize;
    unsafe {
        if libc::sysctlbyname(name.as_ptr(), std::ptr::null_mut(), &mut size, std::ptr::null_mut(), 0) != 0 {
            return None;
        }
        let mut buffer = vec![0u8; size];
        if libc::sysctlbyname(name.as_ptr(), buffer.as_mut_ptr().cast(), &mut size, std::ptr::null_mut(), 0) != 0 {
            return None;
        }
        buffer.truncate(size);
        while buffer.last() == Some(&0) {
            buffer.pop();
        }
        String::from_utf8(buffer).ok()
    }
}

#[cfg(target_os = "linux")]
fn file(path: &str) -> Option<String> {
    std::fs::read_to_string(path).ok().map(|text| text.trim().to_string())
}

#[cfg(target_os = "linux")]
fn os_release(key: &str) -> Option<String> {
    file("/etc/os-release")?.lines().find_map(|line| {
        line.strip_prefix(&format!("{key}="))
            .map(|value| value.trim_matches('"').to_string())
    })
}

fn model() -> Option<String> {
    #[cfg(target_os = "macos")]
    return sysctl("hw.model");
    #[cfg(target_os = "linux")]
    return file("/sys/devices/virtual/dmi/id/product_name");
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    None
}

fn brand() -> Option<String> {
    #[cfg(target_os = "macos")]
    return Some("Apple".to_string());
    #[cfg(target_os = "linux")]
    return file("/sys/devices/virtual/dmi/id/sys_vendor");
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    None
}

fn system_version() -> Option<String> {
    #[cfg(target_os = "macos")]
    return sysctl("kern.osproductversion");
    #[cfg(target_os = "linux")]
    return os_release("VERSION_ID");
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    None
}

fn executable_name() -> String {
    std::env::current_exe()
        .ok()
        .and_then(|path| path.file_stem().map(|name| name.to_string_lossy().into_owned()))
        .unwrap_or_else(|| "unknown".to_string())
}

fn unknown(value: Option<String>) -> String {
    value.unwrap_or_else(|| "unknown".to_string())
}

impl NativeRNDeviceInfoSpec for DeviceInfo {
    fn new(_events: NativeRNDeviceInfoEvents) -> Self {
        Self
    }

    fn get_constants(&self) -> Result<GetConstantsResult, ModuleError> {
        let name = executable_name();
        Ok(GetConstantsResult {
            model: unknown(model()),
            brand: unknown(brand()),
            system_name: std::env::consts::OS.to_string(),
            system_version: unknown(system_version()),
            app_name: name.clone(),
            app_version: std::env::var("RN_GPUI_APP_VERSION").unwrap_or_else(|_| "0.0.0".to_string()),
            build_number: std::env::var("RN_GPUI_APP_BUILD").unwrap_or_else(|_| "0".to_string()),
            bundle_id: std::env::var("RN_GPUI_APP_ID").unwrap_or(name),
            is_tablet: false,
        })
    }

    fn add_listener(&self, _event_name: String) {}

    fn remove_listeners(&self, _count: f64) {}
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_rn_device_info_module::<DeviceInfo>());
}
