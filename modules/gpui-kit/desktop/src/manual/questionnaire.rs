use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use gpui::{
    AnyElement, AppContext as _, Context, Entity, IntoElement, ParentElement as _, SharedString,
    Styled as _, Subscription, Window,
};
use gpui_component::input::InputState;
use gpui_component::kbd::Kbd;
use gpui_component::questionnaire::{
    Questionnaire, QuestionnaireActions, QuestionnaireAnswer, QuestionnaireChoice,
    QuestionnaireChoiceDefinition, QuestionnaireChoices, QuestionnaireDescription,
    QuestionnaireError, QuestionnaireEvent, QuestionnaireInput, QuestionnaireInputDefinition,
    QuestionnaireItem, QuestionnaireItemDefinition, QuestionnaireItemStatus, QuestionnaireNext,
    QuestionnairePrevious, QuestionnaireProgress, QuestionnaireShortcutMode, QuestionnaireSkip,
    QuestionnaireState, QuestionnaireSubmission, QuestionnaireSubmit, QuestionnaireTitle,
};
use gpui_component::{Sizable as _, Size};
use serde::Deserialize;
use serde_json::{json, Map, Value};

use super::slots::{Renderers, Slots};
use crate::*;

const SEPARATOR: &str = "\u{1}";

#[derive(Default, Deserialize, Debug)]
#[serde(default, rename_all = "camelCase")]
struct ChoiceSpec {
    value: String,
    label: String,
    description: String,
    disabled: bool,
    selected: bool,
    /// The choice's content is slot `choice:<item>:<value>` instead of its label.
    content: bool,
    /// Its indicator is slot `indicator:<item>:<value>`.
    indicator: bool,
    /// Its shortcut shows as a keyboard key, `outline` or `default`.
    shortcut_kbd: String,
    content_style: String,
    indicator_style: String,
    shortcut_style: String,
}

#[derive(Default, Deserialize, Debug)]
#[serde(default, rename_all = "camelCase")]
struct InputSpec {
    label: String,
    placeholder: String,
    default_value: String,
}

#[derive(Default, Deserialize, Debug)]
#[serde(default, rename_all = "camelCase")]
struct ItemSpec {
    name: String,
    label: String,
    description: String,
    required: bool,
    multiple: bool,
    disabled: bool,
    input: Option<InputSpec>,
    /// Declarative rules, as JSON.
    validation: String,
    /// An error the host owns, shown from the start.
    external_error: String,
    choices: Vec<ChoiceSpec>,
}

pub struct GpuiKitQuestionnaire {
    state: Option<Entity<QuestionnaireState>>,
    signature: String,
    inputs: HashMap<String, Entity<InputState>>,
    subscriptions: Vec<Subscription>,
    reporter: Option<Reporter>,
}

/// Sends the snapshot when it changes; focus is read while rendering, which
/// has the window.
#[derive(Clone)]
struct Reporter {
    names: Rc<Vec<String>>,
    focus: Rc<RefCell<String>>,
    last: Rc<RefCell<String>>,
    sender: GpuiKitQuestionnaireEventSender,
}

impl Reporter {
    fn report(&self, state: &Entity<QuestionnaireState>, cx: &gpui::App) {
        let json = snapshot(state.read(cx), &self.names, &self.focus.borrow(), cx);
        if *self.last.borrow() != json {
            *self.last.borrow_mut() = json.clone();
            self.sender
                .gpui_kit_questionnaire_state_change(OnGpuiKitQuestionnaireStateChange {
                    state: json,
                });
        }
    }
}

fn answer_value(answer: &QuestionnaireAnswer) -> Value {
    json!({
        "choices": answer.choices().iter().map(|c| c.to_string()).collect::<Vec<_>>(),
        "freeform": answer.freeform().map(|text| text.to_string()),
    })
}

fn submission_json(submission: &QuestionnaireSubmission) -> String {
    let mut out = Map::new();
    for item in submission.items() {
        if item.status() != QuestionnaireItemStatus::Skipped {
            out.insert(item.name().to_string(), answer_value(item.answer()));
        }
    }
    Value::Object(out).to_string()
}

