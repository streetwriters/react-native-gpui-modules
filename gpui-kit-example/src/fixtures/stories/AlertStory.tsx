import React, { useState } from 'react';
import { View } from 'react-native';
import { Alert } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, StoryToolbar, type StorySize } from './StoryKit';

/** `crates/story/src/stories/alert_story.rs` of gpui-component v0.9.1. */
const twoThirds = { width: '66.6667%' } as const;

export function AlertStory({ size = 'medium' }: { size?: StorySize }) {
  const [bannerVisible, setBannerVisible] = useState(true);
  return (
    <StoryFrame testID="story-alert">
      <View style={{ gap: 16 }}>
        <StoryToolbar size={size} />
        <Section
          title="Default"
          description="Title, icon, and rich text content."
          style={twoThirds}
        >
          <Alert
            style={{ width: '100%' }}
            markdown
            message={
              'Your workspace is ready for the team.\n- **12 members** have access\n- Billing remains with the workspace owner'
            }
            size={size}
            title="Workspace settings saved"
          />
        </Section>
        <Section
          title="Variants"
          description="Info, success, warning, and error states."
          style={twoThirds}
        >
          <View style={{ width: '100%', gap: 12 }}>
            <Alert
              variant="info"
              message="Maintenance starts Friday at 22:00 UTC."
              size={size}
              title="Scheduled maintenance"
              onClose={() => {}}
            />
            <Alert
              variant="success"
              message="The transfer is queued and usually settles within one business day."
              size={size}
              title="Transfer submitted"
            />
            <Alert
              variant="warning"
              message={
                'Two teammates still use recovery codes generated more than a year ago.\nAsk them to generate a fresh set in Security settings.'
              }
              size={size}
            />
            <Alert
              variant="error"
              markdown
              message={
                'Please verify your billing information and try again.\n- Check your card details\n- Ensure sufficient funds\n- Verify billing address'
              }
              size={size}
              title="Unable to process your payment."
            />
          </View>
        </Section>
        <Section
          title="Banner"
          description="Full-width and closable alerts."
          style={twoThirds}
        >
          <View style={{ width: '100%', gap: 8 }}>
            <Alert
              message="Reporting is read-only while the nightly ledger closes."
              banner
              onClose={() => setBannerVisible(visible => !visible)}
              visible={bannerVisible}
              size={size}
            />
            <Alert
              variant="info"
              message="A new desktop update will install after you restart."
              banner
              size={size}
            />
            <Alert
              variant="success"
              message="All 1,284 records finished importing."
              banner
              size={size}
            />
            <Alert
              variant="warning"
              message="Your API key expires in 6 days. Rotate it before August 19."
              banner
              size={size}
            />
            <Alert
              variant="error"
              message="Live updates are disconnected. Changes may be delayed."
              banner
              size={size}
            />
          </View>
        </Section>
        <Section
          title="Custom icon"
          description="Custom icon and long content."
          style={twoThirds}
        >
          <Alert
            style={{ width: '100%' }}
            message="The quarterly planning review overlaps with the APAC operations call. Move one event or invite another owner before sending the agenda."
            title="Two events overlap by 30 minutes"
            size={size}
            icon="calendar"
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
