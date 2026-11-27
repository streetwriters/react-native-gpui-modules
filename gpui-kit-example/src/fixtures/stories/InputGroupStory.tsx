import React, { useRef, useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  Form,
  GroupBox,
  Input,
  Textarea,
  type IconName,
  type InputAddon,
  type InputHandle,
  type InputProps,
  type TextareaHandle,
  type TextareaProps,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme, writeClipboard } from './StoryKit';

/** `crates/story/src/stories/input_group_story.rs` (and `examples.rs`) of gpui-component v0.9.1. */

const COMPONENTS = [
  'Button',
  'Input',
  'Textarea',
  'Input Group',
  'Select',
  'Combobox',
  'Checkbox',
  'Radio',
  'Slider',
  'Switch',
  'Calendar',
  'Color Picker',
];

const textSm = { fontSize: 14, lineHeight: 20, color: theme.foreground };

/** `column()`: `v_flex().w_full().max_w(rems(24.)).gap_4()`. */
function Column({ children }: { children: ReactNode }) {
  return (
    <View style={{ width: '100%', maxWidth: 384, gap: 16 }}>{children}</View>
  );
}

/** `labeled()`: a `Field` with a label and a description. */
function Labeled({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Form
      style={{ width: '100%' }}
      fields={[{ label, description, control: children }]}
    />
  );
}

const icon = (name: IconName) => ({ kind: 'icon' as const, icon: name });
const text = (value: string) => ({ kind: 'text' as const, text: value });
const start = (...items: InputAddon['items']): InputAddon => ({ items });
const end = (...items: InputAddon['items']): InputAddon => ({
  align: 'inline-end',
  items,
});
const top = (...items: InputAddon['items']): InputAddon => ({
  align: 'block-start',
  items,
});
const bottom = (...items: InputAddon['items']): InputAddon => ({
  align: 'block-end',
  items,
});

const G = React.forwardRef<InputHandle, InputProps>((props, ref) => (
  <Input ref={ref} style={{ width: '100%' }} {...props} />
));
const T = React.forwardRef<TextareaHandle, TextareaProps>((props, ref) => (
  <Textarea ref={ref} style={{ width: '100%' }} rows={3} {...props} />
));

