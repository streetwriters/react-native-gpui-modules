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
