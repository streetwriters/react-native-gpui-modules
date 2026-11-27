use std::rc::Rc;

use gpui::{
    div, linear_color_stop, linear_gradient, prelude::*, px, Background, Corners, Hsla,
    SharedString,
};
use gpui_component::chart::{
    AreaChart, BarChart, CandlestickChart, LineChart, PieChart, RadarChart, SankeyChart,
    SankeyLabel,
};
use gpui_component::plot::shape::{BarAlignment, SankeyAlign, SankeyLink, SankeyValueScale};
use gpui_component::{h_flex, v_flex, StyledExt as _, Theme};
use serde_json::{Map, Value};

#[derive(Clone)]
pub struct Row(Rc<Map<String, Value>>);

impl Row {
    pub fn from_map(map: &Map<String, Value>) -> Self {
        Row(Rc::new(map.clone()))
    }

    pub fn s(&self, key: &str) -> SharedString {
        match self.0.get(key) {
            Some(Value::String(s)) => SharedString::from(s.clone()),
            Some(other) => SharedString::from(other.to_string()),
            None => SharedString::default(),
        }
    }

    pub fn n(&self, key: &str) -> f64 {
        self.0.get(key).and_then(Value::as_f64).unwrap_or(0.)
    }
}

fn compact(value: f64) -> String {
    let magnitude = value.abs();
    if magnitude >= 1_000_000. {
        format!("{:.1}M", value / 1_000_000.)
    } else if magnitude >= 10_000. {
        format!("{:.0}K", value / 1_000.)
    } else if magnitude >= 1_000. {
        format!("{:.1}K", value / 1_000.)
    } else {
        format!("{:.0}", value)
    }
}

fn money(value: f64) -> String {
    if value < 0. {
        format!("-${}", compact(-value))
    } else {
        format!("${}", compact(value))
    }
}

fn format_value(name: &str, value: f64) -> String {
    match name {
        "money" => money(value),
        "compact" => compact(value),
        "usd2" => format!("${value:.2}"),
        "score" => format!("{value:.0} / 100"),
        _ => format!("{value}"),
    }
}

fn color(theme: &Theme, value: Option<&Value>) -> Hsla {
    let (name, alpha) = match value {
        Some(Value::Array(pair)) => (
            pair.first().and_then(Value::as_str).unwrap_or(""),
            pair.get(1).and_then(Value::as_f64),
        ),
        Some(Value::String(name)) => (name.as_str(), None),
        _ => ("", None),
    };
    let base = match name {
        "chart_1" => theme.chart_1,
        "chart_2" => theme.chart_2,
        "chart_3" => theme.chart_3,
        "chart_4" => theme.chart_4,
        "chart_5" => theme.chart_5,
        "chart_bullish" => theme.chart_bullish,
        "chart_bearish" => theme.chart_bearish,
        "success" => theme.success,
        "danger" => theme.danger,
        "border" => theme.border,
        "foreground" => theme.foreground,
        "muted_foreground" => theme.muted_foreground,
        "transparent" => gpui::transparent_black(),
        hex => super::rules::color(Some(&Value::String(hex.to_string()))).unwrap_or(theme.chart_1),
    };
    match alpha {
        Some(alpha) => base.alpha(alpha as f32),
        None => base,
    }
}

fn area_gradient(color: Hsla) -> Background {
    linear_gradient(
        0.,
        linear_color_stop(color.opacity(0.45), 1.),
        linear_color_stop(color.opacity(0.), 0.),
    )
}

fn fill(theme: &Theme, spec: Option<&Value>) -> Background {
    match spec {
        Some(Value::Object(map)) => match map.get("gradient") {
            Some(base) => area_gradient(color(theme, Some(base))),
            None => color(theme, map.get("color")).into(),
        },
        other => color(theme, other).into(),
    }
}

fn str_field(spec: &Value, key: &str) -> String {
    spec.get(key)
        .and_then(Value::as_str)
        .unwrap_or_default()
        .to_string()
}

