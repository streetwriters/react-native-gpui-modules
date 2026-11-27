//! Items of a `Select` or `Combobox`, from the `listJson` prop: plain or
//! grouped rows with icons, disabled and pinned rows, a badge, and a cap on
//! how many rows can be selected.

use gpui::{
    div, prelude::FluentBuilder as _, AnyElement, App, Half as _, IntoElement, ParentElement as _,
    SharedString, Styled as _, Task, Window,
};
use gpui_component::searchable_list::{
    SearchableListChange, SearchableListDelegate, SearchableListItem,
};
use gpui_component::{h_flex, ActiveTheme as _, Icon, IndexPath, Sizable as _};
use serde::Deserialize;

#[derive(Deserialize, Default, Clone, PartialEq)]
#[serde(default)]
struct ItemSpec {
    value: String,
    title: String,
    icon: String,
    disabled: bool,
    badge: String,
    display: String,
}

#[derive(Deserialize, Default, Clone, PartialEq)]
#[serde(default)]
struct GroupSpec {
    title: String,
    items: Vec<ItemSpec>,
}

#[derive(Deserialize, Default, Clone, PartialEq)]
#[serde(default)]
pub struct ListSpec {
    groups: Vec<GroupSpec>,
    items: Vec<ItemSpec>,
    max: usize,
    pinned: Vec<String>,
}

impl ListSpec {
    pub fn parse(json: &str) -> Self {
        serde_json::from_str(json).unwrap_or_default()
    }

    /// The spec of a plain list of titles.
    pub fn plain(items: Vec<String>) -> Self {
        Self {
            items: items
                .into_iter()
                .map(|title| ItemSpec {
                    value: title.clone(),
                    title,
                    ..Default::default()
                })
                .collect(),
            ..Default::default()
        }
    }
}

#[derive(Clone)]
pub struct KitItem {
    value: SharedString,
    title: SharedString,
    icon: Option<gpui_kit_assets::IconName>,
    disabled: bool,
    badge: SharedString,
    display: SharedString,
}

impl SearchableListItem for KitItem {
    type Value = SharedString;

    fn title(&self) -> SharedString {
        self.title.clone()
    }

    fn display_title(&self) -> Option<AnyElement> {
        (!self.display.is_empty()).then(|| self.display.clone().into_any_element())
    }

    fn render(&self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        h_flex()
            .w_full()
            .gap_2()
            .items_center()
            .when_some(self.icon, |row, icon| {
                row.child(
                    Icon::new(icon)
                        .small()
                        .text_color(cx.theme().muted_foreground),
                )
            })
            .child(div().child(self.title.clone()))
    }

    fn value(&self) -> &SharedString {
        &self.value
    }

    fn disabled(&self) -> bool {
        self.disabled
    }
}

pub struct KitList {
    groups: Vec<(Option<SharedString>, Vec<KitItem>)>,
    matched: Vec<(usize, Vec<usize>)>,
    max: usize,
    pinned: Vec<SharedString>,
    selected: Vec<SharedString>,
}

impl KitList {
    pub fn new(spec: &ListSpec) -> Self {
        let item = |spec: &ItemSpec| KitItem {
            value: SharedString::from(if spec.value.is_empty() {
                spec.title.clone()
            } else {
                spec.value.clone()
            }),
            title: SharedString::from(spec.title.clone()),
            icon: crate::generated::icons::parse(&spec.icon),
            disabled: spec.disabled,
            badge: SharedString::from(spec.badge.clone()),
            display: SharedString::from(spec.display.clone()),
        };
        let groups: Vec<(Option<SharedString>, Vec<KitItem>)> = if spec.groups.is_empty() {
            vec![(None, spec.items.iter().map(item).collect())]
        } else {
            spec.groups
                .iter()
                .map(|group| {
                    (
                        Some(SharedString::from(group.title.clone())),
                        group.items.iter().map(item).collect(),
                    )
                })
                .collect()
        };
        let matched = groups
            .iter()
            .enumerate()
            .map(|(ix, (_, items))| (ix, (0..items.len()).collect()))
            .collect();
        Self {
            groups,
            matched,
            max: spec.max,
            pinned: spec
                .pinned
                .iter()
                .cloned()
                .map(SharedString::from)
                .collect(),
            selected: Vec::new(),
        }
    }

