import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import {
  Resizable,
  ResizablePanel,
  type ResizableHandle,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, StoryToolbar, theme } from './StoryKit';

/** `crates/story/src/stories/resizable_story.rs` of gpui-component v0.9.1. */
const box = (height: number) =>
  ({
    width: '100%',
    height,
    borderWidth: 1,
    borderColor: theme.border,
  }) as const;

export function ResizableStory() {
  const [showLeft, setShowLeft] = useState(true);
  const [flexNone, setFlexNone] = useState(true);
  const programmatic = useRef<ResizableHandle>(null);
  const resize = (index: number, size: number) => () =>
    programmatic.current?.resizePanel(index, size);
  return (
    <StoryFrame testID="story-resizable">
      <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
        <Section
          title="Nested Panels"
          description="Combines horizontal and vertical splits with constrained panel sizes."
          style={{ width: '100%' }}
        >
          <View style={box(600)}>
            <Resizable vertical style={{ flex: 1 }}>
              <ResizablePanel>
                <Resizable>
                  <ResizablePanel
                    size={150}
                    minSize={120}
                    maxSize={300}
                    label="Left (120px .. 300px)"
                  />
                  <ResizablePanel label="Center" />
                  <ResizablePanel size={300} label="Right" />
                </Resizable>
              </ResizablePanel>
              <ResizablePanel label="Center" />
              <ResizablePanel
                size={80}
                minSize={80}
                label="Bottom (80px .. 150px)"
              />
            </Resizable>
          </View>
        </Section>
        <Section
          title="Growing Panel"
          description="A flexible panel absorbs the space left by a constrained neighbor."
          style={{ width: '100%' }}
        >
          <View style={box(400)}>
            <Resizable style={{ flex: 1 }}>
              <ResizablePanel
                size={200}
                minSize={200}
                maxSize={400}
                label="Left 2"
              />
              <ResizablePanel label="Right (Grow)" />
            </Resizable>
          </View>
        </Section>
        <Section
          title="Flex Behavior"
          description="Compare fixed and growing panels while toggling visibility."
          style={{ width: '100%' }}
        >
          <View style={{ width: '100%', gap: 8 }}>
            <StoryToolbar
              items={[
                {
                  label: showLeft ? 'Hide Left' : 'Show Left',
                  onPress: () => setShowLeft(v => !v),
                },
                {
                  label: flexNone ? 'Use flex_none: ON' : 'Use flex_none: OFF',
                  onPress: () => setFlexNone(v => !v),
                },
              ]}
            />
            <View style={box(200)}>
              <Resizable style={{ flex: 1 }}>
                <ResizablePanel
                  visible={showLeft}
                  size={200}
                  minSize={150}
                  maxSize={400}
                  flexNone={flexNone}
                  label="Left"
                />
                <ResizablePanel label="Center" />
                <ResizablePanel
                  size={280}
                  minSize={200}
                  maxSize={400}
                  flexNone={flexNone}
                  label="Right"
                />
              </Resizable>
            </View>
          </View>
        </Section>
        <Section
          title="Programmatic Resize"
          description="Panel sizes can be changed by actions as well as dragging."
          style={{ width: '100%' }}
        >
          <View style={{ width: '100%', gap: 8 }}>
            <StoryToolbar
              items={[
                { label: 'Compact left → 100', onPress: resize(0, 100) },
                { label: 'Reset left → 200', onPress: resize(0, 200) },
                { label: 'Compact right → 80', onPress: resize(2, 80) },
                { label: 'Reset right → 200', onPress: resize(2, 200) },
              ]}
            />
            <View style={box(200)}>
              <Resizable ref={programmatic} style={{ flex: 1 }}>
                <ResizablePanel size={200} label="Left" />
                <ResizablePanel label="Center (grow)" />
                <ResizablePanel size={200} label="Right" />
              </Resizable>
            </View>
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
