use std::cell::RefCell;
use std::rc::Rc;

use gpui::{
    px, AnyElement, AppContext as _, Entity, IntoElement, ParentElement as _, SharedString,
    Styled as _, Subscription, Window,
};
use gpui_component::input::{Input, InputEvent, InputState};
use gpui_component::input::{
    InputGroup, InputGroupAddon, InputGroupAddonAlignment, InputGroupText,
};
use gpui_component::sidebar::{
    Sidebar, SidebarCollapsible, SidebarGroup, SidebarMenu, SidebarMenuItem,
};
use gpui_component::{Sizable as _, Size, Theme, ThemeMode};

use super::slots::Slots;
use crate::*;

pub struct GpuiKitTheme {
    applied: Option<String>,
}

impl GpuiKitThemeSpec for GpuiKitTheme {
    fn create(_props: &GpuiKitThemeProps, _cx: &mut GpuiKitThemeContext) -> Self {
        Self { applied: None }
    }

    fn update(
        &mut self,
        _props: &GpuiKitThemeProps,
        _changed: GpuiKitThemeChanged,
        _cx: &mut GpuiKitThemeContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitThemeProps,
        window: &mut Window,
        cx: &mut GpuiKitThemeContext,
    ) -> AnyElement {
        let mode = props.mode().to_string();
        if self.applied.as_deref() != Some(&mode) {
            self.applied = Some(mode.clone());
            let sender = cx.event_sender();
            if let Some(app) = cx.app() {
                window.defer(app, move |window, app| {
                    match mode.as_str() {
                        "dark" => Theme::change(ThemeMode::Dark, Some(window), app),
                        "light" => Theme::change(ThemeMode::Light, Some(window), app),
                        _ => Theme::sync_system_appearance(Some(window), app),
                    }
                    let dark = Theme::global(app).is_dark();
                    sender.gpui_kit_theme_change(OnGpuiKitThemeChange { dark });
                    window.refresh();
                });
            }
        }
        gpui::div().into_any_element()
    }
}

pub struct GpuiKitInputGroup {
    id: String,
    state: Option<Entity<InputState>>,
    subscription: Option<Subscription>,
    last: Rc<RefCell<String>>,
}

