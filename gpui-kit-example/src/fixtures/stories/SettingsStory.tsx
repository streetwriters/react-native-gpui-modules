import React, { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import {
  Button,
  Icon,
  Settings,
  Theme,
  type SettingPageSpec,
} from '@react-native-gpui/gpui-kit';
import { StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/settings_story.rs` of gpui-component v0.9.1. */

const DEFAULTS = {
  dark: false,
  autoSwitchTheme: false,
  cliPath: '/usr/local/bin/bash',
  fontFamily: 'Arial',
  fontSize: 14,
  lineHeight: 12,
  density: 'Comfortable',
  notificationsEnabled: true,
  autoUpdate: true,
  resettable: true,
  disabled: false,
  groupVariant: 'outline',
  groupSize: 'medium',
};

type AppSettings = typeof DEFAULTS;

const open = (url: string) => () => {
  Linking.openURL(url).catch(() => {});
};

const SIZES = { medium: 'medium', small: 'small', xsmall: 'xsmall' } as const;

export function SettingsStory() {
  const [s, setS] = useState<AppSettings>(DEFAULTS);
  const set = (key: string, value: boolean | number | string) =>
    setS(current => ({ ...current, [key]: value }));
  const size = SIZES[s.groupSize as keyof typeof SIZES] ?? 'medium';
  const pages: SettingPageSpec[] = [
    {
      title: 'General',
      resettable: s.resettable,
      defaultOpen: true,
      icon: 'settings-2',
      titleSuffix: (
        <Button
          icon="info"
          variant="ghost"
          size="xsmall"
          onPress={open('https://gpui-kit.com/')}
        />
      ),
      groups: [
        {
          title: 'Appearance',
          items: [
            {
              key: 'dark',
              kind: 'switch',
              title: 'Dark Mode',
              value: s.dark,
              defaultValue: false,
              description: 'Switch between light and dark themes.',
              disabled: s.disabled,
            },
            {
              key: 'autoSwitchTheme',
              kind: 'checkbox',
              title: 'Auto Switch Theme',
              value: s.autoSwitchTheme,
              defaultValue: DEFAULTS.autoSwitchTheme,
              description:
                'Automatically switch theme based on system settings.',
              disabled: s.disabled,
            },
            {
              key: 'resettable',
              kind: 'switch',
              title: 'resettable',
              value: s.resettable,
              description: 'Enable/Disable reset button for settings.',
              disabled: s.disabled,
            },
            {
              key: 'groupVariant',
              kind: 'dropdown',
              title: 'Group Variant',
              value: s.groupVariant,
              defaultValue: 'outline',
              options: [
                ['normal', 'Normal'],
                ['outline', 'Outline'],
                ['fill', 'Fill'],
              ],
              description: 'Select the variant for setting groups.',
              disabled: s.disabled,
            },
            {
              key: 'groupSize',
              kind: 'dropdown',
              title: 'Group Size',
              value: s.groupSize,
              defaultValue: 'medium',
              options: [
                ['medium', 'Medium'],
                ['small', 'Small'],
                ['xsmall', 'XSmall'],
              ],
              description: 'Select the size for the setting group.',
              disabled: s.disabled,
            },
          ],
        },
        {
          title: 'Font',
          footer: 'Font preferences apply to this story only.',
          items: [
            {
              key: 'fontFamily',
              kind: 'dropdown',
              title: 'Font Family',
              value: s.fontFamily,
              defaultValue: DEFAULTS.fontFamily,
              options: [
                ['Arial', 'Arial'],
                ['Helvetica', 'Helvetica'],
                ['Times New Roman', 'Times New Roman'],
                ['Courier New', 'Courier New'],
              ],
              description: 'Select the font family for the story.',
              disabled: s.disabled,
            },
            {
              key: 'fontSize',
              kind: 'number',
              title: 'Font Size',
              value: s.fontSize,
              defaultValue: DEFAULTS.fontSize,
              min: 8,
              max: 72,
              description:
                'Adjust the font size for better readability between 8 and 72.',
              disabled: s.disabled,
            },
            {
              key: 'lineHeight',
              kind: 'number',
              title: 'Line Height',
              value: s.lineHeight,
              defaultValue: DEFAULTS.lineHeight,
              min: 8,
              max: 32,
              description:
                'Adjust the line height for better readability between 8 and 32.',
              disabled: s.disabled,
            },
          ],
        },
        {
          title: 'Other',
          items: [
            {
              key: 'disabled',
              kind: 'switch',
              title: 'Disable Settings',
              value: s.disabled,
              defaultValue: false,
              description: 'Lock the other settings.',
            },
            {
              key: 'foo',
              kind: 'switch',
              title: 'Foo',
              value: s.disabled,
              defaultValue: false,
              description: 'Find me by searching for my sibling',
              keywords: ['Bar'],
            },
            {
              kind: 'render',
              disabled: s.disabled,
              content: (
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    opacity: s.disabled ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 22.65,
                      color: theme.foreground,
                    }}
                  >
                    View source, report issues, and follow project updates.
                  </Text>
                  <Button
                    icon="globe"
                    label="Repository..."
                    outline
                    size={size}
                    disabled={s.disabled}
                    onPress={open('https://github.com/longbridge/gpui-kit')}
                  />
                </View>
              ),
            },
            {
              key: 'density',
              kind: 'field',
              title: 'Density',
              description:
                'A custom element field with reset support via `on_reset`.',
              disabled: s.disabled,
              dirty: s.density !== DEFAULTS.density,
              field: (
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {['Comfortable', 'Compact'].map(value => (
                    <Button
                      key={value}
                      label={value}
                      size={size}
                      variant={s.density === value ? 'primary' : undefined}
                      outline={s.density !== value}
                      onPress={() => set('density', value)}
                    />
                  ))}
                </View>
              ),
            },
            {
              key: 'cliPath',
              kind: 'input',
              title: 'CLI Path',
              value: s.cliPath,
              defaultValue: DEFAULTS.cliPath,
              vertical: true,
              description:
                'Path to the CLI executable. \nThis item uses Vertical layout. The title,description, and field are all aligned vertically with width 100%.',
              disabled: s.disabled,
            },
          ],
        },
      ],
    },
    {
      title: 'Software Update',
      resettable: s.resettable,
      icon: 'cpu',
      groups: [
        {
          title: 'Updates',
          items: [
            {
              key: 'notificationsEnabled',
              kind: 'switch',
              title: 'Enable Notifications',
              value: s.notificationsEnabled,
              defaultValue: DEFAULTS.notificationsEnabled,
              description: 'Receive notifications about updates and news.',
              disabled: s.disabled,
            },
            {
              key: 'autoUpdate',
              kind: 'switch',
              title: 'Auto Update',
              value: s.autoUpdate,
              defaultValue: DEFAULTS.autoUpdate,
              description: 'Automatically download and install updates.',
              disabled: s.disabled,
            },
          ],
        },
      ],
    },
    {
      title: 'About',
      resettable: s.resettable,
      icon: 'info',
      groups: [
        {
          items: [
            {
              kind: 'render',
              content: (
                <View
                  style={{
                    width: '100%',
                    gap: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="gallery-vertical-end" customSize={64} />
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 25.9,
                      color: theme.foreground,
                    }}
                  >
                    GPUI Component
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 22.65,
                      color: theme.mutedForeground,
                    }}
                  >
                    Rust GUI components for building fantastic cross-platform
                    desktop application by using GPUI.
                  </Text>
                </View>
              ),
            },
          ],
        },
        {
          title: 'Links',
          items: [
            {
              kind: 'field',
              title: 'GitHub Repository',
              description:
                'Open the GitHub repository in your default browser.',
              field: (
                <Button
                  outline
                  label="Repository..."
                  size={size}
                  onPress={open('https://github.com/longbridge/gpui-kit')}
                />
              ),
            },
            {
              kind: 'field',
              title: 'Documentation',
              description: 'Rust doc for the `gpui-component` crate.',
              markdown: true,
              field: (
                <Button
                  outline
                  label="Rust Docs..."
                  size={size}
                  onPress={open('https://docs.rs/gpui-component')}
                />
              ),
            },
            {
              kind: 'field',
              title: 'Website',
              description:
                'Official website and documentation for the GPUI Component.',
              field: (
                <Button
                  outline
                  label="Website..."
                  size={size}
                  onPress={open('https://gpui-kit.com/')}
                />
              ),
            },
          ],
        },
      ],
    },
  ];
  return (
    <StoryFrame fill testID="story-settings" paddings={0}>
      <Theme mode={s.dark ? 'dark' : 'light'} />
      <Settings
        style={{ width: '100%', height: '100%' }}
        pages={pages}
        size={size}
        groupVariant={s.groupVariant as 'normal' | 'outline' | 'fill'}
        onChange={(key, value) => set(key === 'foo' ? 'disabled' : key, value)}
        onReset={key => {
          if (key === 'density') set('density', DEFAULTS.density);
        }}
      />
    </StoryFrame>
  );
}
