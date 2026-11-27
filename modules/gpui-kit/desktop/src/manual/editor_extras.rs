//! Decorations and completions of the code editor, read from JSON props.

use std::ops::Range;
use std::rc::Rc;

use gpui::{App, FontStyle, FontWeight, HighlightStyle, Hsla, Task, UnderlineStyle, Window};
use gpui_base::input::{
    highlight_characters, highlight_contains, highlight_prefix, CompletionHighlighter,
    CompletionProvider, GutterDecoration, OverviewRulerDecoration, OverviewRulerLane,
    RangeDecoration, RangeDecorationStyle, TextDecoration,
};
use gpui_component::ActiveTheme as _;
use gpui_component::Rope;
use serde_json::Value;

/// A color: a number or `#hex` string, or `{ token, opacity }` naming a theme
/// color (`warning`, `status.created` and so on).
pub fn color(value: Option<&Value>, cx: &App) -> Option<Hsla> {
    let value = value?;
    let Some(token) = value.get("token").and_then(Value::as_str) else {
        return crate::manual::rules::color(Some(value));
    };
    let theme = cx.theme();
    let status = &theme.highlight_theme.style.status;
    let base = match token {
        "foreground" => theme.foreground,
        "muted-foreground" => theme.muted_foreground,
        "primary" => theme.primary,
        "border" => theme.border,
        "success" => theme.success,
        "warning" => theme.warning,
        "danger" => theme.danger,
        "info" => theme.info,
        "status.created" => status.created(cx),
        "status.modified" => status.modified(cx),
        "status.deleted" => status.deleted(cx),
        "status.error" => status.error(cx),
        "status.warning" => status.warning(cx),
        "status.info" => status.info(cx),
        "status.hint" => status.hint(cx),
        _ => return None,
    };
    Some(match value.get("opacity").and_then(Value::as_f64) {
        Some(opacity) => base.opacity(opacity as f32),
        None => base,
    })
}

fn items(json: &str) -> Vec<Value> {
    serde_json::from_str(json).unwrap_or_default()
}

fn range(item: &Value) -> Range<usize> {
    let at = |key| item.get(key).and_then(Value::as_u64).unwrap_or(0) as usize;
    at("start")..at("end")
}

pub fn text_decorations(json: &str, cx: &App) -> Vec<TextDecoration> {
    items(json)
        .iter()
        .map(|item| {
            let underline = item.get("underline").map(|underline| UnderlineStyle {
                color: color(underline.get("color"), cx),
                thickness: gpui::px(
                    underline
                        .get("thickness")
                        .and_then(Value::as_f64)
                        .unwrap_or(1.0) as f32,
                ),
                wavy: underline
                    .get("wavy")
                    .and_then(Value::as_bool)
                    .unwrap_or(false),
            });
            TextDecoration::new(
                range(item),
                HighlightStyle {
                    color: color(item.get("color"), cx),
                    background_color: color(item.get("backgroundColor"), cx),
                    font_weight: item
                        .get("bold")
                        .and_then(Value::as_bool)
                        .filter(|bold| *bold)
                        .map(|_| FontWeight::BOLD),
                    font_style: item
                        .get("italic")
                        .and_then(Value::as_bool)
                        .filter(|italic| *italic)
                        .map(|_| FontStyle::Italic),
                    underline,
                    ..Default::default()
                },
            )
        })
        .collect()
}

pub fn range_decorations(json: &str, cx: &App) -> Vec<RangeDecoration> {
    items(json)
        .iter()
        .map(|item| {
            let mut decoration = RangeDecoration::new(range(item));
            if item.get("style").and_then(Value::as_str) == Some("fill") {
                decoration = decoration.with_style(RangeDecorationStyle::Fill);
            }
            if let Some(color) = color(item.get("color"), cx) {
                decoration = decoration.with_color(color);
            }
            decoration
        })
        .collect()
}

pub fn gutter_decorations(json: &str, cx: &App) -> Vec<GutterDecoration> {
    items(json)
        .iter()
        .map(|item| {
            let mut decoration = GutterDecoration::new(range(item));
            if let Some(color) = color(item.get("color"), cx) {
                decoration = decoration.with_color(color);
            }
            if let Some(color) = color(item.get("foldedColor"), cx) {
                decoration = decoration.with_folded_color(color);
            }
            decoration
        })
        .collect()
}

pub fn overview_ruler_decorations(json: &str, cx: &App) -> Vec<OverviewRulerDecoration> {
    items(json)
        .iter()
        .map(|item| {
            let lane = match item.get("lane").and_then(Value::as_str) {
                Some("left") => OverviewRulerLane::Left,
                Some("center") => OverviewRulerLane::Center,
                Some("right") => OverviewRulerLane::Right,
                _ => OverviewRulerLane::default(),
            };
            let mut decoration = OverviewRulerDecoration::new(range(item)).with_lane(lane);
            if let Some(color) = color(item.get("color"), cx) {
                decoration = decoration.with_color(color);
            }
            decoration
        })
        .collect()
}

/// How a query picks and marks completion items.
#[derive(Clone, Copy, PartialEq)]
pub enum Match {
    Prefix,
    Contains,
    Characters,
}

impl Match {
    pub fn highlighter(self) -> Rc<CompletionHighlighter> {
        match self {
            Self::Prefix => Rc::new(highlight_prefix),
            Self::Contains => Rc::new(highlight_contains),
            Self::Characters => Rc::new(highlight_characters),
        }
    }

    fn keeps(self, query: &str, label: &str) -> bool {
        if query.is_empty() {
            return true;
        }
        let item = item(label);
        match self {
            Self::Prefix => label.to_lowercase().starts_with(&query.to_lowercase()),
            Self::Contains => !highlight_contains(query, &item).is_empty(),
            Self::Characters => !highlight_characters(query, &item).is_empty(),
        }
    }
}

fn item(label: &str) -> lsp_types::CompletionItem {
    lsp_types::CompletionItem {
        label: label.to_string(),
        ..Default::default()
    }
}

/// The completions the props give, as JSON: their words and how a query
/// matches them.
pub fn completions(json: &str) -> Option<(Vec<String>, Match)> {
    let value: Value = serde_json::from_str(json).ok()?;
    let words = value
        .get("items")?
        .as_array()?
        .iter()
        .filter_map(Value::as_str)
        .map(str::to_string)
        .collect();
    let mode = match value.get("match").and_then(Value::as_str) {
        Some("contains") => Match::Contains,
        Some("characters") => Match::Characters,
        _ => Match::Prefix,
    };
    Some((words, mode))
}

/// Offers fixed words, kept and marked by the query as the match mode says.
pub struct WordCompletions {
    pub words: Vec<String>,
    pub mode: Match,
}

impl CompletionProvider for WordCompletions {
    fn completions(
        &self,
        _text: &Rope,
        _offset: usize,
        trigger: lsp_types::CompletionContext,
        _window: &mut Window,
        _cx: &mut App,
    ) -> Task<anyhow::Result<lsp_types::CompletionResponse>> {
        let query = trigger.trigger_character.unwrap_or_default();
        let items = self
            .words
            .iter()
            .filter(|word| self.mode.keeps(&query, word))
            .map(|word| item(word))
            .collect();
        Task::ready(Ok(lsp_types::CompletionResponse::Array(items)))
    }

    fn is_completion_trigger(&self, _offset: usize, _new_text: &str, _cx: &mut App) -> bool {
        true
    }
}
