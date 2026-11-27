import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  AlertDialog,
  Button,
  DatePicker,
  Input,
  List,
  Sheet,
} from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  T,
  theme,
  useNotify,
} from './StoryKit';

/** `crates/story/src/stories/sheet_story.rs` of gpui-component v0.9.1. */
const FOODS = [
  'Baguette (France)',
  'Baklava (Turkey)',
  'Beef Wellington (UK)',
  'Biryani (India)',
  'Borscht (Ukraine)',
  'Bratwurst (Germany)',
  'Bulgogi (Korea)',
  'Burrito (USA)',
  'Ceviche (Peru)',
  'Chicken Tikka Masala (India)',
  'Churrasco (Brazil)',
  'Couscous (North Africa)',
  'Croissant (France)',
  'Dim Sum (China)',
  'Empanada (Argentina)',
  'Fajitas (Mexico)',
  'Falafel (Middle East)',
  'Feijoada (Brazil)',
  'Fish and Chips (UK)',
  'Fondue (Switzerland)',
  'Goulash (Hungary)',
  'Haggis (Scotland)',
  'Kebab (Middle East)',
  'Kimchi (Korea)',
  'Lasagna (Italy)',
  'Maple Syrup Pancakes (Canada)',
  'Moussaka (Greece)',
  'Pad Thai (Thailand)',
  'Paella (Spain)',
  'Pancakes (USA)',
  'Pasta Carbonara (Italy)',
  'Pavlova (Australia)',
  'Peking Duck (China)',
  'Pho (Vietnam)',
  'Pierogi (Poland)',
  'Pizza (Italy)',
  'Poutine (Canada)',
  'Pretzel (Germany)',
  'Ramen (Japan)',
  'Rendang (Indonesia)',
  'Sashimi (Japan)',
  'Satay (Indonesia)',
  "Shepherd's Pie (Ireland)",
  'Sushi (Japan)',
  'Tacos (Mexico)',
  'Tandoori Chicken (India)',
  'Tortilla (Spain)',
  'Tzatziki (Greece)',
  'Wiener Schnitzel (Austria)',
];

type Placement = 'left' | 'top' | 'right' | 'bottom';

export function SheetStory() {
  const notify = useNotify();
  const [placement, setPlacement] = useState<Placement>();
  const [scrollable, setScrollable] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [overlay, setOverlay] = useState(true);
  const [overlayClosable, setOverlayClosable] = useState(true);
  const [selected, setSelected] = useState<string>();
  const close = () => setPlacement(undefined);
  return (
    <StoryFrame testID="story-sheet">
      <View style={{ gap: 24 }}>
        <StoryToolbar
          items={[
            {
              label: 'Options',
              menu: [
                {
                  label: 'Overlay',
                  checked: overlay,
                  onSelect: () => setOverlay(v => !v),
                },
                {
                  label: 'Close on overlay click',
                  checked: overlayClosable,
                  onSelect: () => setOverlayClosable(v => !v),
                },
              ],
            },
          ]}
        />
        <Section
          title="Placement"
          description="Open a sheet from any edge of the window."
        >
          {(['left', 'top', 'right', 'bottom'] as Placement[]).map(value => (
            <Button
              key={value}
              outline
              label={`${value[0].toUpperCase()}${value.slice(1)} Sheet...`}
              onPress={() => setPlacement(value)}
            />
          ))}
        </Section>
        <Section title="Scrollable Sheet" style={{ width: 480 }}>
          <Button
            outline
            label="Scrollable Sheet..."
            onPress={() => setScrollable(true)}
          />
        </Section>
        <Section title="Focus back test" style={{ width: 512 }}>
          <Input placeholder="For test focus back on dialog close." />
          <Button
            outline
            label="Test Action"
            tooltip={
              'This button for test dispatch action, to make sure when Dialog close,\nthis still can handle the action.'
            }
            onPress={() => notify.push('You have clicked the TestAction.')}
          />
        </Section>
        {selected !== undefined && (
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <T>You have selected:</T>
            <T style={{ color: theme.red }}>{selected}</T>
          </View>
        )}
      </View>
      <Sheet
        open={placement !== undefined}
        placement={placement}
        size={placement === 'top' || placement === 'bottom' ? 540 : 400}
        overlay={overlay}
        overlayClosable={overlayClosable}
        title="Sheet Title"
        onClose={close}
        footer={
          <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center' }}>
            <Button variant="primary" label="Confirm" onPress={close} />
            <Button label="Cancel" onPress={close} />
          </View>
        }
      >
        <View style={{ flex: 1, gap: 12 }}>
          <Input placeholder="Your Name" />
          <DatePicker placeholder="Date of Birth" />
          <Button
            label="Test Notification"
            onPress={() => notify.push('Hello this is message from Sheet.')}
          />
          <Button
            label="Open Confirm Dialog"
            onPress={() => setConfirm(true)}
          />
          <List
            searchable
            style={{
              flex: 1,
              width: '100%',
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: theme.radius,
            }}
            rows={FOODS.map(label => ({ label }))}
            onConfirm={e => setSelected(FOODS[e.nativeEvent.index])}
            onCancel={close}
          />
        </View>
      </Sheet>
      <Sheet
        open={scrollable}
        placement="right"
        title="Scrollable Sheet"
        onClose={() => setScrollable(false)}
      >
        <Text
          style={{ fontSize: 16, lineHeight: 25.9, color: theme.foreground }}
        >
          {'This is a scrollable sheet.\n'.repeat(150)}
        </Text>
      </Sheet>
      <AlertDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onOk={() => notify.push('You have pressed ok.')}
        onCancel={() => notify.push('You have pressed cancel.')}
      >
        <T>Confirm dialog opened from sheet.</T>
      </AlertDialog>
    </StoryFrame>
  );
}
