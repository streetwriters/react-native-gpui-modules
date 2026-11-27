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

mod story;
pub(crate) use story::stories;
pub(crate) use story::support::{ChangeStorySize, Story, section, story_toolbar, story_toolbar_group};

gpui::actions!(story, [TestAction]);

const CASES: &str = include_str!("../../../../gpui-kit-example/src/fixtures/gpuiKitParityCases.json");

type Log = Rc<RefCell<Vec<String>>>;

struct Case {
    id: String,
    component: String,
    width: f32,
    height: f32,
    props: Value,
    style: Value,
    child: Option<Value>,
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
        "check" => IconName::Check,
        "bell" => IconName::Bell,
        "inbox" => IconName::Inbox,
        _ => return None,
    })
}

fn kit_badge(props: &Value) -> Badge {
    let n = |k: &str| props.get(k).and_then(Value::as_f64);
    let st = |k: &str| props.get(k).and_then(Value::as_str).unwrap_or("").to_string();
    let mut badge = Badge::new().count(n("count").unwrap_or(0.0) as usize);
    if props.get("dot").and_then(Value::as_bool) == Some(true) {
        badge = badge.dot();
    }
    if let Some(max) = n("max") {
        badge = badge.max(max as usize);
    }
    if let Some(name) = icon(&st("icon")) {
        badge = badge.icon(name);
    }
    if let Some(c) = color(&st("color")) {
        badge = badge.color(c);
    }
    if let Some(size) = kit_size(&st("size")) {
        badge = badge.with_size(size);
    }
    badge
}

/// The child a Badge case sits on: an icon, an avatar, or another badge.
fn child_element(child: &Value) -> AnyElement {
    let name = child["name"].as_str().unwrap_or("").to_string();
    match child["kind"].as_str() {
        Some("icon") => Icon::new(icon(&name).unwrap_or(IconName::Info)).into_any_element(),
        Some("avatar") => {
            let mut avatar = Avatar::new().name(name);
            if let Some(size) = child["size"].as_str().and_then(kit_size) {
                avatar = avatar.with_size(size);
            }
            avatar.into_any_element()
        }
        Some("badge") => {
            let mut badge = kit_badge(&child["props"]);
            if let Some(inner) = child.get("child") {
                badge = badge.child(child_element(inner));
            }
            badge.into_any_element()
        }
        _ => gpui::div().into_any_element(),
    }
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
            "Spinner" => {
                let mut spinner = gpui_component::spinner::Spinner::new();
                if let Some(size) = size {
                    spinner = spinner.with_size(size);
                }
                spinner.into_any_element()
            }
            "Skeleton" => gpui_component::skeleton::Skeleton::new()
                .w(px(120.))
                .h(px(16.))
                .into_any_element(),
            "ShimmerText" => gpui_component::shimmer::ShimmerText::new(self.s("text"))
                .into_any_element(),
            "Badge" => {
                let mut badge = kit_badge(&self.case.props);
                if let Some(child) = self.case.child.as_ref() {
                    badge = badge.child(child_element(child));
                }
                badge.into_any_element()
            }
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
        if let Some(m) = style.get("marginTop").and_then(Value::as_f64) {
            frame = frame.mt(px(m as f32));
        }
        if let Some(m) = style.get("marginLeft").and_then(Value::as_f64) {
            frame = frame.ml(px(m as f32));
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
    story: Option<String>,
}

fn args() -> Args {
    let mut out = PathBuf::from("out");
    let (mut case, mut click, mut typed, mut story) = (None, None, None, None);
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
            "--story" => story = it.next(),
            _ => {}
        }
    }
    Args { out, case, click, typed, story }
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
                child: c.get("child").cloned(),
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

/// The window of a story capture, in points; the React Native story fixtures
/// use the same size.
const STORY_SIZE: (f32, f32) = (960., 1100.);

struct StoryFrame {
    story: gpui::AnyView,
    paddings: gpui::Pixels,
}

impl Render for StoryFrame {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        use gpui_component::ActiveTheme as _;
        div()
            .size_full()
            .bg(cx.theme().background)
            .text_color(cx.theme().foreground)
            .child(div().size_full().p(self.paddings).child(self.story.clone()))
    }
}

/// `Story::paddings` of the stories that override it.
fn story_paddings(name: &str) -> gpui::Pixels {
    match name {
        "dock" | "settings" | "welcome" | "chart" => px(0.),
        _ => px(16.),
    }
}

