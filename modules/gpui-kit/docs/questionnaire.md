---
id: gpui-kit-questionnaire
title: Questionnaire
---

The kit's `Questionnaire`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name           | Type                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| `itemsJson`    | `string`                                                                        |
| `shortcuts`    | `WithDefault<'none' \| 'numbers' \| 'letters', 'none'>`                         |
| `showProgress` | `WithDefault<boolean, true>`                                                    |
| `size`         | `WithDefault< 'unset' \| 'xsmall' \| 'small' \| 'medium' \| 'large', 'unset' >` |
| `kitActions`   | `string`                                                                        |
| `kitStyle`     | `string`                                                                        |

## Native events

| Name                                | Type                                                  |
| ----------------------------------- | ----------------------------------------------------- |
| `onGpuiKitQuestionnaireAnswer`      | `DirectEventHandler< Readonly<{ item: string`         |
| `onGpuiKitQuestionnaireItemChange`  | `DirectEventHandler< Readonly<{ current: string }> >` |
| `onGpuiKitQuestionnaireStateChange` | `DirectEventHandler< Readonly<{ state: string }> >`   |

## Commands

- `next`
- `previous`
- `skip`
- `submit`
- `reset`
- `setExternalError`
- `clearExternalError`
- `setAnswer`
- `setCurrentItem`
- `setItemDisabled`

## Coverage

- `QuestionnaireState::new`: generated (questions), items and choices are the schema
- `QuestionnaireItemDefinition`: generated (questions)
- `QuestionnaireChoiceDefinition`: generated (questions)
- `QuestionnaireInputDefinition`: generated (questions[].input), free-text answer
- `QuestionnaireState::with_shortcuts`: generated (shortcuts)
- `QuestionnaireProgress::new`: generated (showProgress)
- `QuestionnaireState::go_next`: generated (next()), command
- `QuestionnaireState::go_previous`: generated (previous()), command
- `QuestionnaireState::skip_current`: generated (skip()), command
- `QuestionnaireState::submit`: generated (submit()), command
- `QuestionnaireState::reset`: generated (reset()), command
- `QuestionnaireEvent`: generated (onAnswer, onItemChange, onSubmit)
- `QuestionnaireItemDefinition::with_validator`: generated (questions), validation: declarative rules checked in Rust; the kit shows the message under the question
