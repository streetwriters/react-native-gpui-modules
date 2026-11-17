use gpui::Role;
use gpui_base::RoleOverride;

/// `implicit`, `presentational`, or an accessibility role name in the ARIA
/// spelling (`button`, `checkbox`, `menuitem`, ...). Empty or unknown is unset.
pub fn role_override(value: &str) -> Option<RoleOverride> {
    let role = match value {
        "" => return None,
        "implicit" => return Some(RoleOverride::Implicit),
        "presentational" | "presentation" | "none" => return Some(RoleOverride::Presentational),
        "button" => Role::Button,
        "checkbox" => Role::CheckBox,
        "radio" => Role::RadioButton,
        "switch" => Role::Switch,
        "link" => Role::Link,
        "menuitem" => Role::MenuItem,
        "menuitemcheckbox" => Role::MenuItemCheckBox,
        "menuitemradio" => Role::MenuItemRadio,
        "tab" => Role::Tab,
        "option" => Role::ListBoxOption,
        "textbox" => Role::TextInput,
        "searchbox" => Role::SearchInput,
        "combobox" => Role::ComboBox,
        "spinbutton" => Role::SpinButton,
        "slider" => Role::Slider,
        "heading" => Role::Heading,
        "img" | "image" => Role::Image,
        "text" | "label" => Role::Label,
        "group" => Role::Group,
        "toolbar" => Role::Toolbar,
        "status" => Role::Status,
        "alert" => Role::Alert,
        _ => return None,
    };
    Some(RoleOverride::Role(role))
}
