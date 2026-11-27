use std::collections::HashMap;
use std::rc::Rc;

use gpui::{px, AnyElement, IntoElement, ParentElement as _, SharedString, Styled as _, Window};
use gpui_component::menu::DropdownMenu as _;
use gpui_component::sidebar::{
    Sidebar, SidebarCollapsible, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem,
    SidebarMenu, SidebarMenuItem, SidebarToggleButton,
};
use gpui_component::Side;
use react_native_gpui::native_tree::ChildRenderer;
use serde::Deserialize;

use super::menu_model::{self, MenuModel};
use super::slots::{Renderers, Slots};
use crate::*;

#[derive(Default, Deserialize)]
#[serde(default, rename_all = "camelCase")]
struct GroupSpec {
    label: String,
    items: Vec<ItemSpec>,
}

#[derive(Default, Deserialize)]
#[serde(default, rename_all = "camelCase")]
struct ItemSpec {
    /// The item's place among all items, depth first, which events report.
    index: usize,
    label: String,
    icon: String,
    active: bool,
    disabled: bool,
    default_open: bool,
    click_to_open: bool,
    kit_style: String,
    label_style: String,
    /// The item has React Native content after its label, slot `suffix-<index>`.
    suffix: bool,
    /// The item's context menu, as a menu model.
    menu: Option<MenuModel>,
    children: Vec<ItemSpec>,
}

/// A slot that takes the free width of the kit's header or footer row.
fn fill(content: AnyElement) -> impl IntoElement {
    gpui::div().flex_1().min_w_0().child(content)
}

pub struct GpuiKitSidebar {
    id: String,
    header_menu: u64,
    submenus: menu_model::Submenus,
}

impl Drop for GpuiKitSidebar {
    fn drop(&mut self) {
        menu_model::remove_picker(self.header_menu);
    }
}

struct Builder {
    renderers: Rc<Renderers>,
    sender: GpuiKitSidebarEventSender,
}

impl Builder {
    fn item(&self, spec: ItemSpec) -> SidebarMenuItem {
        let index = spec.index;
        let press = self.sender.clone();
        let mut item = SidebarMenuItem::new(spec.label)
            .active(spec.active)
            .disable(spec.disabled)
            .default_open(spec.default_open)
            .click_to_open(spec.click_to_open)
            .on_click(move |_, _window, _cx| {
                press.gpui_kit_sidebar_press(OnGpuiKitSidebarPress {
                    index: index as i32,
                });
            });
        if let Some(icon) = crate::generated::icons::parse(&spec.icon) {
            item = item.icon(icon);
        }
        if let Some(style) = crate::style::refinement(&spec.kit_style) {
            gpui::Refineable::refine(gpui::Styled::style(&mut item), &style);
        }
        if let Some(style) = crate::style::refinement(&spec.label_style) {
            item = item.label_style(style);
        }
        if spec.suffix {
            if let Some(suffix) = self.renderers.get(&format!("suffix-{index}")) {
                item = item.suffix(move |window, cx| suffix(window, cx));
            }
        }
        if let Some(model) = spec.menu {
            let pick = self.sender.clone();
            let model = Rc::new(model);
            item = item.context_menu(move |menu, _, _| {
                let pick = pick.clone();
                model.build_flat(
                    menu,
                    Rc::new(move |id| {
                        pick.gpui_kit_sidebar_item_menu(OnGpuiKitSidebarItemMenu {
                            index: index as i32,
                            id: id as i32,
                        })
                    }),
                )
            });
        }
        if !spec.children.is_empty() {
            item = item.children(
                spec.children
                    .into_iter()
                    .map(|child| self.item(child))
                    .collect::<Vec<_>>(),
            );
        }
        item
    }
}

