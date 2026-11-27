use gpui::{AnyElement, IntoElement, SharedString, Window};
use gpui_component::chart::{
    AreaChart, BarChart, CandlestickChart, LineChart, PieChart, RadarChart, SankeyChart,
};
use gpui_component::plot::shape::SankeyLink;

use crate::*;

pub struct GpuiKitChart;

#[derive(Clone)]
struct Point {
    label: SharedString,
    value: f64,
    open: f64,
    high: f64,
    low: f64,
    close: f64,
}

impl GpuiKitChartSpec for GpuiKitChart {
    fn create(_props: &GpuiKitChartProps, _cx: &mut GpuiKitChartContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitChartProps,
        _changed: GpuiKitChartChanged,
        _cx: &mut GpuiKitChartContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitChartProps,
        _window: &mut Window,
        cx: &mut GpuiKitChartContext,
    ) -> AnyElement {
        if !props.spec_json().is_empty() {
            let spec = serde_json::from_str(props.spec_json()).unwrap_or_default();
            if let Some(app) = cx.app() {
                return super::chart_spec::render(&spec, gpui_component::ActiveTheme::theme(&*app));
            }
        }
        let data = props.data();
        let points: Vec<Point> = (0..data.len())
            .filter_map(|index| data.get(index))
            .map(|item| Point {
                label: SharedString::from(item.label().to_string()),
                value: item.value(),
                open: item.open(),
                high: item.high(),
                low: item.low(),
                close: item.close(),
            })
            .collect();
        let color = (props.color() != 0).then(|| crate::color::hsla(props.color() as u32));
        match props.kind() {
            GpuiKitChartKind::Bar => {
                let mut chart = BarChart::new(points)
                    .band(|point: &Point| point.label.clone())
                    .value(|point: &Point| point.value)
                    .grid(props.grid())
                    .label_axis(props.x_axis())
                    .value_axis(props.y_axis());
                if let Some(color) = color {
                    chart = chart.fill(move |_: &Point, _, _, _| color);
                }
                chart.into_any_element()
            }
            GpuiKitChartKind::Area => {
                let mut chart = AreaChart::new(points)
                    .x(|point: &Point| point.label.clone())
                    .y(|point: &Point| point.value)
                    .grid(props.grid())
                    .x_axis(props.x_axis())
                    .y_axis(props.y_axis());
                if let Some(color) = color {
                    chart = chart.stroke(color).fill(color.opacity(0.25));
                }
                if props.smooth() {
                    chart = chart.natural();
                } else {
                    chart = chart.linear();
                }
                chart.into_any_element()
            }
            GpuiKitChartKind::Pie => {
                let mut chart = PieChart::new(points)
                    .value(|point: &Point| point.value as f32)
                    .label(|point: &Point| point.label.clone());
                if props.inner_radius() > 0.0 {
                    chart = chart.inner_radius(props.inner_radius() as f32);
                }
                if props.outer_radius() > 0.0 {
                    chart = chart.outer_radius(props.outer_radius() as f32);
                }
                chart.into_any_element()
            }
            GpuiKitChartKind::Candlestick => CandlestickChart::new(points)
                .x(|point: &Point| point.label.clone())
                .open(|point: &Point| point.open)
                .high(|point: &Point| point.high)
                .low(|point: &Point| point.low)
                .close(|point: &Point| point.close)
                .into_any_element(),
            GpuiKitChartKind::Radar => {
                let mut chart = RadarChart::new(points)
                    .value(|point: &Point| point.value)
                    .label(|point: &Point| point.label.to_string());
                if let Some(color) = color {
                    chart = chart.stroke(color).fill(color.opacity(0.25));
                }
                if props.dots() {
                    chart = chart.dot();
                }
                chart.into_any_element()
            }
            GpuiKitChartKind::Sankey => {
                let nodes = props.nodes();
                let names: Vec<SharedString> = (0..nodes.len())
                    .filter_map(|index| nodes.get(index))
                    .map(|name| SharedString::from(name.to_string()))
                    .collect();
                let links = props.links();
                let links: Vec<SankeyLink> = (0..links.len())
                    .filter_map(|index| links.get(index))
                    .map(|link| {
                        SankeyLink::new(link.source as usize, link.target as usize, link.value)
                    })
                    .collect();
                SankeyChart::new(names, links)
                    .node_label(|name: &SharedString| name.clone())
                    .into_any_element()
            }
            GpuiKitChartKind::Unset | GpuiKitChartKind::Line => {
                let mut chart = LineChart::new(points)
                    .x(|point: &Point| point.label.clone())
                    .y(|point: &Point| point.value)
                    .grid(props.grid())
                    .x_axis(props.x_axis())
                    .y_axis(props.y_axis());
                if let Some(color) = color {
                    chart = chart.stroke(color);
                }
                if props.dots() {
                    chart = chart.dot();
                }
                if props.smooth() {
                    chart = chart.natural();
                } else {
                    chart = chart.linear();
                }
                chart.into_any_element()
            }
        }
    }
}
