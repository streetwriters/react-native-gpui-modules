import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Clipboard, Slider } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, StoryToolbar, T, theme } from './StoryKit';

/** `crates/story/src/stories/slider_story.rs` of gpui-component v0.9.1. */
const small = { fontSize: 14, lineHeight: 22.65, color: theme.mutedForeground };
const WARM = 'rgb(237,190,45)';
const COOL = 'rgb(93,207,227)';

function hex(h: number, s: number, l: number, a: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h * 6) % 6;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r, g, b] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x];
  const m = l - c / 2;
  const byte = (v: number) =>
    Math.floor(v * 255)
      .toString(16)
      .toUpperCase()
      .padStart(2, '0');
  return `#${byte(r + m)}${byte(g + m)}${byte(b + m)}${a < 1 ? byte(a) : ''}`;
}

function Header({ title, value }: { title: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <T style={{ fontWeight: '500' }}>{title}</T>
      <Text style={small}>{value}</Text>
    </View>
  );
}

const HSL_DEFAULTS = [0.38, 0.5, 0.5, 0.5];
const CHANNELS = [
  ['Hue', 360],
  ['Saturation', 100],
  ['Lightness', 100],
  ['Alpha', 100],
] as const;

export function SliderStory() {
  const [disabled, setDisabled] = useState(false);
  const [volume, setVolume] = useState(75);
  const [range, setRange] = useState([12, 45]);
  const [storage, setStorage] = useState(5);
  const [months, setMonths] = useState(5);
  const [kelvin, setKelvin] = useState(3600);
  const [hsl, setHsl] = useState(HSL_DEFAULTS);
  const [speed, setSpeed] = useState(1);
  const rgb = hex(hsl[0], hsl[1], hsl[2], hsl[3]);
  const setChannel = (index: number) => (value: number) =>
    setHsl(previous => previous.map((v, i) => (i === index ? value : v)));
  return (
    <StoryFrame testID="story-slider">
      <View style={{ width: '100%', alignItems: 'center', gap: 12 }}>
        <View style={{ alignSelf: 'stretch' }}>
          <StoryToolbar
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
          title="Default"
          description="Adjust a single value within a defined range."
          style={{ width: 512 }}
        >
          <View
            style={{
              width: 360,
              gap: 16,
              padding: 16,
              borderRadius: theme.radiusLg,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Header title="Output volume" value={`${volume}`} />
            <Slider
              minimum={-255}
              maximum={255}
              step={15}
              defaultValue={75}
              disabled={disabled}
              onValueChange={setVolume}
            />
          </View>
        </Section>
        <Section
          title="Range"
          description="Choose minimum and maximum values together."
          style={{ width: 512 }}
        >
          <View
            style={{
              width: 360,
              gap: 16,
              padding: 16,
              borderRadius: theme.radiusLg,
              backgroundColor: 'rgba(245,245,245,0.4)',
            }}
          >
            <Header title="Price range" value={`$${range[0]}..${range[1]}`} />
            <Slider
              minimum={0}
              maximum={100}
              step={1}
              defaultValue={12}
              defaultEnd={45}
              disabled={disabled}
              onChange={e =>
                setRange([e.nativeEvent.current, e.nativeEvent.end])
              }
            />
          </View>
        </Section>
        <Section
          title="Reverse"
          description="Reverse the fill direction for remaining capacity."
          style={{ width: 512 }}
        >
          <View style={{ width: 360, gap: 16 }}>
            <Header title="Storage remaining" value={`${10 - storage} GB`} />
            <Slider
              minimum={0}
              maximum={10}
              step={1}
              defaultValue={5}
              horizontal
              reverse
              disabled={disabled}
              onValueChange={setStorage}
            />
          </View>
        </Section>
        <Section
          title="Duration"
          description="Compose a slider with a labeled tick scale."
          style={{ width: 512 }}
        >
          <View style={{ width: 360, gap: 8 }}>
            <Header title="Duration (months)" value={`${months}`} />
            <View style={{ paddingHorizontal: 16 }}>
              <Slider
                minimum={0}
                maximum={12}
                step={1}
                defaultValue={5}
                disabled={disabled}
                onValueChange={setMonths}
              />
              <View style={{ width: '100%', height: 34 }}>
                {Array.from({ length: 13 }, (_, month) => {
                  const major = month % 2 === 0;
                  return (
                    <View
                      key={month}
                      style={{
                        position: 'absolute',
                        left: `${(month / 12) * 100}%`,
                        marginLeft: -16,
                        width: 32,
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: 1,
                          height: major ? 6 : 3,
                          backgroundColor: theme.mutedForeground,
                        }}
                      />
                      {major && (
                        <Text style={[small, { marginTop: 8 }]}>{month}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </Section>
        <Section
          title="Color temperature"
          description="Place a color scale beside a regular slider."
          style={{ width: 512 }}
        >
          <View style={{ width: 360, gap: 12 }}>
            <Header title="Color temperature" value={`${kelvin} K`} />
            <View style={{ width: '100%', height: 12, flexDirection: 'row' }}>
              <View
                style={{
                  flex: 1,
                  borderTopLeftRadius: 9999,
                  borderBottomLeftRadius: 9999,
                  experimental_backgroundImage: `linear-gradient(90deg, ${WARM}, ${theme.background})`,
                }}
              />
              <View
                style={{
                  flex: 1,
                  borderTopRightRadius: 9999,
                  borderBottomRightRadius: 9999,
                  experimental_backgroundImage: `linear-gradient(90deg, ${theme.background}, ${COOL})`,
                }}
              />
            </View>
            <Slider
              minimum={2000}
              maximum={6500}
              step={100}
              defaultValue={3600}
              disabled={disabled}
              onValueChange={setKelvin}
            />
          </View>
        </Section>
        <Section
          title="Color Picker"
          subTitle={
            <View
              style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}
            >
              <T style={{ color: rgb }}>{rgb}</T>
              <Clipboard value={rgb} />
            </View>
          }
          style={{ width: 512, justifyContent: 'space-around' }}
        >
          {CHANNELS.map(([name, scale], index) => (
            <View
              key={name}
              style={{
                height: 128,
                gap: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Slider
                vertical
                minimum={0}
                maximum={1}
                step={0.01}
                defaultValue={HSL_DEFAULTS[index]}
                disabled={disabled}
                onValueChange={setChannel(index)}
                style={{ width: 20, minWidth: 0, flex: 1 }}
              />
              <View style={{ alignItems: 'center' }}>
                <T>{name}</T>
                <T>{(hsl[index] * scale).toFixed(0)}</T>
              </View>
            </View>
          ))}
        </Section>
        <Section
          title="Playback speed"
          description="Logarithmic scales provide finer control near common values."
          style={{ width: 512 }}
        >
          <View style={{ width: 360, gap: 16 }}>
            <Header title="Speed" value={`${speed.toFixed(2)}×`} />
            <Slider
              minimum={0.25}
              maximum={4}
              step={0.05}
              defaultValue={1}
              logarithmic
              horizontal
              disabled={disabled}
              onValueChange={setSpeed}
            />
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
