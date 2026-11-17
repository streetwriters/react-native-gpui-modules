import React, { type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Native from './GpuiKitFormNativeComponent';
import { SlotHost } from './SlotHost';

export interface FormField {
  label?: string;
  description?: string;
  required?: boolean;
  visible?: boolean;
  /** Columns the field spans in a multi-column form. */
  colSpan?: number;
  /** The control, any React Native or kit view. */
  control?: ReactNode;
}

export interface FormProps {
  fields: FormField[];
  horizontal?: boolean;
  labelWidth?: number;
  columns?: number;
  /** React Native content below the fields. */
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Form({
  fields,
  horizontal,
  labelWidth,
  columns,
  footer,
  style,
  testID,
}: FormProps) {
  return (
    <SlotHost
      style={[{ width: 360, height: 40 + fields.length * 64 }, style]}
      testID={testID}
      native={Native as never}
      nativeProps={{
        horizontal,
        labelWidth,
        columns,
        fields: fields.map(field => ({
          label: field.label ?? '',
          description: field.description ?? '',
          required: field.required ?? false,
          visible: field.visible ?? true,
          colSpan: field.colSpan ?? 1,
        })),
      }}
      slots={[
        ...fields.map((field, index) => ({
          name: `field-${index}`,
          content: field.control,
        })),
        { name: 'footer', content: footer },
      ]}
    />
  );
}
