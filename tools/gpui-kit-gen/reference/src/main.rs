//! Renders the cases of `gpuiKitParityCases.json` with gpui-kit directly, one
//! hidden window per case, and saves each frame as `<out>/<id>.png`.
//!
//! `--case <id>` renders one case; `--click x,y` (points, relative to the case)
//! then clicks there and `--type <text>` types after it, saving
//! `<id>-after.png` and the events the element reported to `<id>-events.txt`.

use std::cell::RefCell;
use std::path::PathBuf;
use std::rc::Rc;
use std::time::Duration;

use gpui::{
    div, point, px, size, AnyElement, App, AppContext as _, Bounds, Context, Entity, Hsla,
    IntoElement, Keystroke, Modifiers, MouseButton, MouseDownEvent, MouseUpEvent,
    ParentElement as _, PlatformInput, Render, Rgba, SharedString, Styled as _, Window,
    WindowBounds, WindowOptions,
};
use gpui_component::alert::{Alert, AlertVariant};
use gpui_component::avatar::Avatar;
use gpui_component::badge::Badge;
use gpui_component::button::{Button, ButtonCustomVariant, ButtonVariant, ButtonVariants as _, Toggle};
use gpui_component::checkbox::Checkbox;
use gpui_component::clipboard::Clipboard;
use gpui_component::input::{Input, InputState, NumberInput, OtpInput, Textarea, TextareaState};
use gpui_component::kbd::Kbd;
use gpui_component::label::{HighlightsMatch, Label};
use gpui_component::link::Link;
use gpui_component::pagination::Pagination;
use gpui_component::progress::{Progress, ProgressCircle};
use gpui_component::radio::Radio;
use gpui_component::rating::Rating;
use gpui_component::separator::Separator;
use gpui_component::slider::Slider;
use gpui_component::switch::Switch;
use gpui_component::tag::{Tag, TagVariant};
use gpui_component::{Disableable as _, Icon, IconName, Sizable as _, Size};
use serde_json::Value;

const CASES: &str = include_str!("../../../../example/src/fixtures/gpuiKitParityCases.json");

type Log = Rc<RefCell<Vec<String>>>;

struct Case {
    id: String,
    component: String,
    width: f32,
    height: f32,
    props: Value,
    style: Value,
}

struct States {
    input: Option<Entity<InputState>>,
    textarea: Option<Entity<TextareaState>>,
    otp: Option<Entity<gpui_base::OtpState>>,
    slider: Option<Entity<gpui_base::slider::SliderState>>,
}

struct CaseView {
    case: Rc<Case>,
    log: Log,
    states: States,
    checked: bool,
}

fn color(value: &str) -> Option<Hsla> {
    let hex = value.strip_prefix('#')?;
    let raw = u32::from_str_radix(hex, 16).ok()?;
    let (r, g, b) = ((raw >> 16) & 0xff, (raw >> 8) & 0xff, raw & 0xff);
    Some(
        Rgba {
            r: r as f32 / 255.0,
            g: g as f32 / 255.0,
            b: b as f32 / 255.0,
            a: 1.0,
        }
        .into(),
    )
}

fn kit_size(value: &str) -> Option<Size> {
    Some(match value {
        "xsmall" => Size::XSmall,
        "small" => Size::Small,
        "medium" => Size::Medium,
        "large" => Size::Large,
        _ => return None,
    })
}

fn icon(name: &str) -> Option<IconName> {
    Some(match name {
        "search" => IconName::Search,
        "heart" => IconName::Heart,
        "arrow-up" => IconName::ArrowUp,
        "info" => IconName::Info,
        _ => return None,
    })
}

impl CaseView {
    fn s(&self, key: &str) -> String {
        self.case.props.get(key).and_then(Value::as_str).unwrap_or("").to_string()
    }
    fn b(&self, key: &str) -> bool {
        self.case.props.get(key).and_then(Value::as_bool).unwrap_or(false)
    }
    fn n(&self, key: &str) -> Option<f64> {
        self.case.props.get(key).and_then(Value::as_f64)
    }