impl GpuiKitInputGroupSpec for GpuiKitInputGroup {
    fn create(_props: &GpuiKitInputGroupProps, cx: &mut GpuiKitInputGroupContext) -> Self {
        Self {
            id: format!("gpui_kit_input_group-{}", cx.tag()),
            state: None,
            subscription: None,
            last: Rc::new(RefCell::new(String::new())),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitInputGroupProps,
        _changed: GpuiKitInputGroupChanged,
        _cx: &mut GpuiKitInputGroupContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitInputGroupProps,
        window: &mut Window,
        cx: &mut GpuiKitInputGroupContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let placeholder = props.placeholder().to_string();
        let state = self
            .state
            .get_or_insert_with(|| {
                app.new(|cx| {
                    let state = InputState::new(window, cx);
                    if placeholder.is_empty() {
                        state
                    } else {
                        state.placeholder(placeholder.clone())
                    }
                })
            })
            .clone();
        if self.subscription.is_none() {
            let last = self.last.clone();
            self.subscription =
                Some(app.subscribe(&state, move |state, event: &InputEvent, cx| {
                    if let InputEvent::Change = event {
                        let text = state.read(cx).value().to_string();
                        *last.borrow_mut() = text.clone();
                        sender.gpui_kit_input_group_change(OnGpuiKitInputGroupChange { text });
                    }
                }));
        }
        if props.controlled() && *self.last.borrow() != props.value() {
            let wanted = props.value().to_string();
            *self.last.borrow_mut() = wanted.clone();
            state.update(app, |state, cx| state.set_value(wanted, window, cx));
        }
        let mut group = InputGroup::new(SharedString::from(self.id.clone()))
            .input(Input::new(&state))
            .disabled(props.disabled())
            .readonly(props.readonly())
            .invalid(props.invalid());
        let (start_text, end_text) = (props.start_text().to_string(), props.end_text().to_string());
        let mut start = InputGroupAddon::new(format!("{}-start", self.id))
            .align(InputGroupAddonAlignment::InlineStart);
        let mut has_start = false;
        if let Some(slot) = slots.take("start") {
            start = start.child(slot);
            has_start = true;
        } else if !start_text.is_empty() {
            start = start.child(InputGroupText::new().child(start_text));
            has_start = true;
        }
        if has_start {
            group = group.addon(start);
        }
        let mut end = InputGroupAddon::new(format!("{}-end", self.id))
            .align(InputGroupAddonAlignment::InlineEnd);
        let mut has_end = false;
        if let Some(slot) = slots.take("end") {
            end = end.child(slot);
            has_end = true;
        } else if !end_text.is_empty() {
            end = end.child(InputGroupText::new().child(end_text));
            has_end = true;
        }
        if has_end {
            group = group.addon(end);
        }
        match props.size() {
            GpuiKitInputGroupSize::Unset => {}
            GpuiKitInputGroupSize::Xsmall => group = group.with_size(Size::XSmall),
            GpuiKitInputGroupSize::Small => group = group.with_size(Size::Small),
            GpuiKitInputGroupSize::Medium => group = group.with_size(Size::Medium),
            GpuiKitInputGroupSize::Large => group = group.with_size(Size::Large),
        }
        group.into_any_element()
    }
}

pub struct GpuiKitSidebar {
    id: String,
}

impl GpuiKitSidebarSpec for GpuiKitSidebar {
    fn create(_props: &GpuiKitSidebarProps, cx: &mut GpuiKitSidebarContext) -> Self {
        Self {
            id: format!("gpui_kit_sidebar-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitSidebarProps,
        _changed: GpuiKitSidebarChanged,
        _cx: &mut GpuiKitSidebarContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitSidebarProps,
        _window: &mut Window,
        cx: &mut GpuiKitSidebarContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let sender = cx.event_sender();
        let list = props.items();
        struct Entry {
            depth: i32,
            item: SidebarMenuItem,
        }
        let mut groups: Vec<(String, Vec<Entry>)> = Vec::new();
        let groups_spec = props.groups();
        for index in 0..groups_spec.len() {
            if let Some(group) = groups_spec.get(index) {
                groups.push((group.label().to_string(), Vec::new()));
            }
        }
        if groups.is_empty() {
            groups.push((String::new(), Vec::new()));
        }
        for index in 0..list.len() {
            let Some(entry) = list.get(index) else {
                continue;
            };
            let slot = (entry.group().max(0) as usize).min(groups.len() - 1);
            let press = sender.clone();
            let mut item = SidebarMenuItem::new(entry.label().to_string())
                .active(entry.active())
                .disable(entry.disabled())
                .default_open(entry.open())
                .click_to_toggle(true)
                .on_click(move |_, _window, _cx| {
                    press.gpui_kit_sidebar_press(OnGpuiKitSidebarPress {
                        index: index as i32,
                    });
                });
            if let Some(icon) = crate::generated::icons::parse(entry.icon()) {
                item = item.icon(icon);
            }
            groups[slot].1.push(Entry {
                depth: entry.depth(),
                item,
            });
        }
        let build = |entries: Vec<Entry>| -> Vec<SidebarMenuItem> {
            let mut stack: Vec<Entry> = Vec::new();
            let mut roots: Vec<SidebarMenuItem> = Vec::new();
            let close = |stack: &mut Vec<Entry>, roots: &mut Vec<SidebarMenuItem>, until: i32| {
                while stack.last().is_some_and(|top| top.depth >= until) {
                    let done = stack.pop().unwrap();
                    match stack.last_mut() {
                        Some(parent) => {
                            let current =
                                std::mem::replace(&mut parent.item, SidebarMenuItem::new(""));
                            parent.item = current.children(vec![done.item]);
                        }
                        None => roots.push(done.item),
                    }
                }
            };
            for entry in entries {
                close(&mut stack, &mut roots, entry.depth);
                stack.push(entry);
            }
            close(&mut stack, &mut roots, 0);
            roots
        };
        let mut sidebar: Sidebar<SidebarGroup<SidebarMenu>> =
            Sidebar::new(SharedString::from(self.id.clone())).collapsed(props.collapsed());
        sidebar = match props.collapsible() {
            GpuiKitSidebarCollapsible::Offcanvas => {
                sidebar.collapsible(SidebarCollapsible::Offcanvas)
            }
            GpuiKitSidebarCollapsible::None => sidebar.collapsible(SidebarCollapsible::None),
            GpuiKitSidebarCollapsible::Unset | GpuiKitSidebarCollapsible::Icon => {
                sidebar.collapsible(SidebarCollapsible::Icon)
            }
        };
        if let Some(header) = slots.take("header") {
            sidebar = sidebar.header(header);
        }
        if let Some(footer) = slots.take("footer") {
            sidebar = sidebar.footer(footer);
        }
        for (label, entries) in groups {
            let menu = SidebarMenu::new().children(build(entries));
            sidebar = sidebar.child(SidebarGroup::new(label).child(menu));
        }
        gpui::div()
            .w(px(props.width().max(0.0) as f32))
            .h_full()
            .child(sidebar)
            .into_any_element()
    }
}
