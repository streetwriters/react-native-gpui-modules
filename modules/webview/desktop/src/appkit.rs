use std::ffi::{c_char, c_void, CStr};
use std::sync::Once;

use react_native_gpui::native_view::{
    appkit::{
        base::{id, nil, NO, YES},
        foundation::{NSPoint, NSRect, NSSize, NSString},
    },
    objective_c::{
        class, msg_send,
        runtime::{Class, Object, Protocol, Sel},
        sel, sel_impl,
    },
    NativeViewHandle,
};

use crate::webview::{PageEvent, PageState, Source};

#[link(name = "WebKit", kind = "framework")]
// SAFETY: an empty block whose only job is to link the WebKit framework.
unsafe extern "C" {}

#[link(name = "objc")]
unsafe extern "C" {
    fn objc_setAssociatedObject(object: id, key: *const c_void, value: id, policy: usize);
}

type Callback = Box<dyn Fn(id, PageEvent)>;

const BRIDGE: &str = "window.ReactNativeWebView = { postMessage: function (data) { window.webkit.messageHandlers.ReactNativeWebView.postMessage(String(data)); } };";

fn ns(text: &str) -> id {
    // SAFETY: allocates an owned NSString; every caller releases it.
    unsafe { NSString::alloc(nil).init_str(text) }
}

fn release(object: id) {
    // SAFETY: `object` is an owned Objective-C object.
    unsafe {
        let _: () = msg_send![object, release];
    }
}

fn string_of(text: id) -> String {
    if text == nil {
        return String::new();
    }
    // SAFETY: `text` is a live NSString.
    unsafe {
        let utf8: *const c_char = msg_send![text, UTF8String];
        if utf8.is_null() {
            return String::new();
        }
        CStr::from_ptr(utf8).to_string_lossy().into_owned()
    }
}

fn zero_frame() -> NSRect {
    NSRect::new(NSPoint::new(0., 0.), NSSize::new(0., 0.))
}

fn error_parts(error: id) -> (String, i32, String) {
    if error == nil {
        return (String::new(), 0, String::new());
    }
    // SAFETY: `error` is a live NSError.
    unsafe {
        let domain: id = msg_send![error, domain];
        let code: i64 = msg_send![error, code];
        let description: id = msg_send![error, localizedDescription];
        (string_of(domain), code as i32, string_of(description))
    }
}

unsafe fn callback<'a>(this: &Object) -> &'a Callback {
    // SAFETY: `callback` is the leaked box the delegate was created with, alive until `dealloc`.
    unsafe { &*(*this.get_ivar::<usize>("callback") as *const Callback) }
}

extern "C" fn started(this: &Object, _cmd: Sel, view: id, _navigation: id) {
    // SAFETY: called by WebKit on the main thread while the delegate is alive.
    unsafe { callback(this)(view, PageEvent::Start) }
}

extern "C" fn finished(this: &Object, _cmd: Sel, view: id, _navigation: id) {
    // SAFETY: as above.
    unsafe { callback(this)(view, PageEvent::Finish) }
}

extern "C" fn failed(this: &Object, _cmd: Sel, view: id, _navigation: id, error: id) {
    let (domain, code, description) = error_parts(error);
    // SAFETY: as above.
    unsafe { callback(this)(view, PageEvent::Fail { domain, code, description }) }
}

extern "C" fn terminated(this: &Object, _cmd: Sel, view: id) {
    // SAFETY: as above.
    unsafe { callback(this)(view, PageEvent::Terminated) }
}

extern "C" fn received(this: &Object, _cmd: Sel, _controller: id, message: id) {
    // SAFETY: `message` is a live WKScriptMessage whose body is a string; the call runs on the main thread.
    unsafe {
        let body: id = msg_send![message, body];
        let view: id = msg_send![message, webView];
        callback(this)(view, PageEvent::Message(string_of(body)));
    }
}

extern "C" fn delegate_dealloc(this: &Object, _cmd: Sel) {
    // SAFETY: frees the box leaked into the delegate, once, then forwards to `NSObject`.
    unsafe {
        let callback = *this.get_ivar::<usize>("callback") as *mut Callback;
        drop(Box::from_raw(callback));
        let _: () = msg_send![super(this, class!(NSObject)), dealloc];
    }
}

