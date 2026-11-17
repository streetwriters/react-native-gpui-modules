use std::collections::HashMap;

use gpui::{
    AnyElement, AppContext as _, Context, Entity, IntoElement, ParentElement as _, SharedString,
    Subscription, Window,
};
use gpui_component::input::InputState;
use gpui_component::questionnaire::{
    Questionnaire, QuestionnaireActions, QuestionnaireAnswer, QuestionnaireChoice,
    QuestionnaireChoiceDefinition, QuestionnaireChoices, QuestionnaireDescription,
    QuestionnaireError, QuestionnaireEvent, QuestionnaireInput, QuestionnaireInputDefinition,
    QuestionnaireItem, QuestionnaireItemDefinition, QuestionnaireItemStatus, QuestionnaireNext,
    QuestionnairePrevious, QuestionnaireProgress, QuestionnaireShortcutMode, QuestionnaireSkip,
    QuestionnaireState, QuestionnaireSubmission, QuestionnaireSubmit, QuestionnaireTitle,
};

use crate::*;

const SEPARATOR: &str = "\u{1}";

struct Choice {
    item: String,
    value: String,
    label: String,
    description: String,
    disabled: bool,
    selected: bool,
}

struct Item {
    name: String,
    label: String,
    description: String,
    required: bool,
    multiple: bool,
    disabled: bool,
    input: bool,
    validation: String,
}

pub struct GpuiKitQuestionnaire {
    state: Option<Entity<QuestionnaireState>>,
    signature: String,
    inputs: HashMap<String, Entity<InputState>>,
    subscription: Option<Subscription>,
}

