use std::rc::Rc;

use gpui::{
    canvas, px, AnyElement, Bounds, Hsla, IntoElement, Pixels, SharedString, Styled as _, Window,
};
use gpui_component::plot::scale::{Scale, ScaleBand, ScaleLinear, ScalePoint};
use gpui_component::plot::shape::{
    sankey_link_path, Arc, Area, Bar, Line, Pie, RadialLine, Sankey, SankeyLink,
};
use gpui_component::plot::{AxisText, Curve, Grid, PlotAxis};
use gpui_component::ActiveTheme as _;

use crate::*;

const AXIS_GAP: f32 = 24.0;

pub struct GpuiKitPlot;

struct Layer {
    kind: String,
    color: Option<Hsla>,
    width: f32,
}

impl GpuiKitPlotSpec for GpuiKitPlot {
    fn create(_props: &GpuiKitPlotProps, _cx: &mut GpuiKitPlotContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitPlotProps,
        _changed: GpuiKitPlotChanged,
        _cx: &mut GpuiKitPlotContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitPlotProps,
        _window: &mut Window,
        _cx: &mut GpuiKitPlotContext,
    ) -> AnyElement {
        let data = props.data();
        let points: Rc<Vec<(SharedString, f64)>> = Rc::new(
            (0..data.len())
                .filter_map(|index| data.get(index))
                .map(|item| (SharedString::from(item.label().to_string()), item.value()))
                .collect(),
        );
        let list = props.layers();
        let layers: Vec<Layer> = (0..list.len())
            .filter_map(|index| list.get(index))
            .map(|layer| Layer {
                kind: layer.kind().to_string(),
                color: (layer.color() != 0).then(|| crate::color::hsla(layer.color() as u32)),
                width: layer.width() as f32,
            })
            .collect();
        let links_list = props.links();
        let links: Rc<Vec<SankeyLink>> = Rc::new(
            (0..links_list.len())
                .filter_map(|index| links_list.get(index))
                .filter(|link| link.source >= 0 && link.target >= 0)
                .map(|link| SankeyLink::new(link.source as usize, link.target as usize, link.value))
                .collect(),
        );
        let curve = match props.curve() {
            GpuiKitPlotCurve::Natural => Curve::Natural,
            GpuiKitPlotCurve::Step => Curve::StepAfter,
            _ => Curve::Linear,
        };
        canvas(
            |_, _, _| (),
            move |bounds: Bounds<Pixels>, _, window, cx| {
                let theme = cx.theme().clone();
                let palette = [
                    theme.chart_1,
                    theme.chart_2,
                    theme.chart_3,
                    theme.chart_4,
                    theme.chart_5,
                ];
                for layer in &layers {
                    let color = layer.color;
                    match layer.kind.as_str() {
                        kind @ ("pie" | "donut") => {
                            let values: Vec<f32> = points.iter().map(|p| p.1 as f32).collect();
                            let arcs = Pie::new()
                                .value(|v: &f32| Some(*v))
                                .pad_angle(0.02)
                                .arcs(&values);
                            let outer = bounds.size.width.min(bounds.size.height).as_f32() / 2.0;
                            let shape = Arc::new()
                                .inner_radius(if kind == "donut" { outer * 0.6 } else { 0.0 })
                                .outer_radius(outer);
                            for arc in &arcs {
                                let fill = color.unwrap_or(palette[arc.index % palette.len()]);
                                shape.paint(arc, fill, &bounds, window);
                            }
                        }
                        "radar" => {
                            let count = points.len().max(1);
                            let high = points.iter().map(|p| p.1).fold(0.0_f64, f64::max).max(1e-9);
                            let outer = bounds.size.width.min(bounds.size.height).as_f32() / 2.0;
                            let color = color.unwrap_or(theme.chart_2);
                            let values: Vec<f64> = points.iter().map(|p| p.1).collect();
                            RadialLine::new()
                                .data(values)
                                .angle(move |_, index| {
                                    Some(index as f32 * std::f32::consts::TAU / count as f32)
                                })
                                .radius(move |value: &f64, _| Some((value / high) as f32 * outer))
                                .closed()
                                .fill(color.opacity(0.25))
                                .stroke(color)
                                .stroke_width(px(if layer.width > 0.0 { layer.width } else { 2.0 }))
                                .paint(&bounds, window);
                        }
                        "sankey" => {
                            let (width, height) =
                                (bounds.size.width.as_f32(), bounds.size.height.as_f32());
                            let Ok(graph) = Sankey::new()
                                .size(width, height)
                                .layout(points.len(), &links)
                            else {
                                continue;
                            };
                            for link in &graph.links {
                                let (source, target) =
                                    (&graph.nodes[link.source], &graph.nodes[link.target]);
                                if let Some(path) =
                                    sankey_link_path(source, target, link, 1.0, bounds.origin)
                                {
                                    let fill =
                                        color.unwrap_or(palette[link.source % palette.len()]);
                                    window.paint_path(path, fill.opacity(0.4));
                                }
                            }
                            for node in &graph.nodes {
                                let rect = Bounds::from_corners(
                                    bounds.origin + gpui::point(px(node.x0), px(node.y0)),
                                    bounds.origin + gpui::point(px(node.x1), px(node.y1)),
                                );
                                window.paint_quad(gpui::fill(
                                    rect,
                                    color.unwrap_or(palette[node.index % palette.len()]),
                                ));
                            }
                        }
                        _ => {}
                    }
                }
                if points.len() < 2 {
                    return;
                }
                let height = bounds.size.height.as_f32() - AXIS_GAP;
                let width = bounds.size.width.as_f32();
                let low = points.iter().map(|p| p.1).fold(0.0_f64, f64::min);
                let high = points.iter().map(|p| p.1).fold(0.0_f64, f64::max);
                let x = Rc::new(ScalePoint::new(
                    points.iter().map(|p| p.0.clone()).collect::<Vec<_>>(),
                    [0.0, width],
                ));
                let y = Rc::new(ScaleLinear::new(
                    vec![low, high.max(low + 1.0)],
                    [height, 0.0],
                ));
                for layer in &layers {
                    let color = layer.color.unwrap_or(theme.chart_2);
                    let stroke_width = if layer.width > 0.0 { layer.width } else { 2.0 };
                    match layer.kind.as_str() {
                        "bar" => {
                            let band = Rc::new(
                                ScaleBand::new(
                                    points.iter().map(|p| p.0.clone()).collect::<Vec<_>>(),
                                    [0.0, width],
                                )
                                .padding_inner(0.4)
                                .padding_outer(0.2),
                            );
                            let (ys, labels, values) = (
                                y.clone(),
                                points.iter().map(|p| p.0.clone()).collect::<Vec<_>>(),
                                points.iter().map(|p| p.1).collect::<Vec<_>>(),
                            );
                            let bands = band.clone();
                            Bar::new()
                                .data((0..points.len()).collect::<Vec<_>>())
                                .band_width(band.band_width())
                                .cross(move |index: &usize| bands.tick(&labels[*index]))
                                .base(move |_| height)
                                .value(move |index: &usize| ys.tick(&values[*index]))
                                .fill(move |_, _, _| color)
                                .paint(&bounds, window, cx);
                        }
                        "grid" => {
                            Grid::new()
                                .y((0..=4).map(|step| px(height * step as f32 / 4.0)))
                                .stroke(theme.border)
                                .paint(&bounds, window);
                        }
                        "axis" => {
                            let labels = points.iter().enumerate().map(|(index, point)| {
                                AxisText::new(
                                    point.0.clone(),
                                    px(x.tick_at(index).unwrap_or(0.0)),
                                    theme.muted_foreground,
                                )
                            });
                            PlotAxis::new()
                                .x(px(height))
                                .x_label(labels)
                                .stroke(theme.border)
                                .paint(&bounds, window, cx);
                        }
                        "area" => {
                            let (xs, ys, points) = (x.clone(), y.clone(), points.clone());
                            Area::new()
                                .data((0..points.len()).collect::<Vec<_>>())
                                .x({
                                    let xs = xs.clone();
                                    move |index: &usize| xs.tick_at(*index)
                                })
                                .y0(height)
                                .y1(move |index: &usize| ys.tick(&points[*index].1))
                                .fill(color.opacity(0.25))
                                .stroke(color)
                                .curve(curve)
                                .paint(&bounds, window);
                        }
                        kind @ ("line" | "dots") => {
                            let (xs, ys, points) = (x.clone(), y.clone(), points.clone());
                            let mut line = Line::new()
                                .data((0..points.len()).collect::<Vec<_>>())
                                .x(move |index: &usize| xs.tick_at(*index))
                                .y(move |index: &usize| ys.tick(&points[*index].1))
                                .stroke(color)
                                .stroke_width(stroke_width)
                                .curve(curve);
                            if kind == "dots" {
                                line = line.dot().dot_size(8.0).dot_fill(color);
                            }
                            line.paint(&bounds, window);
                        }
                        _ => {}
                    }
                }
            },
        )
        .size_full()
        .into_any_element()
    }
}
