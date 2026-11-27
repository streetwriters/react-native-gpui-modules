import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Avatar,
  AvatarGroup,
  Button,
  Empty,
  Icon,
  Input,
  Link,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T, theme } from './StoryKit';

/** `crates/story/src/stories/empty_story.rs` of gpui-component v0.9.1. */
const DOCS = 'https://gpui-kit.com/docs/getting-started';
const PROJECTS = ['Design system', 'Website', 'Mobile app'];

const row = { flexDirection: 'row', alignItems: 'center', gap: 8 } as const;

export function EmptyStory() {
  const [project, setProject] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const projects = PROJECTS.filter(name =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <StoryFrame testID="story-empty">
      <View style={{ width: '100%', gap: 16 }}>
        <Section
          title="Default"
          description="A named header, multiple actions, and an extra child below the content. Actions update this example."
        >
          <View style={{ width: '100%', minHeight: 288, flexDirection: 'row' }}>
            {project !== null ? (
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                }}
              >
                <View style={row}>
                  <Icon name="folder" customSize={16} />
                  <T>{project}</T>
                </View>
                <Button
                  outline
                  label="Reset example"
                  onPress={() => setProject(null)}
                />
              </View>
            ) : (
              <Empty
                style={{ flex: 1 }}
                icon="folder"
                title="No projects yet"
                description="You haven't created any projects yet. Get started by creating your first project."
                contentStyle={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 8,
                }}
                extra={
                  <Link
                    href={DOCS}
                    text="Learn more"
                    kitStyle={{ fontSize: 14 }}
                  />
                }
              >
                <View style={row}>
                  <Button
                    label="Create project"
                    onPress={() => setProject('Untitled project')}
                  />
                  <Button
                    outline
                    label="Import sample"
                    onPress={() => setProject('Starter project')}
                  />
                </View>
              </Empty>
            )}
          </View>
        </Section>
        <Section
          title="Outline"
          description="Add a border through Styled; the component already supplies the dashed treatment."
        >
          <Empty
            style={{ width: '100%' }}
            kitStyle={{ borderWidth: 1 }}
            icon="hard-drive"
            title="Cloud storage is empty"
            description="Upload files to your cloud storage to access them anywhere."
          >
            <Button outline size="small" label="Upload files…" />
          </Empty>
        </Section>
        <Section
          title="Background"
          description="A semantic background can blend an empty state into its surrounding surface."
        >
          <Empty
            style={{ width: '100%' }}
            kitStyle={{
              minHeight: 256,
              backgroundColor: 'rgba(245,245,245,0.3)',
            }}
            icon="bell"
            title="No notifications"
            description="You're all caught up. New notifications will appear here."
          >
            <Button outline icon="rotate-cw" label="Refresh" />
          </Empty>
        </Section>
        <Section
          title="Avatar"
          description="Default media keeps the Avatar component's own size and appearance."
        >
          <Empty
            style={{ width: '100%' }}
            media={
              <Avatar
                name="Alex Morgan"
                src="https://avatars.githubusercontent.com/u/5518?v=4"
              />
            }
            title="Alex is offline"
            description="You can leave a message for Alex to read when they're back."
          >
            <Button size="small" label="Leave a message…" />
          </Empty>
        </Section>
        <Section
          title="Avatar group"
          description="Compose AvatarGroup inside the same media slot; no new Empty variant is needed."
        >
          <Empty
            style={{ width: '100%' }}
            media={
              <AvatarGroup>
                <Avatar
                  name="Alex Morgan"
                  src="https://avatars.githubusercontent.com/u/5518?v=4"
                />
                <Avatar
                  name="Taylor Lee"
                  src="https://avatars.githubusercontent.com/u/28998859?v=4"
                />
                <Avatar
                  name="Sam Chen"
                  src="https://avatars.githubusercontent.com/u/20092316?v=4"
                />
              </AvatarGroup>
            }
            title="No team members"
            description="Invite your team to collaborate on this project."
          >
            <Button size="small" icon="plus" label="Invite members…" />
          </Empty>
        </Section>
        <Section
          title="Search"
          description="The parent owns search state. Clear the query or search for Design, Website, or Mobile to show results."
          column
        >
          <View style={{ width: '100%' }}>
            <Input
              value={query}
              onChangeText={setQuery}
              cleanable
              prefix={<Icon name="search" customSize={16} />}
            />
          </View>
          <View style={{ width: '100%', minHeight: 192, flexDirection: 'row' }}>
            {projects.length === 0 ? (
              <Empty
                style={{ flex: 1 }}
                title="No projects found"
                description="Try a different search or clear the query to see all projects."
              >
                <Button
                  outline
                  label="Clear search"
                  onPress={() => setQuery('')}
                />
              </Empty>
            ) : (
              <View style={{ width: '100%', gap: 8 }}>
                {projects.map(name => (
                  <View key={name} style={[row, { padding: 12 }]}>
                    <Icon name="folder" customSize={16} />
                    <T>{name}</T>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Section>
        <Section
          title="Custom content"
          description="An existing Input can live in EmptyContent, with rich supporting content beneath it."
        >
          <Empty
            style={{ width: '100%' }}
            title="Looking for a project?"
            description="The page you're looking for doesn't exist. Try searching for another page."
          >
            <View style={{ width: '100%', gap: 16, alignItems: 'center' }}>
              <View style={{ width: '100%' }}>
                <Input
                  cleanable
                  prefix={<Icon name="search" customSize={16} />}
                />
              </View>
              <View
                style={[
                  row,
                  { flexWrap: 'wrap', justifyContent: 'center', gap: 4 },
                ]}
              >
                <T style={{ fontSize: 14, color: theme.mutedForeground }}>
                  Need help?
                </T>
                <Link href={DOCS} text="Read the documentation" />
              </View>
            </View>
          </Empty>
        </Section>
        <Section
          title="Constrained layout"
          description="Refine each named slot independently. Long text wraps in this compact, leading-aligned panel."
        >
          <View style={{ width: '100%', maxWidth: 320 }}>
            <Empty
              kitStyle={{
                borderWidth: 1,
                padding: 16,
                alignItems: 'flex-start',
                textAlign: 'left',
              }}
              headerStyle={{ alignItems: 'flex-start' }}
              contentStyle={{ alignItems: 'flex-start' }}
              icon="inbox"
              title="还没有共享文件"
              description="将文件添加到此项目后，团队成员就能在这里查看、讨论和继续编辑。较长的说明也应该完整显示。"
            >
              <Button outline size="small" label="添加文件…" />
            </Empty>
          </View>
        </Section>
        <Section
          title="Minimal"
          description="Media and content slots are optional."
        >
          <Empty
            style={{ width: '100%' }}
            title="No recent activity"
            description="New activity will appear here."
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
