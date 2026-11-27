import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
  type ReactNode,
} from 'react';
import type {
  NativeSyntheticEvent,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native';
import Native, { Commands } from './GpuiKitQuestionnaireNativeComponent';
import { SlotHost, type Slot } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';

export interface QuestionnaireChoice {
  value: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  /** Selected from the start. */
  selected?: boolean;
  /** React Native content of the choice, instead of its label and description. */
  content?: ReactNode;
  /** React Native content drawn as the choice's indicator, instead of the kit's radio or checkbox. */
  indicator?: ReactNode;
  /** Shows the choice's shortcut as a keyboard key. */
  shortcutKbd?: 'default' | 'outline';
  /** Refines the content beside the indicator, for example its gap. */
  contentStyle?: KitStyle;
  indicatorStyle?: KitStyle;
  shortcutStyle?: KitStyle;
}

export interface QuestionnaireQuestion {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  /** Allows more than one choice. */
  multiple?: boolean;
  disabled?: boolean;
  /**
   * Adds a free-text answer; an object sets its accessible label, its
   * placeholder and the text it starts with.
   */
  input?:
    boolean | { label?: string; placeholder?: string; defaultValue?: string };
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
  /** An error the host owns, shown under the question from the start. */
  externalError?: string;
}

export type QuestionnaireAnswer = {
  choices: string[];
  freeform: string | null;
};

export type QuestionnaireAnswers = Record<string, QuestionnaireAnswer>;

/** What the questionnaire shows, reported whenever it changes. */
export interface QuestionnaireStatus {
  current: string | null;
  /** Items that are not disabled. */
  total: number;
  complete: boolean;
  navigation: {
    previous: boolean;
    next: boolean;
    skip: boolean;
    submit: boolean;
    confirmable: boolean;
  };
  items: Record<
    string,
    {
      status: 'unanswered' | 'answered' | 'skipped';
      disabled: boolean;
      error: string | null;
    }
  >;
  answers: QuestionnaireAnswers;
  /** The answered items' names in the order the questionnaire keeps them. */
  answerOrder: string[];
  /** The free-text drafts, by item. */
  drafts: Record<string, string>;
  /** What has focus in the current item: `input`, `choice:<value>`, or empty. */
  focus: string;
}

/** An item of a submission, with its status. */
export type QuestionnaireSubmissionItem = QuestionnaireAnswer & {
  name: string;
  status: 'unanswered' | 'answered' | 'skipped';
};

export interface QuestionnaireHandle {
  next(): void;
  previous(): void;
  skip(): void;
  submit(): void;
  reset(): void;
  /** Shows an error the host owns under the question until it is cleared. */
  setExternalError(item: string, message: string): void;
  clearExternalError(item: string): void;
  setAnswer(item: string, answer: Partial<QuestionnaireAnswer>): void;
  setCurrentItem(item: string): void;
  setItemDisabled(item: string, disabled: boolean): void;
}

export interface QuestionnaireProps extends Omit<ViewProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  questions: QuestionnaireQuestion[];
  /** Selects choices with number or letter keys. */
  shortcuts?: 'numbers' | 'letters';
  showProgress?: boolean;
  /** The size every part follows. */
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  /** The kit's Back, Skip, Next and Submit buttons to show; all by default. */
  kitActions?: boolean | ('previous' | 'skip' | 'next' | 'submit')[];
  /** React Native content in the actions row, after anything leading and before the kit's buttons. */
  actions?: ReactNode;
  /** React Native content at the start of the actions row, such as a Cancel button. */
  actionsLeading?: ReactNode;
  /** Refines the questionnaire, for example its padding. */
  kitStyle?: KitStyle;
  /** An answer changed; `status` is the item's status after it. */
  onAnswer?: (
    item: string,
    answer: QuestionnaireAnswer,
    status: 'unanswered' | 'answered' | 'skipped',
  ) => void;
  /** The current question changed. */
  onItemChange?: (current: string) => void;
  /** Every required question is answered. */
  onComplete?: (
    answers: QuestionnaireAnswers,
    items: QuestionnaireSubmissionItem[],
  ) => void;
  /** Submit was pressed with every required question answered. */
  onSubmit?: (
    answers: QuestionnaireAnswers,
    items: QuestionnaireSubmissionItem[],
  ) => void;
  /** What the questionnaire shows changed. */
  onStatusChange?: (status: QuestionnaireStatus) => void;
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
    size,
    kitActions,
    actions,
    actionsLeading,
    kitStyle: questionnaireStyle,
    onAnswer,
    onItemChange,
    onComplete,
    onSubmit,
    onStatusChange,
    style,
    testID,
  },
  ref,
) {
  const native = useRef<ComponentRef<typeof Native>>(null);
  const call = (run: (view: ComponentRef<typeof Native>) => void) => {
    if (native.current) run(native.current);
  };
  useImperativeHandle(ref, () => ({
    next: () => call(Commands.next),
    previous: () => call(Commands.previous),
    skip: () => call(Commands.skip),
    submit: () => call(Commands.submit),
    reset: () => call(Commands.reset),
    setExternalError: (item, message) =>
      call(view => Commands.setExternalError(view, item, message)),
    clearExternalError: item =>
      call(view => Commands.clearExternalError(view, item)),
    setAnswer: (item, answer) =>
      call(view =>
        Commands.setAnswer(
          view,
          item,
          JSON.stringify({
            choices: answer.choices ?? [],
            freeform: answer.freeform ?? null,
          }),
        ),
      ),
    setCurrentItem: item => call(view => Commands.setCurrentItem(view, item)),
    setItemDisabled: (item, disabled) =>
      call(view => Commands.setItemDisabled(view, item, disabled)),
  }));
  const slots: Slot[] = [
    { name: 'actions-leading', content: actionsLeading, fit: true },
    { name: 'actions', content: actions },
  ];
  const items = questions.map(question => ({
    name: question.name,
    label: question.label,
    description: question.description ?? '',
    required: question.required ?? false,
    multiple: question.multiple ?? false,
    disabled: question.disabled ?? false,
    input:
      question.input === true ? {} : question.input ? question.input : null,
    validation: question.validation ? JSON.stringify(question.validation) : '',
    externalError: question.externalError ?? '',
    choices: (question.choices ?? []).map(choice => {
      const key = `${question.name}:${choice.value}`;
      if (choice.content != null)
        slots.push({ name: `choice:${key}`, content: choice.content });
      if (choice.indicator != null)
        slots.push({
          name: `indicator:${key}`,
          content: choice.indicator,
          fit: true,
        });
      return {
        value: choice.value,
        label: choice.label ?? choice.value,
        description: choice.description ?? '',
        disabled: choice.disabled ?? false,
        selected: choice.selected ?? false,
        content: choice.content != null,
        indicator: choice.indicator != null,
        shortcutKbd: choice.shortcutKbd ?? '',
        contentStyle: kitStyle(choice.contentStyle),
        indicatorStyle: kitStyle(choice.indicatorStyle),
        shortcutStyle: kitStyle(choice.shortcutStyle),
      };
    }),
  }));
  return (
    <SlotHost
      style={[{ width: 480 }, style]}
      testID={testID}
      nativeRef={native}
      native={Native as never}
      nativeProps={{
        itemsJson: JSON.stringify(items),
        shortcuts: shortcuts ?? 'none',
        showProgress: showProgress ?? true,
        size,
        kitActions:
          kitActions === undefined || kitActions === true
            ? ''
            : kitActions === false || kitActions.length === 0
              ? 'none'
              : kitActions.join(','),
        kitStyle: kitStyle(questionnaireStyle),
        onGpuiKitQuestionnaireAnswer: (
          event: NativeSyntheticEvent<{
            item: string;
            status: string;
            choices: string;
            freeform: string;
          }>,
        ) =>
          onAnswer?.(
            event.nativeEvent.item,
            {
              choices: event.nativeEvent.choices
                ? event.nativeEvent.choices.split('\u0001')
                : [],
              freeform: event.nativeEvent.freeform || null,
            },
            event.nativeEvent.status as 'unanswered' | 'answered' | 'skipped',
          ),
        onGpuiKitQuestionnaireItemChange: (
          event: NativeSyntheticEvent<{ current: string }>,
        ) => onItemChange?.(event.nativeEvent.current),
        onGpuiKitQuestionnaireComplete: (
          event: NativeSyntheticEvent<{ answers: string; items: string }>,
        ) =>
          onComplete?.(
            JSON.parse(event.nativeEvent.answers),
            JSON.parse(event.nativeEvent.items),
          ),
        onGpuiKitQuestionnaireSubmit: (
          event: NativeSyntheticEvent<{ answers: string; items: string }>,
        ) =>
          onSubmit?.(
            JSON.parse(event.nativeEvent.answers),
            JSON.parse(event.nativeEvent.items),
          ),
        onGpuiKitQuestionnaireStateChange: (
          event: NativeSyntheticEvent<{ state: string }>,
        ) => onStatusChange?.(JSON.parse(event.nativeEvent.state)),
      }}
      slots={slots}
    />
  );
});
