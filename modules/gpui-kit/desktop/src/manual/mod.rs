mod accordion;
pub(crate) mod addons;
mod alert_dialog;
mod avatar_group;
mod badge;
mod basic_table;
mod breadcrumb;
mod button_group;
mod calendar;
mod chart;
mod chart_spec;
mod chat;
mod chrome;
mod code;
mod collapsible;
mod color_picker;
mod combobox;
mod command;
mod date_picker;
mod description_list;
mod dialog;
mod dock;
mod dropdown_button;
mod dropdown_menu;
mod editor_extras;
mod empty;
mod form;
mod group_box;
mod history;
mod hover_card;
mod inspector;
mod kbd;
mod layout;
mod list;
mod list_model;
mod marker;
mod menu_model;
mod native_menu;
mod notification;
mod plot;
mod popover;
mod popup_menu;
mod questionnaire;
mod radio_group;
pub(crate) mod rules;
mod select;
mod setting;
mod sheet;
mod sidebar;
pub(crate) mod slots;
mod speech;
mod stacked_chart;
mod stepper;
mod tab_bar;
mod table;
mod text;
mod theme_registry;
mod time_field;
mod toggle_group;
mod tooltip;
mod tree;
mod trigger;
mod virtual_list;
mod window;

use slots::register;

pub fn register() {
    register!(
        GpuiKitNativeMenuComponent,
        gpui_kit_native_menu_component,
        native_menu::GpuiKitNativeMenu
    );
    register!(
        GpuiKitBasicTableComponent,
        gpui_kit_basic_table_component,
        basic_table::GpuiKitBasicTable
    );
    register!(
        GpuiKitGridLayoutComponent,
        gpui_kit_grid_layout_component,
        window::GpuiKitGridLayout
    );
    register!(
        GpuiKitTitleBarComponent,
        gpui_kit_title_bar_component,
        window::GpuiKitTitleBar
    );
    register!(
        GpuiKitWindowBorderComponent,
        gpui_kit_window_border_component,
        window::GpuiKitWindowBorder
    );
    register!(
        GpuiKitDiffComponent,
        gpui_kit_diff_component,
        code::GpuiKitDiff
    );
    register!(
        GpuiKitEditorComponent,
        gpui_kit_editor_component,
        code::GpuiKitEditor
    );
    register!(
        GpuiKitScrollAreaComponent,
        gpui_kit_scroll_area_component,
        text::GpuiKitScrollArea
    );
    register!(
        GpuiKitTextViewComponent,
        gpui_kit_text_view_component,
        text::GpuiKitTextView
    );
    register!(
        GpuiKitAttachmentComponent,
        gpui_kit_attachment_component,
        chat::GpuiKitAttachment
    );
    register!(
        GpuiKitBubbleComponent,
        gpui_kit_bubble_component,
        chat::GpuiKitBubble
    );
    register!(
        GpuiKitMessageComponent,
        gpui_kit_message_component,
        chat::GpuiKitMessage
    );
    register!(
        GpuiKitMessageScrollerComponent,
        gpui_kit_message_scroller_component,
        chat::GpuiKitMessageScroller
    );
    register!(
        GpuiKitFormComponent,
        gpui_kit_form_component,
        form::GpuiKitForm
    );
    register!(
        GpuiKitChartComponent,
        gpui_kit_chart_component,
        chart::GpuiKitChart
    );
    register!(
        GpuiKitInputGroupComponent,
        gpui_kit_input_group_component,
        chrome::GpuiKitInputGroup
    );
    register!(
        GpuiKitSidebarComponent,
        gpui_kit_sidebar_component,
        sidebar::GpuiKitSidebar
    );
    register!(
        GpuiKitThemeRegistryComponent,
        gpui_kit_theme_registry_component,
        theme_registry::GpuiKitThemeRegistry
    );
    register!(
        GpuiKitSidebarToggleComponent,
        gpui_kit_sidebar_toggle_component,
        sidebar::GpuiKitSidebarToggle
    );
    register!(
        GpuiKitThemeComponent,
        gpui_kit_theme_component,
        chrome::GpuiKitTheme
    );
    register!(
        GpuiKitCarouselComponent,
        gpui_kit_carousel_component,
        layout::GpuiKitCarousel
    );
    register!(
        GpuiKitResizableComponent,
        gpui_kit_resizable_component,
        layout::GpuiKitResizable
    );
    register!(
        GpuiKitStatusBarComponent,
        gpui_kit_status_bar_component,
        layout::GpuiKitStatusBar
    );
    register!(
        GpuiKitToolbarComponent,
        gpui_kit_toolbar_component,
        layout::GpuiKitToolbar
    );
    register!(
        GpuiKitTableComponent,
        gpui_kit_table_component,
        table::GpuiKitTable
    );
    register!(
        GpuiKitListComponent,
        gpui_kit_list_component,
        list::GpuiKitList
    );
    register!(
        GpuiKitTreeComponent,
        gpui_kit_tree_component,
        tree::GpuiKitTree
    );
    register!(
        GpuiKitCalendarComponent,
        gpui_kit_calendar_component,
        calendar::GpuiKitCalendar
    );
    register!(
        GpuiKitColorPickerComponent,
        gpui_kit_color_picker_component,
        color_picker::GpuiKitColorPicker
    );
    register!(
        GpuiKitDatePickerComponent,
        gpui_kit_date_picker_component,
        date_picker::GpuiKitDatePicker
    );
    register!(
        GpuiKitTimeFieldComponent,
        gpui_kit_time_field_component,
        time_field::GpuiKitTimeField
    );
    register!(
        GpuiKitTabBarComponent,
        gpui_kit_tab_bar_component,
        tab_bar::GpuiKitTabBar
    );
    register!(
        GpuiKitComboboxComponent,
        gpui_kit_combobox_component,
        combobox::GpuiKitCombobox
    );
    register!(
        GpuiKitSelectComponent,
        gpui_kit_select_component,
        select::GpuiKitSelect
    );
    register!(
        GpuiKitCommandComponent,
        gpui_kit_command_component,
        command::GpuiKitCommand
    );
    register!(
        GpuiKitPopupMenuComponent,
        gpui_kit_popup_menu_component,
        popup_menu::GpuiKitPopupMenu
    );
    register!(
        GpuiKitDropdownMenuComponent,
        gpui_kit_dropdown_menu_component,
        dropdown_menu::GpuiKitDropdownMenu
    );
    register!(
        GpuiKitHoverCardComponent,
        gpui_kit_hover_card_component,
        hover_card::GpuiKitHoverCard
    );
    register!(
        GpuiKitTooltipComponent,
        gpui_kit_tooltip_component,
        tooltip::GpuiKitTooltip
    );
    register!(
        GpuiKitPopoverComponent,
        gpui_kit_popover_component,
        popover::GpuiKitPopover
    );
    register!(
        GpuiKitAlertDialogComponent,
        gpui_kit_alert_dialog_component,
        alert_dialog::GpuiKitAlertDialog
    );
    register!(
        GpuiKitDialogComponent,
        gpui_kit_dialog_component,
        dialog::GpuiKitDialog
    );
    register!(
        GpuiKitNotificationComponent,
        gpui_kit_notification_component,
        notification::GpuiKitNotification
    );
    register!(
        GpuiKitSheetComponent,
        gpui_kit_sheet_component,
        sheet::GpuiKitSheet
    );
    register!(
        GpuiKitAccordionComponent,
        gpui_kit_accordion_component,
        accordion::GpuiKitAccordion
    );
    register!(
        GpuiKitBreadcrumbComponent,
        gpui_kit_breadcrumb_component,
        breadcrumb::GpuiKitBreadcrumb
    );
    register!(
        GpuiKitCollapsibleComponent,
        gpui_kit_collapsible_component,
        collapsible::GpuiKitCollapsible
    );
    register!(
        GpuiKitStepperComponent,
        gpui_kit_stepper_component,
        stepper::GpuiKitStepper
    );
    register!(
        GpuiKitAvatarGroupComponent,
        gpui_kit_avatar_group_component,
        avatar_group::GpuiKitAvatarGroup
    );
    register!(
        GpuiKitButtonGroupComponent,
        gpui_kit_button_group_component,
        button_group::GpuiKitButtonGroup
    );
    register!(
        GpuiKitSpeechComponent,
        gpui_kit_speech_component,
        speech::GpuiKitSpeech
    );
    register!(
        GpuiKitHistoryComponent,
        gpui_kit_history_component,
        history::GpuiKitHistory
    );
    register!(
        GpuiKitInspectorComponent,
        gpui_kit_inspector_component,
        inspector::GpuiKitInspector
    );
    register!(
        GpuiKitVirtualListComponent,
        gpui_kit_virtual_list_component,
        virtual_list::GpuiKitVirtualList
    );
    register!(
        GpuiKitDockComponent,
        gpui_kit_dock_component,
        dock::GpuiKitDock
    );
    register!(
        GpuiKitQuestionnaireComponent,
        gpui_kit_questionnaire_component,
        questionnaire::GpuiKitQuestionnaire
    );
    register!(
        GpuiKitPlotComponent,
        gpui_kit_plot_component,
        plot::GpuiKitPlot
    );
    register!(
        GpuiKitSettingsComponent,
        gpui_kit_settings_component,
        setting::GpuiKitSettings
    );
    register!(
        GpuiKitDescriptionListComponent,
        gpui_kit_description_list_component,
        description_list::GpuiKitDescriptionList
    );
    register!(
        GpuiKitDropdownButtonComponent,
        gpui_kit_dropdown_button_component,
        dropdown_button::GpuiKitDropdownButton
    );
    register!(
        GpuiKitEmptyComponent,
        gpui_kit_empty_component,
        empty::GpuiKitEmpty
    );
    register!(
        GpuiKitGroupBoxComponent,
        gpui_kit_group_box_component,
        group_box::GpuiKitGroupBox
    );
    register!(GpuiKitKbdComponent, gpui_kit_kbd_component, kbd::GpuiKitKbd);
    register!(
        GpuiKitBadgeComponent,
        gpui_kit_badge_component,
        badge::GpuiKitBadge
    );
    register!(
        GpuiKitMarkerComponent,
        gpui_kit_marker_component,
        marker::GpuiKitMarker
    );
    register!(
        GpuiKitRadioGroupComponent,
        gpui_kit_radio_group_component,
        radio_group::GpuiKitRadioGroup
    );
    register!(
        GpuiKitToggleGroupComponent,
        gpui_kit_toggle_group_component,
        toggle_group::GpuiKitToggleGroup
    );
}

pub(crate) fn init(cx: &mut gpui::App) {
    native_menu::init(cx);
    menu_model::init(cx);
}
