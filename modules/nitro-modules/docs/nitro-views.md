# Adding desktop support to a Nitro library

A Nitro library supports desktop through a `desktop` folder with a CMake file, a `cpp: true` entry in `react-native.config.js` for each view, and C++ implementations of its Hybrid Objects and views. Desktop builds everything through the app's single C++ target, so nothing is built as a separate library.

## react-native.config.js

```js
module.exports = {
  dependency: {
    platforms: {
      desktop: {
        cmake: 'desktop',
        hostComponents: [{ name: 'MyView', nativeSurface: true, cpp: true }],
      },
    },
  },
};
```

`name` is the view's Fabric component name, the string in `Hybrid<Name>ComponentName` in the generated `HybridMyViewComponent.cpp` (the key of the view in `nitro.json`'s `autolinking`, or the spec's type name). A library without views omits `hostComponents`.

## desktop/CMakeLists.txt

```cmake
find_program(_node node REQUIRED)
execute_process(
  COMMAND "${_node}" -e "process.stdout.write(require.resolve('@react-native-gpui/nitro-modules/package.json', {paths: [process.argv[1]]}))" "${RN_GPUI_PROJECT_ROOT}"
  OUTPUT_VARIABLE _nitro_adapter_json OUTPUT_STRIP_TRAILING_WHITESPACE)
get_filename_component(_nitro_adapter "${_nitro_adapter_json}" DIRECTORY)
include("${_nitro_adapter}/desktop/NitroDesktop.cmake")

rn_gpui_nitro_library(
  PACKAGE my-nitro-library
  SOURCES "${CMAKE_CURRENT_LIST_DIR}/../cpp/HybridMath.cpp" "${CMAKE_CURRENT_LIST_DIR}/../cpp/HybridMyView.cpp"
  INCLUDE_DIRS "${CMAKE_CURRENT_LIST_DIR}/../cpp"
  VIEWS "MyView=HybridMyView")
```

`rn_gpui_nitro_library` takes:

- `PACKAGE`: the library's npm name. Its `nitro.json` (optional; without it nothing is autolinked) and `nitrogen/generated/shared/c++` are used; run `nitrogen` before building.
- `SOURCES`, `INCLUDE_DIRS`: the library's own C++, compiled into the app.
- `HYBRIDS`: `Name=ImplClass` pairs for Hybrid Objects that `nitro.json` does not autolink in C++. Every `autolinking` entry whose `all` or `desktop` language is `c++` is registered without being listed.
- `VIEWS`: `ViewName=ImplClass` pairs. Each view is hosted as a C++ host component, and the generated registration reads the props of `Hybrid<ViewName>Component.hpp` to forward them to the implementation.

Headers of `react-native-nitro-modules` are available as `<NitroModules/...>`.

## The view class

The implementation inherits its generated spec and `HybridDesktopView`:

```cpp
#include "HybridMyViewSpec.hpp"
#include <NitroModules/GPUINitroHybridView.hpp>

namespace margelo::nitro::mylib {
class HybridMyView : public HybridMyViewSpec, public gpui::HybridDesktopView {
public:
  void setColor(const std::string& color) override { color_ = color; }
  void afterUpdate() override { /* apply color_ */ }
  rngpui::extension::NativeView createNativeView(const rngpui::extension::NativeViewParent& parent) override;
  void onDropView() override {}
};
}
```

The host calls on the main thread:

- the generated `set<Prop>` for each prop that changed, between `beforeUpdate()` and `afterUpdate()`;
- `createNativeView(parent)` once, when the node is first painted. Return an `NSView` (+1 retained) on macOS, a child window or a composited view elsewhere; see [C++ host components](https://streetwriters.github.io/react-native-gpui/docs/native-views#c-host-components);
- `onDropView()` when the node unmounts.

Methods of the view's `HybridView` spec run on the thread JavaScript calls them from, so a method that touches the native view hops to the main thread.
