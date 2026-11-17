use gpui::{
    px, AnyElement, AppContext as _, Entity, IntoElement, SharedString, Subscription, Window,
};
use gpui_component::combobox::{Combobox, ComboboxEvent, ComboboxState};
use gpui_component::searchable_list::SearchableVec;
use gpui_component::{Sizable as _, Size};

use crate::*;

type Items = SearchableVec<SharedString>;

pub struct GpuiKitCombobox {
    state: Option<Entity<ComboboxState<Items>>>,
    subscription: Option<Subscription>,
    items: Vec<String>,
    value: Option<String>,
}

impl GpuiKitComboboxSpec for GpuiKitCombobox {
    fn create(_props: &GpuiKitComboboxProps, _cx: &mut GpuiKitComboboxContext) -> Self {
        Self {
            state: None,
            subscription: None,
            items: Vec::new(),
            value: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitComboboxProps,
        _changed: GpuiKitComboboxChanged,
        _cx: &mut GpuiKitComboboxContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitComboboxProps,
        window: &mut Window,
        cx: &mut GpuiKitComboboxContext,
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
                ComboboxState::new(shared(&initial), Vec::new(), window, cx)
                    .multiple(props.multiple())
                    .searchable(props.searchable())
            });
            let (change, confirm) = (sender.clone(), sender);
            self.subscription = Some(app.subscribe(
                &state,
                move |_, event: &ComboboxEvent<Items>, _cx| match event {
                    ComboboxEvent::Change(values) => {
                        let values = values
                            .iter()
                            .map(|v| v.to_string())
                            .collect::<Vec<_>>()
                            .join("\n");
                        change.gpui_kit_combobox_change(OnGpuiKitComboboxChange { values });
                    }
                    ComboboxEvent::Confirm(values) => {
                        let values = values
                            .iter()
                            .map(|v| v.to_string())
                            .collect::<Vec<_>>()
                            .join("\n");
                        confirm.gpui_kit_combobox_confirm(OnGpuiKitComboboxConfirm { values });
                    }
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
        let wanted = props.controlled().then(|| props.values().to_string());
        if wanted.is_some() && wanted != self.value {
            self.value = wanted.clone();
            let values: Vec<SharedString> = wanted
                .unwrap()
                .split('\n')
                .filter(|v| !v.is_empty())
                .map(|v| SharedString::from(v.to_string()))
                .collect();
            state.update(app, |state, cx| {
                state.set_selected_values(&values, window, cx)
            });
        }
        let mut element = Combobox::new(&state)
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
            GpuiKitComboboxSize::Unset => {}
            GpuiKitComboboxSize::Xsmall => element = element.with_size(Size::XSmall),
            GpuiKitComboboxSize::Small => element = element.with_size(Size::Small),
            GpuiKitComboboxSize::Medium => element = element.with_size(Size::Medium),
            GpuiKitComboboxSize::Large => element = element.with_size(Size::Large),
        }
        element.into_any_element()
    }
}
