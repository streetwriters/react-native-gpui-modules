#pragma once

#include "HybridNativePlatformSpec.hpp"

#include <functional>
#include <memory>
#include <mutex>
#include <vector>

namespace margelo::nitro::unistyles {

using DependencyListener = std::function<void(const std::vector<UnistyleDependency>&, const UnistylesNativeMiniRuntime&)>;
using ImeListener = std::function<void(const UnistylesNativeMiniRuntime&)>;

class HybridNativePlatformDesktop final : public HybridNativePlatformSpec {
public:
  HybridNativePlatformDesktop();
  ~HybridNativePlatformDesktop() override;

  // Routes the host's change notifications to the newest instance.
  static void installObservers();
  static void makeCurrent(const std::shared_ptr<HybridNativePlatformDesktop>& platform);
  void onPlatformChangeFromHost();

  Insets getInsets() override;
  ColorScheme getColorScheme() override;
  double getFontScale() override;
  double getPixelRatio() override;
  Orientation getOrientation() override;
  std::string getContentSizeCategory() override;
  Dimensions getScreenDimensions() override;
  Dimensions getStatusBarDimensions() override;
  Dimensions getNavigationBarDimensions() override;
  bool getPrefersRtlDirection() override;
  void setRootViewBackgroundColor(double color) override;
  void setNavigationBarHidden(bool isHidden) override;
  void setStatusBarHidden(bool isHidden) override;
  void setImmersiveMode(bool isEnabled) override;
  UnistylesNativeMiniRuntime getMiniRuntime() override;
  void registerPlatformListener(const DependencyListener& callback) override;
  void registerImeListener(const ImeListener& callback) override;
  void unregisterPlatformListeners() override;

private:
  UnistylesNativeMiniRuntime buildMiniRuntime();

  std::mutex mutex_;
  UnistylesNativeMiniRuntime miniRuntime_;
  std::vector<DependencyListener> dependencyListeners_;
  std::vector<ImeListener> imeListeners_;
};

} // namespace margelo::nitro::unistyles