impl GpuiKitSidebarSpec for GpuiKitSidebar {
    fn create(_props: &GpuiKitSidebarProps, cx: &mut GpuiKitSidebarContext) -> Self {
        Self {
            id: format!("gpui_kit_sidebar-{}", cx.tag()),
            header_menu: menu_model::next_menu_id(),
            submenus: Default::default(),
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
        let renderers = Rc::new(Renderers::new(props.slots()));
        let mut slots = Slots::new(props.slots(), cx.children());
        let sender = cx.event_sender();
        let groups: Vec<GroupSpec> = serde_json::from_str(props.groups_json()).unwrap_or_default();
        let builder = Builder {
            renderers,
            sender: sender.clone(),
        };
        let id = SharedString::from(self.id.clone());
        // One group without a label is a bare menu, as `Sidebar::child(SidebarMenu)`.
        if groups.len() == 1 && groups[0].label.is_empty() {
            let group = groups.into_iter().next().expect("one group");
            let menu = SidebarMenu::new().children(
                group
                    .items
                    .into_iter()
                    .map(|item| builder.item(item))
                    .collect::<Vec<_>>(),
            );
            let sidebar =
                self.configure(Sidebar::<SidebarMenu>::new(id), props, &mut slots, &sender);
            return sidebar.child(menu).into_any_element();
        }
        let mut sidebar = self.configure(
            Sidebar::<SidebarGroup<SidebarMenu>>::new(id),
            props,
            &mut slots,
            &sender,
        );
        for group in groups {
            let menu = SidebarMenu::new().children(
                group
                    .items
                    .into_iter()
                    .map(|item| builder.item(item))
                    .collect::<Vec<_>>(),
            );
            sidebar = sidebar.child(SidebarGroup::new(group.label).child(menu));
        }
        sidebar.into_any_element()
    }
}

impl GpuiKitSidebar {
    /// Everything but the menu: side, collapsing, width, style, header and footer.
    fn configure<E: SidebarItem + 'static>(
        &self,
        mut sidebar: Sidebar<E>,
        props: &GpuiKitSidebarProps,
        slots: &mut Slots,
        sender: &GpuiKitSidebarEventSender,
    ) -> Sidebar<E> {
        sidebar = sidebar
            .collapsed(props.collapsed())
            .side(if props.side() == "right" {
                Side::Right
            } else {
                Side::Left
            });
        sidebar = match props.collapsible() {
            GpuiKitSidebarCollapsible::Offcanvas => {
                sidebar.collapsible(SidebarCollapsible::Offcanvas)
            }
            GpuiKitSidebarCollapsible::None => sidebar.collapsible(SidebarCollapsible::None),
            GpuiKitSidebarCollapsible::Unset | GpuiKitSidebarCollapsible::Icon => {
                sidebar.collapsible(SidebarCollapsible::Icon)
            }
        };
        if props.sidebar_width() > 0.0 {
            sidebar = sidebar.w(px(props.sidebar_width() as f32));
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut sidebar), &style);
        }
        if let Some(header) = slots.take("header") {
            if props.header_kit() {
                let mut kit = SidebarHeader::new().child(fill(header));
                if let Some(style) = crate::style::refinement(props.header_style()) {
                    gpui::Refineable::refine(gpui::Styled::style(&mut kit), &style);
                }
                let model = MenuModel::parse(props.header_menu_json());
                if model.items.is_empty() {
                    sidebar = sidebar.header(kit);
                } else {
                    let menu_id = self.header_menu;
                    let pick: menu_model::Picker = {
                        let sender = sender.clone();
                        Rc::new(move |id| {
                            sender.gpui_kit_sidebar_header_menu(OnGpuiKitSidebarHeaderMenu {
                                id: id as i32,
                            })
                        })
                    };
                    menu_model::set_picker(menu_id, pick.clone());
                    let rows = Rc::new(HashMap::<usize, ChildRenderer>::new());
                    let submenus = self.submenus.clone();
                    let model = Rc::new(model);
                    sidebar = sidebar.header(kit.dropdown_menu(move |menu, window, cx| {
                        submenus.borrow_mut().clear();
                        model.build(menu, menu_id, &pick, &rows, &submenus, window, cx)
                    }));
                }
            } else {
                sidebar = sidebar.header(header);
            }
        }
        if let Some(footer) = slots.take("footer") {
            if props.footer_kit() {
                let mut kit = SidebarFooter::new().child(fill(footer));
                if let Some(style) = crate::style::refinement(props.footer_style()) {
                    gpui::Refineable::refine(gpui::Styled::style(&mut kit), &style);
                }
                sidebar = sidebar.footer(kit);
            } else {
                sidebar = sidebar.footer(footer);
            }
        }
        sidebar
    }
}

pub struct GpuiKitSidebarToggle;

impl GpuiKitSidebarToggleSpec for GpuiKitSidebarToggle {
    fn create(_props: &GpuiKitSidebarToggleProps, _cx: &mut GpuiKitSidebarToggleContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitSidebarToggleProps,
        _changed: GpuiKitSidebarToggleChanged,
        _cx: &mut GpuiKitSidebarToggleContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitSidebarToggleProps,
        _window: &mut Window,
        cx: &mut GpuiKitSidebarToggleContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        SidebarToggleButton::new()
            .side(if props.side() == "right" {
                Side::Right
            } else {
                Side::Left
            })
            .collapsed(props.collapsed())
            .on_click(move |_, _, _| {
                sender.gpui_kit_sidebar_toggle_press();
            })
            .into_any_element()
    }
}