fn delegate_class() -> &'static Class {
    static REGISTER: Once = Once::new();
    REGISTER.call_once(|| {
        let mut declaration = react_native_gpui::native_view::objective_c::declare::ClassDecl::new(
            "RnGpuiWebViewDelegate",
            class!(NSObject),
        )
        .expect("the delegate class is declared once");
        declaration.add_ivar::<usize>("callback");
        if let Some(protocol) = Protocol::get("WKScriptMessageHandler") {
            declaration.add_protocol(protocol);
        }
        // SAFETY: the selectors and signatures are the ones WebKit calls.
        unsafe {
            declaration.add_method(
                sel!(webView:didStartProvisionalNavigation:),
                started as extern "C" fn(&Object, Sel, id, id),
            );
            declaration.add_method(
                sel!(webView:didFinishNavigation:),
                finished as extern "C" fn(&Object, Sel, id, id),
            );
            declaration.add_method(
                sel!(webView:didFailNavigation:withError:),
                failed as extern "C" fn(&Object, Sel, id, id, id),
            );
            declaration.add_method(
                sel!(webView:didFailProvisionalNavigation:withError:),
                failed as extern "C" fn(&Object, Sel, id, id, id),
            );
            declaration.add_method(
                sel!(webViewWebContentProcessDidTerminate:),
                terminated as extern "C" fn(&Object, Sel, id),
            );
            declaration.add_method(
                sel!(userContentController:didReceiveScriptMessage:),
                received as extern "C" fn(&Object, Sel, id, id),
            );
            declaration.add_method(sel!(dealloc), delegate_dealloc as extern "C" fn(&Object, Sel));
        }
        declaration.register();
    });
    Class::get("RnGpuiWebViewDelegate").expect("registered above")
}

fn user_script(source: &str) -> id {
    // SAFETY: allocates a WKUserScript that the caller adds to a controller, which retains it.
    unsafe {
        let text = ns(source);
        let script: id = msg_send![class!(WKUserScript), alloc];
        // WKUserScriptInjectionTimeAtDocumentStart = 0
        let script: id = msg_send![script, initWithSource: text injectionTime: 0i64 forMainFrameOnly: NO];
        release(text);
        script
    }
}

fn set_bool(object: id, key: &str, value: bool) {
    // SAFETY: key-value coding on a live WebKit object; unknown keys are ignored by the guard.
    unsafe {
        let key = ns(key);
        let number: id = msg_send![class!(NSNumber), numberWithBool: if value { YES } else { NO }];
        let responds: bool = msg_send![object, respondsToSelector: sel!(setValue:forKey:)];
        if responds {
            let _: () = msg_send![object, setValue: number forKey: key];
        }
        release(key);
    }
}

pub fn create(before_content_loaded: &str, messaging: bool, on_event: Callback) -> NativeViewHandle {
    static DELEGATE_KEY: u8 = 0;
    // SAFETY: the view and delegate are created on the main thread; the view's ownership passes to the handle and an associated object keeps the delegate alive as long as the view.
    unsafe {
        let configuration: id = msg_send![class!(WKWebViewConfiguration), new];
        let preferences: id = msg_send![configuration, preferences];
        set_bool(preferences, "allowFileAccessFromFileURLs", true);
        set_bool(preferences, "developerExtrasEnabled", true);
        set_bool(configuration, "allowUniversalAccessFromFileURLs", true);

        let delegate: id = msg_send![delegate_class(), new];
        let callback = Box::into_raw(Box::new(on_event)) as usize;
        (*(delegate as *mut Object)).set_ivar("callback", callback);

        let controller: id = msg_send![configuration, userContentController];
        if messaging {
            let script = user_script(BRIDGE);
            let _: () = msg_send![controller, addUserScript: script];
            release(script);
            let name = ns("ReactNativeWebView");
            let _: () = msg_send![controller, addScriptMessageHandler: delegate name: name];
            release(name);
        }
        if !before_content_loaded.is_empty() {
            let script = user_script(before_content_loaded);
            let _: () = msg_send![controller, addUserScript: script];
            release(script);
        }

        let allocated: id = msg_send![class!(WKWebView), alloc];
        let view: id = msg_send![allocated, initWithFrame: zero_frame() configuration: configuration];
        let _: () = msg_send![view, setNavigationDelegate: delegate];
        let _: () = msg_send![configuration, release];
        const RETAIN_NONATOMIC: usize = 1;
        objc_setAssociatedObject(view, std::ptr::addr_of!(DELEGATE_KEY).cast(), delegate, RETAIN_NONATOMIC);
        let _: () = msg_send![delegate, release];
        let _: () = msg_send![view, setValue: { let number: id = msg_send![class!(NSNumber), numberWithBool: NO]; number } forKey: { ns("drawsBackground") }];
        NativeViewHandle::from_owned_nsview(view as *mut c_void)
    }
}

