rn_gpui_module::include_specs!();

use arboard::{Clipboard as System, Error};
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use rn_gpui_module::ModuleError;

pub struct Clipboard;

fn failure(error: Error) -> ModuleError {
    ModuleError::with_code("E_CLIPBOARD", error.to_string())
}

fn system() -> Result<System, ModuleError> {
    System::new().map_err(failure)
}

fn text() -> Result<String, ModuleError> {
    match system()?.get_text() {
        Ok(text) => Ok(text),
        Err(Error::ContentNotAvailable) => Ok(String::new()),
        Err(error) => Err(failure(error)),
    }
}

fn png() -> Result<String, ModuleError> {
    let image = match system()?.get_image() {
        Ok(image) => image,
        Err(Error::ContentNotAvailable) => return Ok(String::new()),
        Err(error) => return Err(failure(error)),
    };
    let mut bytes = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut bytes, image.width as u32, image.height as u32);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        let mut writer = encoder
            .write_header()
            .map_err(|e| ModuleError::new(e.to_string()))?;
        writer
            .write_image_data(&image.bytes)
            .map_err(|e| ModuleError::new(e.to_string()))?;
    }
    Ok(STANDARD.encode(bytes))
}

/// Puts every given flavour on the clipboard as one item.
#[cfg(target_os = "macos")]
fn write_rich(plain: &str, html: Option<&str>, markdown: Option<&str>) -> Result<(), ModuleError> {
    use objc2_app_kit::{NSPasteboard, NSPasteboardTypeHTML, NSPasteboardTypeString};
    use objc2_foundation::NSString;

    let pasteboard = NSPasteboard::generalPasteboard();
    pasteboard.clearContents();
    let mut stored = unsafe {
        pasteboard.setString_forType(&NSString::from_str(plain), NSPasteboardTypeString)
    };
    if let Some(html) = html {
        stored &= unsafe { pasteboard.setString_forType(&NSString::from_str(html), NSPasteboardTypeHTML) };
    }
    if let Some(markdown) = markdown {
        stored &= pasteboard.setString_forType(
            &NSString::from_str(markdown),
            &NSString::from_str("net.daringfireball.markdown"),
        );
    }
    if stored {
        Ok(())
    } else {
        Err(ModuleError::with_code("E_CLIPBOARD", "the clipboard refused the content"))
    }
}

/// Markdown has no flavour here: it is dropped, and the text and HTML are kept.
#[cfg(not(target_os = "macos"))]
fn write_rich(plain: &str, html: Option<&str>, _markdown: Option<&str>) -> Result<(), ModuleError> {
    let mut clipboard = system()?;
    match html {
        Some(html) => clipboard.set_html(html, Some(plain)),
        None => clipboard.set_text(plain),
    }
    .map_err(failure)
}

impl NativeClipboardModuleSpec for Clipboard {
    fn new(_events: NativeClipboardModuleEvents) -> Self {
        Self
    }

    async fn get_string(&self) -> Result<String, ModuleError> {
        text()
    }

    async fn get_strings(&self) -> Result<Vec<String>, ModuleError> {
        let text = text()?;
        Ok(if text.is_empty() { Vec::new() } else { vec![text] })
    }

    async fn get_image_png(&self) -> Result<String, ModuleError> {
        png()
    }

    async fn get_image_jpg(&self) -> Result<String, ModuleError> {
        Err(ModuleError::new("getImageJPG is not supported on desktop"))
    }

    async fn set_image(&self, _content: String) -> Result<(), ModuleError> {
        Err(ModuleError::new("setImage is not supported on desktop"))
    }

    async fn get_image(&self) -> Result<String, ModuleError> {
        png()
    }

    fn set_string(&self, content: String) {
        if let Err(error) = system().and_then(|mut s| s.set_text(content).map_err(failure)) {
            eprintln!("clipboard setString failed: {}", error.message);
        }
    }

    fn set_html(&self, html: String, content: String) {
        if let Err(error) =
            system().and_then(|mut s| s.set_html(html, Some(content)).map_err(failure))
        {
            eprintln!("clipboard setHTML failed: {}", error.message);
        }
    }

    fn set_rich(&self, plain: String, html: Option<String>, markdown: Option<String>) {
        if let Err(error) = write_rich(&plain, html.as_deref(), markdown.as_deref()) {
            eprintln!("clipboard setRich failed: {}", error.message);
        }
    }

    async fn get_html(&self) -> Result<String, ModuleError> {
        Err(ModuleError::new("getHTML is not supported on desktop"))
    }

    fn set_strings(&self, content: Vec<String>) {
        if let Some(first) = content.into_iter().next() {
            self.set_string(first);
        }
    }

    async fn has_string(&self) -> Result<bool, ModuleError> {
        Ok(!text()?.is_empty())
    }

    async fn has_image(&self) -> Result<bool, ModuleError> {
        Ok(system()?.get_image().is_ok())
    }

    async fn has_url(&self) -> Result<bool, ModuleError> {
        Ok(false)
    }

    async fn has_number(&self) -> Result<bool, ModuleError> {
        Ok(false)
    }

    async fn has_web_url(&self) -> Result<bool, ModuleError> {
        Ok(false)
    }

    fn set_listener(&self) {}

    fn remove_listener(&self) {}

    fn add_listener(&self, _event_name: String) {}

    fn remove_listeners(&self, _count: i32) {}
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_clipboard_module_module::<Clipboard>());
}
