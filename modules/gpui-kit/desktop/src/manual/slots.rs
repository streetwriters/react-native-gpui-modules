use std::collections::HashMap;

use gpui::AnyElement;
use react_native_gpui::native_tree::ChildRenderer;

/// The children of a native tree instance, named by the `slots` prop: a
/// comma-separated list that gives the name of the child at each position.
pub struct Slots(HashMap<String, AnyElement>);

impl Slots {
    pub fn new(names: &str, children: Vec<AnyElement>) -> Self {
        Self(
            names
                .split(',')
                .filter(|name| !name.is_empty())
                .map(str::to_string)
                .zip(children)
                .collect(),
        )
    }

    pub fn take(&mut self, name: &str) -> Option<AnyElement> {
        self.0.remove(name)
    }
}

/// Registers a spec as a Fabric host component and as a native tree component.
macro_rules! register {
    ($component:ident, $factory:ident, $ty:ty) => {
        react_native_gpui::host_component::register_component(crate::$factory::<$ty>());
        crate::$component::<$ty>::register_native_tree();
    };
}
pub(crate) use register;

/// Like [`Slots`], for content that a closure builds on every frame: each slot
/// is a renderer that makes the element again when it is called.
pub struct Renderers(HashMap<String, ChildRenderer>);

impl Renderers {
    pub fn new(names: &str) -> Self {
        Self(
            names
                .split(',')
                .filter(|name| !name.is_empty())
                .map(str::to_string)
                .zip(react_native_gpui::native_tree::child_renderers())
                .collect(),
        )
    }

    pub fn get(&self, name: &str) -> Option<ChildRenderer> {
        self.0.get(name).cloned()
    }
}

/// Keeps an overlay of the window root shown or hidden to match a prop.
#[derive(Clone, Default)]
pub struct Shown(pub std::rc::Rc<std::cell::Cell<bool>>);

impl Shown {
    pub fn sync(
        &self,
        open: bool,
        window: &mut gpui::Window,
        app: &mut gpui::App,
        show: impl Fn(&mut gpui::Window, &mut gpui::App) + 'static,
        hide: impl Fn(&mut gpui::Window, &mut gpui::App) + 'static,
    ) {
        if self.0.get() == open {
            return;
        }
        self.0.set(open);
        window.defer(app, move |window, app| {
            if open {
                show(window, app)
            } else {
                hide(window, app)
            }
        });
    }
}
