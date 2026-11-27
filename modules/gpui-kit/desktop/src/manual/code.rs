use std::cell::RefCell;
use std::rc::Rc;

use gpui::{
    AnyElement, AppContext as _, Entity, IntoElement, ParentElement as _, SharedString,
    Styled as _, Subscription, Window,
};
use gpui_component::diff::{
    Diff, DiffAnnotation, DiffChangeIndicator, DiffDecoration, DiffFile, DiffGutterMarker,
    DiffHoverHighlight, DiffHunkSeparator, DiffInlineUnit, DiffLinePosition, DiffLineRange,
    DiffMode, DiffSide, DiffState,
};
use gpui_component::input::InputEvent;
use gpui_component::input::{Editor, EditorState};

use crate::*;

pub struct GpuiKitEditor {
    state: Option<Entity<EditorState>>,
    subscription: Option<Subscription>,
    last: Rc<RefCell<String>>,
    applied: Option<(String, bool, bool, String, String)>,
    decorations: Decorations,
}

/// The decoration collections of the editor and the props they were made from.
#[derive(Default)]
struct Decorations {
    json: [String; 5],
    text: Option<gpui_base::input::TextDecorationCollection>,
    range: Option<gpui_base::input::RangeDecorationCollection>,
    gutter: Option<gpui_base::input::GutterDecorationCollection>,
    ruler: Option<gpui_base::input::OverviewRulerDecorationCollection>,
}

impl Decorations {
    fn apply(
        &mut self,
        props: &GpuiKitEditorProps,
        state: &Entity<EditorState>,
        app: &mut gpui::App,
    ) {
        use super::editor_extras as extras;
        let json = [
            props.decorations_json().to_string(),
            props.range_decorations_json().to_string(),
            props.gutter_decorations_json().to_string(),
            props.overview_ruler_decorations_json().to_string(),
            props.completions_json().to_string(),
        ];
        if self.json == json {
            return;
        }
        let changed: Vec<bool> = (0..5).map(|i| self.json[i] != json[i]).collect();
        self.json = json.clone();
        if changed[0] {
            let list = extras::text_decorations(&json[0], app);
            match &self.text {
                Some(collection) => collection.set(list, app),
                None => {
                    self.text = Some(state.update(app, |state, cx| {
                        state.create_decorations_collection(list, cx)
                    }))
                }
            }
        }
        if changed[1] {
            let list = extras::range_decorations(&json[1], app);
            match &self.range {
                Some(collection) => collection.set(list, app),
                None => {
                    self.range = Some(state.update(app, |state, cx| {
                        state.create_range_decorations_collection(list, cx)
                    }))
                }
            }
        }
        if changed[2] {
            let list = extras::gutter_decorations(&json[2], app);
            match &self.gutter {
                Some(collection) => collection.set(list, app),
                None if !list.is_empty() => {
                    self.gutter = Some(state.update(app, |state, cx| {
                        state.create_gutter_decorations_collection(list, cx)
                    }))
                }
                None => {}
            }
        }
        if changed[3] {
            let list = extras::overview_ruler_decorations(&json[3], app);
            match &self.ruler {
                Some(collection) => collection.set(list, app),
                None => {
                    self.ruler = Some(state.update(app, |state, cx| {
                        state.create_overview_ruler_decorations_collection(list, cx)
                    }))
                }
            }
        }
        if changed[4] {
            let completions = extras::completions(&json[4]);
            state.update(app, |state, cx| {
                let lsp = state.lsp_mut();
                match completions {
                    Some((words, mode)) => {
                        lsp.set_completion_highlighter(mode.highlighter());
                        lsp.completion_provider =
                            Some(Rc::new(extras::WordCompletions { words, mode }));
                    }
                    None => lsp.completion_provider = None,
                }
                cx.notify();
            });
        }
    }
}

