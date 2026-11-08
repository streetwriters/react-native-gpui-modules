rn_gpui_module::include_specs!();

mod types;

use std::fs;
use std::path::{Path, PathBuf};

use rn_gpui_module::ModuleError;
use types::Selection;

const CANCELED: &str = "OPERATION_CANCELED";

pub struct DocumentPicker;

fn canceled() -> ModuleError {
    ModuleError::with_code(CANCELED, "user canceled the document picker")
}

fn failure(message: impl ToString) -> ModuleError {
    ModuleError::with_code("E_DOCUMENT_PICKER", message.to_string())
}

fn path_from_uri(uri: &str) -> PathBuf {
    match url::Url::parse(uri) {
        Ok(parsed) if parsed.scheme() == "file" => {
            parsed.to_file_path().unwrap_or_else(|_| PathBuf::from(uri))
        }
        _ => PathBuf::from(uri),
    }
}

fn uri_from_path(path: &Path) -> String {
    url::Url::from_file_path(path)
        .map(String::from)
        .unwrap_or_else(|_| path.to_string_lossy().into_owned())
}

fn file_name(path: &Path) -> Option<String> {
    path.file_name().map(|name| name.to_string_lossy().into_owned())
}

fn safe_name(name: &str) -> String {
    let base = Path::new(name)
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_default();
    if base.is_empty() {
        "file".to_string()
    } else {
        base
    }
}

fn app_directory(base: Option<PathBuf>) -> PathBuf {
    let id = std::env::var("RN_GPUI_APP_ID").ok().filter(|id| !id.is_empty()).or_else(|| {
        std::env::current_exe()
            .ok()
            .and_then(|exe| exe.file_stem().map(|s| s.to_string_lossy().into_owned()))
    });
    let base = base.unwrap_or_else(std::env::temp_dir);
    base.join(id.unwrap_or_else(|| "app".to_string()))
}

fn describe(path: &Path) -> PickedDocument {
    let metadata = fs::metadata(path);
    let mime = mime_guess::from_path(path).first().map(|m| m.essence_str().to_string());
    let uti = mime.as_deref().and_then(|m| types::known("mimeType", m).uti);
    PickedDocument {
        uri: uri_from_path(path),
        name: file_name(path),
        error: metadata.as_ref().err().map(|e| e.to_string()),
        r#type: mime,
        native_type: uti,
        size: metadata.ok().map(|m| m.len() as f64),
        is_virtual: Some(false),
        convertible_to_mime_types: None,
    }
}

fn dialog(selection: Option<&Selection>) -> rfd::FileDialog {
    let mut dialog = rfd::FileDialog::new();
    if let Some(Selection::Extensions(extensions)) = selection {
        dialog = dialog.add_filter("Files", extensions);
    }
    dialog
}

fn copy_file(from: &Path, to: &Path) -> std::io::Result<()> {
    fs::copy(from, to).map(|_| ())
}

fn move_file(from: &Path, to: &Path) -> std::io::Result<()> {
    if fs::rename(from, to).is_ok() {
        return Ok(());
    }
    copy_file(from, to)?;
    fs::remove_file(from)
}

impl NativeDocumentPickerSpec for DocumentPicker {
    fn new(_events: NativeDocumentPickerEvents) -> Self {
        Self
    }

