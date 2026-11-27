use std::rc::Rc;

use gpui::{px, Hsla, IntoElement as _};
use gpui_base::input::EditorScrollbarRenderer;
use gpui_base::{Scrollbar, ScrollbarMode};
use serde_json::Value;

/// A color from a style object: an ARGB number from `processColor`, or `#rgb`,
/// `#rrggbb` or `#rrggbbaa`.
pub fn color(value: Option<&Value>) -> Option<Hsla> {
    match value? {
        Value::Number(n) => n.as_u64().map(|argb| crate::color::hsla(argb as u32)),
        Value::String(s) => {
            let hex = s.strip_prefix('#')?;
            let expand = |c: char| format!("{c}{c}");
            let full = match hex.len() {
                3 => hex.chars().map(expand).collect::<String>() + "ff",
                6 => format!("{hex}ff"),
                8 => hex.to_string(),
                _ => return None,
            };
            let rgba = u32::from_str_radix(&full, 16).ok()?;
            Some(crate::color::hsla(rgba.rotate_right(8)))
        }
        _ => None,
    }
}

fn number(rules: &Value, key: &str) -> Option<f64> {
    rules.get(key).and_then(Value::as_f64)
}

/// Declarative rules checked on every edit: `required`, `minLength`,
/// `maxLength`, `pattern`, `min` and `max`. Returns the message of the first
/// rule the text breaks.
pub struct Rules {
    required: bool,
    min_length: Option<usize>,
    max_length: Option<usize>,
    pattern: Option<regex::Regex>,
    min: Option<f64>,
    max: Option<f64>,
    message: String,
}

impl Rules {
    pub fn parse(json: &str) -> Option<Self> {
        let rules: Value = serde_json::from_str(json).ok()?;
        Some(Self {
            required: rules
                .get("required")
                .and_then(Value::as_bool)
                .unwrap_or(false),
            min_length: number(&rules, "minLength").map(|n| n.max(0.0) as usize),
            max_length: number(&rules, "maxLength").map(|n| n.max(0.0) as usize),
            pattern: rules
                .get("pattern")
                .and_then(Value::as_str)
                .and_then(|p| regex::Regex::new(p).ok()),
            min: number(&rules, "min"),
            max: number(&rules, "max"),
            message: rules
                .get("message")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
        })
    }

    pub fn check(&self, text: &str) -> Result<(), String> {
        let fail = |rule: &str| {
            Err(if self.message.is_empty() {
                rule.to_string()
            } else {
                self.message.clone()
            })
        };
        let length = text.chars().count();
        if self.required && text.trim().is_empty() {
            return fail("required");
        }
        if self.max_length.is_some_and(|max| length > max) {
            return fail("maxLength");
        }
        if !text.is_empty() {
            if self.min_length.is_some_and(|min| length < min) {
                return fail("minLength");
            }
            if self.pattern.as_ref().is_some_and(|p| !p.is_match(text)) {
                return fail("pattern");
            }
            if self.min.is_some() || self.max.is_some() {
                let Ok(value) = text.trim().parse::<f64>() else {
                    return fail("number");
                };
                if self.min.is_some_and(|min| value < min) {
                    return fail("min");
                }
                if self.max.is_some_and(|max| value > max) {
                    return fail("max");
                }
            }
        }
        Ok(())
    }
}

/// The closure for `set_validator`: an edit that breaks the rules is rejected
/// and reported to `fail` with the text it would have produced.
pub fn validator(
    json: &str,
    fail: impl Fn(String, String) + 'static,
) -> impl Fn(&str, &mut gpui::App) -> bool + 'static {
    let rules = Rules::parse(json);
    move |text, _| match rules.as_ref().map(|rules| rules.check(text)) {
        Some(Err(message)) => {
            fail(text.to_string(), message);
            false
        }
        _ => true,
    }
}

/// A scrollbar drawn by the kit's `Scrollbar` with colors, width, radius and
/// visibility from a style object; `None` keeps the default scrollbar.
pub fn scrollbar(json: &str) -> Option<EditorScrollbarRenderer> {
    let style: Value = serde_json::from_str(json).ok()?;
    let thumb = color(style.get("thumbColor"));
    let track = color(style.get("trackColor"));
    let width = number(&style, "width").map(|w| px(w as f32));
    let radius = number(&style, "radius").map(|r| px(r as f32));
    let mode = match style.get("autoHide").and_then(Value::as_bool) {
        Some(false) => ScrollbarMode::Always,
        _ => ScrollbarMode::Scrolling,
    };
    Some(Rc::new(move |context, _, _| {
        Scrollbar::new(&context)
            .axis(context.axis())
            .mode(mode)
            .styles(|styles| {
                styles
                    .track(|mut t| {
                        if let Some(c) = track {
                            t = t.bg(c);
                        }
                        if let Some(w) = width {
                            t = t.width(w);
                        }
                        t
                    })
                    .thumb(|mut t| {
                        if let Some(c) = thumb {
                            t = t.bg(c);
                        }
                        if let Some(w) = width {
                            t = t.width(w);
                        }
                        if let Some(r) = radius {
                            t = t.radius(r);
                        }
                        t
                    })
            })
            .into_any_element()
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rules_reject_by_first_broken_rule() {
        let rules = Rules::parse(r#"{"maxLength":3,"pattern":"^[a-z]*$"}"#).unwrap();
        assert!(rules.check("abc").is_ok());
        assert_eq!(rules.check("abcd"), Err("maxLength".into()));
        assert_eq!(rules.check("ab1"), Err("pattern".into()));
        let numeric = Rules::parse(r#"{"min":1,"max":10,"message":"1 to 10"}"#).unwrap();
        assert!(numeric.check("5").is_ok());
        assert!(numeric.check("").is_ok());
        assert_eq!(numeric.check("11"), Err("1 to 10".into()));
    }

    #[test]
    fn colors_parse_from_numbers_and_hex() {
        let red = color(Some(&Value::String("#ff0000".into()))).unwrap();
        assert!((red.s - 1.0).abs() < 1e-3 && red.a == 1.0);
        let half = color(Some(&serde_json::json!(0x80ff0000u32))).unwrap();
        assert!((half.a - 128.0 / 255.0).abs() < 1e-3);
    }
}
