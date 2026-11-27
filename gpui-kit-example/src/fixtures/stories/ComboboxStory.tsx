import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  Combobox,
  Icon,
  type ComboboxHandle,
  type ComboboxProps,
  type PickerGroup,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/combobox_story.rs` of gpui-component v0.9.1. */

const FRAMEWORKS = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'];
const MULTI_FRAMEWORKS = [
  'React',
  'Nextjs',
  'Angular',
  'VueJS',
  'Django',
  'Astro',
  'Remix',
  'Svelte',
  'SolidJS',
  'Qwik',
];
const FOOD: PickerGroup[] = [
  {
    title: 'Fruits',
    items: ['Apples', 'Bananas', 'Cherries'],
  },
  {
    title: 'Vegetables',
    items: ['Carrots', { title: 'Broccoli', disabled: true }, 'Spinach'],
  },
  {
    title: 'Beverages',
    items: ['Tea', { title: 'Coffee', disabled: true }, 'Juice'],
  },
];
const INDUSTRIES = [
  { title: 'Information Technology', icon: 'cpu' as const },
  { title: 'Healthcare', icon: 'heart' as const },
  { title: 'Finance', icon: 'globe' as const },
  { title: 'Education', icon: 'book-open' as const },
  { title: 'Entertainment', icon: 'star' as const },
];
const UNIVERSITIES = ['Harvard University', 'MIT', 'Stanford', 'Cambridge'];

const text = { fontSize: 14, lineHeight: 20, color: theme.foreground };
const muted = { ...text, color: theme.mutedForeground };
const textXs = { fontSize: 12, lineHeight: 16, color: theme.foreground };

/** Rust's `{:?}` for a `Vec<String>`. */
const debug = (values: string[]) =>
  `[${values.map(v => JSON.stringify(v)).join(', ')}]`;

const C = (props: ComboboxProps & { comboRef?: React.Ref<ComboboxHandle> }) => {
  const { comboRef, ...rest } = props;
  return (
    <Combobox
      ref={comboRef}
      searchable
      searchPlaceholder="Search…"
      style={{ width: 280 }}
      {...rest}
    />
  );
};

const Caret = () => (
  <Icon name="chevron-down" size="small" color={theme.mutedForeground} />
);

const chip = {
  borderRadius: theme.radius / 2,
  borderWidth: 1,
  borderColor: theme.border,
  paddingHorizontal: 4,
};

export function ComboboxStory() {
  const [basic, setBasic] = useState<string[]>([]);
  const [grouped, setGrouped] = useState(['Apples']);
  const [badges, setBadges] = useState(['React', 'Angular']);
  const [count, setCount] = useState(MULTI_FRAMEWORKS.slice(0, 6));
  const [universities, setUniversities] = useState(UNIVERSITIES);
  const footerRef = useRef<ComboboxHandle>(null);
  return (
    <StoryFrame testID="story-combobox">
      <View style={{ width: '100%', alignItems: 'center', gap: 16 }}>
        <Section
          title="Default"
          description="Search and choose one option."
          style={{ width: 280 }}
        >
          <C
            items={FRAMEWORKS}
            placeholder="Select framework..."
            onChange={e => setBasic(e.nativeEvent.values)}
          />
        </Section>
        <Section
          title="Multiple"
          description="Select more than one option."
          style={{ width: 280 }}
        >
          <C items={FRAMEWORKS} multiple placeholder="Select frameworks..." />
        </Section>
        <Section
          title="Groups"
          description="Organize results into groups."
          style={{ width: 280 }}
        >
          <C
            groups={FOOD}
            defaultValues={['Apples']}
            placeholder="Select item..."
            onChange={e => setGrouped(e.nativeEvent.values)}
          />
        </Section>
        <Section
          title="Disabled items"
          description="Keep unavailable options visible."
          style={{ width: 280 }}
        >
          <C
            items={[
              'Apples',
              { title: 'Bananas', disabled: true },
              'Cherries',
              'Carrots',
              { title: 'Broccoli', disabled: true },
            ]}
            placeholder="Select item..."
          />
        </Section>
        <Section
          title="Icons"
          description="Show icons in options and the trigger."
          style={{ width: 280 }}
        >
          <C
            items={INDUSTRIES}
            placeholder="Select industry category"
            renderTrigger={selection => {
              const single =
                selection.length === 1
                  ? INDUSTRIES.find(i => i.title === selection[0])
                  : undefined;
              return (
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {single && (
                    <Icon
                      name={single.icon}
                      size="small"
                      color={theme.mutedForeground}
                    />
                  )}
                  <Text
                    numberOfLines={1}
                    style={[selection.length ? text : muted, { flex: 1 }]}
                  >
                    {selection.length === 0
                      ? 'Select industry category'
                      : single
                        ? single.title
                        : `${selection.length} selected`}
                  </Text>
                  <Caret />
                </View>
              );
            }}
          />
        </Section>
        <Section
          title="Check icon"
          description="Replace the default selection mark."
          style={{ width: 280 }}
        >
          <C
            items={FRAMEWORKS}
            checkIcon="circle-check"
            placeholder="Select framework..."
          />
        </Section>
        <Section
          title="Footer"
          description="Add an action below the option list."
          style={{ width: 280 }}
        >
          <C
            comboRef={footerRef}
            items={universities}
            defaultValues={['Harvard University']}
            placeholder="Select university"
            onQuery={query => setUniversities([...UNIVERSITIES, query])}
            footer={
              <Button
                variant="ghost"
                label="New university"
                icon="plus"
                style={{ width: '100%' }}
                kitStyle={{
                  color: theme.foreground,
                  justifyContent: 'flex-start',
                }}
                onPress={() => footerRef.current?.requestQuery()}
              />
            }
          />
        </Section>
        <Section
          title="Custom trigger"
          description="Render custom trigger content."
          style={{ width: 280 }}
        >
          <C
            items={FRAMEWORKS}
            placeholder="Select framework"
            renderTrigger={selection => (
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  <Icon name="palette" size="small" color={theme.primary} />
                  {selection.length > 0 ? (
                    <View
                      style={{
                        backgroundColor: theme.primary,
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{ ...textXs, color: theme.primaryForeground }}
                      >
                        {selection.length === 1
                          ? selection[0]
                          : `${selection.length} selected`}
                      </Text>
                    </View>
                  ) : (
                    <Text style={muted}>Select framework</Text>
                  )}
                </View>
                <Caret />
              </View>
            )}
          />
        </Section>
        <Section
          title="Badges"
          description="Show removable selected badges."
          style={{ width: 280 }}
        >
          <C
            items={MULTI_FRAMEWORKS}
            multiple
            values={badges}
            onChange={e => setBadges(e.nativeEvent.values)}
            placeholder="Select frameworks"
            renderTrigger={selection =>
              selection.length === 0 ? (
                <Text style={muted}>Select frameworks</Text>
              ) : (
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      minWidth: 0,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {selection.slice(0, 1).map(item => (
                      <View
                        key={item}
                        style={{
                          ...chip,
                          minWidth: 0,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <Text numberOfLines={1} style={textXs}>
                          {item}
                        </Text>
                        <Button
                          variant="ghost"
                          size="xsmall"
                          icon="close"
                          onPress={() =>
                            setBadges(list => list.filter(v => v !== item))
                          }
                        />
                      </View>
                    ))}
                    {selection.length > 1 && (
                      <Text
                        style={{
                          ...textXs,
                          flexShrink: 0,
                          color: theme.mutedForeground,
                        }}
                      >
                        {`+${selection.length - 1}`}
                      </Text>
                    )}
                  </View>
                  <View style={{ flexShrink: 0 }}>
                    <Caret />
                  </View>
                </View>
              )
            }
          />
        </Section>
        <Section
          title="Maximum selections"
          description="Limit how many items can be selected."
          style={{ width: 280 }}
        >
          <C
            items={MULTI_FRAMEWORKS}
            multiple
            maxSelections={2}
            placeholder="Select up to 2 frameworks"
          />
        </Section>
        <Section
          title="Pinned items"
          description="Keep required items selected."
          style={{ width: 280 }}
        >
          <C
            items={FRAMEWORKS}
            pinned={FRAMEWORKS.slice(0, 2)}
            placeholder="Select framework..."
          />
        </Section>
        <Section
          title="Rich items"
          description="Render supporting content in option rows."
          style={{ width: 280 }}
        >
          <C
            items={[
              { title: FRAMEWORKS[0], badge: 'Featured' },
              ...FRAMEWORKS.slice(1),
            ]}
            placeholder="Select framework..."
          />
        </Section>
        <Section
          title="Overflow"
          description="Collapse selections after a visible limit."
          style={{ width: 280 }}
        >
          <C
            items={MULTI_FRAMEWORKS}
            multiple
            defaultValues={[0, 2, 5, 8, 9].map(i => MULTI_FRAMEWORKS[i])}
            placeholder="Select frameworks"
            renderTrigger={selection =>
              selection.length === 0 ? (
                <Text style={muted}>Select frameworks</Text>
              ) : (
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 4,
                  }}
                >
                  {selection.slice(0, 2).map(item => (
                    <View key={item} style={chip}>
                      <Text style={textXs}>{item}</Text>
                    </View>
                  ))}
                  {selection.length > 2 && (
                    <View style={chip}>
                      <Text style={{ ...textXs, color: theme.mutedForeground }}>
                        {`+${selection.length - 2} more`}
                      </Text>
                    </View>
                  )}
                </View>
              )
            }
          />
        </Section>
        <Section
          title="Count"
          description="Summarize selections as a count."
          style={{ width: 280 }}
        >
          <C
            items={MULTI_FRAMEWORKS}
            multiple
            defaultValues={MULTI_FRAMEWORKS.slice(0, 6)}
            onChange={e => setCount(e.nativeEvent.values)}
            placeholder="Select frameworks"
            renderTrigger={selection =>
              selection.length === 0 ? (
                <Text style={muted}>Select frameworks</Text>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      minWidth: 16,
                      height: 16,
                      paddingHorizontal: 4,
                      borderRadius: 999,
                      backgroundColor: theme.red,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{ fontSize: 10, lineHeight: 10, color: '#ffffff' }}
                    >
                      {selection.length > 99 ? '99+' : `${selection.length}`}
                    </Text>
                  </View>
                  <Text style={text}>frameworks selected</Text>
                </View>
              )
            }
          />
        </Section>
        <Section
          title="Values"
          description="Read selected values from each delegate."
          style={{ width: '100%' }}
        >
          <View style={{ gap: 8 }}>
            <Text style={{ ...text, fontSize: 16 }}>{`basic: ${debug(
              basic,
            )}`}</Text>
            <Text style={{ ...text, fontSize: 16 }}>
              {`grouped: ${debug(grouped)}`}
            </Text>
            <Text style={{ ...text, fontSize: 16 }}>
              {`multi_badges: ${debug(badges)}`}
            </Text>
            <Text style={{ ...text, fontSize: 16 }}>
              {`multi_count: ${debug(count)}`}
            </Text>
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
