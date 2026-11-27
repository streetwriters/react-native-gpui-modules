import React, {
  createContext,
  useContext,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import {
  ScrollView,
  Text,
  TurboModuleRegistry,
  View,
  type TextStyle,
  type TurboModule,
  type ViewStyle,
} from 'react-native';
import {
  Button,
  DropdownMenu,
  GroupBox,
  Notifications,
  type IconName,
  type MenuEntry,
  type NotificationOptions,
  type NotificationsHandle,
} from '@react-native-gpui/gpui-kit';

/**
 * The gallery helpers of gpui-component's `crates/story` (v0.9.1), rebuilt
 * with the module so each story fixture lays out like the official story.
 */

export { STORY_SIZE } from './meta';
import { STORY_SIZE } from './meta';

/** The default light theme's palette colors (`cx.theme().red` and so on). */
export const theme = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  mutedForeground: '#737373',
  muted: '#f5f5f5',
  border: '#e5e5e5',
  primary: '#171717',
  primaryForeground: '#fafafa',
  secondary: '#e5e5e5',
  secondaryForeground: '#171717',
  info: '#06b6d4',
  magenta: '#9333ea',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#eab308',
  radius: 6,
  radiusLg: 8,
  red: '#dc2626',
  green: '#16a34a',
  blue: '#2563eb',
  yellow: '#ca8a04',
  cyan: '#0891b2',
};

interface ClipboardModule extends TurboModule {
  setString(content: string): void;
}

/** `cx.write_to_clipboard(ClipboardItem::new_string(text))`. */
export function writeClipboard(text: string) {
  TurboModuleRegistry.get<ClipboardModule>('Clipboard')?.setString(text);
}

export type StorySize = 'xsmall' | 'small' | 'medium' | 'large';

const SIZE_LABEL: Record<StorySize, string> = {
  xsmall: 'XSmall',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

const StorySizeContext = createContext<(size: StorySize) => void>(() => {});

/** The story's `ChangeStorySize` action, for a size menu of the story's own. */
export function useSetStorySize() {
  return useContext(StorySizeContext);
}

type Notify = {
  push(options: NotificationOptions | string): void;
  remove(key: string): void;
  clear(): void;
};

const NotifyContext = createContext<
  React.RefObject<NotificationsHandle | null>
>({ current: null });

/** `window.push_notification` and friends, for the story being shown. */
export function useNotify(): Notify {
  const ref = useContext(NotifyContext);
  return {
    push: options => ref.current?.push(options),
    remove: key => ref.current?.remove(key),
    clear: () => ref.current?.clear(),
  };
}

/** The story's `size` field and its `ChangeStorySize` action. */
export function withStorySize<P extends { size?: StorySize }>(
  Story: ComponentType<P>,
) {
  return function Sized(props: P) {
    const [size, setSize] = useState<StorySize>('medium');
    const notifications = useRef<NotificationsHandle>(null);
    return (
      <StorySizeContext.Provider value={setSize}>
        <NotifyContext.Provider value={notifications}>
          <Story {...props} size={size} />
          <Notifications ref={notifications} />
        </NotifyContext.Provider>
      </StorySizeContext.Provider>
    );
  };
}

/** `fixed` is the capture box of the parity runs; `page` fills the gallery page. */
export const StoryLayoutContext = createContext<'fixed' | 'page'>('fixed');

/**
 * `StoryContainer`: the story with `paddings` (16) around it. In the gallery
 * (`page`) a story that scrolls itself (`fill`) takes the whole page and is
 * its only scroller; any other story scrolls as one page.
 */
export function StoryFrame({
  testID,
  paddings = 16,
  fill = false,
  children,
}: {
  testID: string;
  /** `Story::paddings`. */
  paddings?: number;
  /** The story sizes itself to the page and scrolls its own content. */
  fill?: boolean;
  children: ReactNode;
}) {
  const layout = useContext(StoryLayoutContext);
  const frame = {
    backgroundColor: theme.background,
    padding: paddings,
  };
  if (layout === 'fixed')
    return (
      <View
        testID={testID}
        collapsable={false}
        style={{ ...STORY_SIZE, ...frame }}
      >
        {children}
      </View>
    );
  if (fill)
    return (
      <View
        testID={testID}
        collapsable={false}
        style={{ flex: 1, minWidth: 0, ...frame }}
      >
        {children}
      </View>
    );
  return (
    <ScrollView style={{ flex: 1 }}>
      <View
        testID={testID}
        collapsable={false}
        style={{ height: STORY_SIZE.height, ...frame }}
      >
        {children}
      </View>
    </ScrollView>
  );
}

export type ToolbarItem = {
  label?: string;
  icon?: IconName;
  onPress?: () => void;
  /** Entries of the menu the button opens (`dropdown_child`). */
  menu?: MenuEntry[];
  selected?: boolean;
  disabled?: boolean;
  tooltip?: string;
};

/**
 * `story_toolbar(size)` and `story_toolbar_group()`: the size button (when
 * `size` is given) and `items`, joined into one segmented control at the right.
 */
export function StoryToolbar({
  size,
  items = [],
}: {
  size?: StorySize;
  items?: ToolbarItem[];
}) {
  const setSize = useContext(StorySizeContext);
  const all: ToolbarItem[] = [
    ...(size
      ? [
          {
            label: `Size: ${SIZE_LABEL[size]}`,
            menu: (Object.keys(SIZE_LABEL) as StorySize[]).map(value => ({
              label: SIZE_LABEL[value],
              checked: value === size,
              onSelect: () => setSize(value),
            })),
          },
        ]
      : []),
    ...items,
  ];
  const last = all.length - 1;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
      {all.map((item, ix) => {
        const button = (
          <Button
            key={ix}
            label={item.label}
            icon={item.icon}
            outline
            size="small"
            selected={item.selected}
            disabled={item.disabled}
            tooltip={item.tooltip}
            onPress={item.onPress}
            kitStyle={{
              ...(ix > 0
                ? {
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderLeftWidth: 0,
                  }
                : {}),
              ...(ix < last
                ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
                : {}),
            }}
          />
        );
        return item.menu ? (
          <DropdownMenu key={ix} anchor="top-right" items={item.menu}>
            {button}
          </DropdownMenu>
        ) : (
          button
        );
      })}
    </View>
  );
}