fn web_view(view: NativeViewHandle) -> id {
    view.as_nsview() as id
}

pub fn state(view: id) -> PageState {
    if view == nil {
        return PageState::default();
    }
    // SAFETY: `view` is the live WKWebView the delegate reports for.
    unsafe {
        let url: id = msg_send![view, URL];
        let absolute: id = if url == nil { nil } else { msg_send![url, absoluteString] };
        let title: id = msg_send![view, title];
        let loading: bool = msg_send![view, isLoading];
        let back: bool = msg_send![view, canGoBack];
        let forward: bool = msg_send![view, canGoForward];
        PageState {
            url: string_of(absolute),
            title: string_of(title),
            loading,
            can_go_back: back,
            can_go_forward: forward,
        }
    }
}

pub fn load(view: NativeViewHandle, source: &Source) {
    let view = web_view(view);
    // SAFETY: `view` is the live WKWebView this module created, used on the main thread.
    unsafe {
        if !source.html.is_empty() {
            let html = ns(&source.html);
            let base = if source.base_url.is_empty() {
                nil
            } else {
                let text = ns(&source.base_url);
                let url: id = msg_send![class!(NSURL), URLWithString: text];
                release(text);
                url
            };
            let _: id = msg_send![view, loadHTMLString: html baseURL: base];
            release(html);
        } else if !source.uri.is_empty() {
            let text = ns(&source.uri);
            let url: id = msg_send![class!(NSURL), URLWithString: text];
            release(text);
            if url == nil {
                return;
            }
            let is_file: bool = msg_send![url, isFileURL];
            if is_file {
                let root: id = msg_send![class!(NSURL), fileURLWithPath: { let slash = ns("/"); let _: () = msg_send![slash, autorelease]; slash }];
                let _: id = msg_send![view, loadFileURL: url allowingReadAccessToURL: root];
            } else {
                let request: id = msg_send![class!(NSURLRequest), requestWithURL: url];
                let _: id = msg_send![view, loadRequest: request];
            }
        }
    }
}

pub fn evaluate(view: id, script: &str) {
    // SAFETY: `view` is a live WKWebView; a nil completion handler is allowed.
    unsafe {
        let text = ns(script);
        let _: () = msg_send![view, evaluateJavaScript: text completionHandler: nil];
        release(text);
    }
}

pub fn run(view: NativeViewHandle, script: &str) {
    evaluate(web_view(view), script);
}

pub fn go_back(view: NativeViewHandle) {
    // SAFETY: `view` is the live WKWebView, used on the main thread.
    unsafe {
        let _: id = msg_send![web_view(view), goBack];
    }
}

pub fn go_forward(view: NativeViewHandle) {
    // SAFETY: as above.
    unsafe {
        let _: id = msg_send![web_view(view), goForward];
    }
}

pub fn reload(view: NativeViewHandle) {
    // SAFETY: as above.
    unsafe {
        let _: id = msg_send![web_view(view), reload];
    }
}

pub fn stop_loading(view: NativeViewHandle) {
    // SAFETY: as above.
    unsafe {
        let _: () = msg_send![web_view(view), stopLoading];
    }
}

pub fn focus(view: NativeViewHandle) {
    // SAFETY: as above.
    unsafe {
        let view = web_view(view);
        let window: id = msg_send![view, window];
        if window != nil {
            let _: bool = msg_send![window, makeFirstResponder: view];
        }
    }
}
