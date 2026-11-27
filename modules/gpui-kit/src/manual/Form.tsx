import React, { type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Native from './GpuiKitFormNativeComponent';
import { SlotHost } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';

export interface FormField {
  label?: string;
  description?: string;
  required?: boolean;
  visible?: boolean;
  /** Columns the field spans in a multi-column form. */
  colSpan?: number;
  /** The column the field starts at, from 1. */
  colStart?: number;
  /** Leave room for the label when the field has none (default true). */
  labelIndent?: boolean;
  /** Refines the field, for example `alignItems: 'flex-start'`. */
  kitStyle?: KitStyle;
  /** The control, any React Native or kit view. */
  control?: ReactNode;
}

export interface FormProps {
  fields: FormField[];
  horizontal?: boolean;
  labelWidth?: number;
  columns?: number;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
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
  size,
  footer,
  style,
  testID,
}: FormProps) {
  return (
    <SlotHost
      style={style}
      testID={testID}
      native={Native as never}
      nativeProps={{
        horizontal,
        labelWidth,
        columns,
        size,
        fields: fields.map(field => ({
          label: field.label ?? '',
          description: field.description ?? '',
          required: field.required ?? false,
          visible: field.visible ?? true,
          colSpan: field.colSpan ?? 1,
          colStart: field.colStart ?? 0,
          labelIndent: field.labelIndent ?? true,
          kitStyle: kitStyle(field.kitStyle),
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
