import type { ComponentType } from 'react';
import { withStorySize } from './StoryKit';
import { AccordionStory } from './AccordionStory';
import { AlertDialogStory } from './AlertDialogStory';
import { AlertStory } from './AlertStory';
import { AttachmentStory } from './AttachmentStory';
import { AvatarStory } from './AvatarStory';
import { BadgeStory } from './BadgeStory';
import { BreadcrumbStory } from './BreadcrumbStory';
import { BubbleStory } from './BubbleStory';
import { ButtonStory } from './ButtonStory';
import { CalendarStory } from './CalendarStory';
import { CarouselStory } from './CarouselStory';
import { ChartStory } from './ChartStory';
import { CheckboxStory } from './CheckboxStory';
import { ClipboardStory } from './ClipboardStory';
import { CollapsibleStory } from './CollapsibleStory';
import { ColorPickerStory } from './ColorPickerStory';
import { ComboboxStory } from './ComboboxStory';
import { CommandStory } from './CommandStory';
import { DataTableStory } from './DataTableStory';
import { DatePickerStory } from './DatePickerStory';
import { DescriptionListStory } from './DescriptionListStory';
import { DialogStory } from './DialogStory';
import { DiffStory } from './DiffStory';
import { DockStory } from './DockStory';
import { DropdownButtonStory } from './DropdownButtonStory';
import { EditorStory } from './EditorStory';
import { EmptyStory } from './EmptyStory';
import { FormStory } from './FormStory';
import { GridLayoutStory } from './GridLayoutStory';
import { GroupBoxStory } from './GroupBoxStory';
import { HoverCardStory } from './HoverCardStory';
import { IconStory } from './IconStory';
import { ImageStory } from './ImageStory';
import { InputGroupStory } from './InputGroupStory';
import { InputStory } from './InputStory';
import { KbdStory } from './KbdStory';
import { LabelStory } from './LabelStory';
import { ListStory } from './ListStory';
import { MarkerStory } from './MarkerStory';
import { MenuStory } from './MenuStory';
import { MessageScrollerStory } from './MessageScrollerStory';
import { MessageStory } from './MessageStory';
import { NativeMenuStory } from './NativeMenuStory';
import { NotificationStory } from './NotificationStory';
import { NumberInputStory } from './NumberInputStory';
import { OtpInputStory } from './OtpInputStory';
import { PaginationStory } from './PaginationStory';
import { PopoverStory } from './PopoverStory';
import { ProgressStory } from './ProgressStory';
import { QuestionnaireStory } from './QuestionnaireStory';
import { RadioStory } from './RadioStory';
import { RatingStory } from './RatingStory';
import { ResizableStory } from './ResizableStory';
import { ScrollbarStory } from './ScrollbarStory';
import { SelectStory } from './SelectStory';
import { SeparatorStory } from './SeparatorStory';
import { SettingsStory } from './SettingsStory';
import { SheetStory } from './SheetStory';
import { ShellStory } from './ShellStory';
import { ShimmerStory } from './ShimmerStory';
import { SidebarStory } from './SidebarStory';
import { SkeletonStory } from './SkeletonStory';
import { SliderStory } from './SliderStory';
import { SpeechStory } from './SpeechStory';
import { SpinnerStory } from './SpinnerStory';
import { StatusBarStory } from './StatusBarStory';
import { StepperStory } from './StepperStory';
import { SwitchStory } from './SwitchStory';
import { TableStory } from './TableStory';
import { TabsStory } from './TabsStory';
import { TagStory } from './TagStory';
import { TextareaStory } from './TextareaStory';
import { ThemeColorsStory } from './ThemeColorsStory';
import { TimeFieldStory } from './TimeFieldStory';
import { ToggleStory } from './ToggleStory';
import { ToolbarStory } from './ToolbarStory';
import { TooltipStory } from './TooltipStory';
import { TreeStory } from './TreeStory';
import { VirtualListStory } from './VirtualListStory';
import { WelcomeStory } from './WelcomeStory';

