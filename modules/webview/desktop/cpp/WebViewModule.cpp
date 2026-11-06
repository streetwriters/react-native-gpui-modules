#include "WebViewModule.hpp"

#include <RNGpuiWebViewSpec.h>

#include <memory>
#include <string>
#include <utility>

namespace {
namespace jsi = facebook::jsi;
using facebook::react::CallInvoker;
using facebook::react::TurboModule;

class WebViewModule final
    : public facebook::react::NativeRNCWebViewModuleSpec<WebViewModule> {
 public:
  explicit WebViewModule(std::shared_ptr<CallInvoker> jsInvoker)
      : NativeRNCWebViewModuleSpec(std::move(jsInvoker)) {}

  void isFileUploadSupported(rngpui::Promise<bool> promise) {
    promise.resolve(false);
  }

  void shouldStartLoadWithLockIdentifier(bool, double) {}
};
} // namespace

std::shared_ptr<TurboModule> create_web_view_module(
    const std::string& name,
    std::shared_ptr<CallInvoker> jsInvoker) {
  return rngpui::provideTurboModule<WebViewModule>(name, std::move(jsInvoker));
}
