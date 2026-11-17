import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
} from 'react';
import InspectorNative, { Commands } from './GpuiKitInspectorNativeComponent';

export interface InspectorHandle {
  toggle(): void;
}

export interface InspectorProps {
  /** Shows the element inspector over the window. */
  open?: boolean;
}

/**
 * The kit's element inspector: it picks a GPUI element of the window and shows
 * its style. It draws nothing itself, so mount it anywhere.
 */
export const Inspector = forwardRef<InspectorHandle, InspectorProps>(
  function Inspector({ open }, ref) {
    const native = useRef<ComponentRef<typeof InspectorNative>>(null);
    useImperativeHandle(ref, () => ({
      toggle: () => native.current && Commands.toggle(native.current),
    }));
    return (
      <InspectorNative
        ref={native}
        style={{ width: 0, height: 0 }}
        open={open ?? false}
      />
    );
  },
);
