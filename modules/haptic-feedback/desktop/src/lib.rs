rn_gpui_module::include_specs!();

use rn_gpui_module::{ModuleError, ModuleThread, Value};

pub struct RNHapticFeedback;

#[cfg(target_os = "macos")]
fn perform(pattern: &str) {
    use objc2_app_kit::{NSHapticFeedbackManager, NSHapticFeedbackPattern, NSHapticFeedbackPerformanceTime, NSHapticFeedbackPerformer};

    let pattern = match pattern {
        "selection" | "rigid" | "contextClick" | "textHandleMove" | "gestureStart" => {
            NSHapticFeedbackPattern::Alignment
        }
        "notificationSuccess" | "notificationWarning" | "notificationError" | "confirm" | "reject" => {
            NSHapticFeedbackPattern::LevelChange
        }
        _ => NSHapticFeedbackPattern::Generic,
    };
    let performer = NSHapticFeedbackManager::defaultPerformer();
    performer.performFeedbackPattern_performanceTime(pattern, NSHapticFeedbackPerformanceTime::Default);
}

#[cfg(not(target_os = "macos"))]
fn perform(_pattern: &str) {}

impl NativeRNHapticFeedbackSpec for RNHapticFeedback {
    const THREAD: ModuleThread = ModuleThread::Main;

    fn new(_events: NativeRNHapticFeedbackEvents) -> Self {
        Self
    }

    fn trigger(&self, r#type: String, _options: Option<TriggerOptions>) {
        perform(&r#type);
    }

    fn stop(&self) {}

    fn is_supported(&self) -> Result<bool, ModuleError> {
        Ok(cfg!(target_os = "macos"))
    }

    fn trigger_pattern(&self, events: Vec<TriggerPatternEvents>, _options: Option<TriggerPatternOptions>) {
        for event in events {
            if let Some(kind) = event.r#type {
                perform(&kind);
            }
        }
    }

    async fn play_ahap(&self, _file_name: String) -> Result<(), ModuleError> {
        Err(ModuleError::new("AHAP playback is not available on desktop"))
    }

    async fn get_system_haptic_status(&self) -> Result<Value, ModuleError> {
        Ok(Value::object([
            ("vibrationEnabled", Value::Bool(cfg!(target_os = "macos"))),
            ("ringerMode", Value::Null),
        ]))
    }
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_rn_haptic_feedback_module::<RNHapticFeedback>());
}
