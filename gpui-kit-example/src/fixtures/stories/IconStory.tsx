import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, DropdownMenu, Icon } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T, theme } from './StoryKit';

/** `crates/story/src/stories/icon_story.rs` of gpui-component v0.9.1. */
const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const SEARCH_SVG = svg(
  '<path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" />',
);
const ARROW_SVG = svg('<path d="m5 12 7-7 7 7" /><path d="M12 19V5" />');
const LOADER_SVG = svg('<path d="M21 12a9 9 0 1 1-6.219-8.56" />');

const NEUTRAL_500 = '#737373';
const row = { flexDirection: 'row', alignItems: 'center', gap: 16 } as const;

export function IconStory() {
  const [message, setMessage] = useState(
    'Choose a button or menu item to try the icon slots.',
  );
  return (
    <StoryFrame testID="story-icon">
      <View style={{ alignItems: 'center', gap: 24 }}>
        <Section
          title="SVG bytes"
          description="Embedded icons share the same sizing, colors, and loading behavior."
          style={{ width: 480 }}
        >
          <View style={{ gap: 12 }}>
            <View style={row}>
              <Icon svg={SEARCH_SVG} size="small" />
              <Icon svg={SEARCH_SVG} size="large" color={theme.primary} />
              <Button
                iconSvg={SEARCH_SVG}
                label="Search"
                onPress={() => setMessage('Search selected from the button.')}
              />
              <Button
                iconSvg={SEARCH_SVG}
                loadingIconSvg={LOADER_SVG}
                loading
                label="Searching"
              />
              <DropdownMenu
                items={[
                  {
                    label: 'Search',
                    onSelect: () =>
                      setMessage('Search selected from the menu.'),
                  },
                ]}
              >
                <Button label="Actions" />
              </DropdownMenu>
            </View>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22.65,
                color: theme.mutedForeground,
              }}
            >
              {message}
            </Text>
          </View>
        </Section>
        <Section
          title="Cloning and views"
          description="Both arrows retain their SVG bytes and 90° rotation."
          style={{ width: 480 }}
        >
          <View style={row}>
            <T>Clone</T>
            <Icon svg={ARROW_SVG} rotate={90} size="large" />
          </View>
          <View style={row}>
            <T>Entity</T>
            <Icon svg={ARROW_SVG} rotate={90} size="large" />
          </View>
        </Section>
        <Section
          title="Icons"
          description="Common interface symbols from the bundled icon set."
          style={{ width: 480 }}
        >
          {(
            [
              'info',
              'map',
              'bot',
              'github',
              'calendar',
              'globe',
              'heart',
            ] as const
          ).map(name => (
            <Icon key={name} name={name} color={theme.foreground} />
          ))}
        </Section>
        <Section
          title="Color"
          description="Icons inherit semantic foreground colors."
          style={{ width: 480 }}
        >
          <Icon name="maximize" customSize={24} color={theme.green} />
          <Icon name="minimize" customSize={24} color={theme.red} />
        </Section>
        <Section
          title="Icon Buttons"
          description="Icons can be used as compact button content."
          style={{ width: 480 }}
        >
          <View style={row}>
            <Button
              variant="ghost"
              icon="heart"
              iconColor={NEUTRAL_500}
              iconCustomSize={24}
            />
            <Button
              variant="ghost"
              icon="heart-off"
              iconColor={theme.red}
              iconCustomSize={24}
            />
            <Button
              variant="ghost"
              icon="heart"
              iconColor={theme.green}
              iconCustomSize={24}
            />
          </View>
        </Section>
        <Section
          title="Custom Size"
          description="Explicit dimensions support dense controls and counters."
          style={{ width: 480 }}
        >
          <Button
            outline
            size="small"
            label="10"
            style={{ width: 20, height: 20 }}
            kitStyle={{ width: 20, height: 20, paddingHorizontal: 0 }}
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