/** One fixture per official gpui-component story, by the story's file name. */
export const stories: Record<string, ComponentType> = {
  accordion: withStorySize(AccordionStory),
  alert_dialog: withStorySize(AlertDialogStory),
  alert: withStorySize(AlertStory),
  attachment: withStorySize(AttachmentStory),
  avatar: withStorySize(AvatarStory),
  badge: withStorySize(BadgeStory),
  breadcrumb: withStorySize(BreadcrumbStory),
  bubble: withStorySize(BubbleStory),
  button: withStorySize(ButtonStory),
  calendar: withStorySize(CalendarStory),
  carousel: withStorySize(CarouselStory),
  chart: withStorySize(ChartStory),
  checkbox: withStorySize(CheckboxStory),
  clipboard: withStorySize(ClipboardStory),
  collapsible: withStorySize(CollapsibleStory),
  color_picker: withStorySize(ColorPickerStory),
  combobox: withStorySize(ComboboxStory),
  command: withStorySize(CommandStory),
  data_table: withStorySize(DataTableStory),
  date_picker: withStorySize(DatePickerStory),
  description_list: withStorySize(DescriptionListStory),
  dialog: withStorySize(DialogStory),
  diff: withStorySize(DiffStory),
  dock: withStorySize(DockStory),
  dropdown_button: withStorySize(DropdownButtonStory),
  editor: withStorySize(EditorStory),
  empty: withStorySize(EmptyStory),
  form: withStorySize(FormStory),
  grid_layout: withStorySize(GridLayoutStory),
  group_box: withStorySize(GroupBoxStory),
  hover_card: withStorySize(HoverCardStory),
  icon: withStorySize(IconStory),
  image: withStorySize(ImageStory),
  input_group: withStorySize(InputGroupStory),
  input: withStorySize(InputStory),
  kbd: withStorySize(KbdStory),
  label: withStorySize(LabelStory),
  list: withStorySize(ListStory),
  marker: withStorySize(MarkerStory),
  menu: withStorySize(MenuStory),
  message_scroller: withStorySize(MessageScrollerStory),
  message: withStorySize(MessageStory),
  native_menu: withStorySize(NativeMenuStory),
  notification: withStorySize(NotificationStory),
  number_input: withStorySize(NumberInputStory),
  otp_input: withStorySize(OtpInputStory),
  pagination: withStorySize(PaginationStory),
  popover: withStorySize(PopoverStory),
  progress: withStorySize(ProgressStory),
  questionnaire: withStorySize(QuestionnaireStory),
  radio: withStorySize(RadioStory),
  rating: withStorySize(RatingStory),
  resizable: withStorySize(ResizableStory),
  scrollbar: withStorySize(ScrollbarStory),
  select: withStorySize(SelectStory),
  separator: withStorySize(SeparatorStory),
  settings: withStorySize(SettingsStory),
  sheet: withStorySize(SheetStory),
  shell: withStorySize(ShellStory),
  shimmer: withStorySize(ShimmerStory),
  sidebar: withStorySize(SidebarStory),
  skeleton: withStorySize(SkeletonStory),
  slider: withStorySize(SliderStory),
  speech: withStorySize(SpeechStory),
  spinner: withStorySize(SpinnerStory),
  status_bar: withStorySize(StatusBarStory),
  stepper: withStorySize(StepperStory),
  switch: withStorySize(SwitchStory),
  table: withStorySize(TableStory),
  tabs: withStorySize(TabsStory),
  tag: withStorySize(TagStory),
  textarea: withStorySize(TextareaStory),
  theme_colors: withStorySize(ThemeColorsStory),
  time_field: withStorySize(TimeFieldStory),
  toggle: withStorySize(ToggleStory),
  toolbar: withStorySize(ToolbarStory),
  tooltip: withStorySize(TooltipStory),
  tree: withStorySize(TreeStory),
  virtual_list: withStorySize(VirtualListStory),
  welcome: withStorySize(WelcomeStory),
};
