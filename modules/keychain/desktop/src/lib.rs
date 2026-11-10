rn_gpui_module::include_specs!();

mod crypto;
mod secure;

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
            ("storage", Value::String("keychain".to_string())),
        ]),
        None => Value::Bool(false),
    }
}

fn saved(service: &str) -> Value {
    Value::object([
        ("service", Value::String(service.to_string())),
        ("storage", Value::String("keychain".to_string())),
    ])
}

fn field_string(options: &Value, name: &str) -> Option<String> {
    match options {
        Value::Object(fields) => fields.iter().find_map(|(key, value)| match value {
            Value::String(text) if key == name => Some(text.clone()),
            _ => None,
        }),
        _ => None,
    }
}

fn unsupported(method: &str) -> ModuleError {
    ModuleError::with_code("E_KEYCHAIN", format!("{method} is not supported on desktop"))
}

fn service_name(options: &Option<Value>) -> String {
    options
        .as_ref()
        .and_then(|options| field_string(options, "service"))
        .filter(|service| !service.is_empty())
        .unwrap_or_else(|| DEFAULT_SERVICE.to_string())
}

fn server_name(options: &Value) -> Result<String, ModuleError> {
    field_string(options, "server")
        .filter(|server| !server.is_empty())
        .ok_or_else(|| ModuleError::new("options.server is required"))
}

impl NativeKeychainManagerSpec for Keychain {
    fn new(_events: NativeKeychainManagerEvents) -> Self {
        Self
    }

    async fn set_generic_password_for_options(
        &self,
        options: Option<Value>,
        username: String,
        password: String,
    ) -> Result<Option<Value>, ModuleError> {
        let service = service_name(&options);
        store(&service, GENERIC_ACCOUNT, &username, &password)?;
        Ok(Some(saved(&service)))
    }

    async fn get_generic_password_for_options(
        &self,
        options: Option<Value>,
    ) -> Result<Value, ModuleError> {
        let service = service_name(&options);
        Ok(credentials(&service, load(&service, GENERIC_ACCOUNT)?))
    }

    async fn has_generic_password_for_options(
        &self,
        options: Option<Value>,
    ) -> Result<bool, ModuleError> {
        Ok(load(&service_name(&options), GENERIC_ACCOUNT)?.is_some())
    }

    async fn reset_generic_password_for_options(
        &self,
        options: Option<Value>,
    ) -> Result<bool, ModuleError> {
        remove(&service_name(&options), GENERIC_ACCOUNT)
    }

    async fn get_all_generic_password_services(
        &self,
        _options: Option<Value>,
    ) -> Result<Vec<String>, ModuleError> {
        Err(unsupported("getAllGenericPasswordServices"))
    }

    async fn get_all_internet_credential_servers(
        &self,
        _options: Option<Value>,
    ) -> Result<Vec<String>, ModuleError> {
        Err(unsupported("getAllInternetCredentialServers"))
    }

    async fn has_internet_credentials_for_options(
        &self,
        options: Value,
    ) -> Result<bool, ModuleError> {
        Ok(load(&server_name(&options)?, INTERNET_ACCOUNT)?.is_some())
    }

    async fn set_internet_credentials_for_server(
        &self,
        server: String,
        username: String,
        password: String,
        _options: Option<Value>,
    ) -> Result<Option<Value>, ModuleError> {
        store(&server, INTERNET_ACCOUNT, &username, &password)?;
        Ok(Some(saved(&server)))
    }

    async fn get_internet_credentials_for_server(
        &self,
        server: String,
        _options: Option<Value>,
    ) -> Result<Value, ModuleError> {
        Ok(credentials(&server, load(&server, INTERNET_ACCOUNT)?))
    }

    async fn reset_internet_credentials_for_options(
        &self,
        options: Value,
    ) -> Result<bool, ModuleError> {
        remove(&server_name(&options)?, INTERNET_ACCOUNT)
    }
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_keychain_manager_module::<Keychain>());
    rn_gpui_module::register(native_secure_storage_module::<secure::SecureStorage>());
}
