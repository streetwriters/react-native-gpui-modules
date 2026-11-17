use gpui::{px, StyleRefinement, Styled as _};
use serde_json::Value;

/// A `StyleRefinement` from the JSON that `kitStyle` writes: colors are ARGB
/// numbers, lengths are points.
pub fn refinement(json: &str) -> Option<StyleRefinement> {
    if json.is_empty() {
        return None;
    }
    let value: Value = serde_json::from_str(json).ok()?;
    let number = |key: &str| value.get(key).and_then(Value::as_f64);
    let color = |key: &str| number(key).map(|c| crate::color::hsla(c as u32));
    let mut style = StyleRefinement::default();
    if let Some(c) = color("backgroundColor") {
        style = style.bg(c);
    }
    if let Some(c) = color("color") {
        style = style.text_color(c);
    }
    if let Some(c) = color("borderColor") {
        style = style.border_color(c);
    }
    if let Some(w) = number("borderWidth") {
        style = style.border(px(w as f32));
    }
    if let Some(r) = number("borderRadius") {
        style = style.rounded(px(r as f32));
    }
    if let Some(p) = number("padding") {
        style = style.p(px(p as f32));
    }
    if let Some(p) = number("paddingHorizontal") {
        style = style.px(px(p as f32));
    }
    if let Some(p) = number("paddingVertical") {
        style = style.py(px(p as f32));
    }
    if let Some(s) = number("fontSize") {
        style = style.text_size(px(s as f32));
    }
    if let Some(w) = number("fontWeight") {
        style = style.font_weight(gpui::FontWeight(w as f32));
    }
    if let Some(o) = number("opacity") {
        style = style.opacity(o as f32);
    }
    Some(style)
}
