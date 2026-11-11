# Coverage

skipped: 55, generated: 142, aliased: 44

## Components not generated yet

- Kbd: its constructor takes a Keystroke parsed from a 'static string; needs a keystroke cache
- Marker: takes element-valued icon and content arguments (slots)
- AvatarGroup: its children are Avatar elements (slots)
- ToggleGroup: its children are Toggle elements (slots)
- ButtonGroup: its children are Button elements (slots)
- DropdownButton: builds its menu from a closure over a PopupMenu (overlays batch)
- GroupBox: title and footer are elements (slots)
- DescriptionList: items are element pairs (slots)
- Empty: header and content are elements (slots)

## Items

| Component | Item | Outcome | Prop | Reason |
| --- | --- | --- | --- | --- |
| Button | `Button::role` | skipped |  | takes a RoleOverride value that has no string mapping yet |
| Button | `Button::outline` | generated | outline |  |
| Button | `Button::rounded` | generated | rounded |  |
| Button | `Button::label` | generated | label |  |
| Button | `Button::accessibility_id` | generated | accessibilityId |  |
| Button | `Button::accessibility_label` | generated | accessibilityLabel |  |
| Button | `Button::icon` | generated | icon |  |
| Button | `Button::tooltip` | generated | tooltip |  |
| Button | `Button::tooltip_placement` | generated | tooltipPlacement |  |
| Button | `Button::tooltip_show_delay` | generated | tooltipShowDelay |  |
| Button | `Button::tooltip_with_action` | skipped |  | takes a trait object (&dyn Action) |
| Button | `Button::loading` | generated | loading |  |
| Button | `Button::compact` | generated | compact |  |
| Button | `Button::loading_icon` | generated | loadingIcon |  |
| Button | `Button::track_focus` | skipped |  | takes a FocusHandle |
| Button | `Button::tab_index` | generated | tabIndex |  |
| Button | `Button::tab_stop` | generated | tabStop |  |
| Button | `Button::dropdown_caret` | generated | dropdownCaret |  |
| Button | `Button::toggled` | generated | toggled |  |
| Button | `Button::disabled` | generated | disabled |  |
| Button | `Button::focus_ring` | skipped |  | from FocusableExt, not a component property |
| Button | `Button::selected` | generated | selected |  |
| Button | `Button::secondary_selected` | generated | secondarySelected |  |
| Button | `Button::open` | generated | open |  |
| Button | `Button::with_size` | generated | size |  |
| Button | `Button::xsmall` | aliased | size | covered by with_size |
| Button | `Button::small` | aliased | size | covered by with_size |
| Button | `Button::large` | aliased | size | covered by with_size |
| Button | `Button::with_variant` | generated | variant |  |
| Button | `Button::primary` | aliased | variant | covered by with_variant |
| Button | `Button::secondary` | aliased | variant | covered by with_variant |
| Button | `Button::danger` | aliased | variant | covered by with_variant |
| Button | `Button::warning` | aliased | variant | covered by with_variant |
| Button | `Button::success` | aliased | variant | covered by with_variant |
| Button | `Button::info` | aliased | variant | covered by with_variant |
| Button | `Button::ghost` | aliased | variant | covered by with_variant |
| Button | `Button::link` | aliased | variant | covered by with_variant |
| Button | `Button::text` | aliased | variant | covered by with_variant |
| Button | `Button::custom` | skipped |  | unsupported: the type ButtonCustomVariant has no mapping |
| Button | `Button::on_click` | generated | onPress |  |
| Button | `Button::on_hover` | generated | onHoverChange |  |
| Button | `Button::new` | generated |  | constructor; the id comes from the node tag |
| Input | `Input::id` | skipped |  | the id comes from the node tag |
| Input | `Input::accessibility_id` | generated | accessibilityId |  |
| Input | `Input::aria_label` | skipped |  | alias of accessibility_label |
| Input | `Input::prefix` | skipped |  | takes an element (RN slot, later) |
| Input | `Input::suffix` | skipped |  | takes an element (RN slot, later) |
| Input | `Input::h_full` | skipped |  | layout comes from React Native |
| Input | `Input::h` | skipped |  | layout comes from React Native |
| Input | `Input::appearance` | generated | appearance |  |
| Input | `Input::bordered` | generated | bordered |  |
| Input | `Input::focus_bordered` | generated | focusBordered |  |
| Input | `Input::cleanable` | generated | cleanable |  |
| Input | `Input::mask_toggle` | generated | maskToggle |  |
| Input | `Input::content_type` | generated | contentType |  |
| Input | `Input::role` | generated | role |  |
| Input | `Input::disabled` | generated | disabled |  |
| Input | `Input::readonly` | generated | readonly |  |
| Input | `Input::tab_index` | generated | tabIndex |  |
| Input | `Input::with_size` | generated | size |  |
| Input | `Input::xsmall` | aliased | size | covered by with_size |
| Input | `Input::small` | aliased | size | covered by with_size |
| Input | `Input::large` | aliased | size | covered by with_size |
| Input | `Input::selected` | generated | selected |  |
| Input | `Input::secondary_selected` | generated | secondarySelected |  |
| Input | `Input::open` | generated | open |  |
| Input | `Input::focus_ring` | skipped |  | from FocusableExt, not a component property |
| Input | `Input::token` | skipped |  | event not listed in components.json |
| Input | `Input::on_token_click` | skipped |  | event not listed in components.json |
| Input | `Input::on_token_hover` | skipped |  | event not listed in components.json |
| Input | `Input::context_menu` | skipped |  | event not listed in components.json |
| Input | `Input::on_paste` | skipped |  | event not listed in components.json |
| Input | `InputBaseState::set_search_query` | skipped |  | unsupported: takes 2 data arguments |
| Input | `InputBaseState::set_text_align` | skipped |  | excluded in components.json |
| Input | `InputBaseState::set_selection_focus` | skipped |  | excluded in components.json |
| Input | `InputBaseState::set_context_menu_enabled` | skipped |  | excluded in components.json |
| Input | `InputBaseState::set_highlighter` | skipped |  | excluded in components.json |
| Input | `InputBaseState::set_highlighter_factory` | skipped |  | unsupported: the type InputHighlighterFactory has no mapping |
| Input | `InputBaseState::set_editor_style` | skipped |  | unsupported: the type InputEditorStyle has no mapping |
| Input | `InputBaseState::set_fold_placeholder_renderer` | skipped |  | unsupported: the type FoldPlaceholderRenderer has no mapping |
| Input | `InputBaseState::set_fold_background` | skipped |  | unsupported: an optional value has no unset sentinel |
| Input | `InputBaseState::set_accessibility` | skipped |  | excluded in components.json |
| Input | `InputBaseState::set_scrollbar_renderer` | skipped |  | unsupported: the type crate::input::EditorScrollbarRenderer has no mapping |
| Input | `InputBaseState::set_placeholder` | generated | placeholder |  |
| Input | `InputBaseState::set_value` | generated | value | controlled value |
| Input | `InputBaseState::set_disabled` | skipped |  | the disabled prop comes from the element |
| Input | `InputBaseState::set_readonly` | skipped |  | the readonly prop comes from the element |
| Input | `InputBaseState::set_clean_on_escape` | generated | cleanOnEscape |  |
| Input | `InputBaseState::set_submit_on_enter` | generated | submitOnEnter |  |
| Input | `InputBaseState::set_show_whitespaces` | generated | showWhitespaces |  |
| Input | `InputBaseState::set_scroll_beyond_last_line` | skipped |  | unsupported: an optional value has no unset sentinel |
| Input | `InputBaseState::set_cursor_surrounding_lines` | skipped |  | unsupported: an optional value has no unset sentinel |
| Input | `InputBaseState::set_cursor_position` | skipped |  | excluded in components.json |
| Input | `InputBaseState::set_scroll_offset` | skipped |  | excluded in components.json |
| Input | `InputBaseState::set_selected_range` | skipped |  | excluded in components.json |
| Input | `InputBaseState::set_selected_range_with_direction` | skipped |  | unsupported: takes 2 data arguments |
| Input | `InputBaseState::set_mask_pattern` | skipped |  | excluded in components.json |
| Input | `InputBaseState::set_masked` | generated | masked |  |
| Input | `InputBaseState::set_pattern` | skipped |  | excluded in components.json |
| Input | `InputBaseState::set_validator` | skipped |  | excluded in components.json |
| Input | `InputBaseState::set_step` | skipped |  | unsupported: the type NumberStep has no mapping |
| Input | `InputBaseState::set_min` | skipped |  | unsupported: an optional value has no unset sentinel |
| Input | `InputBaseState::set_max` | skipped |  | unsupported: an optional value has no unset sentinel |
| Input | `InputBaseState::set_loading` | generated | loading |  |
| Input | `InputBaseState::focus` | generated | focus | command |
| Input | `InputBaseState::select_all` | generated | select_all | command |
| Input | `InputBaseState::unselect` | generated | unselect | command |
| Input | `InputBaseState::clean` | generated | clean | command |
| Input | `InputBaseState::insert` | generated | insert | command |
| Input | `InputBaseState::replace_all` | generated | replace_all | command |
| Input | `InputEvent::Change` | generated | onChange | event |
| Input | `InputEvent::PressEnter` | generated | onSubmit | event |
| Input | `InputEvent::Focus` | generated | onFocus | event |
| Input | `InputEvent::Blur` | generated | onBlur | event |
| Input | `Input::new` | generated |  | constructor; the id comes from the node tag |
| Label | `Label::secondary` | generated | secondary |  |
| Label | `Label::masked` | generated | masked |  |
| Label | `Label::highlights` | skipped |  | takes a HighlightsMatch value |
| Label | `Label (prop text)` | generated | text | constructor argument |
| Label | `Label::new` | generated |  | constructor; the id comes from the node tag |
| Icon | `Icon::path` | skipped |  | takes an asset path |
| Icon | `Icon::data` | skipped |  | takes raw bytes |
| Icon | `Icon::transform` | skipped |  | takes a gpui Transformation |
| Icon | `Icon::rotate` | skipped |  | takes Radians |
| Icon | `Icon::with_size` | generated | size |  |
| Icon | `Icon::xsmall` | aliased | size | covered by with_size |
| Icon | `Icon::small` | aliased | size | covered by with_size |
| Icon | `Icon::large` | aliased | size | covered by with_size |
| Icon | `Icon (prop name)` | generated | name | constructor argument |
| Icon | `Icon::view` | skipped |  | not a builder (takes self by reference or returns another type) |
| Icon | `Icon::new` | generated |  | constructor; the id comes from the node tag |
| Icon | `Icon::empty` | generated |  | constructor; the id comes from the node tag |
| Badge | `Badge::dot` | generated | dot |  |
| Badge | `Badge::count` | generated | count |  |
| Badge | `Badge::icon` | generated | icon |  |
| Badge | `Badge::max` | generated | max |  |
| Badge | `Badge::color` | generated | color |  |
| Badge | `Badge::with_size` | generated | size |  |
| Badge | `Badge::xsmall` | aliased | size | covered by with_size |
| Badge | `Badge::small` | aliased | size | covered by with_size |
| Badge | `Badge::large` | aliased | size | covered by with_size |
| Badge | `Badge::new` | generated |  | constructor; the id comes from the node tag |
| Tag | `Tag::with_variant` | generated | withVariant |  |
| Tag | `Tag::outline` | generated | outline |  |
| Tag | `Tag::rounded` | skipped |  | takes an AbsoluteLength |
| Tag | `Tag::rounded_full` | generated | roundedFull |  |
| Tag | `Tag::with_size` | generated | size |  |
| Tag | `Tag::xsmall` | aliased | size | covered by with_size |
| Tag | `Tag::small` | aliased | size | covered by with_size |
| Tag | `Tag::large` | aliased | size | covered by with_size |
| Tag | `Tag (prop label)` | generated | label | constructor argument |
| Tag | `Tag::new` | generated |  | constructor; the id comes from the node tag |
| Tag | `Tag::primary` | generated |  | constructor; the id comes from the node tag |
| Tag | `Tag::secondary` | generated |  | constructor; the id comes from the node tag |
| Tag | `Tag::danger` | generated |  | constructor; the id comes from the node tag |
| Tag | `Tag::success` | generated |  | constructor; the id comes from the node tag |
| Tag | `Tag::warning` | generated |  | constructor; the id comes from the node tag |
| Tag | `Tag::info` | generated |  | constructor; the id comes from the node tag |
| Tag | `Tag::custom` | generated |  | constructor; the id comes from the node tag |
| Tag | `Tag::color` | generated |  | constructor; the id comes from the node tag |
| Avatar | `Avatar::src` | skipped |  | takes an ImageSource |
| Avatar | `Avatar::name` | generated | name |  |
| Avatar | `Avatar::placeholder` | generated | placeholder |  |
| Avatar | `Avatar::with_size` | generated | size |  |
| Avatar | `Avatar::xsmall` | aliased | size | covered by with_size |
| Avatar | `Avatar::small` | aliased | size | covered by with_size |
| Avatar | `Avatar::large` | aliased | size | covered by with_size |
| Avatar | `Avatar::new` | generated |  | constructor; the id comes from the node tag |
| Spinner | `Spinner::icon` | generated | icon |  |
| Spinner | `Spinner::color` | generated | color |  |
| Spinner | `Spinner::with_size` | generated | size |  |
| Spinner | `Spinner::xsmall` | aliased | size | covered by with_size |
| Spinner | `Spinner::small` | aliased | size | covered by with_size |
| Spinner | `Spinner::large` | aliased | size | covered by with_size |
| Spinner | `Spinner::ease` | skipped |  | event not listed in components.json |
| Spinner | `Spinner::new` | generated |  | constructor; the id comes from the node tag |
| Skeleton | `Skeleton::secondary` | generated | secondary |  |
| Skeleton | `Skeleton::new` | generated |  | constructor; the id comes from the node tag |
| Link | `Link::href` | generated | href |  |
| Link | `Link::disabled` | generated | disabled |  |
| Link | `Link (prop text)` | generated | text | constructor argument |
| Link | `Link::on_click` | generated | onPress |  |
| Link | `Link::new` | generated |  | constructor; the id comes from the node tag |
| Progress | `Progress::loading` | generated | loading |  |
| Progress | `Progress::color` | generated | color |  |
| Progress | `Progress::value` | generated | value |  |
| Progress | `Progress::accessibility_label` | generated | accessibilityLabel |  |
| Progress | `Progress::with_size` | generated | size |  |
| Progress | `Progress::xsmall` | aliased | size | covered by with_size |
| Progress | `Progress::small` | aliased | size | covered by with_size |
| Progress | `Progress::large` | aliased | size | covered by with_size |
| Progress | `Progress::new` | generated |  | constructor; the id comes from the node tag |
| ProgressCircle | `ProgressCircle::loading` | generated | loading |  |
| ProgressCircle | `ProgressCircle::color` | generated | color |  |
| ProgressCircle | `ProgressCircle::value` | generated | value |  |
| ProgressCircle | `ProgressCircle::accessibility_label` | generated | accessibilityLabel |  |
| ProgressCircle | `ProgressCircle::with_size` | generated | size |  |
| ProgressCircle | `ProgressCircle::xsmall` | aliased | size | covered by with_size |
| ProgressCircle | `ProgressCircle::small` | aliased | size | covered by with_size |
| ProgressCircle | `ProgressCircle::large` | aliased | size | covered by with_size |
| ProgressCircle | `ProgressCircle::new` | generated |  | constructor; the id comes from the node tag |
| Toggle | `Toggle::tooltip` | skipped |  | set later with the Tooltip batch |
| Toggle | `Toggle::tooltip_show_delay` | generated | tooltipShowDelay |  |
| Toggle | `Toggle::label` | generated | label |  |
| Toggle | `Toggle::icon` | generated | icon |  |
| Toggle | `Toggle::checked` | generated | checked |  |
| Toggle | `Toggle::with_variant` | generated | variant |  |
| Toggle | `Toggle::ghost` | aliased | variant | covered by with_variant |
| Toggle | `Toggle::outline` | aliased | variant | covered by with_variant |
| Toggle | `Toggle::disabled` | generated | disabled |  |
| Toggle | `Toggle::with_size` | generated | size |  |
| Toggle | `Toggle::xsmall` | aliased | size | covered by with_size |
| Toggle | `Toggle::small` | aliased | size | covered by with_size |
| Toggle | `Toggle::large` | aliased | size | covered by with_size |
| Toggle | `Toggle::on_click` | generated | onChange |  |
| Toggle | `Toggle::new` | generated |  | constructor; the id comes from the node tag |
| Alert | `Alert::with_variant` | generated | withVariant |  |
| Alert | `Alert::icon` | generated | icon |  |
| Alert | `Alert::title` | generated | title |  |
| Alert | `Alert::banner` | generated | banner |  |
| Alert | `Alert::visible` | generated | visible |  |
| Alert | `Alert::with_size` | generated | size |  |
| Alert | `Alert::xsmall` | aliased | size | covered by with_size |
| Alert | `Alert::small` | aliased | size | covered by with_size |
| Alert | `Alert::large` | aliased | size | covered by with_size |
| Alert | `Alert (prop message)` | generated | message | constructor argument |
| Alert | `Alert::on_close` | generated | onClose |  |
| Alert | `Alert::new` | generated |  | constructor; the id comes from the node tag |
| Alert | `Alert::info` | generated |  | constructor; the id comes from the node tag |
| Alert | `Alert::success` | generated |  | constructor; the id comes from the node tag |
| Alert | `Alert::warning` | generated |  | constructor; the id comes from the node tag |
| Alert | `Alert::error` | generated |  | constructor; the id comes from the node tag |
| ShimmerText | `ShimmerText::id` | skipped |  | the id comes from the node tag |
| ShimmerText | `ShimmerText::with_shimmer_style` | skipped |  | takes a ShimmerStyle value |
| ShimmerText | `ShimmerText::duration` | generated | duration |  |
| ShimmerText | `ShimmerText::highlight_color` | generated | highlightColor |  |
| ShimmerText | `ShimmerText::spread` | skipped |  | takes a ShimmerSpread value |
| ShimmerText | `ShimmerText::reverse` | generated | reverse |  |
| ShimmerText | `ShimmerText::once` | generated | once |  |
| ShimmerText | `ShimmerText (prop text)` | generated | text | constructor argument |
| ShimmerText | `ShimmerText::new` | generated |  | constructor; the id comes from the node tag |
