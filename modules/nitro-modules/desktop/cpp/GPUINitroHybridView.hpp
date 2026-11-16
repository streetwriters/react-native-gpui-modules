#pragma once

#include "GpuiCppHostComponent.h"

namespace margelo::nitro::gpui {

/// The desktop half of a Nitro View, mixed into the library's view class beside
/// its generated `Hybrid<Name>Spec`. The host calls these on the main thread,
/// as the iOS view calls the `HybridView` lifecycle hooks.
class HybridDesktopView {
public:
  virtual ~HybridDesktopView() = default;
  /// Before a batch of prop setters.
  virtual void beforeUpdate() {}
  /// After a batch of prop setters.
  virtual void afterUpdate() {}
  /// Once, when the node is first painted.
  virtual rngpui::extension::NativeView createNativeView(const rngpui::extension::NativeViewParent& parent) {
    return {};
  }
  /// When the node unmounts.
  virtual void onDropView() {}
};

} // namespace margelo::nitro::gpui
