rn_gpui_module::include_specs!();

mod paths;

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use redb::{Database, ReadableTable, TableDefinition, TableError};
use rn_gpui_module::ModuleError;
use serde_json::{Map, Value as Json};

const KV: TableDefinition<&str, &str> = TableDefinition::new("kv");
const LEGACY_FILE: &str = "legacy";

pub struct AsyncStorage {
    directory: PathBuf,
    databases: Mutex<HashMap<String, Arc<Database>>>,
}

fn storage_error(error: impl std::fmt::Display) -> ModuleError {
    ModuleError::new(error.to_string())
}

fn hex(name: &str) -> String {
    name.bytes().map(|byte| format!("{byte:02x}")).collect()
}

/// The database file stem for a storage name: its lowercase hex encoding, so
/// names that differ only in case get their own file on case-insensitive file
/// systems, and no name maps to the legacy storage's stem.
fn file_stem(name: &str) -> String {
    format!("x-{}", hex(name))
}

fn merge(target: &mut Map<String, Json>, source: Map<String, Json>) {
    for (key, incoming) in source {
        match (target.get_mut(&key), incoming) {
            (Some(Json::Object(existing)), Json::Object(incoming)) => merge(existing, incoming),
            (_, incoming) => {
                target.insert(key, incoming);
            }
        }
    }
}

fn merged(old: &str, new: &str) -> String {
    match (
        serde_json::from_str::<Json>(old),
        serde_json::from_str::<Json>(new),
    ) {
        (Ok(Json::Object(mut old)), Ok(Json::Object(new))) => {
            merge(&mut old, new);
            Json::Object(old).to_string()
        }
        _ => new.to_string(),
    }
}

impl AsyncStorage {
    fn database(&self, stem: &str) -> Result<Arc<Database>, ModuleError> {
        let mut databases = self.databases.lock().map_err(storage_error)?;
        if let Some(database) = databases.get(stem) {
            return Ok(database.clone());
        }
        std::fs::create_dir_all(&self.directory).map_err(storage_error)?;
        let path = self.directory.join(format!("{stem}.redb"));
        let database = Arc::new(Database::create(&path).map_err(|error| {
            ModuleError::new(format!("Could not open {}: {error}", path.display()))
        })?);
        databases.insert(stem.to_string(), database.clone());
        Ok(database)
    }

    fn named(&self, name: &str) -> Result<Arc<Database>, ModuleError> {
        self.database(&file_stem(name))
    }

    fn legacy(&self) -> Result<Arc<Database>, ModuleError> {
        self.database(LEGACY_FILE)
    }
}

fn read(database: &Database, keys: &[String]) -> Result<Vec<(String, Option<String>)>, ModuleError> {
    let transaction = database.begin_read().map_err(storage_error)?;
    let table = match transaction.open_table(KV) {
        Ok(table) => Some(table),
        Err(TableError::TableDoesNotExist(_)) => None,
        Err(error) => return Err(storage_error(error)),
    };
    keys.iter()
        .map(|key| {
            let value = match &table {
                Some(table) => table
                    .get(key.as_str())
                    .map_err(storage_error)?
                    .map(|value| value.value().to_string()),
                None => None,
            };
            Ok((key.clone(), value))
        })
        .collect()
}

fn write(
    database: &Database,
    entries: &[(String, Option<String>)],
    merge_json: bool,
) -> Result<(), ModuleError> {
    let transaction = database.begin_write().map_err(storage_error)?;
    {
        let mut table = transaction.open_table(KV).map_err(storage_error)?;
        for (key, value) in entries {
            match value {
                Some(value) => {
                    let next = if merge_json {
                        let current = table
                            .get(key.as_str())
                            .map_err(storage_error)?
                            .map(|current| current.value().to_string());
                        match current {
                            Some(current) => merged(&current, value),
                            None => value.clone(),
                        }
                    } else {
                        value.clone()
                    };
                    table
                        .insert(key.as_str(), next.as_str())
                        .map_err(storage_error)?;
                }
                None => {
                    table.remove(key.as_str()).map_err(storage_error)?;
                }
            }
        }
    }
    transaction.commit().map_err(storage_error)
}