    fn element(&mut self, window: &mut Window, cx: &mut Context<Self>) -> AnyElement {
        let id = SharedString::from(self.case.id.clone());
        let log = self.log.clone();
        let record = move |name: &'static str| {
            let log = log.clone();
            move || log.borrow_mut().push(name.to_string())
        };
        let size = kit_size(&self.s("size"));
        match self.case.component.as_str() {
            "Button" => {
                let mut button = Button::new(id).label(self.s("label"));
                if let Some(name) = icon(&self.s("icon")) {
                    button = button.icon(name);
                }
                if self.b("outline") {
                    button = button.outline();
                }
                if self.b("disabled") {
                    button = button.disabled(true);
                }
                let variant = match self.s("variant").as_str() {
                    "primary" => Some(ButtonVariant::Primary),
                    "secondary" => Some(ButtonVariant::Secondary),
                    "danger" => Some(ButtonVariant::Danger),
                    "ghost" => Some(ButtonVariant::Ghost),
                    "link" => Some(ButtonVariant::Link),
                    _ => None,
                };
                if let Some(variant) = variant {
                    button = button.with_variant(variant);
                }
                if let Some(c) = color(&self.s("customColor")) {
                    let mut custom = ButtonCustomVariant::new(cx).color(c);
                    if let Some(f) = color(&self.s("customForeground")) {
                        custom = custom.foreground(f);
                    }
                    button = button.custom(custom);
                }
                if let Some(size) = size {
                    button = button.with_size(size);
                }
                let press = record("press");
                button.on_click(move |_, _, _| press()).into_any_element()
            }
            "Label" => {
                let mut label = Label::new(self.s("text"));
                let highlights = self.s("highlights");
                if !highlights.is_empty() {
                    label = label.highlights(HighlightsMatch::Full(highlights.into()));
                }
                label.into_any_element()
            }
            "Tag" => {
                let mut tag = Tag::new();
                if self.s("variant") == "danger" {
                    tag = tag.with_variant(TagVariant::Danger);
                }
                if let Some(radius) = self.n("radius") {
                    tag = tag.rounded(px(radius as f32));
                }
                tag.child(self.s("label")).into_any_element()
            }
            "Badge" => Badge::new()
                .count(self.n("count").unwrap_or(0.0) as usize)
                .into_any_element(),
            "Icon" => {
                let mut element = Icon::new(icon(&self.s("name")).unwrap_or(IconName::Info));
                if let Some(size) = size {
                    element = element.with_size(size);
                }
                if let Some(c) = color(&self.s("color")) {
                    element = element.text_color(c);
                }
                if let Some(degrees) = self.n("rotate") {
                    element = element.rotate(gpui::radians((degrees as f32).to_radians()));
                }
                element.into_any_element()
            }
            "Avatar" => {
                let mut avatar = Avatar::new().name(self.s("name"));
                if let Some(size) = size {
                    avatar = avatar.with_size(size);
                }
                avatar.into_any_element()
            }
            "Link" => {
                let press = record("press");
                Link::new(id)
                    .on_click(move |_, _, _| press())
                    .child(self.s("text"))
                    .into_any_element()
            }
            "Progress" => Progress::new(id)
                .value(self.n("value").unwrap_or(0.0) as f32)
                .size_full()
                .into_any_element(),
            "ProgressCircle" => ProgressCircle::new(id)
                .value(self.n("value").unwrap_or(0.0) as f32)
                .size_full()
                .into_any_element(),
            "Toggle" => {
                let change = record("change");
                let view = cx.entity().downgrade();
                Toggle::new(id)
                    .label(self.s("label"))
                    .checked(self.checked)
                    .on_click(move |checked, _, cx| {
                        change();
                        let checked = *checked;
                        let _ = view.update(cx, |view, cx| {
                            view.checked = checked;
                            cx.notify();
                        });
                    })
                    .into_any_element()
            }
            "Alert" => {
                let mut alert = Alert::new(id, self.s("message"));
                if self.s("variant") == "warning" {
                    alert = alert.with_variant(AlertVariant::Warning);
                }
                alert.into_any_element()
            }
            "Checkbox" | "Radio" | "Switch" => {
                let change = record("change");
                let view = cx.entity().downgrade();
                let on_change = move |checked: &bool, _: &mut Window, cx: &mut App| {
                    change();
                    let checked = *checked;
                    let _ = view.update(cx, |view, cx| {
                        view.checked = checked;
                        cx.notify();
                    });
                };
                let label = self.s("label");
                match self.case.component.as_str() {
                    "Checkbox" => Checkbox::new(id)
                        .label(label)
                        .checked(self.checked)
                        .on_change(on_change)
                        .into_any_element(),
                    "Radio" => Radio::new(id)
                        .label(label)
                        .checked(self.checked)
                        .on_change(on_change)
                        .into_any_element(),
                    _ => Switch::new(id)
                        .label(label)
                        .checked(self.checked)
                        .on_change(on_change)
                        .into_any_element(),
                }
            }
            "Rating" => Rating::new(id)
                .value(self.n("value").unwrap_or(0.0) as usize)
                .into_any_element(),
            "Input" | "NumberInput" => {
                if self.states.input.is_none() {
                    let state = cx.new(|cx| InputState::new(window, cx));
                    let (value, placeholder) = (self.s("defaultValue"), self.s("placeholder"));
                    state.update(cx, |state, cx| {
                        if !value.is_empty() {
                            state.set_value(value, window, cx);
                        }
                        if !placeholder.is_empty() {
                            state.set_placeholder(placeholder, window, cx);
                        }
                    });
                    self.states.input = Some(state);
                }
                let state = self.states.input.as_ref().unwrap();
                if self.case.component == "Input" {
                    Input::new(state).into_any_element()
                } else {
                    NumberInput::new(state).into_any_element()
                }
            }
            "Textarea" => {
                if self.states.textarea.is_none() {
                    let state = cx.new(|cx| TextareaState::new(window, cx));
                    let value = self.s("defaultValue");
                    state.update(cx, |state, cx| state.set_value(value, window, cx));
                    self.states.textarea = Some(state);
                }
                Textarea::new(self.states.textarea.as_ref().unwrap())
                    .size_full()
                    .into_any_element()
            }
            "OtpInput" => {
                if self.states.otp.is_none() {
                    let length = self.n("length").unwrap_or(6.0) as usize;
                    self.states.otp = Some(cx.new(|cx| gpui_base::OtpState::new(length, window, cx)));
                }
                OtpInput::new(self.states.otp.as_ref().unwrap()).into_any_element()
            }
            "Slider" => {
                if self.states.slider.is_none() {
                    let value = self.n("value").unwrap_or(0.0) as f32;
                    self.states.slider = Some(cx.new(|_| {
                        gpui_base::slider::SliderState::new()
                            .min(0.0)
                            .max(100.0)
                            .default_value(value)
                    }));
                }
                Slider::new(self.states.slider.as_ref().unwrap()).into_any_element()
            }
            "Pagination" => Pagination::new(id)
                .current_page(self.n("currentPage").unwrap_or(1.0) as usize)
                .total_pages(self.n("totalPages").unwrap_or(1.0) as usize)
                .into_any_element(),
            "Clipboard" => Clipboard::new(id).value(self.s("value")).into_any_element(),
            "Separator" => Separator::horizontal().size_full().into_any_element(),
            "Kbd" => match Keystroke::parse(Box::leak(self.s("keystroke").into_boxed_str())) {
                Ok(keystroke) => Kbd::new(keystroke).into_any_element(),
                Err(_) => div().into_any_element(),
            },
            other => panic!("no reference rendering for {other}"),
        }
    }
}