impl GpuiKitEditorSpec for GpuiKitEditor {
    fn create(_props: &GpuiKitEditorProps, _cx: &mut GpuiKitEditorContext) -> Self {
        Self {
            state: None,
            subscription: None,
            last: Rc::new(RefCell::new(String::new())),
            applied: None,
            decorations: Decorations::default(),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitEditorProps,
        _changed: GpuiKitEditorChanged,
        _cx: &mut GpuiKitEditorContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitEditorProps,
        window: &mut Window,
        cx: &mut GpuiKitEditorContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let (language, line_number, soft_wrap) = (
            props.language().to_string(),
            props.line_number(),
            props.soft_wrap(),
        );
        let initial = if props.controlled() {
            props.value().to_string()
        } else {
            props.default_value().to_string()
        };
        let tab = (props.tab_size() > 0).then(|| gpui_base::input::TabSize {
            tab_size: props.tab_size() as usize,
            hard_tabs: props.hard_tabs(),
        });
        let state = self
            .state
            .get_or_insert_with(|| {
                app.new(|cx| {
                    let mut state = EditorState::new(window, cx)
                        .line_number(line_number)
                        .soft_wrap(soft_wrap);
                    if !language.is_empty() {
                        state = state.language(language.clone());
                    }
                    if let Some(tab) = tab {
                        state = state.tab_size(tab);
                    }
                    if !initial.is_empty() {
                        state = state.default_value(initial.clone());
                    }
                    state
                })
            })
            .clone();
        if self.subscription.is_none() {
            let last = self.last.clone();
            self.subscription =
                Some(app.subscribe(&state, move |state, event: &InputEvent, cx| {
                    if let InputEvent::Change = event {
                        let text = state.read(cx).value().to_string();
                        *last.borrow_mut() = text.clone();
                        sender.gpui_kit_editor_change(OnGpuiKitEditorChange { text });
                    }
                }));
        }
        let wanted = (
            language,
            props.folding(),
            props.indent_guides(),
            props.fold_placeholder().to_string(),
            props.scrollbar_style_json().to_string(),
        );
        if self.applied.as_ref() != Some(&wanted) {
            let previous = self.applied.replace(wanted.clone());
            let (language, folding, indent_guides, placeholder, scrollbar) = wanted;
            state.update(app, |state, cx| {
                if previous.as_ref().is_some_and(|p| p.0 != language) {
                    state.set_highlighter(language, cx);
                }
                state.set_folding(folding, window, cx);
                state.set_indent_guides(indent_guides, window, cx);
                state.set_fold_placeholder_renderer(
                    (!placeholder.is_empty()).then(|| {
                        let text = SharedString::from(placeholder);
                        Rc::new(move |_row: usize| {
                            gpui::div()
                                .px_1()
                                .rounded_sm()
                                .text_color(gpui::rgb(0x808080))
                                .child(text.clone())
                                .into_any_element()
                        }) as gpui_base::input::FoldPlaceholderRenderer
                    }),
                    cx,
                );
                state.set_scrollbar_renderer(crate::manual::rules::scrollbar(&scrollbar));
            });
        }
        if props.controlled() && *self.last.borrow() != props.value() {
            let wanted = props.value().to_string();
            *self.last.borrow_mut() = wanted.clone();
            state.update(app, |state, cx| state.set_value(wanted, window, cx));
        }
        self.decorations.apply(props, &state, app);
        let mut editor = Editor::new(&state)
            .bordered(props.bordered())
            .disabled(props.disabled())
            .readonly(props.readonly());
        if !props.font_family().is_empty() {
            editor = gpui::Styled::font_family(editor, props.font_family().to_string());
        }
        if props.font_size() > 0.0 {
            editor = gpui::Styled::text_size(editor, gpui::px(props.font_size() as f32));
        }
        let editor = gpui::Styled::size_full(editor).into_any_element();
        let theme = props.highlight_theme();
        let colors: Option<serde_json::Value> =
            serde_json::from_str(props.editor_style_json()).ok();
        if matches!(theme, GpuiKitEditorHighlightTheme::App) && colors.is_none() {
            return editor;
        }
        let state = state.downgrade();
        AfterLayout {
            child: editor,
            after: Some(Box::new(move |_window, cx| {
                let Some(state) = state.upgrade() else {
                    return;
                };
                let style = editor_style(theme, colors.as_ref(), cx);
                state.update(cx, |state, _| state.set_editor_style(style));
            })),
        }
        .into_any_element()
    }
}

/// The kit's own editor style, from the app theme, with the chosen highlight
/// theme and any colors the style object sets.
fn editor_style(
    theme: GpuiKitEditorHighlightTheme,
    colors: Option<&serde_json::Value>,
    cx: &gpui::App,
) -> gpui_base::input::InputEditorStyle {
    use gpui_component::highlighter::HighlightTheme;
    use gpui_component::ActiveTheme as _;
    let app = cx.theme();
    let highlight = match theme {
        GpuiKitEditorHighlightTheme::Light => HighlightTheme::default_light(),
        GpuiKitEditorHighlightTheme::Dark => HighlightTheme::default_dark(),
        GpuiKitEditorHighlightTheme::App => app.highlight_theme.clone(),
    };
    let pick = |key: &str, fallback: gpui::Hsla| {
        crate::manual::rules::color(colors.and_then(|c| c.get(key))).unwrap_or(fallback)
    };
    let pick_opt = |key: &str, fallback: Option<gpui::Hsla>| {
        crate::manual::rules::color(colors.and_then(|c| c.get(key))).or(fallback)
    };
    gpui_base::input::InputEditorStyle {
        foreground: pick("foreground", app.foreground),
        muted_foreground: pick("mutedForeground", app.muted_foreground),
        background: pick(
            "background",
            highlight
                .style
                .editor_background
                .unwrap_or_else(|| app.input_background()),
        ),
        border: pick("border", app.border),
        selection: pick("selection", app.selection),
        caret: pick("caret", app.caret),
        diagnostics: gpui_base::input::DiagnosticColors {
            error: highlight.style.status.error(cx),
            warning: highlight.style.status.warning(cx),
            info: highlight.style.status.info(cx),
            hint: highlight.style.status.hint(cx),
        },
        editor_invisible: pick_opt("invisible", highlight.style.editor_invisible),
        editor_active_line: pick_opt("activeLine", highlight.style.editor_active_line),
        editor_gutter_background: pick_opt(
            "gutterBackground",
            highlight.style.editor_gutter_background,
        ),
        fold_icon_renderer: Some(Rc::new(|ix, is_folded| {
            use gpui_component::button::{Button, ButtonRounded, ButtonVariants as _};
            use gpui_component::{IconName, Selectable as _, Sizable as _};
            Button::new(("fold-icon", ix))
                .ghost()
                .icon(if is_folded {
                    IconName::ChevronRight
                } else {
                    IconName::ChevronDown
                })
                .xsmall()
                .rounded(ButtonRounded::Small)
                .size(gpui::px(14.))
                .selected(is_folded)
                .into_any_element()
        })),
        highlight_styles: highlight,
    }
}

/// Lays its child out, then runs `after`: the kit's input element projects its
/// editor style while it lays out, so a style set here is the one it paints.
struct AfterLayout {
    child: AnyElement,
    after: Option<Box<dyn FnOnce(&mut Window, &mut gpui::App)>>,
}

impl IntoElement for AfterLayout {
    type Element = Self;

