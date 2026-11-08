use std::collections::HashMap;

const IMAGE: &[&str] = &[
    "png", "jpg", "jpeg", "gif", "webp", "bmp", "tif", "tiff", "heic", "heif", "avif", "svg", "ico",
];
const AUDIO: &[&str] = &["mp3", "m4a", "wav", "aac", "flac", "ogg", "opus", "aiff", "caf"];
const VIDEO: &[&str] = &["mp4", "m4v", "mov", "avi", "mkv", "webm", "mpg", "mpeg"];
const TEXT: &[&str] = &["txt", "text", "md", "log"];

const UTI_TABLE: &[(&str, &str, &[&str])] = &[
    ("public.image", "image/*", IMAGE),
    ("public.audio", "audio/*", AUDIO),
    ("public.movie", "video/*", VIDEO),
    ("public.video", "video/*", VIDEO),
    ("public.plain-text", "text/plain", TEXT),
    ("public.text", "text/plain", TEXT),
    ("public.json", "application/json", &["json"]),
    ("public.comma-separated-values-text", "text/csv", &["csv"]),
    ("public.zip-archive", "application/zip", &["zip"]),
    ("com.adobe.pdf", "application/pdf", &["pdf"]),
    ("com.microsoft.word.doc", "application/msword", &["doc"]),
    (
        "org.openxmlformats.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        &["docx"],
    ),
    ("com.microsoft.powerpoint.ppt", "application/vnd.ms-powerpoint", &["ppt"]),
    (
        "org.openxmlformats.presentationml.presentation",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        &["pptx"],
    ),
    ("com.microsoft.excel.xls", "application/vnd.ms-excel", &["xls"]),
    (
        "org.openxmlformats.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        &["xlsx"],
    ),
];

pub enum Selection {
    Any,
    Extensions(Vec<String>),
}

pub fn is_any(kind: &str) -> bool {
    matches!(kind, "*/*" | "public.item" | "public.data" | "public.content")
}

fn wildcard(mime: &str) -> Option<&'static [&'static str]> {
    match mime {
        "image/*" => Some(IMAGE),
        "audio/*" => Some(AUDIO),
        "video/*" => Some(VIDEO),
        "text/*" => Some(TEXT),
        _ => None,
    }
}

fn extensions_for(kind: &str) -> Vec<String> {
    let kind = kind.trim();
    if let Some((_, _, extensions)) = UTI_TABLE.iter().find(|(uti, _, _)| *uti == kind) {
        return extensions.iter().map(|e| e.to_string()).collect();
    }
    if let Some(extensions) = wildcard(kind) {
        return extensions.iter().map(|e| e.to_string()).collect();
    }
    if kind.contains('/') {
        return mime_guess::get_mime_extensions_str(kind)
            .map(|list| list.iter().map(|e| e.to_string()).collect())
            .unwrap_or_default();
    }
    if let Some(extension) = kind.strip_prefix('.') {
        return vec![extension.to_ascii_lowercase()];
    }
    Vec::new()
}

pub fn selection(types: &[String]) -> Selection {
    if types.is_empty() || types.iter().any(|kind| is_any(kind.trim())) {
        return Selection::Any;
    }
    let mut extensions: Vec<String> = Vec::new();
    for kind in types {
        for extension in extensions_for(kind) {
            if !extensions.contains(&extension) {
                extensions.push(extension);
            }
        }
    }
    if extensions.is_empty() {
        Selection::Any
    } else {
        Selection::Extensions(extensions)
    }
}

pub struct Known {
    pub is_known: bool,
    pub extension: Option<String>,
    pub mime: Option<String>,
    pub uti: Option<String>,
}

pub fn known(kind: &str, value: &str) -> Known {
    let uti_by_mime: HashMap<&str, &str> = UTI_TABLE.iter().map(|(u, m, _)| (*m, *u)).collect();
    let mut found = Known { is_known: false, extension: None, mime: None, uti: None };
    match kind {
        "UTType" => {
            if let Some((uti, mime, extensions)) = UTI_TABLE.iter().find(|(u, _, _)| *u == value) {
                found = Known {
                    is_known: true,
                    extension: extensions.first().map(|e| e.to_string()),
                    mime: Some(mime.to_string()),
                    uti: Some(uti.to_string()),
                };
            }
        }
        "mimeType" => {
            let extension = mime_guess::get_mime_extensions_str(value)
                .and_then(|list| list.first())
                .map(|e| e.to_string());
            if extension.is_some() || uti_by_mime.contains_key(value) {
                found = Known {
                    is_known: true,
                    extension,
                    mime: Some(value.to_string()),
                    uti: uti_by_mime.get(value).map(|u| u.to_string()),
                };
            }
        }
        "extension" => {
            let extension = value.trim_start_matches('.').to_ascii_lowercase();
            if let Some(mime) = mime_guess::from_ext(&extension).first() {
                let mime = mime.essence_str().to_string();
                found = Known {
                    is_known: true,
                    uti: uti_by_mime.get(mime.as_str()).map(|u| u.to_string()),
                    mime: Some(mime),
                    extension: Some(extension),
                };
            }
        }
        _ => {}
    }
    found
}