fn remove(database: &Database, keys: &[String]) -> Result<(), ModuleError> {
    let entries: Vec<_> = keys.iter().map(|key| (key.clone(), None)).collect();
    write(database, &entries, false)
}

fn keys(database: &Database) -> Result<Vec<String>, ModuleError> {
    let transaction = database.begin_read().map_err(storage_error)?;
    let table = match transaction.open_table(KV) {
        Ok(table) => table,
        Err(TableError::TableDoesNotExist(_)) => return Ok(Vec::new()),
        Err(error) => return Err(storage_error(error)),
    };
    table
        .iter()
        .map_err(storage_error)?
        .map(|entry| {
            entry
                .map(|(key, _)| key.value().to_string())
                .map_err(storage_error)
        })
        .collect()
}

fn clear(database: &Database) -> Result<(), ModuleError> {
    let transaction = database.begin_write().map_err(storage_error)?;
    transaction.delete_table(KV).map_err(storage_error)?;
    transaction.commit().map_err(storage_error)
}

fn pairs(kv_pairs: Vec<Vec<String>>) -> Result<Vec<(String, Option<String>)>, ModuleError> {
    kv_pairs
        .into_iter()
        .map(|pair| match <[String; 2]>::try_from(pair) {
            Ok([key, value]) => Ok((key, Some(value))),
            Err(_) => Err(ModuleError::new("Each entry must be a [key, value] pair")),
        })
        .collect()
}

impl NativeAsyncStorageSpec for AsyncStorage {
    fn new(_events: NativeAsyncStorageEvents) -> Self {
        Self {
            directory: paths::storage_directory(),
            databases: Mutex::new(HashMap::new()),
        }
    }

    async fn get_values(
        &self,
        db_name: String,
        keys: Vec<String>,
    ) -> Result<Vec<GetValuesResult>, ModuleError> {
        let values = read(self.named(&db_name)?.as_ref(), &keys)?;
        Ok(values
            .into_iter()
            .map(|(key, value)| GetValuesResult { key, value })
            .collect())
    }

    async fn set_values(
        &self,
        db_name: String,
        values: Vec<SetValuesValues>,
    ) -> Result<Vec<SetValuesResult>, ModuleError> {
        let entries: Vec<_> = values
            .iter()
            .map(|entry| (entry.key.clone(), entry.value.clone()))
            .collect();
        write(self.named(&db_name)?.as_ref(), &entries, false)?;
        Ok(values
            .into_iter()
            .map(|entry| SetValuesResult {
                key: entry.key,
                value: entry.value,
            })
            .collect())
    }

    async fn remove_values(&self, db_name: String, keys: Vec<String>) -> Result<(), ModuleError> {
        remove(self.named(&db_name)?.as_ref(), &keys)
    }

    async fn get_keys(&self, db_name: String) -> Result<Vec<String>, ModuleError> {
        keys(self.named(&db_name)?.as_ref())
    }

    async fn clear_storage(&self, db_name: String) -> Result<(), ModuleError> {
        clear(self.named(&db_name)?.as_ref())
    }

    async fn legacy_multi_get(
        &self,
        keys: Vec<String>,
    ) -> Result<Vec<Vec<Option<String>>>, ModuleError> {
        Ok(read(self.legacy()?.as_ref(), &keys)?
            .into_iter()
            .map(|(key, value)| vec![Some(key), value])
            .collect())
    }

    async fn legacy_multi_set(&self, kv_pairs: Vec<Vec<String>>) -> Result<(), ModuleError> {
        write(self.legacy()?.as_ref(), &pairs(kv_pairs)?, false)
    }

    async fn legacy_multi_remove(&self, keys: Vec<String>) -> Result<(), ModuleError> {
        remove(self.legacy()?.as_ref(), &keys)
    }

    async fn legacy_multi_merge(&self, kv_pairs: Vec<Vec<String>>) -> Result<(), ModuleError> {
        write(self.legacy()?.as_ref(), &pairs(kv_pairs)?, true)
    }

    async fn legacy_get_all_keys(&self) -> Result<Vec<String>, ModuleError> {
        keys(self.legacy()?.as_ref())
    }

    async fn legacy_clear(&self) -> Result<(), ModuleError> {
        clear(self.legacy()?.as_ref())
    }
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_async_storage_module::<AsyncStorage>());
}
