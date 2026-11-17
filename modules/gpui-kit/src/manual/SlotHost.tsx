import React, { type ComponentType, type ReactNode } from 'react';
import {
  Text,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { NativeRoot, NativeSlot } from '@react-native-gpui/core/desktop';

export type Slot = { name: string; content: ReactNode };

export type SlotHostProps = Omit<ViewProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
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
          <NativeSlot key={slot.name}>
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