    fn into_element(self) -> Self {
        self
    }
}

impl gpui::Element for AfterLayout {
    type RequestLayoutState = ();
    type PrepaintState = ();

    fn id(&self) -> Option<gpui::ElementId> {
        None
    }

    fn source_location(&self) -> Option<&'static std::panic::Location<'static>> {
        None
    }

    fn request_layout(
        &mut self,
        _id: Option<&gpui::GlobalElementId>,
        _inspector_id: Option<&gpui::InspectorElementId>,
        window: &mut Window,
        cx: &mut gpui::App,
    ) -> (gpui::LayoutId, ()) {
        let layout = self.child.request_layout(window, cx);
        if let Some(after) = self.after.take() {
            after(window, cx);
        }
        (layout, ())
    }

    fn prepaint(
        &mut self,
        _id: Option<&gpui::GlobalElementId>,
        _inspector_id: Option<&gpui::InspectorElementId>,
        _bounds: gpui::Bounds<gpui::Pixels>,
        _request_layout: &mut (),
        window: &mut Window,
        cx: &mut gpui::App,
    ) {
        self.child.prepaint(window, cx);
    }

    fn paint(
        &mut self,
        _id: Option<&gpui::GlobalElementId>,
        _inspector_id: Option<&gpui::InspectorElementId>,
        _bounds: gpui::Bounds<gpui::Pixels>,
        _request_layout: &mut (),
        _prepaint: &mut (),
        window: &mut Window,
        cx: &mut gpui::App,
    ) {
        self.child.paint(window, cx);
    }
}

pub struct GpuiKitDiff {
    state: Option<Entity<DiffState>>,
    files: String,
    /// The state settings last applied, so a prop change reaches the state once.
    applied: Option<(DiffMode, i32, String)>,
}

#[derive(Default, serde::Deserialize)]
#[serde(default)]
struct FileSpec {
    kind: String,
    patch: String,
    path: String,
    text: String,
}

#[derive(Default, serde::Deserialize)]
#[serde(default)]
struct LineSpec {
    id: String,
    path: String,
    side: String,
    line: usize,
    start: usize,
    end: usize,
    label: String,
}

fn side_of(side: &str) -> DiffSide {
    if side == "original" {
        DiffSide::Original
    } else {
        DiffSide::Modified
    }
}

fn side_name(side: DiffSide) -> &'static str {
    match side {
        DiffSide::Original => "original",
        _ => "modified",
    }
}

