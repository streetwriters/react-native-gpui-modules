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
    let keyword = |key: &str| value.get(key).and_then(Value::as_str);
    let percent = |key: &str| {
        keyword(key)
            .and_then(|text| text.strip_suffix('%'))
            .and_then(|text| text.parse::<f32>().ok())
            .map(|value| value / 100.0)
    };
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
    if let Some(r) = number("borderTopLeftRadius") {
        style = style.rounded_tl(px(r as f32));
    }
    if let Some(r) = number("borderTopRightRadius") {
        style = style.rounded_tr(px(r as f32));
    }
    if let Some(r) = number("borderBottomLeftRadius") {
        style = style.rounded_bl(px(r as f32));
    }
    if let Some(r) = number("borderBottomRightRadius") {
        style = style.rounded_br(px(r as f32));
    }
    if let Some(w) = number("borderLeftWidth") {
        style = style.border_l(px(w as f32));
    }
    if let Some(w) = number("borderRightWidth") {
        style = style.border_r(px(w as f32));
    }
    if let Some(w) = number("borderTopWidth") {
        style = style.border_t(px(w as f32));
    }
    if let Some(w) = number("borderBottomWidth") {
        style = style.border_b(px(w as f32));
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
    if let Some(p) = number("paddingTop") {
        style = style.pt(px(p as f32));
    }
    if let Some(p) = number("paddingBottom") {
        style = style.pb(px(p as f32));
    }
    if let Some(p) = number("paddingLeft") {
        style = style.pl(px(p as f32));
    }
    if let Some(p) = number("paddingRight") {
        style = style.pr(px(p as f32));
    }
    if let Some(m) = number("margin") {
        style = style.m(px(m as f32));
    }
    if let Some(m) = number("marginHorizontal") {
        style = style.mx(px(m as f32));
    }
    if let Some(m) = number("marginVertical") {
        style = style.my(px(m as f32));
    }
    if let Some(m) = number("marginTop") {
        style = style.mt(px(m as f32));
    }
    if let Some(m) = number("marginBottom") {
        style = style.mb(px(m as f32));
    }
    if let Some(m) = number("marginLeft") {
        style = style.ml(px(m as f32));
    }
    if let Some(m) = number("marginRight") {
        style = style.mr(px(m as f32));
    }
    if let Some(w) = number("minWidth") {
        style = style.min_w(px(w as f32));
    }
    if let Some(r) = number("aspectRatio") {
        style = style.aspect_ratio(r as f32);
    }
    if let Some(b) = number("flexBasis") {
        style = style.flex_basis(px(b as f32));
    }
    if let Some(b) = percent("flexBasis") {
        style = style.flex_basis(gpui::relative(b));
    }
    if let Some(w) = percent("width") {
        style = style.w(gpui::relative(w));
    }
    if let Some(h) = percent("height") {
        style = style.h(gpui::relative(h));
    }
    if let Some(s) = number("fontSize") {
        style = style.text_size(px(s as f32));
    }
    if let Some(w) = number("fontWeight") {
        style = style.font_weight(gpui::FontWeight(w as f32));
    }
    if let Some(w) = number("width") {
        style = style.w(px(w as f32));
    }
    if let Some(l) = number("lineHeight") {
        style = style.line_height(px(l as f32));
    }
    if let Some(h) = number("minHeight") {
        style = style.min_h(px(h as f32));
    }
    if let Some(w) = number("maxWidth") {
        style = style.max_w(px(w as f32));
    }
    match keyword("flexDirection") {
        Some("row") => style = style.flex_row(),
        Some("column") => style = style.flex_col(),
        _ => {}
    }
    if keyword("flexWrap") == Some("wrap") {
        style = style.flex_wrap();
    }
    if let Some(f) = number("flex") {
        style = style
            .flex_grow(f as f32)
            .flex_shrink(f as f32)
            .flex_basis(gpui::relative(0.));
    }
    if let Some(g) = number("gap") {
        style = style.gap(px(g as f32));
    }
    if let Some(h) = number("height") {
        style = style.h(px(h as f32));
    }
    if let Some(o) = number("opacity") {
        style = style.opacity(o as f32);
    }
    match keyword("alignItems") {
        Some("flex-start") => style = style.items_start(),
        Some("center") => style = style.items_center(),
        Some("flex-end") => style = style.items_end(),
        _ => {}
    }
    match keyword("justifyContent") {
        Some("flex-start") => style = style.justify_start(),
        Some("center") => style = style.justify_center(),
        Some("flex-end") => style = style.justify_end(),
        Some("space-between") => style = style.justify_between(),
        _ => {}
    }
    match keyword("boxShadow") {
        Some("xs") => style = style.shadow_xs(),
        Some("sm") => style = style.shadow_sm(),
        Some("md") => style = style.shadow_md(),
        Some("lg") => style = style.shadow_lg(),
        Some("xl") => style = style.shadow_xl(),
        Some("2xl") => style = style.shadow_2xl(),
        _ => {}
    }
    match keyword("textAlign") {
        Some("left") => style = style.text_left(),
        Some("center") => style = style.text_center(),
        Some("right") => style = style.text_right(),
        _ => {}
    }
    if let Some(family) = keyword("fontFamily") {
        style = style.font_family(family.to_string());
    }
    if keyword("overflowX") == Some("hidden") {
        style = style.overflow_x_hidden();
    }
    Some(style)
}

/// The room a `kitStyle` adds around a measured component's content, and its
/// fixed width if it has one.
pub struct Insets {
    pub horizontal: f32,
    pub vertical: f32,
    pub width: Option<f32>,
    pub font_size: Option<f32>,
    pub line_height: Option<f32>,
}

pub fn insets(json: &str) -> Insets {
    let value: Value = serde_json::from_str(json).unwrap_or(Value::Null);
    let number = |key: &str| value.get(key).and_then(Value::as_f64).map(|v| v as f32);
    let padding = number("padding").unwrap_or(0.0);
    let border = number("borderWidth").unwrap_or(0.0);
    Insets {
        horizontal: 2.0 * (number("paddingHorizontal").unwrap_or(padding) + border),
        vertical: 2.0 * (number("paddingVertical").unwrap_or(padding) + border),
        width: number("width"),
        font_size: number("fontSize"),
        line_height: number("lineHeight"),
    }
}

/// A mask pattern from the `maskPattern` prop: the kit's pattern syntax, or a
/// JSON object `{ "separator": ",", "fraction": 2 }` for a number mask.
pub fn mask_pattern(value: &str) -> gpui_component::input::MaskPattern {
    use gpui_component::input::MaskPattern;
    if value.is_empty() {
        return MaskPattern::None;
    }
    if value.starts_with('{') {
        if let Ok(json) = serde_json::from_str::<Value>(value) {
            return MaskPattern::Number {
                separator: json
                    .get("separator")
                    .and_then(Value::as_str)
                    .and_then(|s| s.chars().next()),
                fraction: json
                    .get("fraction")
                    .and_then(Value::as_u64)
                    .map(|f| f as usize),
            };
        }
    }
    value.into()
}
