import React, { useState } from 'react';
import { View } from 'react-native';
import { Pagination } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, StoryToolbar, type StorySize } from './StoryKit';

/** `crates/story/src/stories/pagination_story.rs` of gpui-component v0.9.1. */
export function PaginationStory({ size = 'medium' }: { size?: StorySize }) {
  const [basic, setBasic] = useState(5);
  const [many, setMany] = useState(1);
  const [compact, setCompact] = useState(3);
  return (
    <StoryFrame testID="story-pagination">
      <View style={{ gap: 24 }}>
        <StoryToolbar size={size} />
        <Section title="Default">
          <Pagination
            currentPage={basic}
            totalPages={10}
            size={size}
            onChange={e => setBasic(e.nativeEvent.page)}
          />
        </Section>
        <Section
          title="Visible Pages"
          description="Control how many page links remain visible in a larger result set."
        >
          <Pagination
            currentPage={many}
            totalPages={50}
            visiblePages={10}
            size={size}
            onChange={e => setMany(e.nativeEvent.page)}
          />
        </Section>
        <Section title="Compact Style">
          <Pagination
            compact
            currentPage={compact}
            totalPages={10}
            size={size}
            onChange={e => setCompact(e.nativeEvent.page)}
          />
        </Section>
        <Section title="Disabled">
          <Pagination currentPage={4} totalPages={10} size={size} disabled />
        </Section>
      </View>
    </StoryFrame>
  );
}