fn quote(text: &str) -> String {
    let mut out = String::from("\"");
    for c in text.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

fn answer_json(answer: &QuestionnaireAnswer) -> String {
    let choices = answer
        .choices()
        .iter()
        .map(|choice| quote(choice))
        .collect::<Vec<_>>()
        .join(",");
    let freeform = answer
        .freeform()
        .map(|text| quote(text))
        .unwrap_or_else(|| "null".to_string());
    format!("{{\"choices\":[{choices}],\"freeform\":{freeform}}}")
}

fn submission_json(submission: &QuestionnaireSubmission) -> String {
    let entries = submission
        .items()
        .iter()
        .filter(|item| item.status() != QuestionnaireItemStatus::Skipped)
        .map(|item| format!("{}:{}", quote(item.name()), answer_json(item.answer())))
        .collect::<Vec<_>>()
        .join(",");
    format!("{{{entries}}}")
}

impl GpuiKitQuestionnaireSpec for GpuiKitQuestionnaire {
    fn create(_props: &GpuiKitQuestionnaireProps, _cx: &mut GpuiKitQuestionnaireContext) -> Self {
        Self {
            state: None,
            signature: String::new(),
            inputs: HashMap::new(),
            subscription: None,
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

    fn render(
        &mut self,
        props: &GpuiKitQuestionnaireProps,
        window: &mut Window,
        cx: &mut GpuiKitQuestionnaireContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let list = props.items();
        let items: Vec<Item> = (0..list.len())
            .filter_map(|index| list.get(index))
            .map(|item| Item {
                name: item.name().to_string(),
                label: item.label().to_string(),
                description: item.description().to_string(),
                required: item.required(),
                multiple: item.multiple(),
                disabled: item.disabled(),
                input: item.input(),
                validation: item.validation().to_string(),
            })
            .collect();
        let list = props.choices();
        let choices: Vec<Choice> = (0..list.len())
            .filter_map(|index| list.get(index))
            .map(|choice| Choice {
                item: choice.item().to_string(),
                value: choice.value().to_string(),
                label: choice.label().to_string(),
                description: choice.description().to_string(),
                disabled: choice.disabled(),
                selected: choice.selected(),
            })
            .collect();
        let shortcuts = match props.shortcuts() {
            GpuiKitQuestionnaireShortcuts::Numbers => Some(QuestionnaireShortcutMode::Numbers),
            GpuiKitQuestionnaireShortcuts::Letters => Some(QuestionnaireShortcutMode::Letters),
            _ => None,
        };
        let signature = format!(
            "{:?}|{:?}|{}",
            items
                .iter()
                .map(|i| (&i.name, i.required, i.multiple, i.disabled, i.input, &i.validation))
                .collect::<Vec<_>>(),
            choices
                .iter()
                .map(|c| (&c.item, &c.value, c.disabled, c.selected))
                .collect::<Vec<_>>(),
            shortcuts.is_some()
        );
        if self.signature != signature || self.state.is_none() {
            self.signature = signature;
            let definitions: Vec<QuestionnaireItemDefinition> = items
                .iter()
                .map(|item| {
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
                    definition = definition.with_choices(
                        choices
                            .iter()
                            .filter(|c| c.item == item.name)
                            .map(|choice| {
                                let mut def = QuestionnaireChoiceDefinition::new(
                                    choice.value.clone(),
                                    choice.label.clone(),
                                )
                                .with_disabled(choice.disabled)
                                .with_default_selected(choice.selected);
                                if !choice.description.is_empty() {
                                    def = def.with_description(choice.description.clone());
                                }
                                def
                            }),
                    );
                    if item.input {
                        let input = self
                            .inputs
                            .entry(item.name.clone())
                            .or_insert_with(|| app.new(|cx| InputState::new(window, cx)))
                            .clone();
                        definition = definition.with_input(QuestionnaireInputDefinition::new(
                            input,
                            item.label.clone(),
                        ));
                    }
                    definition
                })
                .collect();
            let valid = QuestionnaireState::new_checked(&definitions);
            if !valid {
                self.state = None;
                return gpui::div().into_any_element();
            }
            let state = app.new(|cx: &mut Context<QuestionnaireState>| {
                let state = QuestionnaireState::new(definitions, cx).expect("a valid schema");
                match shortcuts {
                    Some(mode) => state.with_shortcuts(mode),
                    None => state,
                }
            });
            let (answer, item_change, submit) = (sender.clone(), sender.clone(), sender);
            self.subscription = Some(app.subscribe(
                &state,
                move |_, event: &QuestionnaireEvent, _cx| match event {
                    QuestionnaireEvent::AnswerChanged(change) => {
                        let answer_value = change.answer();
                        answer.gpui_kit_questionnaire_answer(OnGpuiKitQuestionnaireAnswer {
                            item: change.item().to_string(),
                            choices: answer_value
                                .choices()
                                .iter()
                                .map(|choice| choice.to_string())
                                .collect::<Vec<_>>()
                                .join(SEPARATOR),
                            freeform: answer_value
                                .freeform()
                                .map(|text| text.to_string())
                                .unwrap_or_default(),
                        });
                    }
                    QuestionnaireEvent::CurrentItemChanged { current, .. } => {
                        item_change.gpui_kit_questionnaire_item_change(
                            OnGpuiKitQuestionnaireItemChange {
                                current: current
                                    .as_ref()
                                    .map(|name| name.to_string())
                                    .unwrap_or_default(),
                            },
                        );
                    }
                    QuestionnaireEvent::Submit(submission) => {
                        submit.gpui_kit_questionnaire_submit(OnGpuiKitQuestionnaireSubmit {
                            answers: submission_json(submission),
                        });
                    }
                    _ => {}
                },
            ));
            self.state = Some(state);
        }
        let Some(state) = self.state.clone() else {
            return gpui::div().into_any_element();
        };
        let mut root = Questionnaire::new(&state);
        if props.show_progress() {
            root = root.child(QuestionnaireProgress::new(&state));
        }
        for item in &items {
            let mut view = QuestionnaireItem::new(&state, item.name.clone())
                .child(QuestionnaireTitle::new(&state, item.name.clone()));
            if !item.description.is_empty() {
                view = view.child(QuestionnaireDescription::new(&state, item.name.clone()));
            }
            let mut group = QuestionnaireChoices::new(&state, item.name.clone());
            for choice in choices.iter().filter(|c| c.item == item.name) {
                group = group.child(
                    QuestionnaireChoice::new(&state, item.name.clone(), choice.value.clone())
                        .child(SharedString::from(choice.label.clone())),
                );
            }
            view = view.child(group);
            if item.input {
                view = view.child(QuestionnaireInput::new(&state, item.name.clone()));
            }
            view = view.child(QuestionnaireError::new(&state, item.name.clone()));
            root = root.child(view);
        }
        root.child(
            QuestionnaireActions::new(&state)
                .child(QuestionnairePrevious::new(&state))
                .child(QuestionnaireSkip::new(&state))
                .child(QuestionnaireNext::new(&state))
                .child(QuestionnaireSubmit::new(&state)),
        )
        .into_any_element()
    }
}

trait Checked {
    fn new_checked(definitions: &[QuestionnaireItemDefinition]) -> bool;
}

impl Checked for QuestionnaireState {
    fn new_checked(definitions: &[QuestionnaireItemDefinition]) -> bool {
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
}

impl GpuiKitQuestionnaire {
    fn run(
        &self,
        cx: &mut GpuiKitQuestionnaireContext,
        action: impl FnOnce(&mut QuestionnaireState, &mut Window, &mut Context<QuestionnaireState>)
            + 'static,
    ) {
        let Some(state) = self.state.clone() else {
            return;
        };
        if let Some(app) = cx.app() {
            app.defer(move |app| {
                if let Some(window) = app.windows().into_iter().next() {
                    let _ = window.update(app, |_, window, cx| {
                        state.update(cx, |state, cx| action(state, window, cx));
                    });
                }
            });
        }
    }
}
