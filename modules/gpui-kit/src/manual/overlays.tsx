import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import DialogNative from './GpuiKitDialogNativeComponent';
import AlertDialogNative from './GpuiKitAlertDialogNativeComponent';
import SheetNative from './GpuiKitSheetNativeComponent';
import NotificationNative, {
  Commands as NotificationCommands,
} from './GpuiKitNotificationNativeComponent';
import { SlotHost } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';
import type { ButtonProps } from '../generated/Button';

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
  /** A line under the title. */
  description?: string;
  /** How it appears (default `slide-down`). */
  entrance?: 'slide-down' | 'fade' | 'fade-slide' | 'none';
  /** Refines the dialog: padding, width, height, colors, radius. */
  kitStyle?: KitStyle;
  /** Composes the dialog of a header, the body and a footer, and refines the header. */
  headerStyle?: KitStyle;
  /** Composes the dialog of a header, the body and a footer, and refines the footer. */
  footerStyle?: KitStyle;
  /** The footer's buttons, in order, for a composed dialog. */
  buttons?: AlertDialogButton[];
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
  kitStyle: dialogStyle,
  headerStyle,
  footerStyle,
  buttons,
  width,
  marginTop,
  ...rest
}: DialogProps) {
  return (
    <SlotHost
      style={hidden}
      native={DialogNative as never}
      nativeProps={{
        ...rest,
        dialogWidth: width,
        offsetTop: marginTop,
        overlay: rest.overlay ?? true,
        overlayClosable: rest.overlayClosable ?? true,
        keyboard: rest.keyboard ?? true,
        closeButton: rest.closeButton ?? true,
        title: text(title),
        kitStyle: kitStyle(dialogStyle),
        headerStyle: kitStyle(headerStyle) || (buttons ? '{}' : ''),
        footerStyle: kitStyle(footerStyle),
        buttonsJson: buttons ? JSON.stringify(buttons) : '',
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

export interface AlertDialogButton {
  /** `ok` confirms (`onOk`), `cancel` closes (`onCancel`). */
  role: 'ok' | 'cancel';
  label: string;
  variant?: NonNullable<ButtonProps['variant']>;
  outline?: boolean;
  /** Takes an equal share of the footer's width. */
  flex?: boolean;
  fullWidth?: boolean;
}

export interface AlertDialogProps {
  open?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  /** React Native content for the icon. */
  icon?: ReactNode;
  /** React Native content below the description. */
  children?: ReactNode;
  /** React Native content of the footer, instead of its buttons. */
  footer?: ReactNode;
  width?: number;
  /** Also show a cancel button. */
  confirm?: boolean;
  keyboard?: boolean;
  centered?: boolean;
  closeButton?: boolean;
  okText?: string;
  cancelText?: string;
  okVariant?: NonNullable<ButtonProps['variant']>;
  cancelVariant?: NonNullable<ButtonProps['variant']>;
  /** Pressing OK closes the dialog (default `true`). */
  closeOnOk?: boolean;
  /** Pressing Cancel closes the dialog (default `true`). */
  closeOnCancel?: boolean;
  /** Refines the dialog, for example `padding: 0` or a width. */
  kitStyle?: KitStyle;
  /** Composes the dialog of a header and a footer, and refines the header. */
  headerStyle?: KitStyle;
  /** Composes the dialog of a header and a footer, and refines the footer. */
  footerStyle?: KitStyle;
  /** The footer's buttons, in order, for a composed dialog. */
  buttons?: AlertDialogButton[];
  onOk?: (event: Empty) => void;
  onCancel?: (event: Empty) => void;
  onClose?: (event: Empty) => void;
}

export function AlertDialog({
  title,
  description,
  icon,
  children,
  footer,
  onOk,
  onCancel,
  onClose,
  kitStyle: dialogStyle,
  headerStyle,
  footerStyle,
  buttons,
  width,
  ...rest
}: AlertDialogProps) {
  return (
    <SlotHost
      style={hidden}
      native={AlertDialogNative as never}
      nativeProps={{
        ...rest,
        dialogWidth: width,
        keyboard: rest.keyboard ?? true,
        title: text(title),
        description: text(description),
        kitStyle: kitStyle(dialogStyle),
        headerStyle: kitStyle(headerStyle) || (buttons ? '{}' : ''),
        footerStyle: kitStyle(footerStyle),
        buttonsJson: buttons ? JSON.stringify(buttons) : '',
        onGpuiKitAlertDialogOk: onOk,
        onGpuiKitAlertDialogCancel: onCancel,
        onGpuiKitAlertDialogClose: onClose,
      }}
      slots={[
        { name: 'icon', content: icon, fit: true },
        { name: 'title', content: element(title) },
        { name: 'description', content: element(description) },
        { name: 'body', content: children },
        { name: 'footer', content: footer },
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

export type NotificationPlacement =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left-center'
  | 'right-center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface NotificationOptions {
  /** One notification per key: pushing the same key again replaces it, and `remove(key)` closes it. */
  key?: string;
  kind?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string;
  /** Markdown drawn as the whole content, instead of `title` and `message`. */
  markdown?: string;
  /** Hides itself after a while (default `true`; `false` with an `action`). */
  autohide?: boolean;
  placement?: NotificationPlacement;
  /** A button on the notification; pressing it reports `action` and closes it. */
  action?: {
    label: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  };
  /** Where it is delivered: in the window (default), the system's notification center, or both. */
  delivery?: 'app' | 'system' | 'both';
}

export interface NotificationsHandle {
  push(options: NotificationOptions | string): void;
  /** Closes the notification pushed with `key`. */
  remove(key: string): void;
  clear(): void;
}

export interface NotificationsProps {
  /** A notification with a `key` was clicked, closed or had its action pressed. */
  onEvent?: (
    event: NativeSyntheticEvent<
      Readonly<{ key: string; kind: 'click' | 'close' | 'action' }>
    >,
  ) => void;
}

/** Pushes the kit's toast notifications to the window: render it once and call `push` on its ref. */
export const Notifications = forwardRef<
  NotificationsHandle,
  NotificationsProps
>(function Notifications({ onEvent }, ref) {
  const native = useRef<React.ComponentRef<typeof NotificationNative>>(null);
  useImperativeHandle(ref, () => ({
    push: options => {
      if (!native.current) return;
      const value =
        typeof options === 'string' ? { message: options } : options;
      NotificationCommands.push(native.current, JSON.stringify(value));
    },
    remove: key => {
      if (native.current) NotificationCommands.remove(native.current, key);
    },
    clear: () => {
      if (native.current) NotificationCommands.clear(native.current);
    },
  }));
  return (
    <NotificationNative
      ref={native}
      style={hidden}
      onGpuiKitNotificationEvent={onEvent as never}
    />
  );
});