impl Render for CaseView {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let element = self.element(window, cx);
        let style = &self.case.style;
        let mut frame = div().flex().flex_col();
        if let Some(w) = style.get("width").and_then(Value::as_f64) {
            frame = frame.w(px(w as f32));
        }
        if let Some(h) = style.get("height").and_then(Value::as_f64) {
            frame = frame.h(px(h as f32));
        }
        let background = serde_json::from_str::<Value>(CASES)
            .ok()
            .and_then(|v| v.get("background").and_then(Value::as_str).and_then(color))
            .unwrap_or(gpui::white());
        div()
            .w(px(self.case.width))
            .h(px(self.case.height))
            .bg(background)
            .flex()
            .flex_col()
            .items_start()
            .child(frame.child(element))
    }
}

struct Args {
    out: PathBuf,
    case: Option<String>,
    click: Option<(f32, f32)>,
    typed: Option<String>,
}

fn args() -> Args {
    let mut out = PathBuf::from("out");
    let (mut case, mut click, mut typed) = (None, None, None);
    let mut it = std::env::args().skip(1);
    while let Some(arg) = it.next() {
        match arg.as_str() {
            "--out" => out = it.next().map(PathBuf::from).unwrap_or(out),
            "--case" => case = it.next(),
            "--click" => {
                click = it.next().and_then(|v| {
                    let (x, y) = v.split_once(',')?;
                    Some((x.parse().ok()?, y.parse().ok()?))
                })
            }
            "--type" => typed = it.next(),
            _ => {}
        }
    }
    Args { out, case, click, typed }
}

fn cases() -> Vec<Rc<Case>> {
    let root: Value = serde_json::from_str(CASES).expect("cases json");
    root["cases"]
        .as_array()
        .unwrap()
        .iter()
        .map(|c| {
            Rc::new(Case {
                id: c["id"].as_str().unwrap().to_string(),
                component: c["component"].as_str().unwrap().to_string(),
                width: c["width"].as_f64().unwrap() as f32,
                height: c["height"].as_f64().unwrap() as f32,
                props: c["props"].clone(),
                style: c.get("style").cloned().unwrap_or(Value::Null),
            })
        })
        .collect()
}

