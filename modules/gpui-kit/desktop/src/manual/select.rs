use gpui::{
    px, AnyElement, AppContext as _, Entity, IntoElement, SharedString, Subscription, Window,
};
use gpui_component::select::{Select, SelectEvent, SelectState};
use gpui_component::{Sizable as _, Size};

use super::list_model::{KitList, ListSpec};
use crate::*;

type Items = KitList;

pub struct GpuiKitSelect {
    state: Option<Entity<SelectState<Items>>>,
    subscription: Option<Subscription>,
    spec: ListSpec,
    value: Option<String>,
}

impl GpuiKitSelectSpec for GpuiKitSelect {
    fn create(_props: &GpuiKitSelectProps, _cx: &mut GpuiKitSelectContext) -> Self {
        Self {
            state: None,
            subscription: None,
            spec: ListSpec::default(),
            value: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitSelectProps,
        _changed: GpuiKitSelectChanged,
        _cx: &mut GpuiKitSelectContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitSelectProps,
        window: &mut Window,
        cx: &mut GpuiKitSelectContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let spec = if props.list_json().is_empty() {
            let list = props.items();
            ListSpec::plain(
                (0..list.len())
                    .filter_map(|index| list.get(index))
                    .map(|item| item.to_string())
                    .collect(),
            )
        } else {
            ListSpec::parse(props.list_json())
        };
        if self.state.is_none() {
            let list = KitList::new(&spec);
            let selected = list.index_of(props.default_value());
            let state = app.new(|cx| {
                SelectState::new(list, selected, window, cx).searchable(props.searchable())
            });
            self.subscription = Some(app.subscribe(
                &state,
                move |state, event: &SelectEvent<Items>, cx| {
                    let SelectEvent::Confirm(value) = event;
                    let value = value
                        .as_ref()
                        .map(|value| value.to_string())
                        .unwrap_or_default();
                    let index = state
                        .read(cx)
                        .selected_index(cx)
                        .map_or(-1, |ix| ix.row as i32);
                    sender.gpui_kit_select_change(OnGpuiKitSelectChange { value, index });
                },
            ));
            self.state = Some(state);
            self.spec = spec.clone();
        }
        let state = self.state.clone().unwrap();
        if self.spec != spec {
            self.spec = spec.clone();
            state.update(app, |state, cx| {
                state.set_items(KitList::new(&spec), window, cx)
            });
            self.value = None;
        }
        let wanted = props.controlled().then(|| props.value().to_string());
        if wanted != self.value && wanted.is_some() {
            self.value = wanted.clone();
            let value = SharedString::from(wanted.unwrap());
            state.update(app, |state, cx| {
                state.set_selected_value(&value, window, cx)
            });
        }
        let mut element = Select::new(&state)
            .cleanable(props.cleanable())
            .disabled(props.disabled())
            .appearance(props.appearance());
        if !props.placeholder().is_empty() {
            element = element.placeholder(props.placeholder().to_string());
        }
        if !props.search_placeholder().is_empty() {
            element = element.search_placeholder(props.search_placeholder().to_string());
        }
        if props.menu_width() > 0.0 {
            element = element.menu_width(px(props.menu_width() as f32));
        }
        if let Some(icon) = crate::generated::icons::parse(props.icon()) {
            element = element.icon(icon);
        }
        if !props.title_prefix().is_empty() {
            element = element.title_prefix(props.title_prefix().to_string());
        }
        if props.menu_max_height() > 0.0 {
            element = element.menu_max_h(px(props.menu_max_height() as f32));
        }
        if !props.empty_text().is_empty() {
            let text = SharedString::from(props.empty_text().to_string());
            element = element.empty(move |_, cx| {
                use gpui::{ParentElement as _, Styled as _};
                use gpui_component::ActiveTheme as _;
                gpui_component::h_flex()
                    .h_24()
                    .justify_center()
                    .text_color(cx.theme().muted_foreground)
                    .child(text.clone())
            });
        }
        if let Some(style) = crate::style::refinement(props.kit_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        match props.size() {
            GpuiKitSelectSize::Unset => {}
            GpuiKitSelectSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitSelectSize::Small => element = element.with_size(Size::Small),
            GpuiKitSelectSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitSelectSize::Large => element = element.with_size(Size::Large),
        }
        element.into_any_element()
    }
}
