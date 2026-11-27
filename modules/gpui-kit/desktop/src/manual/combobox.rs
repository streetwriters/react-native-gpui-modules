use gpui::{
    px, AnyElement, AppContext as _, Entity, IntoElement, SharedString, Subscription, Window,
};
use gpui_component::combobox::{Combobox, ComboboxEvent, ComboboxState};
use gpui_component::{Icon, IndexPath, Sizable as _, Size};

use super::list_model::{KitList, ListSpec};
use super::slots::Renderers;
use crate::*;

pub struct GpuiKitCombobox {
    state: Option<Entity<ComboboxState<KitList>>>,
    subscription: Option<Subscription>,
    spec: ListSpec,
    value: Option<String>,
}

fn spec_of(props: &GpuiKitComboboxProps) -> ListSpec {
    if !props.list_json().is_empty() {
        return ListSpec::parse(props.list_json());
    }
    let list = props.items();
    ListSpec::plain(
        (0..list.len())
            .filter_map(|index| list.get(index))
            .map(|item| item.to_string())
            .collect(),
    )
}

fn joined(values: &[SharedString]) -> String {
    values
        .iter()
        .map(|v| v.to_string())
        .collect::<Vec<_>>()
        .join("\n")
}

impl GpuiKitComboboxSpec for GpuiKitCombobox {
    fn create(_props: &GpuiKitComboboxProps, _cx: &mut GpuiKitComboboxContext) -> Self {
        Self {
            state: None,
            subscription: None,
            spec: ListSpec::default(),
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

    fn request_query(&mut self, cx: &mut GpuiKitComboboxContext) {
        let Some(state) = self.state.clone() else {
            return;
        };
        let sender = cx.event_sender();
        if let Some(app) = cx.app() {
            let query = state.read(app).query(app).to_string();
            sender.gpui_kit_combobox_query(OnGpuiKitComboboxQuery { query });
        }
    }

    fn render(
        &mut self,
        props: &GpuiKitComboboxProps,
        window: &mut Window,
        cx: &mut GpuiKitComboboxContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let renderers = Renderers::new(props.slots());
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let spec = spec_of(props);
        if self.state.is_none() {
            let list = KitList::new(&spec);
            let selected: Vec<IndexPath> = props
                .default_values()
                .split('\n')
                .filter_map(|value| list.index_of(value))
                .collect();
            let state = app.new(|cx| {
                ComboboxState::new(list, selected, window, cx)
                    .multiple(props.multiple())
                    .searchable(props.searchable())
            });
            let (change, confirm) = (sender.clone(), sender);
            self.subscription = Some(app.subscribe(
                &state,
                move |_, event: &ComboboxEvent<KitList>, _cx| match event {
                    ComboboxEvent::Change(values) => {
                        change.gpui_kit_combobox_change(OnGpuiKitComboboxChange {
                            values: joined(values),
                        });
                    }
                    ComboboxEvent::Confirm(values) => {
                        confirm.gpui_kit_combobox_confirm(OnGpuiKitComboboxConfirm {
                            values: joined(values),
                        });
                    }
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
        if let Some(icon) = crate::generated::icons::parse(props.check_icon()) {
            element = element.check_icon(Icon::new(icon));
        }
        if let Some(trigger) = renderers.get("trigger") {
            element = element.render_trigger(move |_, window, cx| trigger(window, cx));
        }
        if let Some(footer) = renderers.get("footer") {
            element = element.footer(move |window, cx| footer(window, cx));
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