/// Every item of a submission in order, with its status and answer.
fn submission_items(submission: &QuestionnaireSubmission) -> String {
    Value::Array(
        submission
            .items()
            .iter()
            .map(|item| {
                let mut value = answer_value(item.answer());
                value["name"] = Value::from(item.name().to_string());
                value["status"] = Value::from(status_name(item.status()));
                value
            })
            .collect(),
    )
    .to_string()
}

fn status_name(status: QuestionnaireItemStatus) -> &'static str {
    match status {
        QuestionnaireItemStatus::Answered => "answered",
        QuestionnaireItemStatus::Skipped => "skipped",
        _ => "unanswered",
    }
}

/// What the questionnaire shows: the current item, the navigation, each
/// item's status and error, the answers in order, the free-text drafts and
/// what has focus.
fn snapshot(state: &QuestionnaireState, names: &[String], focus: &str, cx: &gpui::App) -> String {
    let navigation = state.navigation_state();
    let mut items = Map::new();
    for name in names {
        if let Some(item) = state.item_state(name) {
            items.insert(
                name.clone(),
                json!({
                    "status": status_name(item.status()),
                    "disabled": item.is_disabled(),
                    "error": state
                        .error(name)
                        .and_then(|error| error.message())
                        .map(|message| message.to_string()),
                }),
            );
        }
    }
    let mut answers = Map::new();
    let mut order = Vec::new();
    for (name, answer) in state.answers().iter() {
        answers.insert(name.to_string(), answer_value(answer));
        order.push(Value::from(name.to_string()));
    }
    let mut drafts = Map::new();
    for name in names {
        if let Some(input) = state.input_state(name) {
            drafts.insert(
                name.clone(),
                Value::from(input.read(cx).value().to_string()),
            );
        }
    }
    json!({
        "current": state.current_item().map(|name| name.to_string()),
        "total": state.total(),
        "complete": state.is_complete(),
        "navigation": {
            "previous": navigation.is_previous_visible(),
            "next": navigation.is_next_visible(),
            "skip": navigation.is_skip_visible(),
            "submit": navigation.is_submit_visible(),
            "confirmable": navigation.is_confirmable(),
        },
        "items": items,
        "answers": answers,
        "answerOrder": order,
        "drafts": drafts,
        "focus": focus,
    })
    .to_string()
}

fn valid(definitions: &[QuestionnaireItemDefinition]) -> bool {
    let mut names = std::collections::HashSet::new();
    definitions.iter().all(|item| {
        let mut values = std::collections::HashSet::new();
        let defaults = item
            .choices()
            .iter()
            .filter(|choice| choice.is_default_selected())
            .count();
        names.insert(item.name().to_string())
            && item
                .choices()
                .iter()
                .all(|choice| values.insert(choice.value().to_string()))
            && (item.is_multiple() || defaults <= 1)
    })
}