export function InputGroupStory() {
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [starred, setStarred] = useState(false);
  const [masked, setMasked] = useState(true);
  const [runs, setRuns] = useState(0);
  const [attached, setAttached] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>();
  const [lastSearch, setLastSearch] = useState<string>();
  const [scope, setScope] = useState('Documentation');
  const [country, setCountry] = useState('+1');
  const [footer, setFooter] = useState('');
  const [summary, setSummary] = useState('');
  const [comment, setComment] = useState('');
  const [posted, setPosted] = useState<string>();
  const [custom, setCustom] = useState('');
  const [submitted, setSubmitted] = useState<string>();
  const [profileName, setProfileName] = useState('Ada Lovelace');
  const [profileEmail, setProfileEmail] = useState('ada@example.com');
  const [saved, setSaved] = useState<string>();
  const [address, setAddress] = useState('gpui-kit.com');
  const lastQuery = useRef('');
  const readonlyRef = useRef<InputHandle>(null);
  const passwordRef = useRef<InputHandle>(null);
  const fileRef = useRef<InputHandle>(null);
  const [file, setFile] = useState('notes.txt');
  const projectRef = useRef<InputHandle>(null);
  const [project, setProject] = useState('Input Group');
  const messageRef = useRef<TextareaHandle>(null);
  const commentRef = useRef<TextareaHandle>(null);
  const customRef = useRef<TextareaHandle>(null);
  const [notes, setNotes] = useState("console.log('Hello, GPUI Kit!');");

  const lowered = query.toLowerCase();
  const count = COMPONENTS.filter(name =>
    name.toLowerCase().includes(lowered),
  ).length;
  const invalidEmail =
    email !== '' && (!email.includes('@') || !email.includes('.'));
  const characters = [...message].length;
  const remaining = 120 - [...footer].length;

  return (
    <StoryFrame testID="story-input_group">
      <View style={{ width: '100%', gap: 16 }}>
        <Section title="Default">
          <View style={{ width: '100%', maxWidth: 384 }}>
            <G
              accessibilityLabel="Search components"
              placeholder="Search components…"
              onChangeText={setQuery}
              addons={[start(icon('search')), end(text(`${count} results`))]}
            />
          </View>
        </Section>
        <Section
          title="Alignment"
          description="Place addons before, after, above, or below the control."
        >
          <Column>
            <Labeled label="Inline start" description="A leading search icon.">
              <G placeholder="Search…" addons={[start(icon('search'))]} />
            </Labeled>
            <Labeled
              label="Inline end"
              description="A trailing icon with a masked input."
            >
              <G
                placeholder="Enter password"
                masked
                contentType="password"
                addons={[end(icon('eye-off'))]}
              />
            </Labeled>
            <Labeled
              label="Block start"
              description="The header is inside the shared frame."
            >
              <G
                placeholder="Enter your full name"
                addons={[top(text('Full Name'))]}
              />
            </Labeled>
            <Labeled
              label="Block end"
              description="The unit sits below the single-line input."
            >
              <G placeholder="0.00" addons={[bottom(text('USD'))]} />
            </Labeled>
          </Column>
        </Section>
        <Section
          title="Icons"
          description="Leading, paired, and multiple trailing icons."
        >
          <Column>
            <G placeholder="Enter your email" addons={[start(icon('inbox'))]} />
            <G
              placeholder="Username"
              defaultValue="ada"
              addons={[start(icon('user')), end(icon('check'))]}
            />
            <G
              placeholder="Website"
              defaultValue="gpui-kit.com"
              addons={[end(icon('star'), icon('info'))]}
            />
          </Column>
        </Section>
        <Section
          title="Text"
          description="Leading and trailing text share the input frame."
        >
          <Column>
            <G
              contentType="url"
              defaultValue="gpui-kit.com"
              addons={[
                start(text('https://')),
                end({
                  kind: 'button',
                  icon: 'star',
                  tooltip: 'Favorite website',
                  color: starred ? theme.primary : undefined,
                  onPress: () => setStarred(s => !s),
                }),
              ]}
            />
            <G
              placeholder="0.00"
              addons={[start(text('$')), end(text('USD'))]}
            />
            <G
              placeholder="example"
              addons={[start(text('https://')), end(text('.com'))]}
            />
            <G
              placeholder="Enter your username"
              addons={[end(text('@company.com'))]}
            />
          </Column>
        </Section>
        <Section
          title="Buttons"
          description="Multiple native actions retain their own behavior and focus."
        >
          <Column>
            <G
              ref={readonlyRef}
              readonly
              defaultValue="https://gpui-kit.com"
              addons={[
                end(
                  {
                    kind: 'button',
                    icon: copied ? 'check' : 'copy',
                    tooltip: 'Copy URL',
                    onPress: () => {
                      writeClipboard('https://gpui-kit.com');
                      setCopied(true);
                    },
                  },
                  {
                    kind: 'button',
                    label: 'Select all',
                    onPress: () => {
                      readonlyRef.current?.focus();
                      readonlyRef.current?.selectAll();
                    },
                  },
                ),
              ]}
            />
            <G
              ref={passwordRef}
              placeholder="Enter password"
              contentType="password"
              masked={masked}
              addons={[
                end({
                  kind: 'button',
                  icon: masked ? 'eye' : 'eye-off',
                  tooltip: 'Toggle password visibility',
                  onPress: () => setMasked(m => !m),
                }),
              ]}
            />
          </Column>
        </Section>
        <Section
          title="Tooltips"
          description="Compact help triggers keep the explanation beside its field."
        >
          <Column>
            <G
              placeholder="Enter password"
              masked
              contentType="password"
              addons={[
                end({
                  kind: 'button',
                  icon: 'info',
                  tooltip: 'Use at least 8 characters.',
                }),
              ]}
            />
            <G
              placeholder="Your email address"
              addons={[
                end({
                  kind: 'button',
                  icon: 'info',
                  tooltip: 'Used for notifications about this workspace.',
                }),
              ]}
            />
          </Column>
        </Section>
        <Section
          title="Dropdown menus"
          description="Menus act on the filename or choose the search scope and country code."
        >
          <Column>
            <G
              ref={fileRef}
              placeholder="Enter file name"
              value={file}
              onChangeText={setFile}
              addons={[
                end({
                  kind: 'button',
                  label: 'More',
                  menu: [
                    {
                      label: 'Copy filename',
                      onSelect: () => writeClipboard(file),
                    },
                    {
                      label: 'Reset filename',
                      onSelect: () => setFile('notes.txt'),
                    },
                    { label: 'Clear filename', onSelect: () => setFile('') },
                  ],
                }),
              ]}
            />
            <G
              placeholder="Enter search query"
              addons={[
                end({
                  kind: 'button',
                  label: scope,
                  dropdownCaret: true,
                  menu: ['Documentation', 'Blog posts', 'Changelog'].map(
                    label => ({
                      label,
                      checked: label === scope,
                      onSelect: () => setScope(label),
                    }),
                  ),
                }),
              ]}
            />
            <G
              placeholder="Phone number"
              addons={[
                start({
                  kind: 'button',
                  label: country,
                  dropdownCaret: true,
                  menu: ['+1', '+44', '+46'].map(label => ({
                    label,
                    checked: label === country,
                    onSelect: () => setCountry(label),
                  })),
                }),
              ]}
            />
          </Column>
        </Section>
        <Section
          title="Popover"
          description="A native popover keeps contextual details attached to its trigger."
        >
          <Column>
            <G
              placeholder="example.com"
              defaultValue="gpui-kit.com"
              onChangeText={setAddress}
              addons={[
                start(
                  {
                    kind: 'button',
                    icon: 'info',
                    tooltip: 'Address details',
                    popoverWidth: 288,
                    popover: (
                      <View style={{ gap: 8 }}>
                        <Text style={{ ...textSm, fontWeight: '600' }}>
                          Address details
                        </Text>
                        <Text style={textSm}>{`https://${address}`}</Text>
                        <Text style={textSm}>
                          The protocol prefix stays separate from the editable
                          hostname.
                        </Text>
                      </View>
                    ),
                  },
                  text('https://'),
                ),
              ]}
            />
          </Column>
        </Section>
        <Section title="Labels and descriptions">
          <Column>
            <Labeled
              label="Username"
              description="Clicking the @ addon focuses the input."
            >
              <G
                placeholder="username"
                addons={[start({ kind: 'label', text: '@' })]}
              />
            </Labeled>
            <G
              placeholder="you@example.com"
              addons={[
                top(
                  { kind: 'label', text: 'Email', color: theme.foreground },
                  {
                    kind: 'button',
                    icon: 'info',
                    push: true,
                    tooltip:
                      "We'll use this address for workspace notifications.",
                  },
                ),
              ]}
            />
          </Column>
        </Section>
        <Section
          title="Text and icon actions"
          description="Use larger buttons for a clear text action; keep secondary actions compact."
        >
          <Column>
            <G
              ref={projectRef}
              placeholder="Enter a project name"
              value={project}
              onChangeText={setProject}
              addons={[
                bottom(
                  {
                    kind: 'button',
                    size: 'small',
                    label: 'Clear',
                    onPress: () => setProject(''),
                  },
                  {
                    kind: 'button',
                    size: 'small',
                    variant: 'secondary',
                    label: 'Reset',
                    onPress: () => setProject('Input Group'),
                  },
                  {
                    kind: 'button',
                    size: 'small',
                    push: true,
                    icon: 'copy',
                    tooltip: 'Copy project name',
                    onPress: () => writeClipboard(project),
                  },
                ),
              ]}
            />
          </Column>
        </Section>
        <Section title="Keyboard shortcut and loading">
          <Column>
            <G
              placeholder="Search…"
              onSubmit={() => setLastSearch(lastQuery.current)}
              onChangeText={value => {
                lastQuery.current = value;
              }}
              addons={[
                start(icon('search')),
                end({ kind: 'kbd', keys: 'enter' }),
              ]}
            />
            {lastSearch !== undefined && (
              <Text style={{ ...textSm, color: theme.mutedForeground }}>
                {`Submitted search: ${lastSearch}`}
              </Text>
            )}
            <G
              readonly
              placeholder="Searching…"
              addons={[start({ kind: 'spinner' }), end(text('Please wait…'))]}
            />
          </Column>
        </Section>
        <Section
          title="Spinner placement"
          description="Progress can lead, trail, or sit next to status text."
        >
          <Column>
            <G
              readonly
              placeholder="Searching…"
              addons={[end({ kind: 'spinner' })]}
            />
            <G
              readonly
              placeholder="Processing…"
              addons={[start({ kind: 'spinner' })]}
            />
            <G
              readonly
              placeholder="Saving changes…"
              addons={[end(text('Saving…'), { kind: 'spinner' })]}
            />
          </Column>
        </Section>
        <Section title="Validation and disabled">
          <Column>
            <View style={{ gap: 8 }}>
              <G
                placeholder="you@example.com"
                contentType="email-address"
                onChangeText={setEmail}
                invalid={invalidEmail}
                addons={[start(icon('info'))]}
              />
              <Text
                style={{
                  ...textSm,
                  color: invalidEmail ? theme.danger : theme.mutedForeground,
                }}
              >
                {invalidEmail
                  ? 'Enter an email address such as you@example.com.'
                  : "Validation comes from the application's field value."}
              </Text>
            </View>
            <G
              disabled
              defaultValue="Unavailable"
              addons={[
                start(icon('search')),
                end({ kind: 'button', label: 'Search' }),
              ]}
            />
            <View style={{ gap: 8 }}>
              <G
                disabled
                invalid
                defaultValue="Invalid saved value"
                addons={[{ items: [] }]}
              />
              <Text style={{ ...textSm, color: theme.danger }}>
                The error remains visible while editing is unavailable.
              </Text>
            </View>
          </Column>
        </Section>
        <Section title="Textarea variants">
          <Column>
            <Labeled
              label="Without addons"
              description="The text viewport owns wrapping and scrolling."
            >
              <T placeholder="Enter your text here…" addons={[{ items: [] }]} />
            </Labeled>
            <T
              placeholder="Write your question…"
              addons={[top(text('Ask, search, or chat…'))]}
            />
            <T
              placeholder="Enter your message"
              onChangeText={setFooter}
              invalid={remaining < 0}
              addons={[bottom(text(`${remaining} characters left`))]}
            />
            <Labeled
              label="Invalid"
              description="Enter a summary to clear the error."
            >
              <T
                placeholder="Write a short summary…"
                onChangeText={setSummary}
                invalid={summary.trim() === ''}
                addons={[{ items: [] }]}
              />
            </Labeled>
            <Labeled
              label="Disabled"
              description="Text and addon actions are unavailable."
            >
              <T
                disabled
                defaultValue="This textarea is disabled."
                addons={[bottom({ kind: 'button', label: 'Post' })]}
              />
            </Labeled>
          </Column>
        </Section>
        <Section title="Textarea toolbars">
          <Column>
            <T
              rows={4}
              defaultValue="console.log('Hello, GPUI Kit!');"
              onChangeText={setNotes}
              addons={[
                {
                  align: 'block-start',
                  kitStyle: { borderBottomWidth: 1, borderColor: theme.border },
                  items: [
                    { kind: 'text', icon: 'file', text: 'script.js' },
                    {
                      kind: 'button',
                      push: true,
                      icon: 'copy',
                      tooltip: 'Copy script',
                      onPress: () => writeClipboard(notes),
                    },
                  ],
                },
                {
                  align: 'block-end',
                  kitStyle: { borderTopWidth: 1, borderColor: theme.border },
                  items: [
                    text(`Run count: ${runs}`),
                    {
                      kind: 'button',
                      push: true,
                      variant: 'secondary',
                      label: 'Run',
                      onPress: () => setRuns(r => r + 1),
                    },
                  ],
                },
              ]}
            />
          </Column>
        </Section>
        <Section
          title="Comment composer"
          description="Cancel clears the draft; Post keeps the submitted text below the composer."
        >
          <Column>
            <T
              ref={commentRef}
              placeholder="Share your thoughts…"
              value={comment}
              onChangeText={setComment}
              addons={[
                bottom(
                  text(`${[...comment].length} characters`),
                  {
                    kind: 'button',
                    push: true,
                    size: 'small',
                    label: 'Cancel',
                    disabled: comment === '',
                    onPress: () => {
                      setComment('');
                      commentRef.current?.focus();
                    },
                  },
                  {
                    kind: 'button',
                    size: 'small',
                    variant: 'primary',
                    label: 'Post',
                    disabled: comment.trim() === '',
                    onPress: () => {
                      setPosted(comment);
                      setComment('');
                      commentRef.current?.focus();
                    },
                  },
                ),
              ]}
            />
            {posted !== undefined && (
              <Text style={textSm}>{`Posted: ${posted}`}</Text>
            )}
          </Column>
        </Section>
        <Section
          title="Auto-growing textarea"
          description="The textarea keeps its own typography; the footer holds a primary submit action."
        >
          <Column>
            <T
              ref={customRef}
              placeholder="An automatically growing textarea…"
              autoGrowMin={1}
              autoGrowMax={8}
              value={custom}
              onChangeText={setCustom}
              kitStyle={{ fontSize: 16, fontFamily: 'Menlo' }}
              addons={[
                bottom(text('Plain text'), {
                  kind: 'button',
                  push: true,
                  variant: 'primary',
                  label: 'Submit',
                  icon: 'arrow-up',
                  disabled: custom.trim() === '',
                  onPress: () => {
                    setSubmitted(custom);
                    setCustom('');
                  },
                }),
              ]}
            />
            {submitted !== undefined && (
              <Text style={textSm}>{`Submitted: ${submitted}`}</Text>
            )}
          </Column>
        </Section>
        <Section
          title="Form composition"
          description="Use Field and GroupBox to keep labels, descriptions, and the save action together."
        >
          <Column>
            <GroupBox title="Contact details" style={{ width: '100%' }}>
              <Form
                style={{ width: '100%' }}
                fields={[
                  {
                    label: 'Display name',
                    control: (
                      <G
                        placeholder="Your name"
                        value={profileName}
                        onChangeText={setProfileName}
                      />
                    ),
                  },
                  {
                    label: 'Email',
                    description: 'Shown in this example only.',
                    control: (
                      <G
                        placeholder="you@example.com"
                        value={profileEmail}
                        onChangeText={setProfileEmail}
                        addons={[start(icon('inbox'))]}
                      />
                    ),
                  },
                ]}
                footer={
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'flex-end' }}
                  >
                    <Button
                      variant="primary"
                      label="Save contact"
                      onPress={() =>
                        setSaved(`${profileName} — ${profileEmail}`)
                      }
                    />
                  </View>
                }
              />
            </GroupBox>
            {saved !== undefined && (
              <Text style={textSm}>{`Saved: ${saved}`}</Text>
            )}
          </Column>
        </Section>
        <Section
          title="Chat textarea"
          description="The retained textarea grows with the message; its actions remain below it."
        >
          <Column>
            <T
              ref={messageRef}
              rows={undefined}
              autoGrowMin={2}
              autoGrowMax={6}
              placeholder="Write a message…"
              value={message}
              onChangeText={setMessage}
              invalid={characters > 280}
              addons={[
                ...(attached
                  ? [
                      top({
                        kind: 'text' as const,
                        icon: 'file' as const,
                        text: 'notes.txt',
                      }),
                    ]
                  : []),
                bottom(
                  text(`${characters}/280`),
                  {
                    kind: 'button',
                    push: true,
                    icon: 'plus',
                    tooltip: 'Toggle sample attachment',
                    onPress: () => setAttached(a => !a),
                  },
                  {
                    kind: 'button',
                    variant: 'primary',
                    label: 'Send',
                    disabled: message.trim() === '' || characters > 280,
                    onPress: () => {
                      if (message.trim() === '' || characters > 280) return;
                      setLastMessage(message);
                      setMessage('');
                      setAttached(false);
                      messageRef.current?.focus();
                    },
                  },
                ),
              ]}
            />
            {lastMessage !== undefined && (
              <Text style={{ ...textSm, color: theme.mutedForeground }}>
                {`Sent: ${lastMessage}`}
              </Text>
            )}
          </Column>
        </Section>
        <Section title="Sizes">
          <Column>
            {(['xsmall', 'small', 'medium', 'large'] as const).map(size => (
              <G
                key={size}
                size={size}
                placeholder={`${size} input`}
                addons={[start(icon('search'))]}
              />
            ))}
          </Column>
        </Section>
      </View>
    </StoryFrame>
  );
}