fn flag(spec: &Value, key: &str) -> bool {
    spec.get(key).and_then(Value::as_bool).unwrap_or(false)
}

fn num(spec: &Value, key: &str) -> Option<f64> {
    spec.get(key).and_then(Value::as_f64)
}

fn rows(spec: &Value) -> Vec<Row> {
    spec.get("rows")
        .and_then(Value::as_array)
        .map(|rows| {
            rows.iter()
                .filter_map(Value::as_object)
                .map(|row| Row(Rc::new(row.clone())))
                .collect()
        })
        .unwrap_or_default()
}

fn id_of(spec: &Value) -> SharedString {
    SharedString::from(str_field(spec, "id"))
}

pub fn render(spec: &Value, theme: &Theme) -> gpui::AnyElement {
    match spec.get("kind").and_then(Value::as_str).unwrap_or("") {
        "line" => line(spec, theme),
        "area" => area(spec, theme),
        "bar" => bar(spec, theme),
        "pie" => pie(spec, theme),
        "radar" => radar(spec, theme),
        "candlestick" => candlestick(spec),
        "sankey" => sankey(spec, theme),
        "stacked" => super::stacked_chart::render(spec),
        _ => div().into_any_element(),
    }
}

fn line(spec: &Value, theme: &Theme) -> gpui::AnyElement {
    let (x, y) = (str_field(spec, "x"), str_field(spec, "y"));
    let tooltip = str_field(spec, "tooltipFormat");
    let y_format = str_field(spec, "yFormat");
    let mut chart = LineChart::new(rows(spec))
        .x(move |d: &Row| d.s(&x))
        .y(move |d: &Row| d.n(&y))
        .stroke(color(theme, spec.get("stroke")))
        .name(str_field(spec, "name"));
    match str_field(spec, "mode").as_str() {
        "linear" => chart = chart.linear(),
        "stepAfter" => chart = chart.step_after(),
        _ => {}
    }
    if flag(spec, "dot") {
        chart = chart.dot();
    }
    if flag(spec, "yAxis") {
        chart = chart.y_axis(true);
    }
    if !y_format.is_empty() {
        chart = chart.y_tick_format(move |v| format_value(&y_format, v));
    }
    if let Some(count) = num(spec, "xTickCount") {
        chart = chart.x_tick_count(count as usize);
    }
    if !tooltip.is_empty() {
        chart = chart.tooltip_value(move |_, v| format_value(&tooltip, v).into());
    }
    chart.id(id_of(spec)).into_any_element()
}

fn area(spec: &Value, theme: &Theme) -> gpui::AnyElement {
    let x = str_field(spec, "x");
    let mut chart = AreaChart::new(rows(spec)).x(move |d: &Row| d.s(&x));
    let series = spec
        .get("series")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    for item in &series {
        let y = str_field(item, "y");
        chart = chart
            .y(move |d: &Row| d.n(&y))
            .stroke(color(theme, item.get("stroke")))
            .fill(fill(theme, item.get("fill")))
            .name(str_field(item, "name"));
    }
    if str_field(spec, "mode") == "linear" {
        chart = chart.linear();
    }
    if let Some(margin) = num(spec, "tickMargin") {
        chart = chart.tick_margin(margin as usize);
    }
    if let (Some(low), Some(high)) = (num(spec, "yDomainLow"), num(spec, "yDomainHigh")) {
        chart = chart.y_domain(low, high);
    }
    if let Some(count) = num(spec, "pointCount") {
        chart = chart.point_count(count as usize);
    }
    if let Some(count) = num(spec, "xTickCount") {
        chart = chart.x_tick_count(count as usize);
    }
    if str_field(spec, "tooltip") == "compare" {
        let muted = theme.muted_foreground;
        let up = theme.chart_bullish;
        let down = theme.chart_bearish;
        chart = chart.tooltip_content(move |d: &Row, _, _| {
            let (revenue, last) = (d.n("revenue"), d.n("last_year"));
            let change = if last.abs() < f64::EPSILON {
                0.
            } else {
                (revenue - last) / last.abs() * 100.
            };
            let row = move |label: &'static str, value: String| {
                h_flex()
                    .justify_between()
                    .gap_4()
                    .child(div().text_color(muted).child(label))
                    .child(value)
            };
            v_flex()
                .gap_1()
                .child(div().font_semibold().child(d.s("month")))
                .child(row("2025", money(revenue)))
                .child(row("2024", money(last)))
                .child(
                    row("Change", format!("{change:+.1}%")).text_color(if change >= 0. {
                        up
                    } else {
                        down
                    }),
                )
        });
    }
    chart.id(id_of(spec)).into_any_element()
}

