rn_gpui_module::include_specs!();

use std::cell::Cell;
use std::rc::Rc;

use gpui::{
    canvas, div, prelude::*, px, rgba, AnyElement, Bounds, FocusHandle, MouseButton, Pixels, Window,
};
use react_native_gpui::host_component::{MeasureConstraint, MeasuredSize};

const TRACK_HEIGHT: f32 = 4.0;
const DEFAULT_THUMB: f32 = 20.0;
const MINIMUM_TRACK: u32 = 0x1d4ed8ff;
const MAXIMUM_TRACK: u32 = 0xd4d4d8ff;
const THUMB: u32 = 0xffffffff;

/// A React Native color, `0xAARRGGBB`, as GPUI's `0xRRGGBBAA`.
fn color(argb: Option<u32>, fallback: u32) -> u32 {
    argb.map_or(fallback, |argb| argb.rotate_left(8))
}

/// Where a value sits on the track, from 0 to 1.
fn fraction_of(props: &RNCSliderProps, value: f64) -> f32 {
    let (min, max) = (props.minimum_value(), props.maximum_value());
    let span = max - min;
    let fraction = if span > 0.0 {
        ((value - min) / span).clamp(0.0, 1.0)
    } else {
        0.0
    };
    (if props.inverted() {
        1.0 - fraction
    } else {
        fraction
    }) as f32
}

pub struct Slider {
    value: Rc<Cell<f64>>,
    track: Rc<Cell<Bounds<Pixels>>>,
    dragging: Rc<Cell<bool>>,
    sender: Rc<RNCSliderEventSender>,
    focus: Option<FocusHandle>,
}

/// The value one arrow key press moves to: one step, or a hundredth of the range without a step.
fn stepped(props: (f64, f64, f64), value: f64, direction: f64) -> f64 {
    let (min, max, step) = props;
    let max = max.max(min);
    let increment = if step > 0.0 {
        step
    } else {
        (max - min) / 100.0
    };
    (value + direction * increment).clamp(min, max)
}

impl RNCSliderSpec for Slider {
    fn measure(props: &RNCSliderProps, constraint: &MeasureConstraint) -> Option<MeasuredSize> {
        let height = if props.thumb_size() > 0.0 {
            props.thumb_size()
        } else {
            DEFAULT_THUMB
        };
        let width = if constraint.max_width.is_finite() {
            constraint.max_width
        } else {
            200.0
        };
        Some(MeasuredSize { width, height })
    }

    fn create(props: &RNCSliderProps, cx: &mut RNCSliderContext) -> Self {
        Self {
            value: Rc::new(Cell::new(props.value() as f64)),
            track: Rc::new(Cell::new(Bounds::default())),
            dragging: Rc::new(Cell::new(false)),
            sender: Rc::new(cx.event_sender()),
            focus: cx.app().map(|app| app.focus_handle().tab_stop(true)),
        }
    }

    fn update(
        &mut self,
        props: &RNCSliderProps,
        changed: RNCSliderChanged,
        _cx: &mut RNCSliderContext,
    ) {
        if changed.value() && !self.dragging.get() {
            self.value.set(props.value() as f64);
        }
    }

