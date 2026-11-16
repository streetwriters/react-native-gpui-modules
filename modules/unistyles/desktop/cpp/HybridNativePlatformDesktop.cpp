#include "HybridNativePlatformDesktop.hpp"

#include "GpuiModules.h"
#include "Dimensions.hpp"
#include "Insets.hpp"
#include "rn-gpui-sys/src/lib.rs.h"

#include <react/coremodules/DeviceInfoModule.h>

namespace margelo::nitro::unistyles {

namespace {
std::mutex currentMutex;
std::weak_ptr<HybridNativePlatformDesktop> currentPlatform;

std::shared_ptr<HybridNativePlatformDesktop> current() {
  std::lock_guard<std::mutex> lock(currentMutex);
  return currentPlatform.lock();
}

bool sameDimensions(const Dimensions& a, const Dimensions& b) {
  return a.width == b.width && a.height == b.height;
}

bool sameInsets(const Insets& a, const Insets& b) {
  return a.top == b.top && a.bottom == b.bottom && a.left == b.left && a.right == b.right && a.ime == b.ime;
}

std::vector<UnistyleDependency> diff(const UnistylesNativeMiniRuntime& lhs, const UnistylesNativeMiniRuntime& rhs) {
  std::vector<UnistyleDependency> dependencies;
  if (lhs.colorScheme != rhs.colorScheme) {
    dependencies.push_back(UnistyleDependency::COLORSCHEME);
  }
  if (!sameDimensions(lhs.screen, rhs.screen)) {
    dependencies.push_back(UnistyleDependency::DIMENSIONS);
  }
  if (lhs.screen.width != rhs.screen.width) {
    dependencies.push_back(UnistyleDependency::BREAKPOINTS);
  }
  if (lhs.isPortrait != rhs.isPortrait) {
    dependencies.push_back(UnistyleDependency::ORIENTATION);
  }
  if (lhs.contentSizeCategory != rhs.contentSizeCategory) {
    dependencies.push_back(UnistyleDependency::CONTENTSIZECATEGORY);
  }
  if (!sameInsets(lhs.insets, rhs.insets)) {
    dependencies.push_back(UnistyleDependency::INSETS);
  }
  if (lhs.pixelRatio != rhs.pixelRatio) {
    dependencies.push_back(UnistyleDependency::PIXELRATIO);
  }
  if (lhs.fontScale != rhs.fontScale) {
    dependencies.push_back(UnistyleDependency::FONTSCALE);
  }
  if (lhs.rtl != rhs.rtl) {
    dependencies.push_back(UnistyleDependency::RTL);
  }
  return dependencies;
}

void notifyCurrent() {
  if (auto platform = current()) {
    platform->onPlatformChangeFromHost();
  }
}
} // namespace

HybridNativePlatformDesktop::HybridNativePlatformDesktop() : HybridObject(TAG) {
  miniRuntime_ = buildMiniRuntime();
}

HybridNativePlatformDesktop::~HybridNativePlatformDesktop() = default;

void HybridNativePlatformDesktop::installObservers() {
  static std::once_flag once;
  std::call_once(once, [] {
    rngpui::registerColorSchemeObserver([](const std::string&) { notifyCurrent(); });
    rngpui::registerWindowMetricsObserver([] { notifyCurrent(); });
    rngpui::registerWindowInsetsObserver([](float, float, float, float) { notifyCurrent(); });
  });
}

void HybridNativePlatformDesktop::makeCurrent(const std::shared_ptr<HybridNativePlatformDesktop>& platform) {
  std::lock_guard<std::mutex> lock(currentMutex);
  currentPlatform = platform;
}

Insets HybridNativePlatformDesktop::getInsets() {
  float top = 0, right = 0, bottom = 0, left = 0;
  rngpui::currentWindowInsets(top, right, bottom, left);
  return Insets(top, bottom, left, right, 0);
}

ColorScheme HybridNativePlatformDesktop::getColorScheme() {
  return rngpui::currentColorScheme() == "dark" ? ColorScheme::DARK : ColorScheme::LIGHT;
}

double HybridNativePlatformDesktop::getFontScale() {
  return facebook::react::DeviceInfoModule::fontScale();
}

double HybridNativePlatformDesktop::getPixelRatio() {
  return rngpui::windowScale();
}

Orientation HybridNativePlatformDesktop::getOrientation() {
  const auto size = facebook::react::DeviceInfoModule::windowSize();
  return size.width > size.height ? Orientation::LANDSCAPE : Orientation::PORTRAIT;
}

std::string HybridNativePlatformDesktop::getContentSizeCategory() {
  const auto scale = getFontScale();
  if (scale <= 0.82) return "xSmall";
  if (scale <= 0.9) return "Small";
  if (scale <= 1.0) return "Medium";
  if (scale <= 1.1) return "Large";
  if (scale <= 1.2) return "xLarge";
  if (scale <= 1.3) return "xxLarge";
  return "xxxLarge";
}

Dimensions HybridNativePlatformDesktop::getScreenDimensions() {
  const auto size = facebook::react::DeviceInfoModule::windowSize();
  return Dimensions(size.width, size.height);
}

Dimensions HybridNativePlatformDesktop::getStatusBarDimensions() {
  return Dimensions(0, 0);
}

Dimensions HybridNativePlatformDesktop::getNavigationBarDimensions() {
  return Dimensions(0, 0);
}

bool HybridNativePlatformDesktop::getPrefersRtlDirection() {
  return rngpui::rn_gpui_layout_direction_rtl();
}

void HybridNativePlatformDesktop::setRootViewBackgroundColor(double) {}

void HybridNativePlatformDesktop::setNavigationBarHidden(bool) {}

void HybridNativePlatformDesktop::setStatusBarHidden(bool) {}

void HybridNativePlatformDesktop::setImmersiveMode(bool) {}

UnistylesNativeMiniRuntime HybridNativePlatformDesktop::getMiniRuntime() {
  std::lock_guard<std::mutex> lock(mutex_);
  return miniRuntime_;
}

UnistylesNativeMiniRuntime HybridNativePlatformDesktop::buildMiniRuntime() {
  const auto orientation = getOrientation();
  return UnistylesNativeMiniRuntime(
      getColorScheme(),
      getScreenDimensions(),
      getContentSizeCategory(),
      getInsets(),
      getPixelRatio(),
      getFontScale(),
      getPrefersRtlDirection(),
      getStatusBarDimensions(),
      getNavigationBarDimensions(),
      orientation == Orientation::PORTRAIT,
      orientation == Orientation::LANDSCAPE);
}

void HybridNativePlatformDesktop::registerPlatformListener(const DependencyListener& callback) {
  std::lock_guard<std::mutex> lock(mutex_);
  dependencyListeners_.push_back(callback);
}

void HybridNativePlatformDesktop::registerImeListener(const ImeListener& callback) {
  std::lock_guard<std::mutex> lock(mutex_);
  imeListeners_.push_back(callback);
}

void HybridNativePlatformDesktop::unregisterPlatformListeners() {
  std::lock_guard<std::mutex> lock(mutex_);
  dependencyListeners_.clear();
  imeListeners_.clear();
}

void HybridNativePlatformDesktop::onPlatformChangeFromHost() {
  auto next = buildMiniRuntime();
  std::vector<UnistyleDependency> changed;
  std::vector<DependencyListener> listeners;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    changed = diff(miniRuntime_, next);
    if (changed.empty()) {
      return;
    }
    miniRuntime_ = next;
    listeners = dependencyListeners_;
  }
  for (const auto& listener : listeners) {
    listener(changed, next);
  }
}

} // namespace margelo::nitro::unistyles
