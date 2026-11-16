#pragma once

#include "HybridMMKVPlatformContextSpec.hpp"

namespace margelo::nitro::mmkv {

class HybridMMKVPlatformContextDesktop final : public HybridMMKVPlatformContextSpec {
public:
  HybridMMKVPlatformContextDesktop() : HybridObject(TAG) {}

  std::string getBaseDirectory() override;
  std::optional<std::string> getAppGroupDirectory() override;
};

} // namespace margelo::nitro::mmkv
