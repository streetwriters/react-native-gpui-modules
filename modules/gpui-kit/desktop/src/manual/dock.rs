use std::cell::RefCell;
use std::collections::HashMap;

use gpui::{
    px, AnyElement, App, AppContext as _, Context, Entity, EventEmitter, FocusHandle, Focusable,
    IntoElement, ParentElement as _, Render, SharedString, Styled as _, Subscription, Window,
};
use gpui_component::dock::{
    panel_handle, register_panel, DockArea, DockAreaState, DockEvent, DockLayout, DockPlacement,
    DockSkin, DockToggleEvent, PanelEvent, PanelInfo, PanelState,
};
use react_native_gpui::native_tree::ChildRenderer;

use super::slots::Renderers;
use crate::*;

const PANEL_NAME: &str = "RnPanel";

thread_local! {
    /// The panels of each dock area, by dock area entity and React key, for
    /// the registry builder that a restored layout calls.
    static PANELS: RefCell<HashMap<gpui::EntityId, HashMap<String, Entity<KitPanel>>>> =
        RefCell::new(HashMap::new());
}

struct KitPanel {
    key: String,
    title: SharedString,
    closable: bool,
    content: Option<ChildRenderer>,
    focus: FocusHandle,
}

impl gpui_component::dock::BasePanel for KitPanel {
    fn panel_name(&self) -> &'static str {
        PANEL_NAME
    }

    fn dump(&self, _cx: &App) -> PanelState {
        let mut state = PanelState::new(PANEL_NAME);
        state.info = PanelInfo::panel(serde_json::json!({ "key": self.key }));
        state
    }

    fn closable(&self, _cx: &App) -> bool {
        self.closable
    }
}

impl gpui_component::dock::Panel for KitPanel {
    fn tab_name(&self, _cx: &App) -> Option<SharedString> {
        Some(self.title.clone())
    }

    fn title(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        self.title.clone()
    }
}

impl EventEmitter<PanelEvent> for KitPanel {}

impl Focusable for KitPanel {
    fn focus_handle(&self, _cx: &App) -> FocusHandle {
        self.focus.clone()
    }
}

impl Render for KitPanel {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let content = self.content.as_ref().map(|render| render(window, cx));
        gpui::div().size_full().children(content)
    }
}

struct Entry {
    id: String,
    title: String,
    placement: String,
    group: String,
    closable: bool,
    size: f64,
}

pub struct GpuiKitDock {
    id: String,
    area: Option<Entity<DockArea>>,
    layout: String,
    panels: HashMap<String, Entity<KitPanel>>,
    signature: String,
    subscriptions: Vec<Subscription>,
    skin: Option<std::rc::Rc<DockSkin>>,
    buttons: Option<(bool, bool)>,
}

fn placement_of(name: &str) -> DockPlacement {
    match name {
        "left" => DockPlacement::Left,
        "right" => DockPlacement::Right,
        "bottom" => DockPlacement::Bottom,
        _ => DockPlacement::Center,
    }
}

fn placement_name(placement: DockPlacement) -> &'static str {
    match placement {
        DockPlacement::Left => "left",
        DockPlacement::Right => "right",
        DockPlacement::Bottom => "bottom",
        DockPlacement::Center => "center",
    }
}