/** Text in the story's default type: 16 points, GPUI's default line height (1.618). */
export function T({
  style,
  children,
}: {
  style?: TextStyle | TextStyle[];
  children: ReactNode;
}) {
  return (
    <Text
      style={[
        { fontSize: 16, lineHeight: 25.9, color: theme.foreground },
        style as TextStyle,
      ]}
    >
      {children}
    </Text>
  );
}

/**
 * `section(title)`: an outline group box whose title is the name in medium
 * weight over an optional extra-small description, and whose body is a
 * centred, wrapping row with a gap of 16 (`column`: a centred column);
 * `style` is the `.w_128()` and similar of the story. The row is centred in
 * the body, and content wider than the row overflows it on both sides.
 */
export function Section({
  title,
  description,
  subTitle,
  style,
  column,
  children,
}: {
  title: string;
  description?: string;
  subTitle?: ReactNode;
  style?: ViewStyle;
  column?: boolean;
  children: ReactNode;
}) {
  const heading =
    description === undefined && subTitle === undefined ? (
      title
    ) : (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
        }}
      >
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <T
            style={{
              fontWeight: '500',
              lineHeight: 20,
              color: theme.mutedForeground,
            }}
          >
            {title}
          </T>
          {description !== undefined && (
            <Text
              style={{
                fontSize: 12,
                lineHeight: 15,
                color: theme.mutedForeground,
              }}
            >
              {description}
            </Text>
          )}
        </View>
        {subTitle}
      </View>
    );
  const body = (
    <View
      style={[
        column
          ? {
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
            }
          : {
              width: '100%',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
            },
        style,
      ]}
    >
      {children}
    </View>
  );
  return (
    <GroupBox
      variant="outline"
      title={heading}
      style={{ marginBottom: 24, alignSelf: 'stretch' }}
      contentClip={false}
      contentStyle={{
        borderRadius: 8,
        overflowX: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ alignItems: 'center' }}>{body}</View>
    </GroupBox>
  );
}
