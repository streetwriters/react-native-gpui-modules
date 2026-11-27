import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Carousel, type KitStyle } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  T,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/carousel_story.rs` of gpui-component v0.9.1. */
const slide = (fontSize: number, square: boolean): KitStyle => ({
  ...(square ? { aspectRatio: 1 } : { height: '100%' }),
  padding: 24,
  borderRadius: theme.radius * 2,
  borderWidth: 1,
  borderColor: theme.border,
  backgroundColor: theme.background,
  color: theme.foreground,
  fontWeight: 600,
  fontSize,
});
const LARGE = slide(36, true);
const frame = (maxWidth: number) =>
  ({ width: '100%', maxWidth, alignSelf: 'center' }) as const;
const numbers = (count: number) =>
  Array.from({ length: count }, (_, i) => String(i + 1));

export function CarouselStory({ size = 'medium' }: { size?: StorySize }) {
  const [controlled, setControlled] = useState(1);
  const section = { width: '100%', gap: 12, alignItems: 'stretch' } as const;
  return (
    <StoryFrame testID="story-carousel">
      <View style={{ width: '100%', gap: 16 }}>
        <StoryToolbar size={size} />
        <Section
          title="Basic"
          description="Browse one full-width item at a time with Left and Right."
          column
          style={section}
        >
          <Carousel
            style={frame(384)}
            kitStyle={{ width: '100%' }}
            size={size}
            slides={numbers(3)}
            slideStyle={LARGE}
            paginationLabels
          />
        </Section>
        <Section
          title="Custom controls"
          description="Replace control content and accessibility labels while retaining navigation behavior."
          column
          style={section}
        >
          <Carousel
            style={frame(384)}
            kitStyle={{ width: '100%' }}
            size={size}
            slides={numbers(3)}
            slideStyle={LARGE}
            pagination={false}
            previousLabel="Back"
            nextLabel="Forward"
            previousAccessibilityLabel="Previous project"
            nextAccessibilityLabel="Next project"
          />
        </Section>
        <Section
          title="Multiple items"
          description={MULTIPLE}
          column
          style={section}
        >
          <Carousel
            style={frame(384)}
            kitStyle={{ width: '100%' }}
            size={size}
            slides={numbers(5)}
            slideStyle={slide(24, true)}
            itemStyle={{ flexBasis: '33.333%', paddingLeft: 4 }}
            trackStyle={{ marginLeft: -4 }}
            pagination={false}
          />
        </Section>
        <Section
          title="Vertical"
          description="Use Up and Down to navigate a vertical carousel."
          column
          style={section}
        >
          <Carousel
            style={frame(256)}
            kitStyle={{ width: '100%' }}
            vertical
            size={size}
            slides={numbers(3)}
            slideStyle={slide(30, false)}
            itemStyle={{ flexBasis: '50%' }}
            contentStyle={{ height: 192 }}
            pagination={false}
          />
        </Section>
        <Section
          title="Looping"
          description="Looping navigation wraps from the last slide to the first."
          column
          style={section}
        >
          <Carousel
            style={frame(384)}
            kitStyle={{ width: '100%' }}
            looping
            size={size}
            slides={numbers(4)}
            slideStyle={LARGE}
            pagination={false}
          />
        </Section>
        <Section
          title="Controlled"
          description="The selected index is owned by application state and can be changed programmatically."
          column
          style={section}
        >
          <Carousel
            style={frame(384)}
            kitStyle={{ width: '100%' }}
            size={size}
            slides={numbers(3)}
            slideStyle={LARGE}
            pagination={false}
            selectedIndex={controlled}
            onChange={e => setControlled(e.nativeEvent.index)}
          />
          <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'center' }}>
            <T>{`Selected slide: ${controlled + 1}`}</T>
            <Button label="Go to first" onPress={() => setControlled(0)} />
            <Button label="Go to last" onPress={() => setControlled(2)} />
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}

const MULTIPLE =
  "A fractional flex basis shows several items at once. Pair the content's negative margin with matching item padding to tune the gap between them.";
