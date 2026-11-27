import { NativeRoot } from '@react-native-gpui/core/desktop';
import React, { type ReactNode } from 'react';
import type { ViewProps } from 'react-native';
import Native from './GpuiKitAvatarGroupNativeComponent';
import type { AvatarProps } from '../generated/Avatar';
import { childProps } from './items';

export interface AvatarGroupProps extends ViewProps {
  /** `Avatar` elements; their `name`, `placeholder` and `src` are used. */
  children?: ReactNode;
  limit?: number;
  ellipsis?: boolean;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
}

export function AvatarGroup({
  children,
  style,
  testID,
  ...rest
}: AvatarGroupProps) {
  const avatars = childProps<AvatarProps>(children);
  return (
    <NativeRoot fitWidth style={style} testID={testID}>
      <Native
        {...rest}
        items={avatars.map(avatar => ({
          name: avatar.name ?? '',
          placeholder: avatar.placeholder ?? '',
          src: avatar.src ?? '',
        }))}
      />
    </NativeRoot>
  );
}