fn bar_shading(color: Hsla, alignment: BarAlignment) -> Background {
    let angle = if alignment.is_horizontal() { 0. } else { 90. };
    linear_gradient(
        angle,
        linear_color_stop(color, 0.),
        linear_color_stop(color.opacity(0.7), 1.),
    )
}

fn bar(spec: &Value, theme: &Theme) -> gpui::AnyElement {
    let (band, value) = (str_field(spec, "band"), str_field(spec, "value"));
    let mut chart = BarChart::new(rows(spec))
        .band(move |d: &Row| d.s(&band))
        .value(move |d: &Row| d.n(&value))
        .name(str_field(spec, "name"));
    let label = str_field(spec, "label");
    if !label.is_empty() {
        let field = str_field(spec, "value");
        chart = chart.label(move |d: &Row| SharedString::from(format_value(&label, d.n(&field))));
    }
    let fill_spec = spec.get("fill").cloned().unwrap_or(Value::Null);
    let base = color(theme, fill_spec.get("color"));
    let (pos, neg) = (
        color(theme, fill_spec.get("pos")),
        color(theme, fill_spec.get("neg")),
    );
    let (from, to) = (
        color(theme, fill_spec.get("from")),
        color(theme, fill_spec.get("to")),
    );
    let key = str_field(&fill_spec, "key");
    let mode = str_field(&fill_spec, "mode");
    let row_theme = theme.clone();
    chart = chart.fill(move |d: &Row, bar, chart, alignment| -> Background {
        match mode.as_str() {
            "rows" => color(&row_theme, d.0.get("color")).into(),
            "sign" => if d.n(&key) >= 0. { pos } else { neg }.into(),
            "shaded" => bar_shading(base, alignment),
            "diagonal" => {
                let w = chart.size.width.max(f32::EPSILON);
                let h = chart.size.height.max(f32::EPSILON);
                let denom = w * w + h * h;
                let project = |x: f32, y: f32| -> f32 { (x * w + (h - y) * h) / denom };
                let lo = project(bar.origin.x, bar.origin.y + bar.size.height);
                let hi = project(bar.origin.x + bar.size.width, bar.origin.y);
                let lerp = |t: f32| Hsla {
                    h: from.h + (to.h - from.h) * t,
                    s: from.s + (to.s - from.s) * t,
                    l: from.l + (to.l - from.l) * t,
                    a: from.a + (to.a - from.a) * t,
                };
                linear_gradient(
                    45.,
                    linear_color_stop(lerp(lo), 0.),
                    linear_color_stop(lerp(hi), 1.),
                )
            }
            _ => base.into(),
        }
    });
    match str_field(spec, "corners").as_str() {
        "tip" => {
            chart = chart.corner_radii(Corners {
                top_left: px(6.),
                top_right: px(6.),
                bottom_left: px(0.),
                bottom_right: px(0.),
            })
        }
        "all" => chart = chart.corner_radii(px(num(spec, "cornerRadius").unwrap_or(6.) as f32)),
        _ => {}
    }
    chart = match str_field(spec, "alignment").as_str() {
        "top" => chart.alignment(BarAlignment::Top),
        "left" => chart.alignment(BarAlignment::Left),
        "right" => chart.alignment(BarAlignment::Right),
        _ => chart,
    };
    if let Some(v) = num(spec, "paddingInner") {
        chart = chart.padding_inner(v as f32);
    }
    if let Some(v) = num(spec, "paddingOuter") {
        chart = chart.padding_outer(v as f32);
    }
    if flag(spec, "valueAxis") {
        chart = chart.value_axis(true);
    }
    if let Some(v) = num(spec, "valueTickCount") {
        chart = chart.value_tick_count(v as usize);
    }
    let tick_format = str_field(spec, "valueTickFormat");
    if !tick_format.is_empty() {
        chart = chart.value_tick_format(move |v| format_value(&tick_format, v));
    }
    if spec.get("gridDashed").and_then(Value::as_bool) == Some(false) {
        chart = chart.grid_dashed(false);
    }
    if let Some(v) = num(spec, "bandTickCount") {
        chart = chart.band_tick_count(v as usize);
    }
    if flag(spec, "signed") {
        let field = str_field(spec, "value");
        let (positive, negative) = (theme.chart_bullish, theme.chart_bearish);
        let label_field = field.clone();
        chart = chart.label_color(move |d: &Row| {
            if d.n(&label_field) >= 0. {
                positive
            } else {
                negative
            }
        });
        chart = chart
            .tooltip_title(|d: &Row| format!("{} 2025", d.s("month")).into())
            .tooltip_value(|_, value| money(value).into())
            .tooltip_value_color(move |_, value| if value >= 0. { positive } else { negative });
    }
    chart.id(id_of(spec)).into_any_element()
}