fn capture(window: &mut Window, app: &mut App, path: &PathBuf) -> anyhow::Result<()> {
    window.refresh();
    window.draw(app).clear(app);
    let image = window.render_to_image()?;
    image.save(path)?;
    Ok(())
}

fn main() {
    let args = Rc::new(args());
    std::fs::create_dir_all(&args.out).expect("out dir");
    let selected: Vec<Rc<Case>> = cases()
        .into_iter()
        .filter(|c| args.case.as_ref().is_none_or(|id| *id == c.id))
        .collect();
    gpui_platform::application()
        .with_assets(gpui_kit_assets::Assets)
        .run(move |cx: &mut App| {
            gpui_component::init(cx);
            cx.spawn(async move |cx| {
                for case in selected {
                    let log: Log = Rc::default();
                    let bounds = Bounds::new(point(px(0.0), px(0.0)), size(px(case.width), px(case.height)));
                    let options = WindowOptions {
                        window_bounds: Some(WindowBounds::Windowed(bounds)),
                        titlebar: None,
                        focus: false,
                        show: false,
                        ..Default::default()
                    };
                    let view_case = case.clone();
                    let view_log = log.clone();
                    let handle = cx
                        .open_window(options, move |window, cx| {
                            let view = cx.new(|_| CaseView {
                                case: view_case,
                                log: view_log,
                                states: States { input: None, textarea: None, otp: None, slider: None },
                                checked: false,
                            });
                            cx.new(|cx| gpui_base::Root::new(gpui::AnyView::from(view), window, cx))
                        })
                        .expect("open window");
                    for _ in 0..3 {
                        cx.background_executor().timer(Duration::from_millis(100)).await;
                        let _ = cx.update_window(handle.into(), |_, window, app| {
                            window.refresh();
                            window.draw(app).clear(app);
                        });
                    }
                    let path = args.out.join(format!("{}.png", case.id));
                    let _ = cx.update_window(handle.into(), |_, window, app| {
                        if let Err(error) = capture(window, app, &path) {
                            eprintln!("{}: {error}", case.id);
                        }
                    });
                    if let Some((x, y)) = args.click {
                        let position = point(px(x), px(y));
                        let _ = cx.update_window(handle.into(), |_, window, app| {
                            window.dispatch_event(
                                PlatformInput::MouseMove(gpui::MouseMoveEvent {
                                    position,
                                    pressed_button: None,
                                    modifiers: Modifiers::default(),
                                }),
                                app,
                            );
                            window.dispatch_event(
                                PlatformInput::MouseDown(MouseDownEvent {
                                    button: MouseButton::Left,
                                    position,
                                    modifiers: Modifiers::default(),
                                    click_count: 1,
                                    first_mouse: false,
                                }),
                                app,
                            );
                            window.dispatch_event(
                                PlatformInput::MouseUp(MouseUpEvent {
                                    button: MouseButton::Left,
                                    position,
                                    modifiers: Modifiers::default(),
                                    click_count: 1,
                                }),
                                app,
                            );
                        });
                        if let Some(text) = &args.typed {
                            for ch in text.chars() {
                                let source = ch.to_string();
                                let _ = cx.update_window(handle.into(), |_, window, app| {
                                    if let Ok(mut keystroke) =
                                        Keystroke::parse(Box::leak(source.clone().into_boxed_str()))
                                    {
                                        keystroke.key_char = Some(source.clone());
                                        window.dispatch_keystroke(keystroke, app);
                                    }
                                });
                            }
                        }
                        for _ in 0..10 {
                            cx.background_executor().timer(Duration::from_millis(100)).await;
                            let _ = cx.update_window(handle.into(), |_, window, app| {
                                window.refresh();
                                window.draw(app).clear(app);
                            });
                        }
                        let path = args.out.join(format!("{}-after.png", case.id));
                        let _ = cx.update_window(handle.into(), |_, window, app| {
                            if let Err(error) = capture(window, app, &path) {
                                eprintln!("{}: {error}", case.id);
                            }
                        });
                        let _ = std::fs::write(
                            args.out.join(format!("{}-events.txt", case.id)),
                            log.borrow().join("\n"),
                        );
                    }
                    let _ = cx.update_window(handle.into(), |_, window, _| window.remove_window());
                }
                let _ = cx.update(|cx| cx.quit());
            })
            .detach();
        });
}
