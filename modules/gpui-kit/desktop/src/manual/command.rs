use gpui::{AnyElement, AppContext as _, Entity, IntoElement, Window};
use gpui_component::command::{Command, CommandItem, CommandState};

use crate::*;

pub struct GpuiKitCommand {
    state: Option<Entity<CommandState>>,
}

impl GpuiKitCommandSpec for GpuiKitCommand {
    fn create(_props: &GpuiKitCommandProps, _cx: &mut GpuiKitCommandContext) -> Self {
        Self { state: None }
    }

    fn update(
        &mut self,
        _props: &GpuiKitCommandProps,
        _changed: GpuiKitCommandChanged,
        _cx: &mut GpuiKitCommandContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitCommandProps,
        window: &mut Window,
        cx: &mut GpuiKitCommandContext,
    ) -> AnyElement {
        let sender = cx.event_sender();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let state = self
            .state
            .get_or_insert_with(|| app.new(|cx| CommandState::new(window, cx)))
            .clone();
        let list = props.items();
        let mut element = Command::new(&state)
            .searchable(props.searchable())
            .filterable(props.filterable())
            .bordered(props.bordered());
        if !props.placeholder().is_empty() {
            element = element.placeholder(props.placeholder().to_string());
        }
        for item in (0..list.len()).filter_map(|index| list.get(index)) {
            let mut entry = CommandItem::new()
                .label(item.label().to_string())
                .checked(item.checked());
            if let Some(icon) = crate::generated::icons::parse(item.icon()) {
                entry = entry.icon(icon);
            }
            let keywords: Vec<String> = item
                .keywords()
                .split(',')
                .filter(|k| !k.is_empty())
                .map(str::to_string)
                .collect();
            element = element.item(entry.keywords(keywords));
        }
        let (select, confirm, cancel, query) =
            (sender.clone(), sender.clone(), sender.clone(), sender);
        element
            .on_select(move |index, _window, _cx| {
                select.gpui_kit_command_select(OnGpuiKitCommandSelect {
                    index: index.row as i32,
                });
            })
            .on_confirm(move |index, _window, _cx| {
                confirm.gpui_kit_command_confirm(OnGpuiKitCommandConfirm {
                    index: index.row as i32,
                });
            })
            .on_cancel(move |_window, _cx| {
                cancel.gpui_kit_command_cancel();
            })
            .on_query(move |text, _window, _cx| {
                query.gpui_kit_command_query(OnGpuiKitCommandQuery {
                    text: text.to_string(),
                });
            })
            .into_any_element()
    }
}
