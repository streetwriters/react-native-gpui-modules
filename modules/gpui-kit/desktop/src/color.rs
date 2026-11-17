use gpui::{Hsla, Rgba};

pub fn hsla(argb: u32) -> Hsla {
    let alpha = ((argb >> 24) & 0xff) as f32 / 255.0;
    let red = ((argb >> 16) & 0xff) as f32 / 255.0;
    let green = ((argb >> 8) & 0xff) as f32 / 255.0;
    let blue = (argb & 0xff) as f32 / 255.0;
    Rgba {
        r: red,
        g: green,
        b: blue,
        a: alpha,
    }
    .into()
}

/// An image from a web address or a file path.
pub fn image_source(location: &str) -> gpui::ImageSource {
    if location.starts_with("http://") || location.starts_with("https://") {
        gpui::ImageSource::from(gpui::SharedUri::from(location.to_string()))
    } else {
        let path = location.strip_prefix("file://").unwrap_or(location);
        gpui::ImageSource::from(std::sync::Arc::<std::path::Path>::from(
            std::path::Path::new(path),
        ))
    }
}
