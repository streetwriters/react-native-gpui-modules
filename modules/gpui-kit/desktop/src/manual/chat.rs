use gpui::{
    AnyElement, AppContext as _, Entity, IntoElement, ParentElement as _, SharedString, Window,
};
use gpui_component::attachment::{
    Attachment, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentStatus,
    AttachmentTitle,
};
use gpui_component::bubble::{Bubble, BubbleContent, BubbleVariant};
use gpui_component::message::{
    Message, MessageAlignment, MessageContent, MessageFooter, MessageHeader,
};
use gpui_component::message_scroller::{MessageScroller, MessageScrollerState};

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
        let mut message = Message::new().id(SharedString::from(self.id.clone()));
        if props.end() {
            message = message.alignment(MessageAlignment::End);
        }
        if let Some(avatar) = slots.take("avatar") {
            message = message.avatar(avatar);
        }
        if let Some(header) = slots.take("header") {
            message = message.header(MessageHeader::new().child(header));
        } else if !props.header().is_empty() {
            message = message.header(MessageHeader::new().child(props.header().to_string()));
        }
        let mut content = MessageContent::new();
        if let Some(body) = slots.take("body") {
            content = content.child(body);
        }
        message = message.content(content);
        if let Some(footer) = slots.take("footer") {
            message = message.footer(MessageFooter::new().child(footer));
        } else if !props.footer().is_empty() {
            message = message.footer(MessageFooter::new().child(props.footer().to_string()));
        }
        message.into_any_element()
    }
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
        let mut bubble = Bubble::new();
        if props.end() {
            bubble = bubble.alignment(MessageAlignment::End);
        }
        bubble = bubble.with_variant(match props.variant() {
            GpuiKitBubbleVariant::Secondary => BubbleVariant::Secondary,
            GpuiKitBubbleVariant::Muted => BubbleVariant::Muted,
            GpuiKitBubbleVariant::Tinted => BubbleVariant::Tinted,
            GpuiKitBubbleVariant::Outline => BubbleVariant::Outline,
            GpuiKitBubbleVariant::Ghost => BubbleVariant::Ghost,
            GpuiKitBubbleVariant::Destructive => BubbleVariant::Destructive,
            GpuiKitBubbleVariant::Unset | GpuiKitBubbleVariant::Filled => BubbleVariant::Filled,
        });
        let mut content = BubbleContent::new();
        if let Some(body) = slots.take("body") {
            content = content.child(body);
        } else if !props.text().is_empty() {
            content = content.child(props.text().to_string());
        }
        bubble.content(content).into_any_element()
    }
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
        let status = match props.status() {
            GpuiKitAttachmentStatus::Pending => AttachmentStatus::Pending,
            GpuiKitAttachmentStatus::Uploading => AttachmentStatus::Uploading,
            GpuiKitAttachmentStatus::Processing => AttachmentStatus::Processing,
            GpuiKitAttachmentStatus::Failed => AttachmentStatus::Failed,
            GpuiKitAttachmentStatus::Unset | GpuiKitAttachmentStatus::Complete => {
                AttachmentStatus::Complete
            }
        };
        let mut attachment = Attachment::new()
            .id(SharedString::from(self.id.clone()))
            .status(status);
        if props.progress() >= 0.0 {
            attachment = attachment.progress(props.progress() as f32);
        }
        if !props.tooltip().is_empty() {
            attachment = attachment.tooltip(props.tooltip().to_string());
        }
        let mut content = AttachmentContent::new()
            .title(AttachmentTitle::new(props.title().to_string()).status(status));
        if !props.description().is_empty() {
            content = content.description(
                AttachmentDescription::new(props.description().to_string()).status(status),
            );
        }
        attachment = attachment.content(content);
        if let Some(actions) = slots.take("actions") {
            attachment = attachment.actions(AttachmentActions::new().child(actions));
        }
        let (click, remove, retry) = (sender.clone(), sender.clone(), sender);
        attachment
            .on_click(move |_, _window, _cx| click.gpui_kit_attachment_press())
            .on_remove(move |_, _window, _cx| remove.gpui_kit_attachment_remove())
            .on_retry(move |_, _window, _cx| retry.gpui_kit_attachment_retry())
            .into_any_element()
    }
}

pub struct GpuiKitMessageScroller {
    id: String,
    state: Option<Entity<MessageScrollerState>>,
    count: usize,
}

impl GpuiKitMessageScrollerSpec for GpuiKitMessageScroller {
    fn create(
        _props: &GpuiKitMessageScrollerProps,
        cx: &mut GpuiKitMessageScrollerContext,
    ) -> Self {
        Self {
            id: format!("gpui_kit_message_scroller-{}", cx.tag()),
            state: None,
            count: 0,
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
        let Some(state) = self.state.clone() else {
            return;
        };
        if let Some(app) = cx.app() {
            state.update(app, |state, cx| state.scroll_to_end(cx));
        }
    }

    fn scroll_to_item(&mut self, index: i32, cx: &mut GpuiKitMessageScrollerContext) {
        let Some(state) = self.state.clone() else {
            return;
        };
        if let Some(app) = cx.app() {
            state.update(app, |state, cx| {
                state.scroll_to_item(index.max(0) as usize, cx);
            });
        }
    }

    fn render(
        &mut self,
        props: &GpuiKitMessageScrollerProps,
        _window: &mut Window,
        cx: &mut GpuiKitMessageScrollerContext,
    ) -> AnyElement {
        let renderers = Renderers::new(props.slots());
        let count = props.count().max(0) as usize;
        let Some(app) = cx.app() else {
            return gpui::div().into_any_element();
        };
        let state = self
            .state
            .get_or_insert_with(|| app.new(|cx| MessageScrollerState::new(count, cx)))
            .clone();
        if self.count != count {
            self.count = count;
            state.update(app, |state, cx| state.reset(count, cx));
        } else {
            state.update(app, |state, cx| state.remeasure(cx));
        }
        MessageScroller::new(
            SharedString::from(self.id.clone()),
            state,
            move |index, window, cx| match renderers.get(&format!("row-{index}")) {
                Some(render) => render(window, cx),
                None => gpui::div().into_any_element(),
            },
        )
        .scrollbar(props.scrollbar())
        .jump_button(props.jump_button())
        .into_any_element()
    }
}
