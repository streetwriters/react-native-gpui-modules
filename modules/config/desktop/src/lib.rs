rn_gpui_module::include_specs!();

use rn_gpui_module::{ModuleError, Value};

include!(concat!(env!("OUT_DIR"), "/config_env.rs"));

pub struct RNCConfigModule;

impl NativeConfigModuleSpec for RNCConfigModule {
    fn new(_events: NativeConfigModuleEvents) -> Self {
        Self
    }

    fn get_config(&self) -> Result<GetConfigResult, ModuleError> {
        let config = Value::object(
            ENTRIES
                .iter()
                .map(|(key, value)| (*key, Value::String((*value).to_string()))),
        );
        Ok(GetConfigResult { config })
    }
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_config_module_module::<RNCConfigModule>());
}
