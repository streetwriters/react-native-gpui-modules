import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Input,
  Select,
  Separator,
  type PickerGroup,
} from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  T,
  theme,
  type StorySize,
} from './StoryKit';
import countries from './data/countries.json';

/** `crates/story/src/stories/select_story.rs` of gpui-component v0.9.1. */
/** `countries.iter().chunk_by(|c| c.letter_prefix())`: consecutive runs by first letter. */
const COUNTRY_GROUPS: PickerGroup[] = [];
for (const country of countries as { name: string; code: string }[]) {
  const item = {
    title: country.name,
    value: country.code,
    display: `${country.name} (${country.code})`,
  };
  const last = COUNTRY_GROUPS[COUNTRY_GROUPS.length - 1];
  if (last?.title === country.name[0]) last.items.push(item);
  else COUNTRY_GROUPS.push({ title: country.name[0], items: [item] });
}
const FRUITS = [
  'Apple',
  'Orange',
  'Banana',
  'Grape',
  'Pineapple',
  'Watermelon & This is a long long long long long long long long long title',
  'Avocado',
];
const UIS = [
  'GPUI',
  'Iced',
  'egui',
  'Makepad',
  'Slint',
  'QT',
  'ImGui',
  'Cocoa',
  'WinUI',
];
const LANGUAGES = ['Rust', 'Go', 'C++', 'JavaScript'];
const REGIONS = ['CN', 'US', 'HK', 'JP', 'KR'];
const INPUT_BORDER = '#e5e5e5';
const SECONDARY_FOREGROUND = '#171717';

const debug = (value: string | null) =>
  value === null ? 'None' : `Some(${JSON.stringify(value)})`;

export function SelectStory({ size = 'medium' }: { size?: StorySize }) {
  const [disabled, setDisabled] = useState(false);
  const [country, setCountry] = useState<string | null>('AR');
  const [fruit, setFruit] = useState<string | null>(null);
  const [ui, setUi] = useState<string | null>('GPUI');
  const [language, setLanguage] = useState<string | null>(null);
  const field = { width: 280 };
  return (
    <StoryFrame testID="story-select">
      <View style={{ flex: 1, alignItems: 'center', gap: 16 }}>
        <View style={{ alignSelf: 'stretch' }}>
          <StoryToolbar
            size={size}
            items={[
              {
                label: 'Options',
                menu: [
                  {
                    label: 'Disabled',
                    checked: disabled,
                    onSelect: () => setDisabled(v => !v),
                  },
                ],
              },
            ]}
          />
        </View>
        <Section
          title="Search and clear"
          description="Search options and clear the value."
          style={field}
        >
          <Select
            style={field}
            groups={COUNTRY_GROUPS}
            defaultValue="AR"
            searchable
            size={size}
            searchPlaceholder="Search…"
            cleanable
            disabled={disabled}
            onChange={e => setCountry(e.nativeEvent.value || null)}
          />
        </Section>
        <Section
          title="Menu width"
          description="Set trigger and menu widths independently."
          style={field}
        >
          <Select
            style={field}
            items={FRUITS}
            searchable
            size={size}
            disabled={disabled}
            icon="search"
            menuWidth={400}
            onChange={e => setFruit(e.nativeEvent.value || null)}
          />
        </Section>
        <Section
          title="Disabled"
          description="Keep the selected value visible."
          style={field}
        >
          <Select style={field} items={[]} size={size} disabled />
        </Section>
        <Section
          title="Title prefix"
          description="Prefix the selected value."
          style={field}
        >
          <Select
            style={field}
            items={UIS}
            defaultValue="GPUI"
            size={size}
            disabled={disabled}
            placeholder="UI"
            titlePrefix="UI: "
            onChange={e => setUi(e.nativeEvent.value || null)}
          />
        </Section>
        <Section
          title="Menu height"
          description="Limit the popup height."
          style={field}
        >
          <Select
            style={field}
            items={UIS}
            defaultValue="GPUI"
            size={size}
            disabled={disabled}
            placeholder="UI"
            titlePrefix="UI: "
            menuMaxHeight={96}
          />
        </Section>
        <Section
          title="Search"
          description="Filter options from the popup."
          style={field}
        >
          <Select
            style={field}
            items={LANGUAGES}
            searchable
            accessibilityLabel="Programming language"
            size={size}
            disabled={disabled}
            placeholder="Language"
            titlePrefix="Language: "
            onChange={e => setLanguage(e.nativeEvent.value || null)}
          />
        </Section>
        <Section
          title="Empty"
          description="Render a custom empty state."
          style={field}
        >
          <Select
            style={field}
            items={[]}
            size={size}
            disabled={disabled}
            emptyText="No Data"
          />
        </Section>
        <Section
          title="Custom appearance"
          description="Compose an appearance-free select with another control."
          style={field}
        >
          <View
            style={{
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: INPUT_BORDER,
              borderRadius: theme.radiusLg,
              width: 280,
              gap: 4,
            }}
          >
            <View style={{ width: 140 }}>
              <Select
                style={{ width: 140 }}
                items={REGIONS}
                defaultValue="CN"
                size={size}
                appearance={false}
                kitStyle={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  color: SECONDARY_FOREGROUND,
                }}
              />
            </View>
            <Separator orientation="vertical" />
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Your phone number"
                appearance={false}
                kitStyle={{ paddingVertical: 8 }}
              />
            </View>
            <View style={{ padding: 8 }}>
              <Button size={size} variant="ghost" label="Send" />
            </View>
          </View>
        </Section>
        <Section
          title="Values"
          description="Read selected values from state."
          style={{ width: 512 }}
        >
          <View style={{ gap: 12 }}>
            <T>{`Country: ${debug(country)}`}</T>
            <T>{`fruit: ${debug(fruit)}`}</T>
            <T>{`UI: ${debug(ui)}`}</T>
            <T>{`Language: ${debug(language)}`}</T>
            <T>This is other text.</T>
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
