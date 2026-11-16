#include "HybridNitroFixtureView.hpp"

#ifdef __APPLE__
#include "NitroFixtureViewMac.h"
#endif

namespace margelo::nitro::nitrofixture {

std::string HybridNitroFixtureView::getColor() {
  std::lock_guard<std::mutex> lock(mutex_);
  return color_;
}

void HybridNitroFixtureView::setColor(const std::string& color) {
  std::lock_guard<std::mutex> lock(mutex_);
  color_ = color;
}

std::string HybridNitroFixtureView::getLabel() {
  std::lock_guard<std::mutex> lock(mutex_);
  return label_;
}

void HybridNitroFixtureView::setLabel(const std::string& label) {
  std::lock_guard<std::mutex> lock(mutex_);
  label_ = label;
}

std::string HybridNitroFixtureView::getAppliedColor() {
  std::lock_guard<std::mutex> lock(mutex_);
  return appliedColor_;
}

double HybridNitroFixtureView::getUpdateCount() {
  return updateCount_.load();
}

bool HybridNitroFixtureView::isNativeViewCreated() {
  return nativeViewCreated_.load();
}

void HybridNitroFixtureView::afterUpdate() {
  std::string color;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    appliedColor_ = color_;
    color = color_;
  }
  updateCount_.fetch_add(1);
#ifdef __APPLE__
  if (nsView_ != nullptr) {
    nitroFixtureFillView(nsView_, color.c_str());
  }
#endif
}

rngpui::extension::NativeView HybridNitroFixtureView::createNativeView(const rngpui::extension::NativeViewParent&) {
  rngpui::extension::NativeView view;
#ifdef __APPLE__
  nsView_ = nitroFixtureCreateView(getColor().c_str());
  view.kind = rngpui::extension::NativeView::Kind::NSView;
  view.nsView = nsView_;
#endif
  nativeViewCreated_.store(true);
  return view;
}

void HybridNitroFixtureView::onDropView() {
  nsView_ = nullptr;
}

} // namespace margelo::nitro::nitrofixture
