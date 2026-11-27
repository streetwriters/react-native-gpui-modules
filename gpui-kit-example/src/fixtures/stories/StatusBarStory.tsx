import React from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  Icon,
  ProgressCircle,
  Separator,
  StatusBar,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme, useNotify } from './StoryKit';

/** `crates/story/src/stories/status_bar_story.rs` of gpui-component v0.9.1. */

/** Text in the bar's own type (`text_xs`, muted). */
function Xs({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: 12, lineHeight: 19.4, color: theme.mutedForeground }}
    >
      {children}
    </Text>
  );
}

const row = { flexDirection: 'row', alignItems: 'center' } as const;

export function StatusBarStory() {
  const notify = useNotify();
  const bar = (text: string) => () => notify.push(text);
  return (
    <StoryFrame testID="story-status_bar">
      <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
        <Section
          title="Editor"
          description="Places repository state on the left and document state on the right."
          style={{ maxWidth: 760 }}
        >
          <View style={{ width: '100%' }}>
            <StatusBar
              left={[
                <Button
                  key="branch"
                  variant="ghost"
                  size="xsmall"
                  icon="github"
                  label="main"
                  tooltip="Git branch"
                  onPress={bar('Switch branch')}
                />,
                <Separator
                  key="sep"
                  orientation="vertical"
                  style={{ height: 12 }}
                />,
                <View key="checks" style={[row, { gap: 8 }]}>
                  <View style={[row, { gap: 4 }]}>
                    <Icon
                      name="circle-check"
                      size="xsmall"
                      color={theme.green}
                    />
                    <Xs>0</Xs>
                  </View>
                  <View style={[row, { gap: 4 }]}>
                    <Icon name="info" size="xsmall" color={theme.blue} />
                    <Xs>2</Xs>
                  </View>
                </View>,
              ]}
              right={[
                <Button
                  key="position"
                  variant="ghost"
                  size="xsmall"
                  label="Ln 12, Col 34"
                  tooltip="Go to Line/Column"
                  onPress={bar('Go to Line/Column')}
                />,
                <Separator
                  key="sep"
                  orientation="vertical"
                  style={{ height: 12 }}
                />,
                <Button
                  key="encoding"
                  variant="ghost"
                  size="xsmall"
                  label="UTF-8"
                  onPress={bar('Select encoding')}
                />,
                <Button
                  key="language"
                  variant="ghost"
                  size="xsmall"
                  label="Rust"
                  onPress={bar('Select language')}
                />,
              ]}
            />
          </View>
        </Section>
        <Section
          title="Application"
          description="Combines connectivity, progress, save state, and notifications."
          style={{ maxWidth: 760 }}
        >
          <View style={{ width: '100%' }}>
            <StatusBar
              left={
                <View style={[row, { gap: 4 }]}>
                  <Icon
                    name="check"
                    size="xsmall"
                    color={theme.mutedForeground}
                  />
                  <Xs>Connected</Xs>
                </View>
              }
              right={[
                'All changes saved',
                <Button
                  key="notifications"
                  variant="ghost"
                  size="xsmall"
                  icon="bell"
                  label="3"
                  tooltip="3 notifications"
                  onPress={bar('3 notifications')}
                />,
              ]}
            >
              <View style={[row, { gap: 8 }]}>
                <ProgressCircle value={45} />
                <Xs>Syncing…</Xs>
              </View>
            </StatusBar>
          </View>
        </Section>
        <Section
          title="Alignment"
          description="Center content adapts when either side is empty or populated."
          style={{ maxWidth: 760 }}
        >
          <View style={{ width: '100%', gap: 24 }}>
            <StatusBar>Center only → start-aligned</StatusBar>
            <StatusBar left="Left">Center → end (only left)</StatusBar>
            <StatusBar right="Right">Center → start (only right)</StatusBar>
            <StatusBar left="Left" right="Right">
              Center → centered (left + right)
            </StatusBar>
            <StatusBar left="Left" right="Right" />
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
