import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Progress, ProgressCircle } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  T,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/progress_story.rs` of gpui-component v0.9.1. */
export function ProgressStory({ size = 'medium' }: { size?: StorySize }) {
  const [value, setValue] = useState(25);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);
  const play = () => {
    clearInterval(timer.current);
    setValue(0);
    timer.current = setInterval(() => {
      setValue(v => {
        const next = Math.min(100, v + 2);
        if (next >= 100) clearInterval(timer.current);
        return next;
      });
    }, 15);
  };
  const small = {
    fontSize: 14,
    lineHeight: 22.65,
    color: theme.mutedForeground,
  };
  return (
    <StoryFrame testID="story-progress">
      <View style={{ width: '100%', gap: 12 }}>
        <StoryToolbar
          size={size}
          items={[
            {
              label: `Value: ${value}%`,
              menu: [0, 25, 75, 100].map(preset => ({
                label: `${preset}%`,
                checked: value === preset,
                onSelect: () => setValue(preset),
              })),
            },
            {
              label: 'Options',
              menu: [
                {
                  label: 'Loading',
                  checked: loading,
                  onSelect: () => setLoading(v => !v),
                },
              ],
            },
            { icon: 'play', onPress: play },
          ]}
        />
        <Section
          title="Upload"
          description="Pair progress with a clear label, value, and status."
          style={{ width: 560 }}
        >
          <View
            style={{
              width: 400,
              gap: 12,
              padding: 16,
              borderRadius: theme.radiusLg,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <T style={{ fontWeight: '500' }}>Uploading design-assets.zip</T>
              <Text style={small}>{`${value}%`}</Text>
            </View>
            <Progress value={value} loading={loading} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={[small, { fontSize: 12, lineHeight: 19.4 }]}>
                24.8 MB of 96 MB
              </Text>
              <Text style={[small, { fontSize: 12, lineHeight: 19.4 }]}>
                {loading ? 'Calculating…' : 'About 1 min left'}
              </Text>
            </View>
          </View>
        </Section>
        <Section
          title="Circular"
          description="Use a compact radial indicator for focused tasks."
          style={{ width: 560 }}
        >
          <View
            style={{
              width: 400,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              padding: 16,
              borderRadius: theme.radiusLg,
              backgroundColor: 'rgba(245,245,245,0.4)',
            }}
          >
            <View style={{ width: 80, height: 80 }}>
              <ProgressCircle
                size={size}
                value={value}
                loading={loading}
                style={{ width: 80, height: 80 }}
              />
              {!loading && (
                <View
                  style={{
                    position: 'absolute',
                    inset: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <T style={{ fontWeight: '600' }}>{`${value}%`}</T>
                </View>
              )}
            </View>
            <View style={{ gap: 4 }}>
              <T style={{ fontWeight: '500' }}>Analyzing project</T>
              <Text style={small}>
                {loading
                  ? 'Preparing analysis…'
                  : 'Scanning components and dependencies.'}
              </Text>
            </View>
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
