use gpui::{AnyElement, App, Hsla, IntoElement, Window};
use gpui_component::theme::ThemeColor;
use gpui_component::{ActiveTheme as _, Theme, ThemeRegistry};
use serde_json::{json, Map, Value};

use crate::*;

pub struct GpuiKitThemeRegistry {
    last: String,
}

fn hex(color: Hsla) -> String {
    let rgb = color.to_rgb();
    let byte = |value: f32| (value * 255.0) as u8;
    if color.a < 1.0 {
        format!(
            "{:02x}{:02x}{:02x}{:02x}",
            byte(rgb.r),
            byte(rgb.g),
            byte(rgb.b),
            byte(color.a)
        )
    } else {
        format!("{:02x}{:02x}{:02x}", byte(rgb.r), byte(rgb.g), byte(rgb.b))
    }
}

/// Every color of `colors` by its key, as `rrggbb[aa]`.
fn color_map(colors: &ThemeColor) -> Map<String, Value> {
    let Ok(Value::Object(map)) = serde_json::to_value(colors) else {
        return Map::new();
    };
    map.into_iter()
        .filter_map(|(key, value)| {
            let color: Hsla = serde_json::from_value(value).ok()?;
            Some((key, Value::from(hex(color))))
        })
        .collect()
}

/// A default theme of the mode with `config` applied, as the theme viewer
/// shows a theme without applying it.
fn resolved(config: &std::rc::Rc<gpui_component::theme::ThemeConfig>) -> ThemeColor {
    let mut theme = if config.mode.is_dark() {
        Theme::from(ThemeColor::dark().as_ref())
    } else {
        Theme::from(ThemeColor::light().as_ref())
    };
    theme.apply_config(config);
    theme.colors
}

fn snapshot(selected: &str, cx: &App) -> String {
    let registry = ThemeRegistry::global(cx);
    let active = cx.theme().theme_name().to_string();
    let themes: Vec<Value> = registry
        .sorted_themes()
        .into_iter()
        .map(|theme| json!({ "name": theme.name.to_string(), "dark": theme.mode.is_dark() }))
        .collect();
    let name = if selected.is_empty() {
        active.clone()
    } else {
        selected.to_string()
    };
    let config = registry.themes().get(name.as_str()).cloned();
    let (colors, explicit, dark) = match &config {
        Some(config) => {
            let explicit: Vec<Value> = match serde_json::to_value(&config.colors) {
                Ok(Value::Object(map)) => map
                    .into_iter()
                    .filter(|(_, value)| !value.is_null())
                    .map(|(key, _)| Value::from(key))
                    .collect(),
                _ => Vec::new(),
            };
            (resolved(config), explicit, config.mode.is_dark())
        }
        None => (**cx.theme(), Vec::new(), cx.theme().mode.is_dark()),
    };
    let base = if dark {
        registry.default_dark_theme()
    } else {
        registry.default_light_theme()
    };
    let isolated = resolved(base);
    json!({
        "themes": themes,
        "active": active,
        "selected": name,
        "colors": color_map(&colors),
        "explicit": explicit,
        "dark": dark,
        "isolated": {
            "border": hex(isolated.border),
            "foreground": hex(isolated.foreground),
            "mutedForeground": hex(isolated.muted_foreground),
        },
    })
    .to_string()
}

impl GpuiKitThemeRegistrySpec for GpuiKitThemeRegistry {
    fn create(_props: &GpuiKitThemeRegistryProps, _cx: &mut GpuiKitThemeRegistryContext) -> Self {
        Self {
            last: String::new(),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitThemeRegistryProps,
        _changed: GpuiKitThemeRegistryChanged,
        _cx: &mut GpuiKitThemeRegistryContext,
    ) {
    }

    fn apply(&mut self, name: String, cx: &mut GpuiKitThemeRegistryContext) {
        cx.with_window(|window, app| {
            let config = ThemeRegistry::global(app)
                .themes()
                .get(name.as_str())
                .cloned();
            if let Some(config) = config {
                Theme::update(app, |theme| theme.apply_config(&config));
                window.refresh();
            }
        });
    }

    fn render(
        &mut self,
        props: &GpuiKitThemeRegistryProps,
        _window: &mut Window,
        cx: &mut GpuiKitThemeRegistryContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        if let Some(app) = cx.app() {
            let json = snapshot(props.selected(), app);
            if self.last != json {
                self.last = json.clone();
                sender.gpui_kit_theme_registry_change(OnGpuiKitThemeRegistryChange { json });
            }
        }
        gpui::div().into_any_element()
    }
}
