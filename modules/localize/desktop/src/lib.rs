rn_gpui_module::include_specs!();

use rn_gpui_module::{ModuleError, Value};

pub struct RNLocalize;

struct Region {
    country: String,
    language: String,
    script: Option<String>,
}

fn region() -> Region {
    let tag = sys_locale::get_locale().unwrap_or_else(|| "en-US".into());
    let parts: Vec<&str> = tag.split(['-', '_']).collect();
    let language = parts.first().copied().unwrap_or("en").to_lowercase();
    let script = parts
        .get(1)
        .filter(|part| part.len() == 4)
        .map(|part| part.to_string());
    let country = parts
        .iter()
        .skip(1)
        .find(|part| part.len() == 2 || part.len() == 3 && part.chars().all(|c| c.is_ascii_digit()))
        .map(|part| part.to_uppercase())
        .unwrap_or_else(|| default_country(&language).into());
    Region { country, language, script }
}

fn default_country(language: &str) -> &'static str {
    match language {
        "de" => "DE",
        "fr" => "FR",
        "es" => "ES",
        "it" => "IT",
        "ja" => "JP",
        "zh" => "CN",
        "pt" => "BR",
        "ru" => "RU",
        "ko" => "KR",
        "nl" => "NL",
        "sv" => "SE",
        "ar" => "EG",
        _ => "US",
    }
}

fn is_rtl(language: &str) -> bool {
    matches!(language, "ar" | "he" | "fa" | "ur" | "ps" | "sd" | "yi" | "ug")
}

fn metric_country(country: &str) -> bool {
    !matches!(country, "US" | "LR" | "MM")
}

fn currency(country: &str) -> &'static str {
    match country {
        "US" => "USD",
        "GB" => "GBP",
        "JP" => "JPY",
        "CN" => "CNY",
        "IN" => "INR",
        "CA" => "CAD",
        "AU" => "AUD",
        "CH" => "CHF",
        "BR" => "BRL",
        "RU" => "RUB",
        "KR" => "KRW",
        "MX" => "MXN",
        "SE" => "SEK",
        "NO" => "NOK",
        "DK" => "DKK",
        "PL" => "PLN",
        "EG" => "EGP",
        "SA" => "SAR",
        "AE" => "AED",
        "DE" | "FR" | "ES" | "IT" | "NL" | "BE" | "AT" | "PT" | "IE" | "FI" | "GR" => "EUR",
        _ => "USD",
    }
}

fn twelve_hour_country(country: &str) -> bool {
    matches!(country, "US" | "CA" | "AU" | "NZ" | "IN" | "PH" | "PK" | "EG" | "SA")
}

fn open_settings_url() -> bool {
    #[cfg(target_os = "macos")]
    {
        return std::process::Command::new("open")
            .arg("x-apple.systempreferences:com.apple.Localization-Settings.extension")
            .status()
            .map(|status| status.success())
            .unwrap_or(false);
    }
    #[allow(unreachable_code)]
    false
}

impl NativeRNLocalizeSpec for RNLocalize {
    fn new(_events: NativeRNLocalizeEvents) -> Self {
        Self
    }

    fn get_calendar(&self) -> Result<String, ModuleError> {
        Ok("gregorian".into())
    }

    fn get_country(&self) -> Result<String, ModuleError> {
        Ok(region().country)
    }

    fn get_currencies(&self) -> Result<Vec<String>, ModuleError> {
        Ok(vec![currency(&region().country).into()])
    }

    fn get_locales(&self) -> Result<Vec<Value>, ModuleError> {
        let mut tags: Vec<String> = sys_locale::get_locales().collect();
        if tags.is_empty() {
            tags.push(sys_locale::get_locale().unwrap_or_else(|| "en-US".into()));
        }
        Ok(tags
            .into_iter()
            .map(|tag| {
                let tag = tag.replace('_', "-");
                let parts: Vec<&str> = tag.split('-').collect();
                let language = parts.first().copied().unwrap_or("en").to_lowercase();
                let country = parts
                    .iter()
                    .skip(1)
                    .find(|part| part.len() == 2)
                    .map(|part| part.to_uppercase())
                    .unwrap_or_else(|| default_country(&language).into());
                Value::object([
                    ("languageTag", Value::String(tag.clone())),
                    ("languageCode", Value::String(language.clone())),
                    ("countryCode", Value::String(country)),
                    ("isRTL", Value::Bool(is_rtl(&language))),
                ])
            })
            .collect())
    }

    fn get_number_format_settings(&self) -> Result<Value, ModuleError> {
        let region = region();
        let comma = matches!(
            region.language.as_str(),
            "de" | "fr" | "es" | "it" | "nl" | "pt" | "ru" | "sv" | "da" | "fi" | "nb" | "pl" | "tr"
        );
        let (decimal, grouping) = if comma { (",", ".") } else { (".", ",") };
        let _ = region.script;
        Ok(Value::object([
            ("decimalSeparator", Value::String(decimal.into())),
            ("groupingSeparator", Value::String(grouping.into())),
        ]))
    }

    fn get_temperature_unit(&self) -> Result<String, ModuleError> {
        Ok(if metric_country(&region().country) { "celsius" } else { "fahrenheit" }.into())
    }

    fn get_time_zone(&self) -> Result<String, ModuleError> {
        Ok(iana_time_zone::get_timezone().unwrap_or_else(|_| "UTC".into()))
    }

    fn uses24_hour_clock(&self) -> Result<bool, ModuleError> {
        Ok(!twelve_hour_country(&region().country))
    }

    fn uses_metric_system(&self) -> Result<bool, ModuleError> {
        Ok(metric_country(&region().country))
    }

    fn uses_auto_date_and_time(&self) -> Result<Option<bool>, ModuleError> {
        Ok(None)
    }

    fn uses_auto_time_zone(&self) -> Result<Option<bool>, ModuleError> {
        Ok(None)
    }

    async fn open_app_language_settings(&self) -> Result<bool, ModuleError> {
        Ok(open_settings_url())
    }
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_rn_localize_module::<RNLocalize>());
}