fn files_of(props: &GpuiKitDiffProps) -> Vec<DiffFile> {
    if props.files_json().is_empty() {
        return DiffFile::parse(props.patch()).unwrap_or_default();
    }
    let specs: Vec<FileSpec> = serde_json::from_str(props.files_json()).unwrap_or_default();
    specs
        .into_iter()
        .flat_map(|spec| match spec.kind.as_str() {
            "conflicts" => DiffFile::parse_conflicts(spec.path, &spec.text)
                .map(|file| vec![file])
                .unwrap_or_default(),
            "unchanged" => vec![DiffFile::unchanged(spec.path, &spec.text)],
            _ => DiffFile::parse(&spec.patch).unwrap_or_default(),
        })
        .collect()
}

fn lines_of(json: &str) -> Vec<LineSpec> {
    serde_json::from_str(json).unwrap_or_default()
}

impl GpuiKitDiff {
    fn with_state(
        &self,
        cx: &mut GpuiKitDiffContext,
        f: impl FnOnce(&mut DiffState, &mut gpui::Context<DiffState>),
    ) {
        if let (Some(state), Some(app)) = (self.state.clone(), cx.app()) {
            state.update(app, f);
        }
    }
}

impl GpuiKitDiffSpec for GpuiKitDiff {
    fn create(_props: &GpuiKitDiffProps, _cx: &mut GpuiKitDiffContext) -> Self {
        Self {
            state: None,
            files: String::new(),
            applied: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitDiffProps,
        _changed: GpuiKitDiffChanged,
        _cx: &mut GpuiKitDiffContext,
    ) {
    }

    fn next_change(&mut self, cx: &mut GpuiKitDiffContext) {
        self.with_state(cx, |state, cx| state.next_change(cx));
    }

    fn previous_change(&mut self, cx: &mut GpuiKitDiffContext) {
        self.with_state(cx, |state, cx| state.previous_change(cx));
    }

    fn expand_unchanged(&mut self, cx: &mut GpuiKitDiffContext) {
        self.with_state(cx, |state, cx| state.expand_unchanged(cx));
    }

    fn collapse_unchanged(&mut self, cx: &mut GpuiKitDiffContext) {
        self.with_state(cx, |state, cx| state.collapse_unchanged(cx));
    }

    fn render(
        &mut self,
        props: &GpuiKitDiffProps,
        _window: &mut Window,
        cx: &mut GpuiKitDiffContext,
    ) -> AnyElement {
        let renderers = Rc::new(super::slots::Renderers::new(props.slots()));
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let state = self
            .state
            .get_or_insert_with(|| app.new(|cx| DiffState::new(Vec::<DiffFile>::new(), cx)))
            .clone();
        let key = format!("{}\u{0}{}", props.patch(), props.files_json());
        if self.files != key {
            self.files = key;
            let files = files_of(props);
            let has_changes = files.iter().any(DiffFile::has_changes);
            state.update(app, |state, cx| state.set_files(files, cx));
            sender.gpui_kit_diff_files_change(OnGpuiKitDiffFilesChange { has_changes });
        }
        let mode = if props.mode() == "split" {
            DiffMode::Split
        } else {
            DiffMode::Unified
        };
        let settings = (mode, props.context_lines(), props.inline_unit().to_string());
        if self.applied.as_ref() != Some(&settings) {
            let first = self.applied.is_none();
            self.applied = Some(settings.clone());
            let (mode, context, inline) = settings;
            state.update(app, |state, cx| {
                if state.mode() != mode {
                    state.set_mode(mode, cx);
                }
                if context != -2 || !first {
                    let lines = match context {
                        -1 => None,
                        -2 => Some(3),
                        lines => Some(lines.max(0) as usize),
                    };
                    if state.context_lines() != lines {
                        state.set_context_lines(lines, cx);
                    }
                }
                let unit = match inline.as_str() {
                    "character" => Some(DiffInlineUnit::Character),
                    "none" => None,
                    _ => Some(DiffInlineUnit::Word),
                };
                if state.inline_unit() != unit {
                    state.set_inline_unit(unit, cx);
                }
            });
        }
        let mut diff = Diff::new(&state)
            .line_number(props.line_numbers())
            .syntax_highlight(props.syntax_highlight())
            .header_visible(props.header())
            .soft_wrap(props.soft_wrap())
            .change_background(props.change_background())
            .hunk_separator(match props.hunk_separator() {
                "line-info" => DiffHunkSeparator::LineInfo,
                "simple" => DiffHunkSeparator::Simple,
                _ => DiffHunkSeparator::Metadata,
            })
            .change_indicator(match props.change_indicator() {
                "bars" => DiffChangeIndicator::Bars,
                "none" => DiffChangeIndicator::None,
                _ => DiffChangeIndicator::Signs,
            })
            .hover_highlight(match props.hover_highlight() {
                "line" => DiffHoverHighlight::Line,
                "line-number" => DiffHoverHighlight::LineNumber,
                "both" => DiffHoverHighlight::Both,
                _ => DiffHoverHighlight::None,
            });
        let decorations = lines_of(props.decorations_json());
        if !decorations.is_empty() {
            diff = diff.decorations(decorations.into_iter().map(|line| {
                DiffDecoration::new(DiffLineRange::new(
                    line.path,
                    side_of(&line.side),
                    line.start,
                    line.end,
                ))
            }));
        }
        let markers = lines_of(props.markers_json());
        if !markers.is_empty() {
            diff = diff.gutter_markers(markers.into_iter().map(|line| {
                let position = DiffLinePosition::new(line.path, side_of(&line.side), line.line);
                DiffGutterMarker::new(SharedString::from(line.id), position).with_label(line.label)
            }));
            let renderers = renderers.clone();
            diff = diff.render_gutter_marker(move |marker, window, cx| {
                gpui::div().children(
                    renderers
                        .get(&format!("marker:{}", marker.id()))
                        .map(|render| render(window, cx)),
                )
            });
        }
        let annotations = lines_of(props.annotations_json());
        if !annotations.is_empty() {
            diff = diff.annotations(annotations.into_iter().map(|line| {
                let position = DiffLinePosition::new(line.path, side_of(&line.side), line.line);
                DiffAnnotation::line(SharedString::from(line.id), position)
            }));
            let renderers = renderers.clone();
            diff = diff.render_annotation(move |annotation, window, cx| {
                gpui::div().w_full().children(
                    renderers
                        .get(&format!("annotation:{}", annotation.id()))
                        .map(|render| render(window, cx)),
                )
            });
        }
        if props.add_annotation_events() {
            diff = diff.on_add_annotation(move |range, _, _| {
                sender.gpui_kit_diff_add_annotation(OnGpuiKitDiffAddAnnotation {
                    path: range.path().to_string(),
                    side: side_name(range.side()).to_string(),
                    start: range.start() as i32,
                    end: range.end() as i32,
                    end_side: side_name(range.end_side()).to_string(),
                });
            });
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut diff), &style);
        }
        diff.into_any_element()
    }
}
