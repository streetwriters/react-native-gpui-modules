import React, { type ReactNode } from 'react';
import {
  View,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { IconName } from '../generated/icons';
import Native from './GpuiKitTabBarNativeComponent';
import { SlotHost } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';

export interface TabEntry {
  /** Leave it out for a tab with only an icon. */
  label?: string;
  icon?: IconName;
  disabled?: boolean;
  /** React Native content of the tab, shown while it is selected. */
  panel?: ReactNode;
  /** React Native content after the tab's label. */
  suffix?: ReactNode;
  /** An icon before the label. */
  prefixIcon?: IconName;
  /** Refines the tab, for example `flex: 1` through `width` or padding. */
  kitStyle?: KitStyle;
}

export type TabSelectEvent = NativeSyntheticEvent<Readonly<{ index: number }>>;

export interface TabsProps {
  tabs: TabEntry[];
  selectedIndex?: number;
  variant?: 'tab' | 'outline' | 'pill' | 'segmented' | 'underline' | 'folder';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  menu?: boolean;
  /** The widest a tab may be, in points. */
  maxWidth?: number;
  /** React Native content before the tabs. */
  prefix?: ReactNode;
  /** React Native content after the tabs. */
  suffix?: ReactNode;
  /** Refines the bar, for example a top border. */
  kitStyle?: KitStyle;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onSelect?: (event: TabSelectEvent) => void;
}

/** The kit's tab bar with the panel of the selected tab below it. */
export function Tabs({
  tabs,
  selectedIndex = 0,
  variant,
  size,
  menu,
  maxWidth,
  prefix,
  suffix,
  kitStyle: barStyle,
  style,
  testID,
  onSelect,
}: TabsProps) {
  const selected = tabs[selectedIndex];
  const slots = [
    { name: 'prefix', content: prefix, fit: true },
    { name: 'suffix', content: suffix, fit: true },
    ...tabs.map((tab, index) => ({
      name: `tab-suffix-${index}`,
      content: tab.suffix,
      fit: true,
    })),
  ];
  return (
    <View style={style} testID={testID}>
      <SlotHost
        style={{ alignSelf: 'stretch' }}
        testID={testID ? `${testID}-bar` : undefined}
        native={Native as never}
        nativeProps={{
          items: tabs.map(tab => ({
            label: tab.label ?? '',
            icon: tab.icon ?? '',
            disabled: tab.disabled ?? false,
            prefixIcon: tab.prefixIcon ?? '',
            kitStyle: kitStyle(tab.kitStyle),
          })),
          selectedIndex,
          variant,
          size,
          menu,
          tabMaxWidth: maxWidth ?? 0,
          kitStyle: kitStyle(barStyle),
          onGpuiKitTabBarSelect: onSelect,
        }}
        slots={slots}
      />
      {selected?.panel}
    </View>
  );
}
