import React from 'react';
import { View } from 'react-native';
import {
  Attachment,
  AttachmentGroup,
  Button,
  type AttachmentProps,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme, useNotify } from './StoryKit';

/** `crates/story/src/stories/attachment_story.rs` of gpui-component v0.9.1. */
const PREVIEW = 'https://pub.lbkrs.com/files/202503/vEnnmgUM6bo362ya/sdk.svg';
const noop = () => {};
const imageTile = (status: AttachmentProps['status']): AttachmentProps => ({
  axis: 'vertical',
  status,
  onRemove: noop,
  mediaSrc: PREVIEW,
});
const fileChip = (
  status: AttachmentProps['status'],
  title: string,
  description: string,
): AttachmentProps => ({
  status,
  onRemove: noop,
  mediaIcon: 'file-text',
  title,
  description,
});
const col = { maxWidth: 680, gap: 12 } as const;

export function AttachmentStory() {
  const notify = useNotify();
  return (
    <StoryFrame testID="story-attachment">
      <View style={{ width: '100%', gap: 16 }}>
        <Section
          title="Composer"
          description="Image tiles and file chips in a scrolling row, with the built-in remove, retry, progress and tooltip controls. Hover a card for its remove control."
          style={{ maxWidth: 680 }}
        >
          <AttachmentGroup
            edgeFade={theme.background}
            style={{ width: '100%' }}
          >
            <Attachment {...imageTile('complete')} />
            <Attachment {...imageTile('uploading')} progress={62} />
            <Attachment
              {...imageTile('failed')}
              tooltip="Network error · Click to retry"
              onRetry={() => notify.push('Retrying photo.png…')}
            />
            <Attachment
              {...imageTile('failed')}
              tooltip="Image exceeds 20 MB limit · Remove to send"
            />
            <Attachment
              {...fileChip('complete', 'Q3 statement.pdf', 'PDF · 1.2 MB')}
            />
            <Attachment
              {...fileChip('uploading', 'Q3 statement.pdf', 'Uploading')}
              progress={62}
            />
            <Attachment
              {...fileChip('failed', 'Q3 statement.pdf', 'Upload failed')}
              tooltip="Network error · Click to retry"
              onRetry={() => notify.push('Retrying Q3 statement.pdf…')}
            />
            <Attachment
              {...fileChip(
                'failed',
                'accessibility-review-and-keyboard-navigation-findings.xlsx',
                'Exceeds 20 MB limit',
              )}
              tooltip="Max file size is 20 MB · Remove to send"
            />
          </AttachmentGroup>
        </Section>
        <Section
          title="Lifecycle"
          description="The states the composer row does not show: pending, an upload without a known percentage, processing with a custom shimmer, and a completed file."
          column
          style={col}
        >
          <Attachment
            {...fileChip('pending', 'meeting-notes.pdf', 'Ready to upload')}
          />
          <Attachment
            {...fileChip('uploading', 'design-assets.zip', 'Uploading')}
          />
          <Attachment
            status="processing"
            mediaIcon="file-text"
            title="transcript.pdf"
            description="Processing document"
            shimmer={{ color: theme.primary, spread: 0.45, reverse: true }}
          />
          <Attachment
            mediaIcon="circle-check"
            mediaStyle={{ color: theme.success }}
            title="published-report.pdf"
            description="Uploaded · 1.8 MB"
          />
        </Section>
        <Section
          title="Preview card"
          description="A vertical card puts the preview above the metadata; actions sit over its upper trailing corner and stay clickable above the whole-card click."
          style={{ maxWidth: 680 }}
        >
          <Attachment
            axis="vertical"
            onPress={() => notify.push('Opening sdk-preview.svg…')}
            mediaSrc={PREVIEW}
            title="sdk-preview.svg"
            description="SVG · 1280 × 720"
            actions={
              <Button
                variant="ghost"
                size="xsmall"
                label="Open"
                onPress={() => notify.push('Opened sdk-preview.svg')}
              />
            }
          />
        </Section>
        <Section
          title="Sizes"
          description="One geometry scale per named size: card, media box and type move together."
          column
          style={col}
        >
          <Attachment
            {...fileChip('complete', 'large.pdf', 'Large · PDF · 3.1 MB')}
            size="large"
          />
          <Attachment
            {...fileChip('complete', 'medium.pdf', 'Medium · PDF · 2.4 MB')}
          />
          <Attachment
            {...fileChip('complete', 'small.csv', 'Small · CSV · 840 KB')}
            size="small"
          />
          <Attachment
            {...fileChip('complete', 'xsmall.txt', 'XSmall · TXT · 4 KB')}
            size="xsmall"
          />
        </Section>
        <Section
          title="Custom style"
          description="Every public part takes style refinements, and an overlay is painted above the preview and any status scrim."
          column
          style={col}
        >
          <Attachment
            style={{ width: '100%' }}
            kitStyle={{
              width: '100%',
              borderRadius: theme.radius,
              backgroundColor: '#f5f5f5',
              borderColor: 'rgba(245, 245, 245, 0.5)',
            }}
            mediaIcon="file-text"
            mediaStyle={{
              borderRadius: theme.radius,
              backgroundColor: 'rgba(23, 23, 23, 0.12)',
              color: theme.primary,
            }}
            title="custom-theme.json"
            titleStyle={{ color: theme.primary }}
            description="JSON · 16 KB"
          />
          <Attachment
            axis="vertical"
            mediaSrc={PREVIEW}
            mediaOverlayIcon="play"
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
