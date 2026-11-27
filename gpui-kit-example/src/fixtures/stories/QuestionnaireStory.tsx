import React, { useRef, useState } from 'react';
import { Text, View, type TextStyle } from 'react-native';
import {
  Button,
  Dialog,
  GroupBox,
  Questionnaire,
  type QuestionnaireAnswer,
  type QuestionnaireHandle,
  type QuestionnaireProps,
  type QuestionnaireQuestion,
  type QuestionnaireStatus,
  type QuestionnaireSubmissionItem,
} from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/questionnaire_story.rs` of gpui-component v0.9.1. */

const text = (size: number, extra: TextStyle = {}): TextStyle => ({
  fontSize: size,
  lineHeight: size * 1.618,
  color: theme.foreground,
  ...extra,
});

const STATUS: Record<string, string> = {
  unanswered: 'Unanswered',
  answered: 'Answered',
  skipped: 'Skipped',
};

/** Rust's `{:?}` of a `QuestionnaireAnswer`. */
const debugAnswer = (answer?: QuestionnaireAnswer | null) =>
  `QuestionnaireAnswer { choices: [${(answer?.choices ?? [])
    .map(choice => JSON.stringify(choice))
    .join(', ')}], freeform: ${
    answer?.freeform == null
      ? 'None'
      : `Some(${JSON.stringify(answer.freeform)})`
  } }`;

const summary = (items: QuestionnaireSubmissionItem[]) =>
  items
    .map(item => `${item.name}:${STATUS[item.status]}=${debugAnswer(item)}`)
    .join(' · ');

function SummaryLine({ children }: { children: string }) {
  return (
    <Text
      style={text(12, {
        width: '100%',
        textAlign: 'center',
        color: theme.mutedForeground,
      })}
    >
      {children}
    </Text>
  );
}

const choices = (...list: [string, string][]) =>
  list.map(([value, label]) => ({ value, label }));

const MAIN: QuestionnaireQuestion[] = [
  {
    name: 'direction',
    label: 'What should we prototype next?',
    required: true,
    description: 'Choose one direction or write your own.',
    choices: [
      {
        value: 'delegation',
        label: 'Delegation',
        description: 'Show how work moves to a specialist.',
        selected: true,
      },
      {
        value: 'questions',
        label: 'Question prompts',
        description: 'Show choices while the interface waits.',
      },
      { value: 'both', label: 'Both together' },
    ],
    input: {
      label: 'Another direction',
      placeholder: 'Type another direction…',
    },
  },
  {
    name: 'tools',
    label: 'Which tools do you use?',
    multiple: true,
    description: 'Choose any that belong in the prototype.',
    choices: [
      { value: 'editor', label: 'Editor' },
      { value: 'terminal', label: 'Terminal' },
      { value: 'browser', label: 'Browser', disabled: true },
    ],
    input: {
      label: 'Another tool',
      placeholder: 'Add another tool…',
      defaultValue: 'Terminal',
    },
  },
  {
    name: 'tone',
    label: 'What tone should the interface use?',
    description: 'This optional question can be intentionally skipped.',
    choices: choices(['direct', 'Direct'], ['warm', 'Warm']),
  },
  {
    name: 'advanced',
    label: 'Advanced preferences',
    disabled: true,
    choices: choices(['enabled', 'Enable advanced options']),
  },
];

const VALIDATION: QuestionnaireQuestion[] = [
  {
    name: 'handle',
    label: 'Choose a public handle',
    required: true,
    description: 'The validator rejects short handles.',
    input: { label: 'Public handle', placeholder: 'At least three characters' },
    validation: { minLength: 3, message: 'Use at least three characters.' },
  },
  {
    name: 'summary',
    label: 'How should we summarize it?',
    choices: choices(['short', 'Short'], ['detailed', 'Detailed']),
  },
];

const EXTERNAL: QuestionnaireQuestion[] = [
  {
    externalError: 'This workspace is not available.',
    name: 'server',
    label: 'Which workspace should we connect?',
    required: true,
    choices: choices(['personal', 'Personal'], ['team', 'Team']),
  },
];

const CONTROL: QuestionnaireQuestion[] = [
  {
    name: 'runtime',
    label: 'Where will this workflow run?',
    required: true,
    description: 'Selecting Cloud enables the Environment question.',
    choices: [
      { value: 'local', label: 'Local', selected: true },
      { value: 'cloud', label: 'Cloud' },
    ],
  },
  {
    name: 'delivery',
    label: 'How should updates be delivered?',
    choices: choices(['guided', 'Guided'], ['automatic', 'Automatic']),
  },
  {
    name: 'environment',
    label: 'Which cloud environment?',
    disabled: true,
    choices: choices(['staging', 'Staging'], ['production', 'Production']),
  },
];

const SINGLE = (label: string): QuestionnaireQuestion[] => [
  {
    name: 'shortcut',
    label,
    choices: choices(
      ['first', 'First choice'],
      ['second', 'Second choice'],
      ['third', 'Third choice'],
    ),
  },
];

const KEYBOARD: QuestionnaireQuestion[] = [
  {
    ...SINGLE('Choose an answer or type your own')[0],
    description:
      'Use Up/Down to include the freeform input in the answer focus order.',
    input: {
      label: 'Custom answer',
      placeholder: 'Type without triggering A, B, or C…',
    },
  },
  {
    name: 'keyboard_review',
    label: 'Confirm the keyboard result',
    choices: choices(['keep', 'Keep it'], ['change', 'Change it']),
  },
];

const CARD: QuestionnaireQuestion[] = [
  {
    name: 'card_scope',
    label: 'Who can use this workspace?',
    required: true,
    choices: choices(['team', 'Team members'], ['everyone', 'Everyone']),
  },
  {
    name: 'card_updates',
    label: 'Send setup updates?',
    choices: choices(['yes', 'Yes'], ['no', 'No']),
  },
];

const DIALOG: QuestionnaireQuestion[] = [
  {
    name: 'dialog',
    label: 'Which workspace should we open?',
    required: true,
    choices: choices(['first', 'Personal'], ['second', 'Team']),
  },
  {
    name: 'dialog_verification',
    label: 'How should we verify the setup?',
    required: true,
    choices: choices(
      ['targeted', 'Targeted checks'],
      ['full', 'Full verification'],
    ),
  },
];

type Log = { push: (line: string) => void; lines: string[] };

function useLog(): Log {
  const [lines, setLines] = useState<string[]>([]);
  return {
    lines,
    push: line => setLines(current => [...current, line].slice(-4)),
  };
}

export function QuestionnaireStory({ size = 'medium' }: { size?: StorySize }) {
  const main = useRef<QuestionnaireHandle>(null);
  const external = useRef<QuestionnaireHandle>(null);
  const control = useRef<QuestionnaireHandle>(null);
  const [mainStatus, setMainStatus] = useState<QuestionnaireStatus>();
  const [externalStatus, setExternalStatus] = useState<QuestionnaireStatus>();
  const [controlStatus, setControlStatus] = useState<QuestionnaireStatus>();
  const [lettersStatus, setLettersStatus] = useState<QuestionnaireStatus>();
  const [customStatus, setCustomStatus] = useState<QuestionnaireStatus>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const events = useLog();
  const keyboard = useLog();

  const keyboardEvents = (mode: string): Partial<QuestionnaireProps> => ({
    onItemChange: current =>
      keyboard.push(`${mode}: current=${current || 'none'}`),
    onAnswer: (_, answer) =>
      keyboard.push(`${mode}: answer=${debugAnswer(answer)}`),
    onComplete: () => keyboard.push(`${mode}: completed`),
    onSubmit: () => keyboard.push(`${mode}: submitted`),
  });

  const nav = mainStatus?.navigation;
  const navigationSummary = nav
    ? `Navigation: previous=${nav.previous} · next=${nav.next} · skip=${nav.skip} · submit=${nav.submit} · can_confirm=${nav.confirmable}`
    : '';
  const statusSummary = ['direction', 'tools', 'tone', 'advanced']
    .filter(name => mainStatus?.items[name])
    .map(name => `${name}: ${STATUS[mainStatus!.items[name].status]}`)
    .join(' · ');
  const answerSummary = (mainStatus?.answerOrder ?? [])
    .map(name => `${name}=${debugAnswer(mainStatus!.answers[name])}`)
    .join(' · ');
  const lettersFocus = lettersStatus?.focus.startsWith('choice:')
    ? `choice ${lettersStatus.focus.slice('choice:'.length)}`
    : lettersStatus?.focus === 'input'
      ? 'freeform input'
      : 'item group or none';
  const externalError = externalStatus?.items.server?.error ?? 'none';
  const controlNav = controlStatus?.navigation;
  const environmentEnabled = controlStatus
    ? !controlStatus.items.environment?.disabled
    : false;
  const compactSelected =
    customStatus?.answers.custom?.choices.includes('compact') ?? false;

  return (
    <StoryFrame testID="story-questionnaire">
      <View style={{ width: '100%', gap: 16 }}>
        <StoryToolbar size={size} />
        <Section
          title="Complete flow"
          description="Required single choice, multiple choice, freeform input, skip, disabled item, and submit events."
          style={{ maxWidth: 448 }}
        >
          <Questionnaire
            ref={main}
            style={{ width: '100%' }}
            size={size}
            shortcuts="letters"
            questions={MAIN}
            onStatusChange={setMainStatus}
            onItemChange={current =>
              events.push(`Current item: ${current || 'none'}`)
            }
            onAnswer={(item, _, status) =>
              events.push(`Answer changed: ${item} (${STATUS[status]})`)
            }
            onComplete={(_, items) =>
              events.push(`Completed: ${summary(items)}`)
            }
            onSubmit={(_, items) => events.push(`Submitted: ${summary(items)}`)}
          />
        </Section>
        <Section
          title="Validation and external errors"
          description="Next validates the active item; external errors remain host-owned until cleared or fixed."
          style={{ maxWidth: 600 }}
        >
          <Text style={text(16, { fontWeight: '500' })}>
            Internal validation
          </Text>
          <Questionnaire
            style={{ width: '100%' }}
            size={size}
            questions={VALIDATION}
          />
          <Text style={text(16, { fontWeight: '500' })}>
            External error lifecycle
          </Text>
          <Questionnaire
            ref={external}
            style={{ width: '100%' }}
            size={size}
            questions={EXTERNAL}
            onStatusChange={setExternalStatus}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              outline
              label="Apply server error"
              onPress={() =>
                external.current?.setExternalError(
                  'server',
                  'This workspace is not available.',
                )
              }
            />
            <Button
              outline
              label="Clear error"
              onPress={() => external.current?.clearExternalError('server')}
            />
            <Button
              variant="primary"
              label="Fix and submit again"
              onPress={() => {
                external.current?.setAnswer('server', { choices: ['team'] });
                external.current?.clearExternalError('server');
                external.current?.submit();
              }}
            />
          </View>
          <SummaryLine>{`External error: ${externalError}`}</SummaryLine>
        </Section>
        <Section
          title="Navigation state"
          description="The host can inspect current item, answers, status, available actions, and events."
          style={{ maxWidth: 600 }}
        >
          <Button
            outline
            label="Reset complete flow"
            onPress={() => main.current?.reset()}
          />
          <Text
            style={text(14, {
              width: '100%',
              textAlign: 'center',
              color: theme.mutedForeground,
            })}
          >
            {`Current: ${mainStatus?.current ?? 'none'} · enabled items: ${mainStatus?.total ?? 0} · complete: ${mainStatus?.complete ?? false}`}
          </Text>
          <SummaryLine>{statusSummary}</SummaryLine>
          <SummaryLine>{navigationSummary}</SummaryLine>
          <SummaryLine>
            {answerSummary ? `Answers: ${answerSummary}` : 'Answers: none'}
          </SummaryLine>
          {events.lines.map((line, ix) => (
            <SummaryLine key={ix}>{line}</SummaryLine>
          ))}
        </Section>
        <Section
          title="Shortcuts and keyboard"
          description="The fixture exposes focus, answers, drafts, and events while testing the full keyboard contract."
          style={{ maxWidth: 600 }}
        >
          <View style={{ width: '100%', gap: 4 }}>
            {[
              'Up/Down: move through choices and the freeform input; text editing keeps native arrow behavior.',
              'Left/Right: switch items outside text input and radio focus; Right requires an answer.',
              'Enter: confirm a filled answer. Command/Ctrl+Enter: confirm the current item.',
              'A–Z or 1–9: activate enabled choices. While input is focused, typed characters edit the draft and are not intercepted.',
            ].map(line => (
              <Text
                key={line}
                style={text(14, {
                  textAlign: 'center',
                  color: theme.mutedForeground,
                })}
              >
                {line}
              </Text>
            ))}
          </View>
          <View style={{ width: '100%', flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={text(16, { fontWeight: '500' })}>Letters</Text>
              <Questionnaire
                style={{ width: '100%' }}
                size={size}
                shortcuts="letters"
                questions={KEYBOARD}
                onStatusChange={setLettersStatus}
                {...keyboardEvents('Letters')}
              />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={text(16, { fontWeight: '500' })}>Numbers</Text>
              <Questionnaire
                style={{ width: '100%' }}
                size={size}
                shortcuts="numbers"
                questions={SINGLE('Choose an answer with a number')}
                {...keyboardEvents('Numbers')}
              />
            </View>
          </View>
          <SummaryLine>
            {`Letters focus: ${lettersFocus} · answer=${debugAnswer(lettersStatus?.answers.shortcut)} · draft=${JSON.stringify(lettersStatus?.drafts.shortcut ?? '')}`}
          </SummaryLine>
          {keyboard.lines.map((line, ix) => (
            <SummaryLine key={ix}>{line}</SummaryLine>
          ))}
        </Section>
        <Section
          title="Controlled current, conditional items, and custom actions"
          description="The host synchronizes Environment from the Runtime answer; custom actions use NavigationState visibility."
          style={{ maxWidth: 600 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Button
              outline
              label="Jump to runtime question"
              onPress={() => control.current?.setCurrentItem('runtime')}
            />
            <Text style={text(12, { color: theme.mutedForeground })}>
              {environmentEnabled
                ? 'Environment enabled: Runtime is Cloud'
                : 'Environment disabled: choose Cloud on Runtime'}
            </Text>
          </View>
          <Questionnaire
            ref={control}
            style={{ width: '100%' }}
            size={size}
            questions={CONTROL}
            kitActions={false}
            onStatusChange={setControlStatus}
            onAnswer={(item, answer) => {
              if (item !== 'runtime') return;
              const cloud = answer.choices.includes('cloud');
              control.current?.setItemDisabled('environment', !cloud);
            }}
            actions={
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                {controlNav?.previous && (
                  <Button
                    outline
                    label="Back"
                    onPress={() => control.current?.previous()}
                  />
                )}
                {controlNav?.skip && (
                  <Button
                    outline
                    label="Not now"
                    style={{ marginLeft: 'auto' }}
                    onPress={() => control.current?.skip()}
                  />
                )}
                {controlNav?.next && (
                  <Button
                    variant="primary"
                    label="Continue"
                    style={controlNav.skip ? undefined : { marginLeft: 'auto' }}
                    onPress={() => control.current?.next()}
                  />
                )}
                {controlNav?.submit && (
                  <Button
                    variant="primary"
                    label="Finish"
                    style={controlNav.skip ? undefined : { marginLeft: 'auto' }}
                    onPress={() => control.current?.submit()}
                  />
                )}
              </View>
            }
          />
        </Section>
        <Section
          title="Card and Dialog composition"
          description="GroupBox or Dialog owns the surface and its close behavior; the questionnaire keeps progress, items, and actions together."
          style={{ maxWidth: 600 }}
        >
          <GroupBox
            variant="outline"
            title="Workspace access"
            style={{ width: '100%' }}
          >
            <Questionnaire
              style={{ width: '100%' }}
              size={size}
              questions={CARD}
            />
          </GroupBox>
          <Button
            outline
            label="Open Questionnaire Dialog"
            onPress={() => setDialogOpen(true)}
          />
          <Dialog
            open={dialogOpen}
            title="Workspace setup"
            description="Questionnaire validates the answer; the Dialog host owns close and cancel."
            kitStyle={{ padding: 0 }}
            headerStyle={{ padding: 16 }}
            onClose={() => setDialogOpen(false)}
          >
            <Questionnaire
              style={{ width: '100%' }}
              kitStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
              size="small"
              questions={DIALOG}
              kitActions={['previous', 'next', 'submit']}
              actionsLeading={
                <Button
                  outline
                  label="Cancel"
                  onPress={() => setDialogOpen(false)}
                />
              }
              onSubmit={() => setDialogOpen(false)}
            />
          </Dialog>
        </Section>
        <Section
          title="Custom choice composition"
          description="Customize indicator, content, shortcut renderers, and style seams while preserving Questionnaire state and behavior."
          style={{ maxWidth: 600 }}
        >
          <Questionnaire
            style={{ width: '100%' }}
            size={size}
            shortcuts="letters"
            showProgress={false}
            kitActions={['submit']}
            onStatusChange={setCustomStatus}
            questions={[
              {
                name: 'custom',
                label: 'Choose a presentation',
                choices: [
                  {
                    value: 'compact',
                    label: 'Compact',
                    description:
                      'Use a custom indicator and composed description.',
                    contentStyle: { gap: 8 },
                    shortcutKbd: 'outline',
                    indicator: (
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: compactSelected
                            ? theme.primary
                            : theme.muted,
                        }}
                      />
                    ),
                    content: (
                      <View style={{ gap: 4 }}>
                        <Text style={text(16, { fontWeight: '500' })}>
                          Compact
                        </Text>
                        <Text
                          style={text(14, { color: theme.mutedForeground })}
                        >
                          A custom indicator and composed description.
                        </Text>
                      </View>
                    ),
                  },
                  {
                    value: 'comfortable',
                    label: 'Comfortable',
                    indicatorStyle: { opacity: 0.65 },
                    shortcutStyle: { opacity: 0.65 },
                  },
                ],
              },
            ]}
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