impl GpuiKitDockSpec for GpuiKitDock {
    fn create(_props: &GpuiKitDockProps, cx: &mut GpuiKitDockContext) -> Self {
        Self {
            id: format!("gpui_kit_dock-{}", cx.tag()),
            area: None,
            layout: String::new(),
            panels: HashMap::new(),
            signature: String::new(),
            subscriptions: Vec::new(),
            skin: None,
            buttons: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitDockProps,
        _changed: GpuiKitDockChanged,
        _cx: &mut GpuiKitDockContext,
    ) {
    }

    fn toggle_dock(&mut self, placement: String, cx: &mut GpuiKitDockContext) {
        let Some(area) = self.area.clone() else {
            return;
        };
        let placement = placement_of(&placement);
        if let Some(app) = cx.app() {
            app.defer(move |app| {
                if let Some(window) = app.windows().into_iter().next() {
                    let _ = window.update(app, |_, window, cx| {
                        area.update(cx, |area, cx| area.toggle_dock(placement, window, cx));
                    });
                }
            });
        }
    }

    fn select_panel(&mut self, id: String, cx: &mut GpuiKitDockContext) {
        let (Some(area), Some(panel)) = (self.area.clone(), self.panels.get(&id).cloned()) else {
            return;
        };
        if let Some(app) = cx.app() {
            app.defer(move |app| {
                let panel_id = gpui_component::dock::PanelId::from(panel.entity_id());
                if let Some(window) = app.windows().into_iter().next() {
                    let _ = window.update(app, |_, window, cx| {
                        area.update(cx, |area, cx| area.select_panel(panel_id, window, cx));
                    });
                }
            });
        }
    }

    fn restore_layout(&mut self, layout: String, cx: &mut GpuiKitDockContext) {
        let Some(area) = self.area.clone() else {
            return;
        };
        if let Some(app) = cx.app() {
            app.defer(move |app| {
                if let Some(window) = app.windows().into_iter().next() {
                    let _ = window.update(app, |_, window, cx| load(&area, &layout, window, cx));
                }
            });
        }
    }

    fn render(
        &mut self,
        props: &GpuiKitDockProps,
        window: &mut Window,
        cx: &mut GpuiKitDockContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let list = props.panels();
        let entries: Vec<Entry> = (0..list.len())
            .filter_map(|index| list.get(index))
            .map(|panel| Entry {
                id: panel.id().to_string(),
                title: panel.title().to_string(),
                placement: panel.placement().to_string(),
                group: panel.group().to_string(),
                closable: panel.closable(),
                size: panel.size(),
            })
            .collect();
        let signature = entries
            .iter()
            .map(|e| format!("{}|{}|{}|{}", e.id, e.placement, e.group, e.size))
            .collect::<Vec<_>>()
            .join(";")
            + &format!(
                "#{}",
                matches!(props.center_axis(), GpuiKitDockCenterAxis::Vertical)
            );

        for entry in &entries {
            let content = renderers.get(&format!("panel-{}", entry.id));
            let panel = self
                .panels
                .entry(entry.id.clone())
                .or_insert_with(|| {
                    app.new(|cx| KitPanel {
                        key: entry.id.clone(),
                        title: SharedString::default(),
                        closable: true,
                        content: None,
                        focus: cx.focus_handle(),
                    })
                })
                .clone();
            panel.update(app, |panel, cx| {
                panel.title = SharedString::from(entry.title.clone());
                panel.closable = entry.closable;
                panel.content = content;
                cx.notify();
            });
        }

        let id = self.id.clone();
        if self.area.is_none() {
            let (area, skin) = DockSkin::dock_area(id, Some(1), window, app);
            self.area = Some(area);
            self.skin = Some(skin);
        }
        let area = self.area.clone().unwrap();
        let buttons = (props.toggle_button_visible(), props.close_button_visible());
        if self.buttons != Some(buttons) {
            self.buttons = Some(buttons);
            if let Some(skin) = &self.skin {
                skin.set_toggle_button_visible(buttons.0, app);
                skin.set_close_button_visible(buttons.1, app);
            }
        }
        PANELS.with(|panels| {
            panels
                .borrow_mut()
                .insert(area.entity_id(), self.panels.clone());
        });
        if self.subscriptions.is_empty() {
            register_panel(app, PANEL_NAME, |context, window, cx| {
                let key = match context.info() {
                    PanelInfo::Panel(info) => info
                        .get("key")
                        .and_then(serde_json::Value::as_str)
                        .unwrap_or_default()
                        .to_string(),
                    _ => String::new(),
                };
                let area = context.dock_area().entity_id();
                let known = PANELS.with(|panels| {
                    panels
                        .borrow()
                        .get(&area)
                        .and_then(|panels| panels.get(&key).cloned())
                });
                let _ = window;
                let panel = known.unwrap_or_else(|| {
                    cx.new(|cx| KitPanel {
                        title: SharedString::from(key.clone()),
                        key,
                        closable: true,
                        content: None,
                        focus: cx.focus_handle(),
                    })
                });
                panel_handle(panel)
            });
            let layout = sender.clone();
            let toggle = sender;
            self.subscriptions
                .push(app.subscribe(&area, move |area, event: &DockEvent, cx| {
                    if matches!(event, DockEvent::LayoutChanged) {
                        let dump = area.read(cx).dump(cx);
                        layout.gpui_kit_dock_layout_change(OnGpuiKitDockLayoutChange {
                            layout: serde_json::to_string(&dump).unwrap_or_default(),
                        });
                    }
                }));
            self.subscriptions.push(app.subscribe(
                &area,
                move |_, event: &DockToggleEvent, _cx| {
                    toggle.gpui_kit_dock_toggle(OnGpuiKitDockToggle {
                        placement: placement_name(event.placement()).to_string(),
                        open: event.is_open(),
                    });
                },
            ));
        }

        let initial = props.layout().to_string();
        if self.layout != initial {
            self.layout = initial.clone();
            if !initial.is_empty() {
                self.signature = signature.clone();
                let area = area.clone();
                app.defer(move |app| {
                    if let Some(window) = app.windows().into_iter().next() {
                        let _ =
                            window.update(app, |_, window, cx| load(&area, &initial, window, cx));
                    }
                });
            }
        }
        if self.signature != signature {
            self.signature = signature;
            let axis_horizontal = !matches!(props.center_axis(), GpuiKitDockCenterAxis::Vertical);
            for placement in [
                DockPlacement::Center,
                DockPlacement::Left,
                DockPlacement::Right,
                DockPlacement::Bottom,
            ] {
                let mut groups: Vec<(String, Vec<&Entry>)> = Vec::new();
                for entry in entries
                    .iter()
                    .filter(|e| placement_of(&e.placement) == placement)
                {
                    match groups.iter_mut().find(|(group, _)| group == &entry.group) {
                        Some((_, members)) => members.push(entry),
                        None => groups.push((entry.group.clone(), vec![entry])),
                    }
                }
                if groups.is_empty() {
                    continue;
                }
                let mut layout = if matches!(placement, DockPlacement::Bottom) || !axis_horizontal {
                    DockLayout::v_split()
                } else {
                    DockLayout::h_split()
                };
                for (_, members) in groups {
                    let mut tabs = DockLayout::tabs();
                    let size = members
                        .iter()
                        .map(|member| member.size)
                        .find(|size| *size > 0.0)
                        .map(|size| px(size as f32));
                    for member in members {
                        if let Some(panel) = self.panels.get(&member.id) {
                            tabs = tabs.panel(panel.clone());
                        }
                    }
                    layout = layout.child(tabs, size);
                }
                area.update(app, |area, cx| {
                    area.set_dock(placement, layout, window, cx);
                });
            }
        }
        area.update(app, |area, cx| {
            area.set_locked(props.locked(), window, cx);
            for placement in [
                DockPlacement::Left,
                DockPlacement::Right,
                DockPlacement::Bottom,
            ] {
                let name = placement_name(placement);
                if area.has_dock(placement) && area.dock_size(placement).is_none() {
                    let size = serde_json::from_str::<serde_json::Value>(props.dock_sizes())
                        .ok()
                        .and_then(|sizes| sizes.get(name).and_then(serde_json::Value::as_f64))
                        .unwrap_or(props.dock_size());
                    area.set_dock_size(placement, px(size as f32), window, cx);
                }
                if area.has_dock(placement) {
                    let collapsible = props.collapsible().split(',').any(|p| p == name);
                    area.set_dock_collapsible(placement, collapsible, window, cx);
                }
            }
        });
        area.into_any_element()
    }
}

fn load(area: &Entity<DockArea>, layout: &str, window: &mut Window, cx: &mut App) {
    let Ok(state) = serde_json::from_str::<DockAreaState>(layout) else {
        return;
    };
    area.update(cx, |area, cx| {
        let _ = area.load(state, window, cx);
    });
}