impl GpuiKitQuestionnaireSpec for GpuiKitQuestionnaire {
    fn create(_props: &GpuiKitQuestionnaireProps, _cx: &mut GpuiKitQuestionnaireContext) -> Self {
        Self {
            state: None,
            signature: String::new(),
            inputs: HashMap::new(),
            subscriptions: Vec::new(),
            reporter: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitQuestionnaireProps,
        _changed: GpuiKitQuestionnaireChanged,
        _cx: &mut GpuiKitQuestionnaireContext,
    ) {
    }

    fn next(&mut self, cx: &mut GpuiKitQuestionnaireContext) {
        self.run(cx, |state, window, cx| {
            state.go_next(window, cx);
        });
    }

    fn previous(&mut self, cx: &mut GpuiKitQuestionnaireContext) {
        self.run(cx, |state, window, cx| {
            state.go_previous(window, cx);
        });
    }

    fn skip(&mut self, cx: &mut GpuiKitQuestionnaireContext) {
        self.run(cx, |state, window, cx| {
            state.skip_current(window, cx);
        });
    }

    fn submit(&mut self, cx: &mut GpuiKitQuestionnaireContext) {
        self.run(cx, |state, window, cx| {
            state.submit(window, cx);
        });
    }

    fn reset(&mut self, cx: &mut GpuiKitQuestionnaireContext) {
        self.run(cx, |state, window, cx| state.reset(window, cx));
    }

    fn set_external_error(
        &mut self,
        item: String,
        message: String,
        cx: &mut GpuiKitQuestionnaireContext,
    ) {
        self.run(cx, move |state, _, cx| {
            let _ = state.set_external_error(&item, message, cx);
        });
    }

    fn clear_external_error(&mut self, item: String, cx: &mut GpuiKitQuestionnaireContext) {
        self.run(cx, move |state, _, cx| {
            let _ = state.clear_external_error(&item, cx);
        });
    }

    fn set_answer(&mut self, item: String, answer: String, cx: &mut GpuiKitQuestionnaireContext) {
        let value: Value = serde_json::from_str(&answer).unwrap_or_default();
        let choices: Vec<String> = value
            .get("choices")
            .and_then(Value::as_array)
            .map(|list| {
                list.iter()
                    .filter_map(Value::as_str)
                    .map(str::to_string)
                    .collect()
            })
            .unwrap_or_default();
        let freeform = value
            .get("freeform")
            .and_then(Value::as_str)
            .map(str::to_string);
        self.run(cx, move |state, window, cx| {
            let mut answer = QuestionnaireAnswer::new().with_choices(choices);
            if let Some(freeform) = freeform {
                answer = answer.with_freeform(freeform);
            }
            let _ = state.set_answer(&item, answer, window, cx);
        });
    }

    fn set_current_item(&mut self, item: String, cx: &mut GpuiKitQuestionnaireContext) {
        self.run(cx, move |state, window, cx| {
            let _ = state.set_current_item(&item, window, cx);
        });
    }

    fn set_item_disabled(
        &mut self,
        item: String,
        disabled: bool,
        cx: &mut GpuiKitQuestionnaireContext,
    ) {
        self.run(cx, move |state, window, cx| {
            let _ = state.set_item_disabled(&item, disabled, window, cx);
        });
    }

    fn render(
        &mut self,
        props: &GpuiKitQuestionnaireProps,
        window: &mut Window,
        cx: &mut GpuiKitQuestionnaireContext,
    ) -> AnyElement {
        let renderers = Rc::new(Renderers::new(props.slots()));
        let mut slots = Slots::new(props.slots(), cx.children());
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let items: Vec<ItemSpec> = serde_json::from_str(props.items_json()).unwrap_or_default();
        let shortcuts = match props.shortcuts() {
            GpuiKitQuestionnaireShortcuts::Numbers => Some(QuestionnaireShortcutMode::Numbers),
            GpuiKitQuestionnaireShortcuts::Letters => Some(QuestionnaireShortcutMode::Letters),
            _ => None,
        };
        let signature = format!("{items:?}|{shortcuts:?}");
        if self.signature != signature || self.state.is_none() {
            self.signature = signature;
            let definitions: Vec<QuestionnaireItemDefinition> = items
                .iter()
                .map(|item| self.definition(item, window, app))
                .collect();
            if !valid(&definitions) {
                self.state = None;
                return gpui::div().into_any_element();
            }
            let errors: Vec<(String, String)> = items
                .iter()
                .filter(|item| !item.external_error.is_empty())
                .map(|item| (item.name.clone(), item.external_error.clone()))
                .collect();
            let state = app.new(|cx: &mut Context<QuestionnaireState>| {
                let mut state = QuestionnaireState::new(definitions, cx).expect("a valid schema");
                if let Some(mode) = shortcuts {
                    state = state.with_shortcuts(mode);
                }
                for (item, message) in errors {
                    let _ = state.set_external_error(&item, message, cx);
                }
                state
            });
            let reporter = Reporter {
                names: Rc::new(items.iter().map(|item| item.name.clone()).collect()),
                focus: Rc::default(),
                last: Rc::default(),
                sender: sender.clone(),
            };
            self.subscriptions = subscribe(&state, reporter.clone(), sender, app);
            self.reporter = Some(reporter);
            self.state = Some(state);
        }
        let Some(state) = self.state.clone() else {
            return gpui::div().into_any_element();
        };
        if let Some(reporter) = &self.reporter {
            let current = state.read(app);
            let focus = if current.is_current_input_focused(window) {
                "input".to_string()
            } else if let Some(choice) = current.focused_current_choice(window) {
                format!("choice:{choice}")
            } else {
                String::new()
            };
            if *reporter.focus.borrow() != focus {
                *reporter.focus.borrow_mut() = focus;
                reporter.report(&state, app);
            }
        }
        let mut root = Questionnaire::new(&state);
        match props.size() {
            GpuiKitQuestionnaireSize::Unset => {}
            GpuiKitQuestionnaireSize::Xsmall => root = root.with_size(Size::XSmall),
            GpuiKitQuestionnaireSize::Small => root = root.with_size(Size::Small),
            GpuiKitQuestionnaireSize::Medium => root = root.with_size(Size::Medium),
            GpuiKitQuestionnaireSize::Large => root = root.with_size(Size::Large),
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut root), &style);
        }
        if props.show_progress() {
            root = root.child(QuestionnaireProgress::new(&state));
        }
        for item in items {
            root = root.child(item_view(&state, item, &renderers, &mut slots));
        }
        let leading = slots.take("actions-leading");
        let custom = slots.take("actions");
        let kit: Vec<&str> = match props.kit_actions() {
            "" => vec!["previous", "skip", "next", "submit"],
            list => list.split(',').collect(),
        };
        if kit.iter().any(|name| *name != "none") || custom.is_some() || leading.is_some() {
            let mut actions = QuestionnaireActions::new(&state);
            if let Some(leading) = leading {
                actions = actions.child(leading);
            }
            if let Some(custom) = custom {
                actions = actions.child(gpui::div().flex_1().min_w_0().child(custom));
            }
            for name in kit {
                actions = match name {
                    "previous" => actions.child(QuestionnairePrevious::new(&state)),
                    "skip" => actions.child(QuestionnaireSkip::new(&state)),
                    "next" => actions.child(QuestionnaireNext::new(&state)),
                    "submit" => actions.child(QuestionnaireSubmit::new(&state)),
                    _ => actions,
                };
            }
            root = root.child(actions);
        }
        root.into_any_element()
    }
}

