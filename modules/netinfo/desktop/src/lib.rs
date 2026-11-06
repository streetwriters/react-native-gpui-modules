rn_gpui_module::include_specs!();

use std::net::IpAddr;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;

use rn_gpui_module::{ModuleError, Value};

const EVENT: &str = "netInfo.networkStatusDidChange";
const POLL_INTERVAL: Duration = Duration::from_secs(2);

pub struct NetInfo {
    listening: Arc<AtomicBool>,
    events: NativeRNCNetInfoEvents,
}

fn is_online() -> bool {
    if_addrs::get_if_addrs().map_or(false, |interfaces| {
        interfaces.iter().any(|interface| match interface.ip() {
            IpAddr::V4(ip) => !ip.is_loopback() && !ip.is_link_local() && !ip.is_unspecified(),
            IpAddr::V6(ip) => {
                !ip.is_loopback() && !ip.is_unspecified() && (ip.segments()[0] & 0xffc0) != 0xfe80
            }
        })
    })
}

fn state(online: bool) -> Value {
    Value::object([
        ("type", Value::String(if online { "other" } else { "none" }.into())),
        ("isConnected", Value::Bool(online)),
        ("isInternetReachable", if online { Value::Null } else { Value::Bool(false) }),
        (
            "details",
            if online {
                Value::object([("isConnectionExpensive", Value::Bool(false))])
            } else {
                Value::Null
            },
        ),
    ])
}

impl NativeRNCNetInfoSpec for NetInfo {
    fn new(events: NativeRNCNetInfoEvents) -> Self {
        let listening = Arc::new(AtomicBool::new(true));
        let flag = listening.clone();
        let sender = events.clone();
        std::thread::spawn(move || {
            let mut last = is_online();
            while flag.load(Ordering::Relaxed) {
                std::thread::sleep(POLL_INTERVAL);
                let now = is_online();
                if now != last {
                    last = now;
                    sender.send_event(EVENT, state(now));
                }
            }
        });
        Self { listening, events }
    }

    async fn get_current_state(
        &self,
        _requested_interface: Option<String>,
    ) -> Result<Value, ModuleError> {
        let _ = &self.events;
        Ok(state(is_online()))
    }

    fn add_listener(&self, _event_name: String) {}

    fn remove_listeners(&self, _count: f64) {}
}

impl Drop for NetInfo {
    fn drop(&mut self) {
        self.listening.store(false, Ordering::Relaxed);
    }
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_rnc_net_info_module::<NetInfo>());
}