    fn render(
        &mut self,
        props: &RNCSliderProps,
        _window: &mut Window,
        cx: &mut RNCSliderContext,
    ) -> AnyElement {
        let fill = fraction_of(props, self.value.get());
        let thumb_size = if props.thumb_size() > 0.0 {
            props.thumb_size()
        } else {
            DEFAULT_THUMB
        };
        let minimum = rgba(color(props.minimum_track_tint_color(), MINIMUM_TRACK));
        let maximum = rgba(color(props.maximum_track_tint_color(), MAXIMUM_TRACK));
        let thumb = rgba(color(props.thumb_tint_color(), THUMB));
        let disabled = props.disabled();
        let track = self.track.clone();

        let mut root = div()
            .id("slider")
            .relative()
            .size_full()
            .flex()
            .items_center()
            .opacity(if disabled { 0.5 } else { 1.0 })
            .child(
                canvas(move |bounds, _, _| track.set(bounds), |_, _, _, _| {})
                    .absolute()
                    .size_full(),
            )
            .child(
                div()
                    .absolute()
                    .left_0()
                    .w(gpui::relative(fill))
                    .h(px(TRACK_HEIGHT))
                    .rounded_full()
                    .bg(minimum),
            )
            .child(
                div()
                    .absolute()
                    .right_0()
                    .w(gpui::relative(1.0 - fill))
                    .h(px(TRACK_HEIGHT))
                    .rounded_full()
                    .bg(maximum),
            )
            .child(
                div()
                    .absolute()
                    .top_0()
                    .bottom_0()
                    .my_auto()
                    .left(gpui::relative(fill))
                    .ml(px(-thumb_size / 2.0))
                    .size(px(thumb_size))
                    .rounded_full()
                    .bg(thumb)
                    .border_1()
                    .border_color(rgba(0x00000033)),
            );

        if disabled {
            return root.into_any_element();
        }

        if self.focus.is_none() {
            self.focus = cx.app().map(|app| app.focus_handle().tab_stop(true));
        }
        if let Some(focus) = &self.focus {
            let (key_value, key_sender) = (self.value.clone(), self.sender.clone());
            let range = (props.minimum_value(), props.maximum_value(), props.step());
            let inverted = props.inverted();
            root = root
                .track_focus(focus)
                .tab_stop(true)
                .on_key_down(move |event, window, cx| {
                    let (min, max, _) = range;
                    let current = key_value.get();
                    let value = match event.keystroke.key.as_str() {
                        "left" | "down" => {
                            stepped(range, current, if inverted { 1.0 } else { -1.0 })
                        }
                        "right" | "up" => {
                            stepped(range, current, if inverted { -1.0 } else { 1.0 })
                        }
                        "home" => min,
                        "end" => max.max(min),
                        _ => return,
                    };
                    cx.stop_propagation();
                    if (value - current).abs() <= f64::EPSILON {
                        return;
                    }
                    key_value.set(value);
                    key_sender.rnc_slider_value_change(OnRNCSliderValueChange {
                        value: value as f32,
                        from_user: true,
                    });
                    key_sender.rnc_slider_sliding_complete(OnRNCSliderSlidingComplete {
                        value: value as f32,
                        from_user: true,
                    });
                    window.refresh();
                });
        }

        let locate = {
            let track = self.track.clone();
            let props = (
                props.minimum_value(),
                props.maximum_value(),
                props.step(),
                props.inverted(),
            );
            let props = Rc::new(props);
            move |x: f32| {
                let bounds = track.get();
                let left = f32::from(bounds.origin.x);
                let width = f32::from(bounds.size.width).max(1.0);
                let fraction = f64::from((x - left) / width);
                let (min, max, step, inverted) = *props;
                let fraction = if inverted { 1.0 - fraction } else { fraction };
                let mut value =
                    (min + fraction.clamp(0.0, 1.0) * (max - min)).clamp(min, max.max(min));
                if step > 0.0 {
                    value = (min + ((value - min) / step).round() * step).clamp(min, max.max(min));
                }
                value
            }
        };

        let (down_locate, down_value, down_dragging, down_sender) = (
            locate.clone(),
            self.value.clone(),
            self.dragging.clone(),
            self.sender.clone(),
        );
        let down_focus = self.focus.clone();
        let (move_locate, move_value, move_dragging, move_sender) = (
            locate.clone(),
            self.value.clone(),
            self.dragging.clone(),
            self.sender.clone(),
        );
        let (up_value, up_dragging, up_sender) = (
            self.value.clone(),
            self.dragging.clone(),
            self.sender.clone(),
        );

        root = root
            .on_mouse_down(MouseButton::Left, move |event, window, cx| {
                if let Some(focus) = &down_focus {
                    window.focus(focus, cx);
                }
                let value = down_locate(f32::from(event.position.x));
                down_value.set(value);
                down_dragging.set(true);
                down_sender.rnc_slider_sliding_start(OnRNCSliderSlidingStart {
                    value: value as f32,
                    from_user: true,
                });
                down_sender.rnc_slider_value_change(OnRNCSliderValueChange {
                    value: value as f32,
                    from_user: true,
                });
                window.refresh();
            })
            .on_mouse_move(move |event, window, _| {
                if !move_dragging.get() {
                    return;
                }
                let value = move_locate(f32::from(event.position.x));
                if (value - move_value.get()).abs() > f64::EPSILON {
                    move_value.set(value);
                    move_sender.rnc_slider_value_change(OnRNCSliderValueChange {
                        value: value as f32,
                        from_user: true,
                    });
                    window.refresh();
                }
            })
            .on_mouse_up(MouseButton::Left, move |event, window, _| {
                if !up_dragging.get() {
                    return;
                }
                up_dragging.set(false);
                let value = locate(f32::from(event.position.x));
                up_value.set(value);
                up_sender.rnc_slider_sliding_complete(OnRNCSliderSlidingComplete {
                    value: value as f32,
                    from_user: true,
                });
                window.refresh();
            });

        root.into_any_element()
    }
}

pub fn rn_gpui_register() {
    react_native_gpui::host_component::register_component(rnc_slider_component::<Slider>());
}
