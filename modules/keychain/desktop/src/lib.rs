rn_gpui_module::include_specs!();

use keyring::Entry;
use rn_gpui_module::{ModuleError, Value};

const INTERNET_ACCOUNT: &str = "internet-credentials";
const GENERIC_ACCOUNT: &str = "generic-password";
const DEFAULT_SERVICE: &str = "react-native-keychain";

pub struct Keychain;

fn failure(error: keyring::Error) -> ModuleError {
    ModuleError::with_code("E_KEYCHAIN", error.to_string())
}

fn store(service: &str, account: &str, username: &str, password: &str) -> Result<bool, ModuleError> {
    let blob = serde_json::json!({ "username": username, "password": password }).to_string();
    Entry::new(service, account)
        .and_then(|entry| entry.set_password(&blob))
        .map_err(failure)?;
    Ok(true)
}

fn load(service: &str, account: &str) -> Result<Option<(String, String)>, ModuleError> {
    let entry = Entry::new(service, account).map_err(failure)?;
    let blob = match entry.get_password() {
        Ok(blob) => blob,
        Err(keyring::Error::NoEntry) => return Ok(None),
        Err(error) => return Err(failure(error)),
    };
    let parsed: serde_json::Value =
        serde_json::from_str(&blob).map_err(|e| ModuleError::new(e.to_string()))?;
    let field = |name: &str| parsed[name].as_str().unwrap_or_default().to_string();
    Ok(Some((field("username"), field("password"))))
}

fn remove(service: &str, account: &str) -> Result<bool, ModuleError> {
    match Entry::new(service, account).and_then(|entry| entry.delete_credential()) {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(true),
        Err(error) => Err(failure(error)),
    }
}

fn credentials(service: &str, found: Option<(String, String)>) -> Value {
    match found {
        Some((username, password)) => Value::object([
            ("service", Value::String(service.to_string())),
            ("server", Value::String(service.to_string())),
            ("username", Value::String(username)),
            ("password", Value::String(password)),
        ]),
        None => Value::Bool(false),
    }
}

fn service_name(service: Option<String>) -> String {
    service
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| DEFAULT_SERVICE.to_string())
}

impl NativeRNKeychainManagerSpec for Keychain {
    fn new(_events: NativeRNKeychainManagerEvents) -> Self {
        Self
    }

    async fn set_internet_credentials_for_server(
        &self,
        server: String,
        username: String,
        password: String,
        _security_level: Option<String>,
        _options: Option<Value>,
    ) -> Result<bool, ModuleError> {
        store(&server, INTERNET_ACCOUNT, &username, &password)
    }

    async fn has_internet_credentials_for_server(&self, server: String) -> Result<bool, ModuleError> {
        Ok(load(&server, INTERNET_ACCOUNT)?.is_some())
    }

    async fn get_internet_credentials_for_server(
        &self,
        server: String,
        _options: Option<Value>,
    ) -> Result<Value, ModuleError> {
        Ok(credentials(&server, load(&server, INTERNET_ACCOUNT)?))
    }

    async fn reset_internet_credentials_for_server(
        &self,
        server: String,
        _options: Option<Value>,
    ) -> Result<bool, ModuleError> {
        remove(&server, INTERNET_ACCOUNT)
    }

    async fn set_generic_password_for_options(
        &self,
        service: Option<String>,
        username: String,
        password: String,
        _security_level: Option<String>,
    ) -> Result<bool, ModuleError> {
        store(&service_name(service), GENERIC_ACCOUNT, &username, &password)
    }

    async fn get_generic_password_for_options(
        &self,
        service: Option<String>,
    ) -> Result<Value, ModuleError> {
        let service = service_name(service);
        Ok(credentials(&service, load(&service, GENERIC_ACCOUNT)?))
    }

    async fn reset_generic_password_for_options(
        &self,
        service: Option<String>,
    ) -> Result<bool, ModuleError> {
        remove(&service_name(service), GENERIC_ACCOUNT)
    }
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_rn_keychain_manager_module::<Keychain>());
}
