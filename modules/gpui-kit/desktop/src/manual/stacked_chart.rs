use gpui::{
    point, px, AnyElement, App, Bounds, ElementId, IntoElement, Pixels, Point, SharedString,
    TextAlign, Window,
};
use gpui_component::plot::{
    axis_gutter,
    label::TEXT_SIZE,
    scale::{Scale, ScaleBand, ScaleLinear, ScaleOrdinal},
    shape::{Bar, Stack, StackSeries},
    tooltip::{CrossLine, Tooltip, TooltipState},
    AxisText, Grid, Plot, PlotAxis, PlotElement,
};
use gpui_component::ActiveTheme as _;
use serde_json::Value;

use super::chart_spec::Row;

fn axis_gap() -> f32 {
    axis_gutter(px(TEXT_SIZE))
}

pub struct StackedBarChart {
    data: Vec<Row>,
    series: Vec<StackSeries<Row>>,
}

impl StackedBarChart {
    pub fn new(data: Vec<Row>) -> Self {
        let series = Stack::new()
            .data(data.clone())
            .keys(vec!["desktop", "mobile", "tablet", "watch"])
            .value(|d: &Row, key| Some(d.n(key) as f32))
            .series();

        Self { data, series }
    }
}

impl IntoElement for StackedBarChart {
    type Element = PlotElement<Self>;

    fn into_element(self) -> Self::Element {
        PlotElement::new(self)
    }
}

impl Plot for StackedBarChart {
    fn paint(&mut self, bounds: Bounds<Pixels>, window: &mut Window, cx: &mut App) {
        let width = bounds.size.width.as_f32();
        let height = bounds.size.height.as_f32() - axis_gap();
        let x = ScaleBand::new(self.data.iter().map(|v| v.s("date")), [0., width])
            .max_band_width(30.)
            .padding_inner(0.4)
            .padding_outer(0.2);
        let band_width = x.band_width();

        let max = self
            .series
            .iter()
            .flat_map(|s| s.points.iter().map(|p| p.y1))
            .fold(0., f32::max) as f64;

        let y = ScaleLinear::new(vec![0., max], [height, 10.]);
        let x_label = self.data.iter().filter_map(|d| {
            x.tick(&d.s("date")).map(|x_tick| {
                AxisText::new(
                    d.s("date"),
                    x_tick + band_width / 2.,
                    cx.theme().muted_foreground,
                )
                .align(TextAlign::Center)
            })
        });
        PlotAxis::new()
            .x(height)
            .x_label(x_label)
            .stroke(cx.theme().border)
            .paint(&bounds, window, cx);
        let keys = self.series.iter().map(|s| s.key.clone()).collect();
        let colors = vec![
            cx.theme().chart_4,
            cx.theme().chart_3,
            cx.theme().chart_2,
            cx.theme().chart_1,
        ];
        let ordinal = ScaleOrdinal::new(keys, colors);
        Grid::new()
            .y((0..=3).map(|i| height * i as f32 / 4.0))
            .stroke(cx.theme().border)
            .dash_array(&[px(4.), px(2.)])
            .paint(&bounds, window);
        for series in self.series.iter() {
            let x = x.clone();
            let y0 = y.clone();
            let y1 = y.clone();

            let key = &series.key;
            let fill = ordinal.map(&key).unwrap_or(cx.theme().chart_4);

            Bar::new()
                .data(&series.points)
                .band_width(band_width)
                .cross(move |d| x.tick(&d.data.s("date")))
                .base(move |d| y0.tick(&(d.y0 as f64)).unwrap_or(height))
                .value(move |d| y1.tick(&(d.y1 as f64)))
                .fill(move |_, _, _| fill)
                .paint(&bounds, window, cx);
        }
    }

    fn id(&self) -> Option<ElementId> {
        Some("stacked-bar-chart".into())
    }

    fn tooltip_state(
        &self,
        position: Point<Pixels>,
        bounds: Bounds<Pixels>,
        _cx: &App,
    ) -> Option<TooltipState> {
        let x = ScaleBand::new(
            self.data.iter().map(|v| v.s("date")),
            [0., bounds.size.width.as_f32()],
        )
        .max_band_width(30.)
        .padding_inner(0.4)
        .padding_outer(0.2);
        let band_width = x.band_width();
        if position.y.as_f32() > bounds.size.height.as_f32() - axis_gap() {
            return None;
        }

        let index = x.nearest_index(position.x.as_f32());
        let d = self.data.get(index)?;
        let center_x = x.tick(&d.s("date"))? + band_width / 2.;

        Some(TooltipState::new(
            index,
            point(px(center_x), position.y),
            vec![],
        ))
    }

    fn tooltip(
        &self,
        state: &TooltipState,
        cursor: Point<Pixels>,
        bounds: Bounds<Pixels>,
        _window: &mut Window,
        cx: &mut App,
    ) -> Option<AnyElement> {
        let d = self.data.get(state.index)?;
        let ordinal = ScaleOrdinal::new(
            self.series.iter().map(|s| s.key.clone()).collect(),
            vec![
                cx.theme().chart_4,
                cx.theme().chart_3,
                cx.theme().chart_2,
                cx.theme().chart_1,
            ],
        );
        let band_width = ScaleBand::new(
            self.data.iter().map(|v| v.s("date")),
            [0., bounds.size.width.as_f32()],
        )
        .max_band_width(30.)
        .padding_inner(0.4)
        .padding_outer(0.2)
        .band_width();
        let mut tooltip = Tooltip::new(cursor, bounds.size)
            .gap(px(8.))
            .cross_line(
                CrossLine::new(state.cross_line)
                    .height(bounds.size.height.as_f32() - axis_gap())
                    .band(px(band_width)),
            )
            .title(d.s("date"));
        let mut total = 0.;
        for series in self.series.iter() {
            let color = ordinal.map(&series.key).unwrap_or(cx.theme().chart_4);
            let value = series
                .points
                .get(state.index)
                .map(|p| p.y1 - p.y0)
                .unwrap_or(0.);
            total += value;
            tooltip = tooltip.row(color, series.key.clone(), format!("{}", value));
        }

        Some(
            tooltip
                .plain_row("total", format!("{}", total))
                .into_any_element(),
        )
    }
}

pub fn render(spec: &Value) -> AnyElement {
    let rows = spec
        .get("rows")
        .and_then(Value::as_array)
        .map(|rows| {
            rows.iter()
                .filter_map(Value::as_object)
                .map(Row::from_map)
                .collect()
        })
        .unwrap_or_default();
    StackedBarChart::new(rows).into_any_element()
}