impl GpuiKitQuestionnaire {
    fn definition(
        &mut self,
        item: &ItemSpec,
        window: &mut Window,
        app: &mut gpui::App,
    ) -> QuestionnaireItemDefinition {
        let mut definition =
            QuestionnaireItemDefinition::new(item.name.clone(), item.label.clone())
                .with_required(item.required)
                .with_multiple(item.multiple)
                .with_disabled(item.disabled);
        if !item.description.is_empty() {
            definition = definition.with_description(item.description.clone());
        }
        if let Some(rules) = crate::manual::rules::Rules::parse(&item.validation) {
            definition = definition.with_validator(move |context| {
                let answer = context.answer();
                let text = match answer.freeform() {
                    Some(text) => text.to_string(),
                    None => answer
                        .choices()
                        .iter()
                        .map(|choice| choice.to_string())
                        .collect::<Vec<_>>()
                        .join(","),
                };
                rules.check(&text).map_err(SharedString::from)
            });
        }
        definition = definition.with_choices(item.choices.iter().map(|choice| {
            let mut def =
                QuestionnaireChoiceDefinition::new(choice.value.clone(), choice.label.clone())
                    .with_disabled(choice.disabled)
                    .with_default_selected(choice.selected);
            if !choice.description.is_empty() {
                def = def.with_description(choice.description.clone());
            }
            def
        }));
        if let Some(input) = &item.input {
            let (placeholder, value) = (input.placeholder.clone(), input.default_value.clone());
            let state = self
                .inputs
                .entry(item.name.clone())
                .or_insert_with(|| {
                    app.new(|cx| {
                        let mut state = InputState::new(window, cx);
                        if !placeholder.is_empty() {
                            state = state.placeholder(placeholder);
                        }
                        if !value.is_empty() {
                            state = state.default_value(value);
                        }
                        state
                    })
                })
                .clone();
            let label = if input.label.is_empty() {
                item.label.clone()
            } else {
                input.label.clone()
            };
            definition = definition.with_input(QuestionnaireInputDefinition::new(state, label));
        }
        definition
    }

