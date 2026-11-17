use gpui::{
    px, AnyElement, AppContext as _, Entity, IntoElement, SharedString, Subscription, Window,
};
use gpui_component::searchable_list::SearchableVec;
use gpui_component::select::{Select, SelectEvent, SelectState};
use gpui_component::{Sizable as _, Size};

use crate::*;

type Items = SearchableVec<SharedString>;

pub struct GpuiKitSelect {
    state: Option<Entity<SelectState<Items>>>,
    subscription: Option<Subscription>,
    items: Vec<String>,
    value: Option<String>,
}

impl GpuiKitSelectSpec for GpuiKitSelect {
    fn create(_props: &GpuiKitSelectProps, _cx: &mut GpuiKitSelectContext) -> Self {
        Self {
            state: None,
            subscription: None,
            items: Vec::new(),
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
        let list = props.items();
        let items: Vec<String> = (0..list.len())
            .filter_map(|index| list.get(index))
            .map(|item| item.to_string())
            .collect();
        let shared = |items: &[String]| {
            SearchableVec::new(
                items
                    .iter()
                    .cloned()
                    .map(SharedString::from)
                    .collect::<Vec<_>>(),
            )
        };
        if self.state.is_none() {
            let initial = items.clone();
            let state = app.new(|cx| {
                SelectState::new(shared(&initial), None, window, cx).searchable(props.searchable())
            });
            let events = items.clone();
            self.subscription = Some(app.subscribe(
                &state,
                move |_, event: &SelectEvent<Items>, _cx| {
                    let SelectEvent::Confirm(value) = event;
                    let value = value
                        .as_ref()
                        .map(|value| value.to_string())
                        .unwrap_or_default();
                    let index = events
                        .iter()
                        .position(|item| *item == value)
                        .map_or(-1, |index| index as i32);
                    sender.gpui_kit_select_change(OnGpuiKitSelectChange { value, index });
                },
            ));
            self.state = Some(state);
            self.items = items.clone();
        }
        let state = self.state.clone().unwrap();
        if self.items != items {
            self.items = items.clone();
            state.update(app, |state, cx| state.set_items(shared(&items), window, cx));
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
