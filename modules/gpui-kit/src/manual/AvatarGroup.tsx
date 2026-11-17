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

const sizes = { xsmall: 20, small: 24, medium: 32, large: 40 } as const;

export function AvatarGroup({ children, style, ...rest }: AvatarGroupProps) {
  const avatars = childProps<AvatarProps>(children);
  const shown =
    Math.min(avatars.length, rest.limit ?? 3) + (rest.ellipsis ? 1 : 0);
  const side = sizes[rest.size ?? 'medium'];
  return (
    <Native
      {...rest}
      items={avatars.map(avatar => ({
        name: avatar.name ?? '',
        placeholder: avatar.placeholder ?? '',
        src: avatar.src ?? '',
      }))}
      style={[
        { height: side, width: side + Math.max(0, shown - 1) * side * 0.7 + 4 },
        style,
      ]}
    />
  );
}
