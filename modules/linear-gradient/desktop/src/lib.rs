rn_gpui_module::include_specs!();

use gpui::{
    div, linear_color_stop, linear_gradient, prelude::*, rgba, AnyElement, LinearColorStop,
    Window,
};

/// The processed color of React Native, `0xAARRGGBB`, as GPUI's `0xRRGGBBAA`.
fn color(processed: f64) -> u32 {
    (processed as i64 as u32).rotate_left(8)
}

pub struct LinearGradient;

/// A CSS-style angle, in degrees from the top, of the line from start to end.
fn direction(props: &BVLinearGradientProps) -> f32 {
    if props.use_angle() {
        return props.angle() as f32;
    }
    let (start, end) = (props.start(), props.end());
    let (dx, dy) = ((end.x - start.x) as f32, (end.y - start.y) as f32);
    dx.atan2(-dy).to_degrees().rem_euclid(360.0)
}

fn stops(props: &BVLinearGradientProps) -> Vec<(u32, f32)> {
    let colors = props.colors();
    let locations = props.locations();
    let count = colors.len();
    colors
        .iter()
        .enumerate()
        .map(|(index, processed)| {
            let position = if locations.len() == count {
                locations[index] as f32
            } else if count > 1 {
                index as f32 / (count - 1) as f32
            } else {
                0.0
            };
            (color(*processed), position.clamp(0.0, 1.0))
        })
        .collect()
}

fn paint(props: &BVLinearGradientProps) -> AnyElement {
    let stops = stops(props);
    let angle = direction(props);
    match stops.as_slice() {
        [] => div().size_full().into_any_element(),
        [(only, _)] => div().size_full().bg(rgba(*only)).into_any_element(),
        [(first, first_at), (last, last_at)] => {
            let gradient = linear_gradient(
                angle,
                linear_color_stop(rgba(*first), *first_at),
                linear_color_stop(rgba(*last), *last_at),
            );
            div().size_full().bg(gradient).into_any_element()
        }
        _ => segments(&stops, angle),
    }
}

/// Paints more than two stops as one two-stop gradient per segment, laid out
/// along the axis the direction is closest to. A diagonal direction is drawn
/// along its dominant axis.
fn segments(stops: &[(u32, f32)], angle: f32) -> AnyElement {
    let radians = angle.to_radians();
    let horizontal = radians.sin().abs() > radians.cos().abs();
    let forward = if horizontal {
        radians.sin() >= 0.0
    } else {
        -radians.cos() >= 0.0
    };
    let mut visual: Vec<(f32, u32)> = stops
        .iter()
        .map(|(color, at)| (if forward { *at } else { 1.0 - *at }, *color))
        .collect();
    visual.sort_by(|a, b| a.0.total_cmp(&b.0));

    let segment_angle = if horizontal { 90.0 } else { 180.0 };
    let mut root = div().relative().size_full();
    for pair in visual.windows(2) {
        let ((from, from_color), (to, to_color)) = (pair[0], pair[1]);
        let width = to - from;
        if width <= 0.0 {
            continue;
        }
        let gradient = linear_gradient(
            segment_angle,
            LinearColorStop {
                color: rgba(from_color).into(),
                percentage: 0.0,
            },
            LinearColorStop {
                color: rgba(to_color).into(),
                percentage: 1.0,
            },
        );
        let segment = div().absolute().bg(gradient);
        let segment = if horizontal {
            segment.top_0().bottom_0().left(gpui::relative(from)).w(gpui::relative(width))
        } else {
            segment.left_0().right_0().top(gpui::relative(from)).h(gpui::relative(width))
        };
        root = root.child(segment);
    }
    root.into_any_element()
}

impl BVLinearGradientSpec for LinearGradient {
    fn create(_props: &BVLinearGradientProps, _cx: &mut BVLinearGradientContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &BVLinearGradientProps,
        _changed: BVLinearGradientChanged,
        _cx: &mut BVLinearGradientContext,
    ) {
    }

    fn render(
        &mut self,
        props: &BVLinearGradientProps,
        _window: &mut Window,
        _cx: &mut BVLinearGradientContext,
    ) -> AnyElement {
        paint(props)
    }
}

pub fn rn_gpui_register() {
    react_native_gpui::host_component::register_component(bv_linear_gradient_component::<LinearGradient>());
}
