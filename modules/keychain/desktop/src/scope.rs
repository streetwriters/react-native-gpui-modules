//! Per-data-folder scoping of credential store names.
//!
//! When `RN_GPUI_APP_DATA_DIR` is set and non-empty, every service/server name the module
//! touches gets a suffix derived from that folder, so copies of an app with separate data
//! folders do not share (or delete) each other's entries. Unset or empty: names are unchanged.
//! Names handed back to JS are always the caller's original ones.

use keyring::Entry;
use std::path::Path;

const DATA_DIR_VAR: &str = "RN_GPUI_APP_DATA_DIR";

/// FNV-1a: stable across runs, platforms and Rust versions (unlike `DefaultHasher`).
fn fnv1a(bytes: &[u8]) -> u64 {
    bytes.iter().fold(0xcbf29ce484222325, |hash, byte| {
        (hash ^ u64::from(*byte)).wrapping_mul(0x100000001b3)
    })
}

fn suffix_for(dir: &str) -> String {
    let path = Path::new(dir);
    let canonical = std::fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf());
    let hash = fnv1a(canonical.to_string_lossy().as_bytes());
    format!("@{:08x}", hash & 0xffff_ffff)
}

/// `name` scoped to `dir`, or `name` itself when `dir` is `None` or empty.
pub fn scope_name(name: &str, dir: Option<&str>) -> String {
    match dir.filter(|dir| !dir.is_empty()) {
        Some(dir) => format!("{name}{}", suffix_for(dir)),
        None => name.to_string(),
    }
}

/// The inverse of [`scope_name`] for names listed from the credential store. Listing is not
/// supported on desktop yet; any listing must pass names through this before returning them.
#[allow(dead_code)]
pub fn unscope_name<'a>(name: &'a str, dir: Option<&str>) -> &'a str {
    match dir.filter(|dir| !dir.is_empty()) {
        Some(dir) => name.strip_suffix(suffix_for(dir).as_str()).unwrap_or(name),
        None => name,
    }
}

fn current_dir() -> Option<String> {
    std::env::var(DATA_DIR_VAR).ok()
}

/// The one place every entry point builds a credential store entry.
pub fn entry(service: &str, account: &str) -> keyring::Result<Entry> {
    Entry::new(&scope_name(service, current_dir().as_deref()), account)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_dir(label: &str) -> String {
        let dir = std::env::temp_dir().join(format!("rn-gpui-scope-{label}-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        dir.to_string_lossy().into_owned()
    }

    #[test]
    fn unset_and_empty_leave_names_untouched() {
        assert_eq!(scope_name("notesnook-desktop:db", None), "notesnook-desktop:db");
        assert_eq!(scope_name("notesnook-desktop:db", Some("")), "notesnook-desktop:db");
    }

    #[test]
    fn a_folder_adds_a_stable_suffix() {
        let dir = temp_dir("a");
        let scoped = scope_name("svc", Some(&dir));
        assert!(scoped.starts_with("svc@") && scoped.len() == "svc@".len() + 8);
        assert_eq!(scoped, scope_name("svc", Some(&dir)));
    }

    #[test]
    fn the_suffix_is_stable_across_releases() {
        assert_eq!(fnv1a(b"/data/a"), fnv1a(b"/data/a"));
        assert_eq!(fnv1a(b""), 0xcbf29ce484222325);
        assert_eq!(fnv1a(b"a"), 0xaf63dc4c8601ec8c);
    }

    #[test]
    fn different_folders_get_different_names() {
        let (one, two) = (temp_dir("one"), temp_dir("two"));
        assert_ne!(scope_name("svc", Some(&one)), scope_name("svc", Some(&two)));
    }

    #[test]
    fn the_same_folder_spelled_differently_matches() {
        let dir = temp_dir("canon");
        let roundabout = format!("{dir}/../{}", Path::new(&dir).file_name().unwrap().to_string_lossy());
        assert_eq!(scope_name("svc", Some(&dir)), scope_name("svc", Some(&roundabout)));
    }

    #[test]
    fn a_scoped_name_round_trips_back_to_the_original() {
        let dir = temp_dir("rt");
        for name in ["svc", "notesnook-desktop:db", "https://example.com"] {
            let scoped = scope_name(name, Some(&dir));
            assert_ne!(scoped, name);
            assert_eq!(unscope_name(&scoped, Some(&dir)), name);
            assert_eq!(unscope_name(name, None), name);
        }
        // A name written by another folder or the unscoped app is left alone.
        let other = scope_name("svc", Some(&temp_dir("rt2")));
        assert_eq!(unscope_name(&other, Some(&dir)), other);
    }

    #[test]
    fn json_returned_to_js_shows_the_original_name() {
        let value = crate::credentials("svc", Some(("u".into(), "p".into())));
        let rn_gpui_module::Value::Object(fields) = value else { panic!() };
        for (key, value) in fields {
            if key == "service" || key == "server" {
                assert!(matches!(value, rn_gpui_module::Value::String(s) if s == "svc"));
            }
        }
    }
}
