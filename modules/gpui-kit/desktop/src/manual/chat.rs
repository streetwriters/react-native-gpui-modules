use gpui::{
    AnyElement, AppContext as _, Entity, IntoElement, ParentElement as _, SharedString,
    Styled as _, Window,
};
use gpui_component::attachment::{
    Attachment, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup,
    AttachmentMedia, AttachmentStatus, AttachmentTitle,
};
use gpui_component::bubble::{
    Bubble, BubbleContent, BubbleGroup, BubbleReactionSide, BubbleReactions, BubbleVariant,
};
use gpui_component::button::{Button, ButtonVariants as _};
use gpui_component::message::{
    Message, MessageAlignment, MessageAvatar, MessageContent, MessageFooter, MessageGroup,
    MessageHeader,
};
use gpui_component::message_scroller::{MessageScroller, MessageScrollerState};
use gpui_component::Sizable as _;

use super::slots::{Renderers, Slots};
use crate::*;

pub struct GpuiKitMessage {
    id: String,
}

impl GpuiKitMessageSpec for GpuiKitMessage {
    fn create(_props: &GpuiKitMessageProps, cx: &mut GpuiKitMessageContext) -> Self {
        Self {
            id: format!("gpui_kit_message-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitMessageProps,
        _changed: GpuiKitMessageChanged,
        _cx: &mut GpuiKitMessageContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitMessageProps,
        _window: &mut Window,
        cx: &mut GpuiKitMessageContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let sender = cx.event_sender();
        let specs: Vec<MessageSpec> =
            serde_json::from_str(props.messages_json()).unwrap_or_default();
        let messages: Vec<AnyElement> = specs
            .iter()
            .enumerate()
            .map(|(index, spec)| {
                message_element(&self.id, index, spec, &mut slots, &sender).into_any_element()
            })
            .collect();
        if props.grouped() {
            return MessageGroup::new()
                .w_full()
                .children(messages)
                .into_any_element();
        }
        messages
            .into_iter()
            .next()
            .unwrap_or_else(|| gpui::div().into_any_element())
    }
}

#[derive(serde::Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
struct MessageSpec {
    align: String,
    avatar: Option<AvatarSpec>,
    avatar_slot: Option<usize>,
    header: Option<MetaSpec>,
    content: Option<ContentSpec>,
    footer: Option<MetaSpec>,
    style: String,
    stack_gap: Option<f32>,
}

#[derive(serde::Deserialize, Default)]
#[serde(default)]
struct AvatarSpec {
    name: String,
    src: String,
    size: Option<f32>,
    empty: bool,
    style: String,
}

#[derive(serde::Deserialize, Default)]
#[serde(default)]
struct MetaSpec {
    items: Vec<ItemSpec>,
    inset: Option<bool>,
    gap: Option<f32>,
    style: String,
}

#[derive(serde::Deserialize, Default)]
#[serde(default)]
struct ItemSpec {
    text: Option<String>,
    color: u32,
    slot: Option<usize>,
    button: Option<ButtonSpec>,
}

#[derive(serde::Deserialize, Default)]
#[serde(default)]
struct ButtonSpec {
    id: i32,
    icon: String,
    label: String,
    tooltip: String,
}

#[derive(serde::Deserialize, Default)]
#[serde(default)]
struct ContentSpec {
    gap: Option<f32>,
    style: String,
    parts: Vec<PartSpec>,
}

#[derive(serde::Deserialize, Default)]
#[serde(default)]
struct PartSpec {
    kind: String,
    text: String,
    variant: String,
    reactions: Option<ReactionsSpec>,
    attachment: Option<AttachmentSpec>,
    slot: Option<usize>,
}

fn meta_items(
    items: &[ItemSpec],
    slots: &mut Slots,
    sender: &GpuiKitMessageEventSender,
) -> Vec<AnyElement> {
    items
        .iter()
        .filter_map(|item| {
            if let Some(slot) = item.slot {
                return slots.take(&format!("item-{slot}"));
            }
            if let Some(spec) = &item.button {
                let id = spec.id;
                let mut button = Button::new(SharedString::from(format!("message-action-{id}")))
                    .ghost()
                    .xsmall();
                if let Some(icon) = crate::generated::icons::parse(&spec.icon) {
                    button = button.icon(icon);
                }
                if !spec.label.is_empty() {
                    button = button.label(spec.label.clone());
                }
                if !spec.tooltip.is_empty() {
                    button = button.tooltip(spec.tooltip.clone());
                }
                let sender = sender.clone();
                return Some(
                    button
                        .on_click(move |_, _, _| {
                            sender.gpui_kit_message_action(OnGpuiKitMessageAction { id })
                        })
                        .into_any_element(),
                );
            }
            let text = item.text.clone()?;
            Some(if item.color != 0 {
                gpui::div()
                    .text_color(crate::color::hsla(item.color))
                    .child(text)
                    .into_any_element()
            } else {
                text.into_any_element()
            })
        })
        .collect()
}

fn reactions_of(spec: &ReactionsSpec) -> BubbleReactions {
    let mut reactions = BubbleReactions::new();
    if spec.side == "top" {
        reactions = reactions.side(BubbleReactionSide::Top);
    }
    match spec.align.as_str() {
        "start" => reactions = reactions.alignment(MessageAlignment::Start),
        "end" => reactions = reactions.alignment(MessageAlignment::End),
        _ => {}
    }
    if let Some(padding) = spec.padding {
        reactions = reactions.p(gpui::px(padding));
    }
    if let Some(action) = &spec.action {
        let mut button = Button::new("bubble-reaction").ghost();
        button = match action.size.as_str() {
            "xsmall" => button.xsmall(),
            _ => button.small(),
        };
        if !action.label.is_empty() {
            button = button.label(action.label.clone());
        }
        if let Some(icon) = crate::generated::icons::parse(&action.icon) {
            button = button.icon(icon);
        }
        if !action.tooltip.is_empty() {
            button = button.tooltip(action.tooltip.clone());
        }
        reactions = reactions.action(button);
    }
    if !spec.text.is_empty() {
        reactions = reactions.child(spec.text.clone());
    }
    reactions
}

fn message_element(
    id: &str,
    index: usize,
    spec: &MessageSpec,
    slots: &mut Slots,
    sender: &GpuiKitMessageEventSender,
) -> Message {
    let mut message = Message::new().id(SharedString::from(format!("{id}-{index}")));
    match spec.align.as_str() {
        "end" => message = message.alignment(MessageAlignment::End),
        "start" => message = message.alignment(MessageAlignment::Start),
        _ => {}
    }
    if let Some(gap) = spec.stack_gap {
        message = message.with_stack_style(gpui::StyleRefinement::default().gap(gpui::px(gap)));
    }
    if let Some(avatar) = &spec.avatar {
        if avatar.empty {
            let mut slot = MessageAvatar::new();
            if let Some(style) = crate::style::refinement(&avatar.style) {
                gpui::Refineable::refine(gpui::Styled::style(&mut slot), &style);
            }
            message = message.avatar_slot(slot);
        } else {
            let mut image = gpui_component::avatar::Avatar::new();
            if !avatar.name.is_empty() {
                image = image.name(avatar.name.clone());
            }
            if !avatar.src.is_empty() {
                image = image.src(avatar.src.clone());
            }
            if let Some(size) = avatar.size {
                image = image.size(gpui::px(size));
            }
            message = message.avatar(image);
        }
    } else if let Some(slot) = spec
        .avatar_slot
        .and_then(|slot| slots.take(&format!("item-{slot}")))
    {
        message = message.avatar(slot);
    }
    if let Some(header) = &spec.header {
        let mut element = MessageHeader::new();
        if let Some(inset) = header.inset {
            element = element.content_inset(inset);
        }
        if let Some(gap) = header.gap {
            element = element.gap(gpui::px(gap));
        }
        if let Some(style) = crate::style::refinement(&header.style) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        message = message.header(element.children(meta_items(&header.items, slots, sender)));
    }
    if let Some(content) = &spec.content {
        let mut element = MessageContent::new();
        if let Some(gap) = content.gap {
            element = element.gap(gpui::px(gap));
        }
        if let Some(style) = crate::style::refinement(&content.style) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        for (part_index, part) in content.parts.iter().enumerate() {
            match part.kind.as_str() {
                "bubble" => {
                    let mut bubble = bubble_base("", &part.variant)
                        .content(BubbleContent::new().child(part.text.clone()));
                    if let Some(reactions) = &part.reactions {
                        bubble = bubble.reactions(reactions_of(reactions));
                    }
                    element = element.bubble(bubble);
                }
                "attachment" => {
                    if let Some(spec) = &part.attachment {
                        let card_id = format!("{id}-{index}-attachment");
                        let actions = part
                            .slot
                            .and_then(|slot| slots.take(&format!("item-{slot}")));
                        element = element
                            .child(attachment_card(&card_id, part_index, spec, actions, None));
                    }
                }
                "slot" => {
                    if let Some(slot) = part
                        .slot
                        .and_then(|slot| slots.take(&format!("item-{slot}")))
                    {
                        element = element.child(slot);
                    }
                }
                _ => element = element.child(part.text.clone()),
            }
        }
        message = message.content(element);
    }
    if let Some(footer) = &spec.footer {
        let mut element = MessageFooter::new();
        if let Some(inset) = footer.inset {
            element = element.content_inset(inset);
        }
        if let Some(gap) = footer.gap {
            element = element.gap(gpui::px(gap));
        }
        if let Some(style) = crate::style::refinement(&footer.style) {
            gpui::Refineable::refine(gpui::Styled::style(&mut element), &style);
        }
        message = message.footer(element.children(meta_items(&footer.items, slots, sender)));
    }
    if let Some(style) = crate::style::refinement(&spec.style) {
        gpui::Refineable::refine(gpui::Styled::style(&mut message), &style);
    }
    message
}

pub struct GpuiKitBubble;

impl GpuiKitBubbleSpec for GpuiKitBubble {
    fn create(_props: &GpuiKitBubbleProps, _cx: &mut GpuiKitBubbleContext) -> Self {
        Self
    }

    fn update(
        &mut self,
        _props: &GpuiKitBubbleProps,
        _changed: GpuiKitBubbleChanged,
        _cx: &mut GpuiKitBubbleContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitBubbleProps,
        _window: &mut Window,
        cx: &mut GpuiKitBubbleContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        if !props.group_json().is_empty() {
            let items: Vec<GroupedBubble> =
                serde_json::from_str(props.group_json()).unwrap_or_default();
            let mut group = BubbleGroup::new();
            for item in items {
                let bubble = bubble_base(&item.align, &item.variant)
                    .content(BubbleContent::new().child(item.text));
                group = group.child(bubble);
            }
            return group.w_full().into_any_element();
        }
        let align = props.align();
        let variant = match props.variant() {
            GpuiKitBubbleVariant::Secondary => "secondary",
            GpuiKitBubbleVariant::Muted => "muted",
            GpuiKitBubbleVariant::Tinted => "tinted",
            GpuiKitBubbleVariant::Outline => "outline",
            GpuiKitBubbleVariant::Ghost => "ghost",
            GpuiKitBubbleVariant::Destructive => "destructive",
            GpuiKitBubbleVariant::Unset | GpuiKitBubbleVariant::Filled => "filled",
        };
        let mut bubble = bubble_base(align, variant);
        let mut content = BubbleContent::new();
        if let Some(style) = crate::style::refinement(props.content_style()) {
            gpui::Refineable::refine(gpui::Styled::style(&mut content), &style);
        }
        if let Some(body) = slots.take("body") {
            content = content.child(body);
        } else if !props.text().is_empty() {
            content = content.child(props.text().to_string());
        }
        bubble = bubble.content(content);
        if !props.reactions_json().is_empty() {
            let spec: ReactionsSpec =
                serde_json::from_str(props.reactions_json()).unwrap_or_default();
            let mut reactions = reactions_of(&spec);
            if let Some(slot) = slots.take("reactions") {
                reactions = reactions.child(slot);
            }
            bubble = bubble.reactions(reactions);
        }
        bubble.into_any_element()
    }
}

#[derive(serde::Deserialize, Default)]
#[serde(default)]
struct GroupedBubble {
    text: String,
    variant: String,
    align: String,
}

#[derive(serde::Deserialize, Default)]
#[serde(default)]
struct ReactionsSpec {
    side: String,
    align: String,
    text: String,
    padding: Option<f32>,
    action: Option<ReactionAction>,
}

#[derive(serde::Deserialize, Default)]
#[serde(default)]
struct ReactionAction {
    label: String,
    icon: String,
    tooltip: String,
    size: String,
}

fn bubble_base(align: &str, variant: &str) -> Bubble {
    let mut bubble = Bubble::new();
    match align {
        "start" => bubble = bubble.alignment(MessageAlignment::Start),
        "end" => bubble = bubble.alignment(MessageAlignment::End),
        _ => {}
    }
    bubble.with_variant(match variant {
        "secondary" => BubbleVariant::Secondary,
        "muted" => BubbleVariant::Muted,
        "tinted" => BubbleVariant::Tinted,
        "outline" => BubbleVariant::Outline,
        "ghost" => BubbleVariant::Ghost,
        "destructive" => BubbleVariant::Destructive,
        _ => BubbleVariant::Filled,
    })
}

pub struct GpuiKitAttachment {
    id: String,
}

impl GpuiKitAttachmentSpec for GpuiKitAttachment {
    fn create(_props: &GpuiKitAttachmentProps, cx: &mut GpuiKitAttachmentContext) -> Self {
        Self {
            id: format!("gpui_kit_attachment-{}", cx.tag()),
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitAttachmentProps,
        _changed: GpuiKitAttachmentChanged,
        _cx: &mut GpuiKitAttachmentContext,
    ) {
    }

    fn render(
        &mut self,
        props: &GpuiKitAttachmentProps,
        _window: &mut Window,
        cx: &mut GpuiKitAttachmentContext,
    ) -> AnyElement {
        let mut slots = Slots::new(props.slots(), cx.children());
        let sender = cx.event_sender();
        let specs: Vec<AttachmentSpec> =
            serde_json::from_str(props.items_json()).unwrap_or_default();
        let cards: Vec<Attachment> = specs
            .iter()
            .enumerate()
            .map(|(index, spec)| {
                let actions = slots.take(&format!("actions-{index}"));
                attachment_card(&self.id, index, spec, actions, Some(&sender))
            })
            .collect();
        if props.as_group() {
            let mut group = AttachmentGroup::new(SharedString::from(format!("{}-group", self.id)));
            if props.edge_fade() != 0 {
                group = group.with_edge_fade(crate::color::hsla(props.edge_fade() as u32));
            }
            return group.children(cards).into_any_element();
        }
        match cards.into_iter().next() {
            Some(card) => card.into_any_element(),
            None => gpui::div().into_any_element(),
        }
    }
}

#[derive(serde::Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub(super) struct AttachmentSpec {
    title: String,
    description: String,
    tooltip: String,
    progress: f32,
    status: String,
    axis: String,
    size: String,
    media_src: String,
    media_icon: String,
    media_overlay_icon: String,
    media_style: String,
    title_style: String,
    shimmer: Option<ShimmerSpec>,
    style: String,
    clickable: bool,
    removable: bool,
    retryable: bool,
}

#[derive(serde::Deserialize, Default)]
#[serde(default)]
struct ShimmerSpec {
    color: u32,
    spread: f32,
    reverse: bool,
}

fn attachment_card(
    id: &str,
    index: usize,
    spec: &AttachmentSpec,
    actions: Option<AnyElement>,
    sender: Option<&GpuiKitAttachmentEventSender>,
) -> Attachment {
    let status = match spec.status.as_str() {
        "pending" => AttachmentStatus::Pending,
        "uploading" => AttachmentStatus::Uploading,
        "processing" => AttachmentStatus::Processing,
        "failed" => AttachmentStatus::Failed,
        _ => AttachmentStatus::Complete,
    };
    let mut card = Attachment::new()
        .id(SharedString::from(format!("{id}-{index}")))
        .status(status);
    if spec.axis == "vertical" {
        card = card.axis(gpui::Axis::Vertical);
    }
    match spec.size.as_str() {
        "xsmall" => card = card.xsmall(),
        "small" => card = card.small(),
        "large" => card = card.large(),
        _ => {}
    }
    if spec.progress >= 0.0 {
        card = card.progress(spec.progress);
    }
    if !spec.tooltip.is_empty() {
        card = card.tooltip(spec.tooltip.clone());
    }
    let has_media =
        !spec.media_src.is_empty() || !spec.media_icon.is_empty() || !spec.media_style.is_empty();
    if has_media {
        let mut media = AttachmentMedia::new();
        if !spec.media_src.is_empty() {
            media = media.src(spec.media_src.clone());
        }
        if let Some(icon) = crate::generated::icons::parse(&spec.media_icon) {
            media = media.child(gpui_component::Icon::new(icon));
        }
        if let Some(icon) = crate::generated::icons::parse(&spec.media_overlay_icon) {
            media = media.overlay(gpui_component::Icon::new(icon));
        }
        if let Some(style) = crate::style::refinement(&spec.media_style) {
            gpui::Refineable::refine(gpui::Styled::style(&mut media), &style);
        }
        card = card.media(media);
    }
    if !spec.title.is_empty() {
        let mut title = AttachmentTitle::new(spec.title.clone()).status(status);
        if let Some(style) = crate::style::refinement(&spec.title_style) {
            gpui::Refineable::refine(gpui::Styled::style(&mut title), &style);
        }
        if let Some(shimmer) = &spec.shimmer {
            let mut style = gpui_component::shimmer::ShimmerStyle::new()
                .spread(shimmer.spread)
                .reverse(shimmer.reverse);
            if shimmer.color != 0 {
                style = style.highlight_color(crate::color::hsla(shimmer.color));
            }
            title = title.with_shimmer_style(style);
        }
        let mut content = AttachmentContent::new().title(title);
        if !spec.description.is_empty() {
            content = content
                .description(AttachmentDescription::new(spec.description.clone()).status(status));
        }
        card = card.content(content);
    }
    if let Some(style) = crate::style::refinement(&spec.style) {
        gpui::Refineable::refine(gpui::Styled::style(&mut card), &style);
    }
    if let Some(actions) = actions {
        card = card.actions(AttachmentActions::new().child(actions));
    }
    let Some(sender) = sender else {
        return card;
    };
    let index = index as i32;
    if spec.clickable {
        let click = sender.clone();
        card = card.on_click(move |_, _, _| {
            click.gpui_kit_attachment_press(OnGpuiKitAttachmentPress { index })
        });
    }
    if spec.removable {
        let remove = sender.clone();
        card = card.on_remove(move |_, _, _| {
            remove.gpui_kit_attachment_remove(OnGpuiKitAttachmentRemove { index })
        });
    }
    if spec.retryable {
        let retry = sender.clone();
        card = card.on_retry(move |_, _, _| {
            retry.gpui_kit_attachment_retry(OnGpuiKitAttachmentRetry { index })
        });
    }
    card
}

pub struct GpuiKitMessageScroller {
    id: String,
    state: Option<Entity<MessageScrollerState>>,
    keys: Vec<String>,
    subscription: Option<gpui::Subscription>,
}

impl GpuiKitMessageScroller {
    fn with_state(
        &self,
        cx: &mut GpuiKitMessageScrollerContext,
        f: impl FnOnce(&mut MessageScrollerState, &mut gpui::Context<MessageScrollerState>),
    ) {
        if let (Some(state), Some(app)) = (self.state.clone(), cx.app()) {
            state.update(app, f);
        }
    }
}

impl GpuiKitMessageScrollerSpec for GpuiKitMessageScroller {
    fn create(
        _props: &GpuiKitMessageScrollerProps,
        cx: &mut GpuiKitMessageScrollerContext,
    ) -> Self {
        Self {
            id: format!("gpui_kit_message_scroller-{}", cx.tag()),
            state: None,
            keys: Vec::new(),
            subscription: None,
        }
    }

    fn update(
        &mut self,
        _props: &GpuiKitMessageScrollerProps,
        _changed: GpuiKitMessageScrollerChanged,
        _cx: &mut GpuiKitMessageScrollerContext,
    ) {
    }

    fn scroll_to_end(&mut self, cx: &mut GpuiKitMessageScrollerContext) {
        self.with_state(cx, |state, cx| state.scroll_to_end(cx));
    }

    fn scroll_to_item(&mut self, index: i32, cx: &mut GpuiKitMessageScrollerContext) {
        self.with_state(cx, |state, cx| {
            state.scroll_to_item(index.max(0) as usize, cx);
        });
    }

    fn remeasure_items(&mut self, start: i32, end: i32, cx: &mut GpuiKitMessageScrollerContext) {
        self.with_state(cx, |state, cx| {
            state.remeasure_items(start.max(0) as usize..end.max(start).max(0) as usize, cx);
        });
    }

    fn render(
        &mut self,
        props: &GpuiKitMessageScrollerProps,
        _window: &mut Window,
        cx: &mut GpuiKitMessageScrollerContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let sender = cx.event_sender();
        let keys: Vec<String> = serde_json::from_str(props.keys_json()).unwrap_or_default();
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let state = match self.state.clone() {
            Some(state) => state,
            None => {
                let count = keys.len();
                let state = app.new(|cx| MessageScrollerState::new(count, cx));
                let last = std::cell::Cell::new(None);
                self.subscription = Some(app.observe(&state, move |state, cx| {
                    let state = state.read(cx);
                    let now = (state.is_following_tail(), state.is_scrolled_up());
                    if last.get() != Some(now) {
                        last.set(Some(now));
                        sender.gpui_kit_message_scroller_scroll_change(
                            OnGpuiKitMessageScrollerScrollChange {
                                following_tail: now.0,
                                scrolled_up: now.1,
                            },
                        );
                    }
                }));
                self.keys = keys.clone();
                self.state = Some(state.clone());
                state
            }
        };
        if self.keys != keys {
            let old = std::mem::replace(&mut self.keys, keys.clone());
            state.update(app, |state, cx| {
                if keys.len() > old.len() && keys[..old.len()] == old[..] {
                    state.append(keys.len() - old.len(), cx);
                } else if keys.len() > old.len() && keys[keys.len() - old.len()..] == old[..] {
                    state.prepend(keys.len() - old.len(), cx);
                } else {
                    state.reset(keys.len(), cx);
                }
            });
        }
        let mut scroller = MessageScroller::new(
            SharedString::from(self.id.clone()),
            state,
            move |index, window, cx| match renderers.get(&format!("row-{index}")) {
                Some(render) => render(window, cx),
                None => gpui::div().into_any_element(),
            },
        )
        .scrollbar(props.scrollbar())
        .jump_button(props.jump_button());
        if let Some(style) = crate::style::refinement(props.content_style()) {
            scroller = scroller.with_content_style(style);
        }
        if let Some(style) = crate::style::refinement(props.list_style()) {
            scroller = scroller.with_list_style(style);
        }
        if let Some(style) = crate::style::refinement(props.row_style()) {
            scroller = scroller.with_row_style(style);
        }
        if props.bottom_fade() != 0 {
            scroller = scroller.with_bottom_fade(crate::color::hsla(props.bottom_fade() as u32));
        }
        if !props.jump_button_label().is_empty() {
            scroller = scroller.with_jump_button_label(props.jump_button_label().to_string());
        }
        if let Some(style) = crate::style::refinement(props.jump_button_style()) {
            scroller = scroller.with_jump_button_style(style);
        }
        if props.jump_button_transition() >= 0 {
            scroller = scroller.with_jump_button_transition(std::time::Duration::from_millis(
                props.jump_button_transition() as u64,
            ));
        }
        let (text, variant, size) = (
            props.jump_button_text().to_string(),
            props.jump_button_variant().to_string(),
            props.jump_button_size().to_string(),
        );
        if !(text.is_empty() && variant.is_empty() && size.is_empty()) {
            scroller = scroller.with_jump_button_renderer(move |mut button| {
                if variant == "outline" {
                    button = button.outline();
                } else if let Some(variant) = super::button_group::button_variant(&variant) {
                    button = button.with_variant(variant);
                }
                button = match size.as_str() {
                    "xsmall" => button.xsmall(),
                    "small" => button.small(),
                    "large" => button.large(),
                    _ => button,
                };
                if !text.is_empty() {
                    button = button.label(text);
                }
                button
            });
        }
        scroller.into_any_element()
    }
}
