import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
} from 'react';
import type {
  NativeSyntheticEvent,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native';
import Native, { Commands } from './GpuiKitQuestionnaireNativeComponent';

export interface QuestionnaireChoice {
  value: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  /** Selected from the start. */
  selected?: boolean;
}

export interface QuestionnaireQuestion {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  /** Allows more than one choice. */
  multiple?: boolean;
  disabled?: boolean;
  /** Adds a free-text answer. */
  input?: boolean;
  /**
   * Rules the answer must meet before the questionnaire moves on, checked in
   * Rust: against the free text when there is one, else against the chosen
   * values joined by commas. The kit shows `message` (or the rule name) under
   * the question.
   */
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
  choices?: QuestionnaireChoice[];
}

export type QuestionnaireAnswers = Record<
  string,
  { choices: string[]; freeform: string | null }
>;

export interface QuestionnaireHandle {
  next(): void;
  previous(): void;
  skip(): void;
  submit(): void;
  reset(): void;
}

export interface QuestionnaireProps extends Omit<ViewProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  questions: QuestionnaireQuestion[];
  /** Selects choices with number or letter keys. */
  shortcuts?: 'numbers' | 'letters';
  showProgress?: boolean;
  /** An answer changed. */
  onAnswer?: (
    item: string,
    answer: { choices: string[]; freeform: string | null },
  ) => void;
  /** The current question changed. */
  onItemChange?: (current: string) => void;
  /** Submit was pressed with every required question answered. */
  onSubmit?: (answers: QuestionnaireAnswers) => void;
}

/** The kit's questionnaire: one question at a time, with choices and free text. */
export const Questionnaire = forwardRef<
  QuestionnaireHandle,
  QuestionnaireProps
>(function Questionnaire(
  {
    questions,
    shortcuts,
    showProgress,
    onAnswer,
    onItemChange,
    onSubmit,
    style,
    ...view
  },
  ref,
) {
  const native = useRef<ComponentRef<typeof Native>>(null);
  useImperativeHandle(ref, () => ({
    next: () => native.current && Commands.next(native.current),
    previous: () => native.current && Commands.previous(native.current),
    skip: () => native.current && Commands.skip(native.current),
    submit: () => native.current && Commands.submit(native.current),
    reset: () => native.current && Commands.reset(native.current),
  }));
  return (
    <Native
      {...view}
      ref={native}
      style={[{ width: 480, height: 320 }, style]}
      shortcuts={shortcuts ?? 'none'}
      showProgress={showProgress ?? true}
      items={questions.map(question => ({
        name: question.name,
        label: question.label,
        description: question.description ?? '',
        required: question.required ?? false,
        multiple: question.multiple ?? false,
        disabled: question.disabled ?? false,
        input: question.input ?? false,
        validation: question.validation ? JSON.stringify(question.validation) : '',
      }))}
      choices={questions.flatMap(question =>
        (question.choices ?? []).map(choice => ({
          item: question.name,
          value: choice.value,
          label: choice.label ?? choice.value,
          description: choice.description ?? '',
          disabled: choice.disabled ?? false,
          selected: choice.selected ?? false,
        })),
      )}
      onGpuiKitQuestionnaireAnswer={(
        event: NativeSyntheticEvent<{
          item: string;
          choices: string;
          freeform: string;
        }>,
      ) =>
        onAnswer?.(event.nativeEvent.item, {
          choices: event.nativeEvent.choices
            ? event.nativeEvent.choices.split('\u0001')
            : [],
          freeform: event.nativeEvent.freeform || null,
        })
      }
      onGpuiKitQuestionnaireItemChange={(
        event: NativeSyntheticEvent<{ current: string }>,
      ) => onItemChange?.(event.nativeEvent.current)}
      onGpuiKitQuestionnaireSubmit={(
        event: NativeSyntheticEvent<{ answers: string }>,
      ) => onSubmit?.(JSON.parse(event.nativeEvent.answers))}
    />
  );
});
