import React, { type ComponentType, type ReactNode } from 'react';
import {
  Text,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { NativeRoot, NativeSlot } from '@react-native-gpui/core/desktop';

export type Slot = {
  name: string;
  content: ReactNode;
  /** The slot is as wide as its content, so the kit part around it can align it. */
  fit?: boolean;
  /** The slot takes the height the kit part gives it, and so does its content. */
  fill?: boolean;
  /** Whether the slot clips its content; by default it does unless `fit`. */
  clip?: boolean;
};

export type SlotHostProps = Omit<ViewProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Without a width in `style`, the box is as wide as its content. */
  fitWidth?: boolean;
};

/**
 * Renders a kit component whose content has named places for React Native
 * views: the places are slots of a native tree, so the views are laid out by
 * the kit component and keep their own context and events.
 */
export function SlotHost({
  native: Native,
  nativeProps,
  nativeRef,
  slots,
  ...view
}: SlotHostProps & {
  nativeRef?: React.Ref<unknown>;
  native: ComponentType<Record<string, unknown>>;
  nativeProps: Record<string, unknown>;
  slots: Slot[];
}) {
  const present = slots.filter(
    slot => slot.content != null && slot.content !== false,
  );
  return (
    <NativeRoot {...view}>
      <Native
        ref={nativeRef as never}
        {...nativeProps}
        slots={present.map(slot => slot.name).join(',')}
      >
        {present.map(slot => (
          <NativeSlot
            key={slot.name}
            fit={slot.fit}
            fill={slot.fill}
            clip={slot.clip}
          >
            {typeof slot.content === 'string' ||
            typeof slot.content === 'number' ? (
              <Text>{slot.content}</Text>
            ) : (
              slot.content
            )}
          </NativeSlot>
        ))}
      </Native>
    </NativeRoot>
  );
}
