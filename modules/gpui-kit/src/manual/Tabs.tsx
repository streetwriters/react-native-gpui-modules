import React, { type ReactNode } from 'react';
import {
  View,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { IconName } from '../generated/icons';
import Native from './GpuiKitTabBarNativeComponent';

export interface TabEntry {
  label: string;
  icon?: IconName;
  disabled?: boolean;
  /** React Native content of the tab, shown while it is selected. */
  panel?: ReactNode;
}

export type TabSelectEvent = NativeSyntheticEvent<Readonly<{ index: number }>>;

export interface TabsProps {
  tabs: TabEntry[];
  selectedIndex?: number;
  variant?: 'tab' | 'outline' | 'pill' | 'segmented' | 'underline' | 'folder';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  menu?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onSelect?: (event: TabSelectEvent) => void;
}

const heights = { xsmall: 24, small: 28, medium: 36, large: 44 } as const;

/** The kit's tab bar with the panel of the selected tab below it. */
export function Tabs({
  tabs,
  selectedIndex = 0,
  variant,
  size,
  menu,
  style,
  testID,
  onSelect,
}: TabsProps) {
  const selected = tabs[selectedIndex];
  return (
    <View style={style} testID={testID}>
      <Native
        testID={testID ? `${testID}-bar` : undefined}
        style={{ height: heights[size ?? 'medium'], alignSelf: 'stretch' }}
        items={tabs.map(tab => ({
          label: tab.label,
          icon: tab.icon ?? '',
          disabled: tab.disabled ?? false,
        }))}
        selectedIndex={selectedIndex}
        variant={variant}
        size={size}
        menu={menu}
        onGpuiKitTabBarSelect={onSelect as never}
      />
      {selected?.panel}
    </View>
  );
}