fn pie(spec: &Value, theme: &Theme) -> gpui::AnyElement {
    let value = str_field(spec, "value");
    let row_theme = theme.clone();
    let mut chart = PieChart::new(rows(spec))
        .value(move |d: &Row| d.n(&value) as f32)
        .outer_radius(num(spec, "outerRadius").unwrap_or(90.) as f32)
        .color(move |d: &Row| color(&row_theme, d.0.get("color")))
        .name(str_field(spec, "name"));
    if let Some(v) = num(spec, "innerRadius") {
        chart = chart.inner_radius(v as f32);
    }
    if let Some(v) = num(spec, "padAngle") {
        chart = chart.pad_angle(v as f32);
    }
    let label = str_field(spec, "label");
    if !label.is_empty() {
        let name = label.clone();
        chart = chart
            .label(move |d: &Row| d.s(&label))
            .tooltip_name(move |d: &Row| d.s(&name));
    }
    chart.id(id_of(spec)).into_any_element()
}

fn radar(spec: &Value, theme: &Theme) -> gpui::AnyElement {
    let label = str_field(spec, "label");
    let mut chart = RadarChart::new(rows(spec));
    if str_field(spec, "labelKind") == "grade" {
        let muted = theme.muted_foreground;
        let accent = theme.chart_2;
        let badge = theme.radius_full();
        let field = str_field(spec, "gradeField");
        chart = chart.label(move |d: &Row| {
            let grade = match d.n(&field) {
                v if v >= 85. => "A",
                v if v >= 70. => "B",
                _ => "C",
            };
            v_flex()
                .items_center()
                .gap_1()
                .child(div().text_xs().text_color(muted).child(d.s("dimension")))
                .child(
                    h_flex()
                        .justify_center()
                        .size_6()
                        .rounded(badge)
                        .bg(accent.opacity(0.1))
                        .text_sm()
                        .font_weight(gpui::FontWeight::SEMIBOLD)
                        .text_color(accent)
                        .child(grade),
                )
                .into_any_element()
        });
    } else {
        chart = chart.label(move |d: &Row| d.s(&label));
    }
    let series = spec
        .get("series")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    for item in &series {
        let value = str_field(item, "value");
        chart = chart
            .value(move |d: &Row| d.n(&value))
            .stroke(color(theme, item.get("stroke")))
            .fill(color(theme, item.get("fill")))
            .name(str_field(item, "name"));
    }
    if let Some(v) = num(spec, "maxValue") {
        chart = chart.max_value(v);
    }
    let tooltip = str_field(spec, "tooltipFormat");
    if !tooltip.is_empty() {
        chart = chart.tooltip_value(move |_, _, v| format_value(&tooltip, v).into());
    }
    if flag(spec, "dot") {
        chart = chart.dot();
    }
    if let Some(v) = num(spec, "outerRadius") {
        chart = chart.outer_radius(v as f32);
    }
    if let Some(v) = num(spec, "gridLevels") {
        chart = chart.grid_levels(v as usize);
    }
    chart.id(id_of(spec)).into_any_element()
}

