use gpui::{
    div, AnyElement, Div, ElementId, InteractiveElement, Interactivity, IntoElement,
    ParentElement as _, RenderOnce, SharedString, Stateful, StyleRefinement, Styled, Window,
};
use gpui_component::menu::DropdownMenu;
use gpui_component::menu::PopupMenuItem;
use gpui_component::Selectable;

/// A slot of React Native content that a popup is anchored to: a box that
/// popovers, menus and tooltips treat as their trigger element.
#[derive(IntoElement)]
pub struct SlotTrigger {
    base: Stateful<Div>,
    selected: bool,
}

impl SlotTrigger {
    pub fn new(id: impl Into<SharedString>, content: Option<AnyElement>) -> Self {
        let id: SharedString = id.into();
        let base = div().id(ElementId::Name(id));
        Self {
            base: match content {
                Some(content) => base.child(content),
                None => base,
            },
            selected: false,
        }
    }

    pub fn into_base(self) -> Stateful<Div> {
        self.base
    }
}

impl Styled for SlotTrigger {
    fn style(&mut self) -> &mut StyleRefinement {
        self.base.style()
    }
}

impl InteractiveElement for SlotTrigger {
    fn interactivity(&mut self) -> &mut Interactivity {
        self.base.interactivity()
    }
}

impl Selectable for SlotTrigger {
    fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    fn is_selected(&self) -> bool {
        self.selected
    }
}

impl DropdownMenu for SlotTrigger {}

impl RenderOnce for SlotTrigger {
    fn render(self, _: &mut Window, _: &mut gpui::App) -> impl IntoElement {
        self.base
    }
}

/// One entry of a menu given as data.
#[derive(Clone)]
pub struct MenuEntry {
    pub label: String,
    pub icon: String,
    pub checked: bool,
    pub disabled: bool,
    pub separator: bool,
}

/// Builds the entries into a popup menu; `select` is told the index of the
/// entry that was chosen.
pub fn build_menu(
    mut menu: gpui_component::menu::PopupMenu,
    entries: &[MenuEntry],
    select: impl Fn(usize) + Clone + 'static,
) -> gpui_component::menu::PopupMenu {
    for (index, entry) in entries.iter().enumerate() {
        if entry.separator {
            menu = menu.separator();
            continue;
        }
        let select = select.clone();
        let mut item = PopupMenuItem::new(entry.label.clone())
            .checked(entry.checked)
            .disabled(entry.disabled)
            .on_click(move |_, _window, _cx| select(index));
        if let Some(icon) = crate::generated::icons::parse(&entry.icon) {
            item = item.icon(icon);
        }
        menu = menu.item(item);
    }
    menu
}

pub fn anchor(name: &str) -> gpui::Anchor {
    match name {
        "top-right" => gpui::Anchor::TopRight,
        "bottom-left" => gpui::Anchor::BottomLeft,
        "bottom-right" => gpui::Anchor::BottomRight,
        _ => gpui::Anchor::TopLeft,
    }
}
