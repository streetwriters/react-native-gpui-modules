#pragma once

#include "HybridNitroFixtureViewSpec.hpp"
#include <NitroModules/GPUINitroHybridView.hpp>

#include <atomic>
#include <mutex>
#include <string>

namespace margelo::nitro::nitrofixture {

class HybridNitroFixtureView : public HybridNitroFixtureViewSpec, public gpui::HybridDesktopView {
public:
  HybridNitroFixtureView() : HybridObject(TAG) {}

  std::string getColor() override;
  void setColor(const std::string& color) override;
  std::string getLabel() override;
  void setLabel(const std::string& label) override;

  std::string getAppliedColor() override;
  double getUpdateCount() override;
  bool isNativeViewCreated() override;

  void afterUpdate() override;
  rngpui::extension::NativeView createNativeView(const rngpui::extension::NativeViewParent& parent) override;
  void onDropView() override;

private:
  std::mutex mutex_;
  std::string color_;
  std::string label_;
  std::string appliedColor_;
  std::atomic<int> updateCount_{0};
  std::atomic<bool> nativeViewCreated_{false};
  void* nsView_ = nullptr;
};

} // namespace margelo::nitro::nitrofixture