fn candlestick(spec: &Value) -> gpui::AnyElement {
    let tooltip = str_field(spec, "tooltipFormat");
    CandlestickChart::new(rows(spec))
        .x(|d: &Row| d.s("date"))
        .open(|d: &Row| d.n("open"))
        .high(|d: &Row| d.n("high"))
        .low(|d: &Row| d.n("low"))
        .close(|d: &Row| d.n("close"))
        .body_width_ratio(num(spec, "bodyWidthRatio").unwrap_or(0.8) as f32)
        .tick_margin(num(spec, "tickMargin").unwrap_or(5.) as usize)
        .tooltip_value(move |_, _, v| format_value(&tooltip, v).into())
        .id(id_of(spec))
        .into_any_element()
}

#[derive(Clone)]
struct Node {
    name: SharedString,
    value: f64,
    growth: Option<f64>,
    color: Hsla,
}

fn sankey(spec: &Value, theme: &Theme) -> gpui::AnyElement {
    let list = |key: &str| {
        spec.get(key)
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default()
    };
    let nodes: Vec<Node> = list("nodes")
        .iter()
        .map(|n| Node {
            name: SharedString::from(str_field(n, "name")),
            value: num(n, "value").unwrap_or(0.),
            growth: num(n, "growth"),
            color: color(theme, n.get("color")),
        })
        .collect();
    let links: Vec<SankeyLink> = list("links")
        .iter()
        .map(|l| {
            SankeyLink::new(
                num(l, "source").unwrap_or(0.) as usize,
                num(l, "target").unwrap_or(0.) as usize,
                num(l, "value").unwrap_or(0.),
            )
        })
        .collect();
    let chart = SankeyChart::new(nodes, links)
        .id(id_of(spec))
        .node_align(SankeyAlign::Center)
        .node_padding(40.)
        .value_scale(SankeyValueScale::Sqrt)
        .node_color(|d: &Node| d.color);
    if flag(spec, "detailed") {
        let (up, down, muted) = (theme.success, theme.danger, theme.muted_foreground);
        chart
            .tooltip_name(|d: &Node| d.name.clone())
            .tooltip_value(|d: &Node, _| format!("${:.2}B", d.value / 1_000_000_000.).into())
            .labels(move |d: &Node, _| {
                let mut lines = vec![SankeyLabel::new(format!(
                    "${:.2}B",
                    d.value / 1_000_000_000.
                ))];
                if let Some(growth) = d.growth {
                    let arrow = if growth >= 0. { "▲" } else { "▼" };
                    lines.push(
                        SankeyLabel::new(format!("{} {:+.2}%", arrow, growth))
                            .color(if growth >= 0. { up } else { down }),
                    );
                }
                lines.push(SankeyLabel::new(d.name.clone()).color(muted));
                lines
            })
            .into_any_element()
    } else {
        chart
            .node_label(|d| d.name.clone())
            .value_label(|d, _| format!("${:.2}B", d.value / 1_000_000_000.).into())
            .into_any_element()
    }
}