    /// The position of `value` among all rows, ignoring the search.
    pub fn index_of(&self, value: &str) -> Option<IndexPath> {
        self.groups
            .iter()
            .enumerate()
            .find_map(|(section, (_, items))| {
                items
                    .iter()
                    .position(|item| item.value.as_ref() == value)
                    .map(|row| IndexPath::default().section(section).row(row))
            })
    }
}

impl SearchableListDelegate for KitList {
    type Item = KitItem;

    fn sections_count(&self, _: &App) -> usize {
        self.matched.len()
    }

    fn section(&self, section: usize) -> Option<AnyElement> {
        let (group, _) = self.matched.get(section)?;
        self.groups[*group]
            .0
            .clone()
            .map(IntoElement::into_any_element)
    }

    fn items_count(&self, section: usize) -> usize {
        self.matched.get(section).map_or(0, |(_, rows)| rows.len())
    }

    fn item(&self, ix: IndexPath) -> Option<&KitItem> {
        let (group, rows) = self.matched.get(ix.section)?;
        self.groups[*group].1.get(*rows.get(ix.row)?)
    }

    fn position<V>(&self, value: &V) -> Option<IndexPath>
    where
        KitItem: SearchableListItem<Value = V>,
        V: PartialEq,
    {
        for (section, (group, rows)) in self.matched.iter().enumerate() {
            for (row, &at) in rows.iter().enumerate() {
                if self.groups[*group].1[at].value() == value {
                    return Some(IndexPath::default().section(section).row(row));
                }
            }
        }
        None
    }

    fn perform_search(&mut self, query: &str, _: &mut Window, _: &mut App) -> Task<()> {
        let lowered = query.to_lowercase();
        self.matched = self
            .groups
            .iter()
            .enumerate()
            .filter_map(|(ix, (title, items))| {
                let rows: Vec<usize> = items
                    .iter()
                    .enumerate()
                    .filter(|(_, item)| item.matches(query))
                    .map(|(row, _)| row)
                    .collect();
                let title_matches = title
                    .as_ref()
                    .is_some_and(|title| title.to_lowercase().contains(&lowered));
                (!rows.is_empty() || title_matches || title.is_none()).then_some((ix, rows))
            })
            .collect();
        Task::ready(())
    }

    fn render_item(
        &self,
        _ix: IndexPath,
        item: &KitItem,
        checked: bool,
        _window: &mut Window,
        cx: &mut App,
    ) -> Option<AnyElement> {
        if item.badge.is_empty() {
            return None;
        }
        Some(
            h_flex()
                .w_full()
                .justify_between()
                .items_center()
                .child(item.title.clone())
                .when(checked, |row| {
                    row.child(
                        Icon::new(gpui_component::IconName::Check)
                            .xsmall()
                            .text_color(cx.theme().muted_foreground),
                    )
                })
                .child(
                    div()
                        .rounded(cx.theme().radius.half())
                        .bg(cx.theme().primary)
                        .text_color(cx.theme().primary_foreground)
                        .px_1()
                        .text_xs()
                        .child(item.badge.clone()),
                )
                .into_any_element(),
        )
    }

    fn is_item_enabled(&self, _ix: IndexPath, item: &KitItem, _cx: &App) -> bool {
        if item.disabled || self.pinned.contains(&item.value) {
            return false;
        }
        self.max == 0 || self.selected.len() < self.max || self.selected.contains(&item.value)
    }

    fn is_item_checked(
        &self,
        _ix: IndexPath,
        item: &KitItem,
        current_selection: &[(IndexPath, KitItem)],
        _cx: &App,
    ) -> bool {
        self.pinned.contains(&item.value)
            || current_selection
                .iter()
                .any(|(_, selected)| selected.value == item.value)
    }

    fn on_will_change(
        &mut self,
        selection: &mut Vec<(IndexPath, KitItem)>,
        changes: &[SearchableListChange],
    ) {
        for change in changes {
            match change {
                SearchableListChange::Select { index } => {
                    let Some(item) = self.item(*index).cloned() else {
                        continue;
                    };
                    let full = self.max > 0 && selection.len() >= self.max;
                    if !full && !selection.iter().any(|(_, s)| s.value == item.value) {
                        selection.push((*index, item));
                    }
                }
                SearchableListChange::Deselect { index } => {
                    if let Some(item) = self.item(*index).cloned() {
                        selection.retain(|(_, s)| s.value != item.value);
                    } else {
                        selection.retain(|(ix, _)| ix != index);
                    }
                }
            }
        }
        self.selected = selection.iter().map(|(_, s)| s.value.clone()).collect();
    }
}
