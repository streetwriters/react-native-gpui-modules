import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  Checkbox,
  Icon,
  Input,
  Label,
  type IconName,
  type InputHandle,
  type InputProps,
} from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/input_story.rs` of gpui-component v0.9.1. */

const full = { width: '100%' } as const;
const textSm = { fontSize: 14, lineHeight: 20, color: theme.foreground };
const textBase = { fontSize: 16, lineHeight: 25.9, color: theme.foreground };

/** Rust's `{:?}` for a string. */
const debug = (value: string) => JSON.stringify(value);

const CONTENT_TYPES: [
  string,
  NonNullable<InputProps['contentType']>,
  string,
  string,
  boolean,
][] = [
  ['Name', 'name', 'Full name', 'Jane Doe', false],
  ['Username', 'username', 'Username', 'jane.doe', false],
  ['Password', 'password', 'Current password', 'current-password', true],
  ['New password', 'new-password', 'New password', 'new-password', true],
  ['One-time code', 'one-time-code', '123456', '123456', false],
  ['Email', 'email-address', 'Email address', 'jane.doe@example.com', false],
  [
    'Telephone',
    'telephone-number',
    'Telephone number',
    '+1 415 555 0198',
    false,
  ],
  ['URL', 'url', 'Website URL', 'https://example.com', false],
  [
    'Credit card number',
    'credit-card-number',
    'Card number',
    '4242 4242 4242 4242',
    false,
  ],
  ['Credit card expiration', 'credit-card-expiration', 'MM/YY', '12/28', false],
  [
    'Credit card security code',
    'credit-card-security-code',
    'CVC',
    '123',
    true,
  ],
  ['Postal code', 'postal-code', 'Postal code', '94107', false],
];

/** `InfoButton`: `Button::new("info").text().icon(IconName::Info).xsmall()`. */
const info = <Button variant="text" icon="info" size="xsmall" />;
const search = <Icon name="search" size="small" />;

export function InputStory({ size = 'medium' }: { size?: StorySize }) {
  const [currency, setCurrency] = useState('');
  const [phone, setPhone] = useState('');
  const [mask, setMask] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const focus = (value: string) => ({
    onFocus: () => setFocused(value),
    onBlur: () => setFocused(null),
  });
  const S = (props: InputProps) => (
    <Input size={size} style={full} {...props} />
  );
  return (
    <StoryFrame testID="story-input">
      <View style={{ width: '100%', gap: 12 }}>
        <StoryToolbar size={size} />
        <Section
          title="Default"
          description="Text, email, and clearable inputs."
          style={{ width: 512 }}
        >
          <S
            cleanable
            defaultValue="Hello 世界，this is GPUI component, this is a long text."
          />
          <S placeholder="Enter text here..." />
        </Section>
        <Section
          title="States"
          description="Disabled, read-only and revealable password inputs."
          style={{ width: 512 }}
        >
          <S disabled defaultValue="This is disabled input" />
          <S readonly defaultValue="This is read-only input" />
          <S
            masked
            maskToggle
            cleanable
            contentType="password"
            placeholder="Enter your password..."
            defaultValue="this-is-password-中文🚀🎉"
          />
        </Section>
        <Section
          title="Content type"
          description="Content types adapt input behavior."
          style={{ width: 512 }}
        >
          {CONTENT_TYPES.map(([label, type, placeholder, value, masked]) => (
            <View
              key={label}
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View style={{ width: 192, flexShrink: 0 }}>
                <Label text={label} kitStyle={{ fontSize: 14 }} />
              </View>
              <Input
                style={{ flex: 1 }}
                contentType={type}
                placeholder={placeholder}
                defaultValue={value}
                masked={masked}
                maskToggle={masked}
              />
            </View>
          ))}
        </Section>
        <Section
          title="Alignment"
          description="Align text to the center or end."
          style={{ width: 512 }}
        >
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <Input
              size={size}
              style={{ flex: 1 }}
              textAlign="center"
              placeholder="Enter text to test center layout..."
              defaultValue="Centered Text"
            />
            <Input
              size={size}
              style={{ flex: 1 }}
              textAlign="right"
              placeholder="Enter text to test right layout..."
              defaultValue="Right Aligned Text"
            />
          </View>
        </Section>
        <Section
          title="Prefix and suffix"
          description="Add icons or actions inside the field."
          style={{ width: 512 }}
        >
          <S cleanable prefix={search} placeholder="Search some thing..." />
          <S
            cleanable
            prefix={search}
            suffix={info}
            placeholder="This input have prefix and suffix."
          />
          <S
            cleanable
            suffix={info}
            pattern="^[a-zA-Z0-9]*$"
            placeholder="This input only support [a-zA-Z0-9] characters."
          />
        </Section>
        <Section
          title="Composed states"
          description="Composed inputs support disabled state."
          style={{ width: 512 }}
        >
          <S
            cleanable
            prefix={search}
            suffix={info}
            placeholder="Search account..."
            defaultValue="jane.doe@example.com"
          />
          <S
            cleanable
            disabled
            prefix={search}
            suffix={info}
            placeholder="Search account..."
            defaultValue="disabled.account@example.com"
          />
        </Section>
        <Section
          title="Currency"
          description="Format currency while retaining its value."
          style={{ width: 512 }}
        >
          <S
            maskPattern={JSON.stringify({ separator: ',', fraction: 3 })}
            onChangeText={setCurrency}
          />
          <Text style={textBase}>{`Value: ${debug(currency)}`}</Text>
        </Section>
        <Section
          title="Phone mask"
          description="Expose formatted and raw phone values."
          style={{ width: 512 }}
        >
          <S maskPattern="(999)-999-9999" onChangeText={setPhone} />
          <View>
            <Text style={textBase}>{`Value: ${debug(phone)}`}</Text>
            <Text style={textBase}>
              {`Unmask Value: ${debug(phone.replace(/\D/g, ''))}`}
            </Text>
          </View>
        </Section>
        <Section
          title="Mask pattern"
          description="Combine letter and number placeholders."
          style={{ width: 512 }}
        >
          <S maskPattern="AAA-###-AAA" onChangeText={setMask} />
          <View>
            <Text style={textBase}>{`Value: ${debug(mask)}`}</Text>
            <Text style={textBase}>
              {`Unmask Value: ${debug(mask.replace(/[^A-Za-z0-9]/g, ''))}`}
            </Text>
          </View>
        </Section>
        <Section
          title="Validation"
          description="Validate values while the user types."
          style={{ width: 512 }}
        >
          <S
            pattern="^-?[0-9]*\.?[0-9]*$"
            placeholder="validate to limit float number."
          />
        </Section>
        <Section
          title="Clear on Escape"
          description="Clear a value with its action or Escape."
          style={{ width: 512 }}
        >
          <S
            cleanable
            cleanOnEscape
            placeholder="Enter text and clear it by pressing ESC"
            {...focus('')}
          />
        </Section>
        <Section
          title="Focused value"
          description="Read the value of the focused input."
          style={{ width: 512 }}
        >
          <Text style={textBase}>
            {`Value: ${focused === null ? 'None' : `Some(${debug(focused)})`}`}
          </Text>
        </Section>
        <Section
          title="Custom appearance"
          description="Remove the default field appearance."
          style={{ width: 512 }}
        >
          <View
            style={{
              width: '100%',
              borderBottomWidth: 2,
              borderColor: theme.border,
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: theme.secondary,
            }}
          >
            <S
              appearance={false}
              contextMenuEnabled={false}
              placeholder="Custom Input use monospace, 0123456789."
              kitStyle={{
                fontFamily: 'Menlo',
                color: theme.secondaryForeground,
              }}
            />
          </View>
        </Section>
        <Section
          title="Context menu"
          description="Add actions to the editing menu."
          style={{ width: 512 }}
        >
          <S
            placeholder="Input with custom context menu..."
            contextMenu={[
              {
                label: 'Custom Action',
                action: 'input::SelectAll',
                disabled: false,
              },
              { label: '-', action: '', disabled: false },
              { label: 'Copy', action: 'input::Copy', disabled: false },
              { label: 'Paste', action: 'input::Paste', disabled: false },
            ]}
          />
        </Section>
        <Section
          title="Text color"
          description="Apply a semantic text color."
          style={{ width: 512 }}
        >
          <S
            placeholder="Type something..."
            defaultValue="Custom text color input"
            kitStyle={{ color: theme.info }}
          />
        </Section>
        <Section
          title="Atomic inline tokens"
          description="References keep their identity through selection, deletion and undo. Copy returns the underlying text."
          style={{ width: '100%' }}
        >
          <TokenExample />
        </Section>
        <Section
          title="Completion"
          description="The application owns the candidates, the menu and the keys it captures; type $ to complete a variable."
          style={{ width: 512 }}
        >
          <View style={{ width: '100%', gap: 8 }}>
            <Input style={full} placeholder="Type $ to complete a variable" />
            <Text style={{ ...textSm, color: theme.mutedForeground }}>
              Enter submits when no menu is open.
            </Text>
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}

type Reference = {
  id: string;
  text: string;
  label: string;
  icon: IconName;
  action: string;
};

/** `input_tokens.rs`: the four sample references. */
const REFERENCES: Reference[] = [
  {
    id: 'command:commit-pr',
    text: '/commit-pr',
    label: '',
    icon: 'square-terminal',
    action: 'Insert command',
  },
  {
    id: 'image:1',
    text: '[Image 1]',
    label: 'Image 1',
    icon: 'image',
    action: 'Attach image',
  },
  {
    id: 'skill:gpui-kit',
    text: '$gpui-kit',
    label: 'gpui-kit',
    icon: 'sparkles',
    action: 'Insert skill',
  },
  {
    id: 'person:alice',
    text: '@alice',
    label: 'Alice',
    icon: 'at-sign',
    action: 'Mention someone',
  },
];
const INITIAL = 'Ask @alice to review [Image 1] 🙂';
const INITIAL_REFERENCES = ['person:alice', 'image:1'];

const utf8 = (text: string) =>
  [...text].reduce((n, c) => {
    const code = c.codePointAt(0) ?? 0;
    return n + (code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4);
  }, 0);

/** UTF-16 offset to the byte offset the kit reports ranges in. */
const byteAt = (text: string, at: number) => utf8(text.slice(0, at));

function describe(text: string, ids: string[]) {
  let from = 0;
  return ids
    .map(id => REFERENCES.find(r => r.id === id)!)
    .map(reference => {
      const at = text.indexOf(reference.text, from);
      if (at < 0) return null;
      from = at + reference.text.length;
      const start = byteAt(text, at);
      return `${reference.id} ${start}..${start + utf8(reference.text)}`;
    })
    .filter(Boolean)
    .join(', ');
}

function TokenExample() {
  const input = useRef<InputHandle>(null);
  const [text, setText] = useState(INITIAL);
  const [ids, setIds] = useState<string[]>([]);
  const [saved, setSaved] = useState({
    text: INITIAL,
    ids: INITIAL_REFERENCES,
  });
  const [readonly, setReadonly] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [status, setStatus] = useState('');

  const load = (value: { text: string; ids: string[] }) => {
    const handle = input.current;
    if (!handle) return;
    handle.replaceAll(value.text);
    let from = 0;
    for (const id of value.ids) {
      const reference = REFERENCES.find(r => r.id === id)!;
      const at = value.text.indexOf(reference.text, from);
      from = at + reference.text.length;
      const start = byteAt(value.text, at);
      handle.setSelectedRange(start, start + utf8(reference.text));
      handle.insertToken(reference.id, reference.text, reference.label);
    }
    setIds(value.ids);
  };
  useEffect(() => {
    load(saved);
    // The initial content is loaded once, as `TokenExample::new` does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const insert = (reference: Reference) => {
    const handle = input.current;
    if (!handle) return;
    if (/\S$/.test(text)) handle.insert(' ');
    handle.insertToken(reference.id, reference.text, reference.label);
    handle.insert(' ');
    handle.focus();
    setIds(list => [...list, reference.id]);
  };
  const row = (label: string, value: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <Text
        style={{
          ...textSm,
          width: 88,
          flexShrink: 0,
          color: theme.mutedForeground,
        }}
      >
        {label}
      </Text>
      <Text style={{ ...textSm, flex: 1, minWidth: 0 }}>{value}</Text>
    </View>
  );
  return (
    <View style={{ width: '100%', gap: 16 }}>
      <Input
        ref={input}
        style={full}
        readonly={readonly}
        disabled={disabled}
        accessibilityLabel="Message"
        onChangeText={setText}
        onTokenClick={event => {
          const reference = REFERENCES.find(r => r.id === event.nativeEvent.id);
          setStatus(
            reference?.id.startsWith('command:')
              ? `Would run ${reference.text}`
              : reference?.id.startsWith('image:')
                ? `Would preview ${reference.label}`
                : reference?.id.startsWith('skill:')
                  ? `Would open the ${reference.label} skill`
                  : reference
                    ? `Would open ${reference.label}'s profile`
                    : `Unknown reference ${event.nativeEvent.id}`,
          );
        }}
        addons={[
          {
            align: 'inline-end',
            items: [
              ...REFERENCES.map(reference => ({
                kind: 'button' as const,
                icon: reference.icon,
                tooltip: reference.action,
                disabled: readonly,
                onPress: () => insert(reference),
              })),
              {
                kind: 'button' as const,
                variant: 'primary' as const,
                label: 'Send',
                onPress: () =>
                  setStatus(
                    `Sent ${debug(text.trim())} with ${
                      describe(text, ids).split(', ').filter(Boolean).length
                    } references`,
                  ),
              },
            ],
          },
        ]}
      />
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button
            outline
            size="small"
            label="Save draft"
            onPress={() => {
              setSaved({ text, ids });
              setStatus('Draft saved');
            }}
          />
          <Button
            outline
            size="small"
            label="Restore draft"
            disabled={readonly || disabled}
            onPress={() => {
              load(saved);
              setStatus('Draft restored');
            }}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Checkbox
            size="small"
            label="Readonly"
            checked={readonly}
            onChange={event => setReadonly(event.nativeEvent.state)}
          />
          <Checkbox
            size="small"
            label="Disabled"
            checked={disabled}
            onChange={event => setDisabled(event.nativeEvent.state)}
          />
        </View>
      </View>
      <View style={{ width: '100%', gap: 4 }}>
        {row('Text', text)}
        {row('References', describe(text, ids))}
        {status !== '' && row('Status', status)}
      </View>
    </View>
  );
}