fn story_view(name: &str, window: &mut Window, cx: &mut App) -> gpui::AnyView {
    use story::stories::*;
    match name {
        "badge" => BadgeStory::new_view(window, cx).into(),
        "avatar" => AvatarStory::new_view(window, cx).into(),
        "button" => ButtonStory::new_view(window, cx).into(),
        "tag" => TagStory::new_view(window, cx).into(),
        "icon" => IconStory::new_view(window, cx).into(),
        "label" => LabelStory::new_view(window, cx).into(),
        "spinner" => SpinnerStory::new_view(window, cx).into(),
        "skeleton" => SkeletonStory::new_view(window, cx).into(),
        "progress" => ProgressStory::new_view(window, cx).into(),
        "switch" => SwitchStory::new_view(window, cx).into(),
        "checkbox" => CheckboxStory::new_view(window, cx).into(),
        "radio" => RadioStory::new_view(window, cx).into(),
        "rating" => RatingStory::new_view(window, cx).into(),
        "slider" => SliderStory::new_view(window, cx).into(),
        "kbd" => KbdStory::new_view(window, cx).into(),
        "separator" => SeparatorStory::new_view(window, cx).into(),
        "alert" => AlertStory::new_view(window, cx).into(),
        "toggle" => ToggleStory::new_view(window, cx).into(),
        "shimmer" => ShimmerStory::new_view(window, cx).into(),
        "breadcrumb" => BreadcrumbStory::new_view(window, cx).into(),
        "calendar" => CalendarStory::new_view(window, cx).into(),
        "clipboard" => ClipboardStory::new_view(window, cx).into(),
        "image" => ImageStory::new_view(window, cx).into(),
        "pagination" => PaginationStory::new_view(window, cx).into(),
        "group_box" => GroupBoxStory::new_view(window, cx).into(),
        "otp_input" => OtpInputStory::new_view(window, cx).into(),
        "time_field" => TimeFieldStory::new_view(window, cx).into(),
        "description_list" => DescriptionListStory::new_view(window, cx).into(),
        "empty" => EmptyStory::new_view(window, cx).into(),
        "number_input" => NumberInputStory::new_view(window, cx).into(),
        "color_picker" => ColorPickerStory::new_view(window, cx).into(),
        "date_picker" => DatePickerStory::new_view(window, cx).into(),
        "select" => SelectStory::new_view(window, cx).into(),
        "form" => FormStory::new_view(window, cx).into(),
        "textarea" => TextareaStory::new_view(window, cx).into(),
        "input" => InputStory::new_view(window, cx).into(),
        "input_group" => InputGroupStory::new_view(window, cx).into(),
        "combobox" => ComboboxStory::new_view(window, cx).into(),
        "table" => TableStory::new_view(window, cx).into(),
        "dock" => DockStory::new_view(window, cx).into(),
        "tree" => TreeStory::new_view(window, cx).into(),
        "speech" => SpeechStory::new_view(window, cx).into(),
        "tabs" => TabsStory::new_view(window, cx).into(),
        "tooltip" => TooltipStory::new_view(window, cx).into(),
        "stepper" => StepperStory::new_view(window, cx).into(),
        "status_bar" => StatusBarStory::new_view(window, cx).into(),
        "hover_card" => HoverCardStory::new_view(window, cx).into(),
        "notification" => NotificationStory::new_view(window, cx).into(),
        "dropdown_button" => DropdownButtonStory::new_view(window, cx).into(),
        "native_menu" => NativeMenuStory::new_view(window, cx).into(),
        "menu" => MenuStory::new_view(window, cx).into(),
        "popover" => PopoverStory::new_view(window, cx).into(),
        "alert_dialog" => AlertDialogStory::new_view(window, cx).into(),
        "dialog" => DialogStory::new_view(window, cx).into(),
        "sheet" => SheetStory::new_view(window, cx).into(),
        "accordion" => AccordionStory::new_view(window, cx).into(),
        "collapsible" => CollapsibleStory::new_view(window, cx).into(),
        "toolbar" => ToolbarStory::new_view(window, cx).into(),
        "resizable" => ResizableStory::new_view(window, cx).into(),
        "virtual_list" => VirtualListStory::new_view(window, cx).into(),
        "scrollbar" => ScrollbarStory::new_view(window, cx).into(),
        "welcome" => WelcomeStory::new_view(window, cx).into(),
        "bubble" => BubbleStory::new_view(window, cx).into(),
        "attachment" => AttachmentStory::new_view(window, cx).into(),
        "message" => MessageStory::new_view(window, cx).into(),
        "marker" => MarkerStory::new_view(window, cx).into(),
        "carousel" => CarouselStory::new_view(window, cx).into(),
        "command" => CommandStory::new_view(window, cx).into(),
        "list" => ListStory::new_view(window, cx).into(),
        "grid_layout" => GridLayoutStory::new_view(window, cx).into(),
        "settings" => SettingsStory::new_view(window, cx).into(),
        "diff" => DiffStory::new_view(window, cx).into(),
        "editor" => EditorStory::new_view(window, cx).into(),
        "sidebar" => SidebarStory::new_view(window, cx).into(),
        "questionnaire" => QuestionnaireStory::new_view(window, cx).into(),
        "message_scroller" => MessageScrollerStory::new_view(window, cx).into(),
        "theme_colors" => ThemeColorsStory::new_view(window, cx).into(),
        "chart" => ChartStory::new_view(window, cx).into(),
        "data_table" => DataTableStory::new_view(window, cx).into(),
        "shell" => ShellStory::new_view(window, cx).into(),
        other => panic!("no vendored story {other}"),
    }
}

