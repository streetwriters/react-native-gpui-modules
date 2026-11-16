#include "CallInvokerDispatcher.hpp"
#include "InstallNitro.hpp"

#include <ReactCommon/TurboModule.h>

#include <exception>
#include <memory>
#include <string>

namespace {
using facebook::jsi::Runtime;
using facebook::jsi::Value;

class NitroModules final : public facebook::react::TurboModule {
public:
  explicit NitroModules(std::shared_ptr<facebook::react::CallInvoker> jsInvoker)
      : TurboModule("NitroModules", std::move(jsInvoker)) {
    methodMap_["install"] = MethodMetadata{0, &NitroModules::install};
  }

private:
  static Value install(Runtime& runtime, facebook::react::TurboModule& turboModule, const Value*, size_t) {
    auto& self = static_cast<NitroModules&>(turboModule);
    try {
      margelo::nitro::install(runtime, std::make_shared<margelo::nitro::CallInvokerDispatcher>(self.jsInvoker_));
      return Value::undefined();
    } catch (const std::exception& error) {
      return facebook::jsi::String::createFromUtf8(runtime, error.what());
    }
  }
};
} // namespace

std::shared_ptr<facebook::react::TurboModule> create_gpui_nitro_modules(
    const std::string& name,
    std::shared_ptr<facebook::react::CallInvoker> jsInvoker) {
  if (name != "NitroModules") {
    return nullptr;
  }
  return std::make_shared<NitroModules>(std::move(jsInvoker));
}
