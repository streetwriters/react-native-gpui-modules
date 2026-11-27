import React from 'react';
import { View } from 'react-native';
import { Table, Tag, type TagProps } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/table_story.rs` of gpui-component v0.9.1. */

const INVOICES: [string, string, string, string, string][] = [
  ['INV001', 'Paid', 'Credit Card', '$250.00', '2024-01-15'],
  ['INV002', 'Pending', 'PayPal', '$150.00', '2024-02-01'],
  ['INV003', 'Unpaid', 'Bank Transfer', '$350.00', '2024-02-15'],
  [
    'INV004',
    'Paid',
    'Credit Card\nMaster Card / Visa',
    '$450.00',
    '2024-03-01',
  ],
  ['INV005', 'Paid', 'PayPal', '$550.00', '2024-03-15'],
  ['INV006', 'Pending', 'Bank Transfer', '$200.00', '2024-04-01'],
  ['INV007', 'Unpaid', 'Credit Card', '$300.00', '2024-04-15'],
];

/** `table_even` of the default light theme. */
const TABLE_EVEN = '#fafafa';

const VARIANT: Record<string, TagProps['variant']> = {
  Paid: 'success',
  Pending: 'warning',
  Unpaid: 'danger',
};

function StatusTag({ status }: { status: string }) {
  return (
    <Tag
      label={status}
      variant={VARIANT[status]}
      outline={VARIANT[status] !== undefined}
      size="xsmall"
    />
  );
}

export function TableStory({ size = 'medium' }: { size?: StorySize }) {
  return (
    <StoryFrame testID="story-table">
      <View style={{ width: '100%', gap: 24 }}>
        <StoryToolbar size={size} />
        <Section title="Default" style={{ width: '100%' }}>
          <Table
            size={size}
            header={[
              {
                cells: [
                  { content: 'Invoice', width: 150 },
                  { content: 'Status', colSpan: 2 },
                  { content: 'Amount', align: 'right' },
                  { content: 'Date', align: 'right' },
                ],
              },
            ]}
            rows={INVOICES.map(([invoice, status, method, amount, date]) => ({
              cells: [
                { content: invoice, width: 150 },
                { content: <StatusTag status={status} /> },
                method,
                { content: amount, align: 'right' },
                { content: date, align: 'right' },
              ],
            }))}
            footer={[
              {
                cells: [
                  { content: 'Total', colSpan: 3 },
                  { content: '$2,250.00', colSpan: 2, align: 'right' },
                ],
              },
            ]}
            caption="A list of your recent invoices."
          />
        </Section>
        <Section title="Bordered" style={{ width: '100%' }}>
          <Table
            size={size}
            kitStyle={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: theme.radius,
            }}
            header={[
              {
                cells: [
                  { content: 'Invoice', width: 100 },
                  'Method',
                  { content: 'Amount', align: 'right' },
                  { content: 'Date', align: 'right' },
                ],
              },
            ]}
            rows={INVOICES.slice(0, 6).map(
              ([invoice, , method, amount, date], ix) => ({
                kitStyle:
                  ix % 2 !== 0 ? { backgroundColor: TABLE_EVEN } : undefined,
                cells: [
                  { content: invoice, width: 100 },
                  method,
                  { content: amount, align: 'right' },
                  { content: date, align: 'right' },
                ],
              }),
            )}
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