/// Opens the official story `name` in a window of [`STORY_SIZE`] and saves
/// `<out>/story-<name>.png` once its images had time to load.
fn run_story(args: Rc<Args>, name: String) {
    gpui_platform::application()
        .with_assets(gpui_kit_assets::AllAssets)
        .with_http_client(std::sync::Arc::new(reqwest_client::ReqwestClient::new()))
        .run(move |cx: &mut App| {
            gpui_component::init(cx);
            cx.set_reduce_motion(true);
            cx.spawn(async move |cx| {
                let bounds = Bounds::new(
                    point(px(0.0), px(0.0)),
                    size(px(STORY_SIZE.0), px(STORY_SIZE.1)),
                );
                let displays: Vec<Option<gpui::DisplayId>> = cx
                    .update(|cx| cx.displays().iter().map(|d| Some(d.id())).collect::<Vec<_>>());
                let mut handle = None;
                for display_id in displays.into_iter().chain([None]) {
                    let options = WindowOptions {
                        window_bounds: Some(WindowBounds::Windowed(bounds)),
                        titlebar: None,
                        focus: false,
                        show: false,
                        display_id,
                        ..Default::default()
                    };
                    let name = name.clone();
                    let opened = cx
                        .open_window(options, move |window, cx| {
                            let view: gpui::AnyView =
                                if window.scale_factor() < 2.0 && display_id.is_some() {
                                    cx.new(|_| gpui::Empty).into()
                                } else {
                                    let story = story_view(&name, window, cx);
                                    let paddings = story_paddings(&name);
                                    cx.new(|_| StoryFrame { story, paddings }).into()
                                };
                            cx.new(|cx| gpui_base::Root::new(view, window, cx))
                        })
                        .expect("open window");
                    let scale = cx
                        .update_window(opened.into(), |_, window, _| window.scale_factor())
                        .unwrap_or(1.0);
                    if scale >= 2.0 || display_id.is_none() {
                        handle = Some(opened);
                        break;
                    }
                    let _ = cx.update_window(opened.into(), |_, window, _| window.remove_window());
                }
                let handle = handle.expect("open window");
                for _ in 0..100 {
                    cx.background_executor().timer(Duration::from_millis(100)).await;
                    let _ = cx.update_window(handle.into(), |_, window, app| {
                        window.refresh();
                        window.draw(app).clear(app);
                    });
                }
                let path = args.out.join(format!("story-{}.png", args.story.as_deref().unwrap_or("")));
                let _ = cx.update_window(handle.into(), |_, window, app| {
                    if let Err(error) = capture(window, app, &path) {
                        eprintln!("story: {error}");
                    }
                });
                let _ = cx.update(|cx| cx.quit());
            })
            .detach();
        });
}

fn main() {
    let args = Rc::new(args());
    std::fs::create_dir_all(&args.out).expect("out dir");
    if let Some(name) = args.story.clone() {
        run_story(args, name);
        return;
    }
    let selected: Vec<Rc<Case>> = cases()
        .into_iter()
        .filter(|c| args.case.as_ref().is_none_or(|id| *id == c.id))
        .collect();
    gpui_platform::application()
        .with_assets(gpui_kit_assets::AllAssets)
        .run(move |cx: &mut App| {
            gpui_component::init(cx);
            cx.set_reduce_motion(true);
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
