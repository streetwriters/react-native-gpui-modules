---
id: gpui-kit-questionnaire
title: Questionnaire
---

The kit's `Questionnaire`, written by hand on the same specification as the generated components. The React Native side is in `src/manual`.

## Native props

| Name           | Type                                                    |
| -------------- | ------------------------------------------------------- |
| `items`        | `ReadonlyArray<QuestionnaireItemDef>`                   |
| `choices`      | `ReadonlyArray<QuestionnaireChoiceDef>`                 |
| `shortcuts`    | `WithDefault<'none' \| 'numbers' \| 'letters', 'none'>` |
| `showProgress` | `WithDefault<boolean, true>`                            |

## Native events

| Name                               | Type                                                  |
| ---------------------------------- | ----------------------------------------------------- |
| `onGpuiKitQuestionnaireItemChange` | `DirectEventHandler< Readonly<{ current: string }> >` |
| `onGpuiKitQuestionnaireSubmit`     | `DirectEventHandler< Readonly<{ answers: string }> >` |

## Commands

- `next`
- `previous`
- `skip`
- `submit`
- `reset`

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
- `QuestionnaireItemDefinition::with_validator`: skipped, a synchronous Rust closure on every answer, which JS cannot answer in time; required and the onSubmit answers cover validation
