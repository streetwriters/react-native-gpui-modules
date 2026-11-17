import React, { type ReactNode } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import DialogNative from './GpuiKitDialogNativeComponent';
import AlertDialogNative from './GpuiKitAlertDialogNativeComponent';
import SheetNative from './GpuiKitSheetNativeComponent';
import NotificationNative from './GpuiKitNotificationNativeComponent';
import { SlotHost } from './SlotHost';

type Empty = NativeSyntheticEvent<Readonly<Record<string, never>>>;

/** The root of an overlay holds React Native content but takes no room itself. */
const hidden = { position: 'absolute', width: 0, height: 0 } as const;

const text = (value: ReactNode) =>
  typeof value === 'string' ? value : undefined;
const element = (value: ReactNode) =>
  typeof value === 'string' ? null : value;

export interface DialogProps {
  open?: boolean;
  /** A string, or React Native content. */
  title?: ReactNode;
  /** React Native content for the body. */
  children?: ReactNode;
  /** React Native content for the footer, instead of the buttons. */
  footer?: ReactNode;
  width?: number;
  marginTop?: number;
  overlay?: boolean;
  overlayClosable?: boolean;
  keyboard?: boolean;
  closeButton?: boolean;
  centered?: boolean;
  showCancel?: boolean;
  okText?: string;
  cancelText?: string;
  onOk?: (event: Empty) => void;
  onCancel?: (event: Empty) => void;
  /** The dialog was closed, by a button, Escape or the backdrop. */
  onClose?: (event: Empty) => void;
}

export function Dialog({
  title,
  children,
  footer,
  onOk,
  onCancel,
  onClose,
  ...rest
}: DialogProps) {
  return (
    <SlotHost
      style={hidden}
      native={DialogNative as never}
      nativeProps={{
        ...rest,
        overlay: rest.overlay ?? true,
        overlayClosable: rest.overlayClosable ?? true,
        keyboard: rest.keyboard ?? true,
        closeButton: rest.closeButton ?? true,
        title: text(title),
        onGpuiKitDialogOk: onOk,
        onGpuiKitDialogCancel: onCancel,
        onGpuiKitDialogClose: onClose,
      }}
      slots={[
        { name: 'title', content: element(title) },
        { name: 'body', content: children },
        { name: 'footer', content: footer },
      ]}
    />
  );
}

export interface AlertDialogProps {
  open?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  /** React Native content for the icon. */
  icon?: ReactNode;
  width?: number;
  /** Also show a cancel button. */
  confirm?: boolean;
  keyboard?: boolean;
  centered?: boolean;
  okText?: string;
  cancelText?: string;
  onOk?: (event: Empty) => void;
  onCancel?: (event: Empty) => void;
  onClose?: (event: Empty) => void;
}

export function AlertDialog({
  title,
  description,
  icon,
  onOk,
  onCancel,
  onClose,
  ...rest
}: AlertDialogProps) {
  return (
    <SlotHost
      style={hidden}
      native={AlertDialogNative as never}
      nativeProps={{
        ...rest,
        keyboard: rest.keyboard ?? true,
        title: text(title),
        description: text(description),
        onGpuiKitAlertDialogOk: onOk,
        onGpuiKitAlertDialogCancel: onCancel,
        onGpuiKitAlertDialogClose: onClose,
      }}
      slots={[
        { name: 'icon', content: icon },
        { name: 'title', content: element(title) },
        { name: 'description', content: element(description) },
      ]}
    />
  );
}

export interface SheetProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Width, or height for top and bottom. */
  size?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  resizable?: boolean;
  overlay?: boolean;
  overlayClosable?: boolean;
  onClose?: (event: Empty) => void;
}

export function Sheet({
  title,
  children,
  footer,
  onClose,
  ...rest
}: SheetProps) {
  return (
    <SlotHost
      style={hidden}
      native={SheetNative as never}
      nativeProps={{
        ...rest,
        resizable: rest.resizable ?? true,
        overlay: rest.overlay ?? true,
        overlayClosable: rest.overlayClosable ?? true,
        title: text(title),
        onGpuiKitSheetClose: onClose,
      }}
      slots={[
        { name: 'title', content: element(title) },
        { name: 'body', content: children },
        { name: 'footer', content: footer },
      ]}
    />
  );
}

export interface NotificationProps {
  /** Shows the notification while it turns true. */
  open?: boolean;
  title?: string;
  message?: string;
  kind?: 'info' | 'success' | 'warning' | 'error';
  placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  autohide?: boolean;
  onClose?: (event: Empty) => void;
}

export function Notification({ onClose, ...rest }: NotificationProps) {
  return (
    <NotificationNative
      {...rest}
      style={hidden}
      onGpuiKitNotificationClose={onClose as never}
    />
  );
}