    fn run(
        &self,
        cx: &mut GpuiKitQuestionnaireContext,
        action: impl FnOnce(&mut QuestionnaireState, &mut Window, &mut Context<QuestionnaireState>)
            + 'static,
    ) {
        let Some(state) = self.state.clone() else {
            return;
        };
        cx.with_window(|window, app| {
            state.update(app, |state, cx| action(state, window, cx));
        });
    }
}

fn subscribe(
    state: &Entity<QuestionnaireState>,
    reporter: Reporter,
    events: GpuiKitQuestionnaireEventSender,
    app: &mut gpui::App,
) -> Vec<Subscription> {
    reporter.report(state, app);
    vec![
        app.observe(state, move |state, cx| reporter.report(&state, cx)),
        app.subscribe(
            state,
            move |_, event: &QuestionnaireEvent, _cx| match event {
                QuestionnaireEvent::AnswerChanged(change) => {
                    let answer = change.answer();
                    events.gpui_kit_questionnaire_answer(OnGpuiKitQuestionnaireAnswer {
                        item: change.item().to_string(),
                        status: status_name(change.status()).to_string(),
                        choices: answer
                            .choices()
                            .iter()
                            .map(|choice| choice.to_string())
                            .collect::<Vec<_>>()
                            .join(SEPARATOR),
                        freeform: answer
                            .freeform()
                            .map(|text| text.to_string())
                            .unwrap_or_default(),
                    });
                }
                QuestionnaireEvent::CurrentItemChanged { current, .. } => {
                    events.gpui_kit_questionnaire_item_change(OnGpuiKitQuestionnaireItemChange {
                        current: current
                            .as_ref()
                            .map(|name| name.to_string())
                            .unwrap_or_default(),
                    });
                }
                QuestionnaireEvent::Completed(submission) => {
                    events.gpui_kit_questionnaire_complete(OnGpuiKitQuestionnaireComplete {
                        answers: submission_json(submission),
                        items: submission_items(submission),
                    });
                }
                QuestionnaireEvent::Submit(submission) => {
                    events.gpui_kit_questionnaire_submit(OnGpuiKitQuestionnaireSubmit {
                        answers: submission_json(submission),
                        items: submission_items(submission),
                    });
                }
                _ => {}
            },
        ),
    ]
}

fn item_view(
    state: &Entity<QuestionnaireState>,
    item: ItemSpec,
    renderers: &Rc<Renderers>,
    slots: &mut Slots,
) -> QuestionnaireItem {
    let name = item.name.clone();
    let mut group = QuestionnaireChoices::new(state, name.clone());
    for choice in item.choices {
        let key = format!("{}:{}", name, choice.value);
        let mut view = QuestionnaireChoice::new(state, name.clone(), choice.value.clone());
        if let Some(style) = crate::style::refinement(&choice.content_style) {
            view = view.content_style(style);
        }
        if let Some(style) = crate::style::refinement(&choice.indicator_style) {
            view = view.indicator_style(style);
        }
        if let Some(style) = crate::style::refinement(&choice.shortcut_style) {
            view = view.shortcut_style(style);
        }
        if choice.indicator {
            if let Some(render) = renderers.get(&format!("indicator:{key}")) {
                view = view.render_indicator(move |_, window, cx| render(window, cx));
            }
        }
        if !choice.shortcut_kbd.is_empty() {
            let outline = choice.shortcut_kbd == "outline";
            view = view.render_shortcut(move |choice, _, _| {
                let keystroke = choice.shortcut().and_then(|shortcut| {
                    gpui::Keystroke::parse(super::kbd::interned(&shortcut.to_lowercase())).ok()
                });
                match keystroke {
                    Some(keystroke) => {
                        let kbd = Kbd::new(keystroke);
                        if outline { kbd.outline() } else { kbd }.into_any_element()
                    }
                    None => gpui::div().into_any_element(),
                }
            });
        }
        if choice.content {
            if let Some(content) = slots.take(&format!("choice:{key}")) {
                view = view.child(content);
            }
        }
        group = group.child(view);
    }
    if item.input.is_some() {
        group = group.child(QuestionnaireInput::new(state, name.clone()));
    }
    QuestionnaireItem::new(state, name.clone())
        .child(QuestionnaireTitle::new(state, name.clone()))
        .child(QuestionnaireDescription::new(state, name.clone()))
        .child(group)
        .child(QuestionnaireError::new(state, name))
}
