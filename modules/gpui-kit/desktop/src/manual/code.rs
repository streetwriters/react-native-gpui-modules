use std::cell::RefCell;
use std::rc::Rc;

use gpui::{
    AnyElement, AppContext as _, Entity, IntoElement, ParentElement as _, SharedString, Styled as _,
    Subscription, Window,
};
use gpui_component::diff::{Diff, DiffFile, DiffState};
use gpui_component::input::InputEvent;
use gpui_component::input::{Editor, EditorState};

use crate::*;

pub struct GpuiKitEditor {
    state: Option<Entity<EditorState>>,
    subscription: Option<Subscription>,
    last: Rc<RefCell<String>>,
    applied: Option<(String, bool, bool, String, String)>,
}

impl GpuiKitEditorSpec for GpuiKitEditor {
    fn create(_props: &GpuiKitEditorProps, _cx: &mut GpuiKitEditorContext) -> Self {
        Self {
            state: None,
            subscription: None,
            last: Rc::new(RefCell::new(String::new())),
            applied: None,
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
        let state = self
            .state
            .get_or_insert_with(|| {
                app.new(|cx| {
                    let state = EditorState::new(window, cx)
                        .line_number(line_number)
                        .soft_wrap(soft_wrap);
                    if language.is_empty() {
                        state
                    } else {
                        state.language(language.clone())
                    }
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
        let editor = Editor::new(&state)
            .bordered(props.bordered())
            .disabled(props.disabled())
            .readonly(props.readonly())
            .into_any_element();
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
        background: pick("background", app.editor_background()),
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
            use gpui_component::{IconName, Selectable as _, Sizable as _, StyledExt as _};
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
    patch: String,
}

impl GpuiKitDiffSpec for GpuiKitDiff {
    fn create(_props: &GpuiKitDiffProps, _cx: &mut GpuiKitDiffContext) -> Self {
        Self {
            state: None,
            patch: String::new(),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitDiffProps,
        _changed: GpuiKitDiffChanged,
        _cx: &mut GpuiKitDiffContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitDiffProps,
        _window: &mut Window,
        cx: &mut GpuiKitDiffContext,
    ) -> AnyElement {
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let patch = props.patch().to_string();
        let files = DiffFile::parse(&patch).unwrap_or_default();
        let state = self
            .state
            .get_or_insert_with(|| app.new(|cx| DiffState::new(Vec::<DiffFile>::new(), cx)))
            .clone();
        if self.patch != patch {
            self.patch = patch;
            state.update(app, |state, cx| state.set_files(files, cx));
        }
        Diff::new(&state)
            .line_number(props.line_numbers())
            .syntax_highlight(props.syntax_highlight())
            .header_visible(props.header())
            .soft_wrap(props.soft_wrap())
            .into_any_element()
    }
}
