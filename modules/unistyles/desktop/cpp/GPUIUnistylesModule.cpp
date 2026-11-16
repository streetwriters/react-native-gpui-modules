#include "HybridNativePlatformDesktop.hpp"

#include "HybridShadowRegistry.h"
#include "HybridStyleSheet.h"
#include "HybridUnistylesRuntime.h"
#include "UnistylesRegistry.h"

#include <NitroModules/HybridObjectRegistry.hpp>
#include <ReactCommon/TurboModule.h>
#include <ReactCommon/TurboModuleWithJSIBindings.h>

#include <cstdint>
#include <functional>
#include <memory>
#include <string>

namespace {
using namespace margelo::nitro;

class UnistylesModule final : public facebook::react::TurboModule,
                              public facebook::react::TurboModuleWithJSIBindings {
public:
  explicit UnistylesModule(std::shared_ptr<facebook::react::CallInvoker> jsInvoker)
      : TurboModule("Unistyles", jsInvoker), callInvoker_(std::move(jsInvoker)) {}

  ~UnistylesModule() override {
    if (generation_ != 0) {
      core::UnistylesRegistry::get().releaseOwnership(generation_);
    }
  }

private:
  // Runs on first init and on every reload; the newest runtime owns the
  // registry and a previous runtime's state is kept until it releases it.
  void installJSIBindingsWithRuntime(facebook::jsi::Runtime&) override {
    generation_ = core::UnistylesRegistry::get().takeOwnership();

    if (HybridObjectRegistry::hasHybridObject("UnistylesRuntime")) {
      HybridObjectRegistry::unregisterHybridObjectConstructor("UnistylesRuntime");
      HybridObjectRegistry::unregisterHybridObjectConstructor("UnistylesStyleSheet");
      HybridObjectRegistry::unregisterHybridObjectConstructor("UnistylesShadowRegistry");
    }

    auto callInvoker = callInvoker_;
    auto runOnJSThread = [callInvoker](std::function<void(facebook::jsi::Runtime&)>&& callback) {
      callInvoker->invokeAsync(std::move(callback));
    };

    auto nativePlatform = std::make_shared<unistyles::HybridNativePlatformDesktop>();
    unistyles::HybridNativePlatformDesktop::makeCurrent(nativePlatform);
    auto unistylesRuntime = std::make_shared<HybridUnistylesRuntime>(nativePlatform, runOnJSThread, generation_);
    auto styleSheet = std::make_shared<HybridStyleSheet>(unistylesRuntime);

    HybridObjectRegistry::registerHybridObjectConstructor(
        "UnistylesRuntime", [unistylesRuntime]() -> std::shared_ptr<HybridObject> { return unistylesRuntime; });
    HybridObjectRegistry::registerHybridObjectConstructor(
        "UnistylesStyleSheet", [styleSheet]() -> std::shared_ptr<HybridObject> { return styleSheet; });
    HybridObjectRegistry::registerHybridObjectConstructor(
        "UnistylesShadowRegistry", [unistylesRuntime]() -> std::shared_ptr<HybridObject> {
          return std::make_shared<HybridShadowRegistry>(unistylesRuntime);
        });
  }

  std::shared_ptr<facebook::react::CallInvoker> callInvoker_;
  uint64_t generation_ = 0;
};
} // namespace

extern "C" void rn_gpui_unistyles_init() {
  margelo::nitro::unistyles::HybridNativePlatformDesktop::installObservers();
}

std::shared_ptr<facebook::react::TurboModule> create_gpui_unistyles_module(
    const std::string& name,
    std::shared_ptr<facebook::react::CallInvoker> jsInvoker) {
  if (name != "Unistyles") {
    return nullptr;
  }
  return std::make_shared<UnistylesModule>(std::move(jsInvoker));
}