    async fn pick(&self, options: PickOptions) -> Result<Vec<PickedDocument>, ModuleError> {
        let selection = types::selection(options.r#type.as_deref().unwrap_or_default());
        let dialog = dialog(Some(&selection));
        let paths = if options.allow_multi_selection.unwrap_or(false) {
            dialog.pick_files().unwrap_or_default()
        } else {
            dialog.pick_file().into_iter().collect()
        };
        if paths.is_empty() {
            return Err(canceled());
        }
        Ok(paths.iter().map(|path| describe(path)).collect())
    }

    async fn pick_directory(&self, _options: PickOptions) -> Result<DirectoryResult, ModuleError> {
        rfd::FileDialog::new()
            .pick_folder()
            .map(|path| DirectoryResult { uri: uri_from_path(&path) })
            .ok_or_else(canceled)
    }

    async fn write_documents(
        &self,
        options: WriteDocumentsOptions,
    ) -> Result<Vec<WrittenDocument>, ModuleError> {
        let sources: Vec<PathBuf> = options.source_uris.iter().map(|u| path_from_uri(u)).collect();
        if sources.is_empty() {
            return Err(failure("sourceUris is empty"));
        }
        let copy = options.copy.unwrap_or(false);
        let transfer = |from: &Path, to: &Path| {
            if copy {
                copy_file(from, to)
            } else {
                move_file(from, to)
            }
        };

        let targets: Vec<(PathBuf, PathBuf)> = if sources.len() == 1 {
            let name = options
                .file_name
                .as_deref()
                .map(safe_name)
                .or_else(|| file_name(&sources[0]))
                .unwrap_or_else(|| "file".to_string());
            let mut dialog = rfd::FileDialog::new().set_file_name(name);
            if let Some(extension) = sources[0].extension() {
                let extension = extension.to_string_lossy().into_owned();
                dialog = dialog.add_filter(extension.clone(), &[extension]);
            }
            let target = dialog.save_file().ok_or_else(canceled)?;
            vec![(sources[0].clone(), target)]
        } else {
            let directory = rfd::FileDialog::new().pick_folder().ok_or_else(canceled)?;
            sources
                .iter()
                .map(|source| {
                    let name = file_name(source).unwrap_or_else(|| "file".to_string());
                    (source.clone(), directory.join(name))
                })
                .collect()
        };

        Ok(targets
            .into_iter()
            .map(|(from, to)| match transfer(&from, &to) {
                Ok(()) => WrittenDocument {
                    uri: uri_from_path(&to),
                    name: file_name(&to),
                    error: None,
                },
                Err(error) => WrittenDocument {
                    uri: uri_from_path(&to),
                    name: file_name(&to),
                    error: Some(error.to_string()),
                },
            })
            .collect())
    }

    async fn keep_local_copy(
        &self,
        options: KeepLocalCopyOptions,
    ) -> Result<Vec<LocalCopyResult>, ModuleError> {
        let base = match options.destination.as_str() {
            "documentDirectory" => app_directory(dirs::data_dir()),
            _ => app_directory(dirs::cache_dir()),
        };
        Ok(options
            .files
            .into_iter()
            .map(|file| {
                let source = path_from_uri(&file.uri);
                let directory = base.join(uuid::Uuid::new_v4().to_string());
                let target = directory.join(safe_name(&file.file_name));
                let result = fs::create_dir_all(&directory).and_then(|_| copy_file(&source, &target));
                match result {
                    Ok(()) => LocalCopyResult {
                        status: "success".to_string(),
                        source_uri: file.uri,
                        local_uri: Some(uri_from_path(&target)),
                        copy_error: None,
                    },
                    Err(error) => LocalCopyResult {
                        status: "error".to_string(),
                        source_uri: file.uri,
                        local_uri: None,
                        copy_error: Some(error.to_string()),
                    },
                }
            })
            .collect())
    }

    fn is_known_type(&self, kind: String, value: String) -> Result<KnownType, ModuleError> {
        let known = types::known(&kind, &value);
        Ok(KnownType {
            is_known: known.is_known,
            preferred_filename_extension: known.extension,
            mime_type: known.mime,
            ut_type: known.uti,
        })
    }

    async fn release_secure_access(&self, _uris: Vec<String>) -> Result<(), ModuleError> {
        Ok(())
    }

    async fn release_long_term_access(
        &self,
        uris: Vec<String>,
    ) -> Result<Vec<ReleaseResult>, ModuleError> {
        Ok(uris
            .into_iter()
            .map(|uri| ReleaseResult { uri, status: "success".to_string() })
            .collect())
    }
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_document_picker_module::<DocumentPicker>());
}
