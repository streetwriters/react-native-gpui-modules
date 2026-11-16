// Writes the desktop registration file of one Nitro library: its C++ Hybrid
// Objects, and a host view manager for each Nitro View.
//
// node generate-nitro-desktop.mjs <package-root> <output.cpp> <init-suffix> [--hybrid Name=Impl]... [--view View=Impl]...

import fs from 'node:fs';
import path from 'node:path';

const [packageRoot, output, initSuffix, ...rest] = process.argv.slice(2);
const hybrids = new Map();
const views = [];
for (let i = 0; i < rest.length; i += 2) {
  const [name, impl] = (rest[i + 1] ?? '').split('=');
  if (!name || !impl) {
    throw new Error(`${rest[i]} expects Name=ImplClass`);
  }
  if (rest[i] === '--hybrid') {
    hybrids.set(name, impl);
  } else if (rest[i] === '--view') {
    views.push({ name, impl });
  } else {
    throw new Error(`unknown argument ${rest[i]}`);
  }
}

const nitroJsonPath = path.join(packageRoot, 'nitro.json');
const nitroJson = fs.existsSync(nitroJsonPath)
  ? JSON.parse(fs.readFileSync(nitroJsonPath, 'utf8'))
  : { cxxNamespace: [], autolinking: {} };
const namespace = `margelo::nitro::${nitroJson.cxxNamespace.join('::')}`;

const registrations = new Map();
for (const [name, platforms] of Object.entries(nitroJson.autolinking ?? {})) {
  for (const key of ['all', 'desktop']) {
    const entry = platforms[key];
    if (entry?.language === 'c++') {
      registrations.set(name, entry.implementationClassName);
    }
  }
}
for (const [name, impl] of hybrids) {
  registrations.set(name, impl);
}

const capitalize = text => text[0].toUpperCase() + text.slice(1);

function viewProps(viewName) {
  const header = path.join(
    packageRoot,
    'nitrogen/generated/shared/c++/views',
    `Hybrid${viewName}Component.hpp`,
  );
  const source = fs.readFileSync(header, 'utf8');
  const start = source.indexOf(`class Hybrid${viewName}Props`);
  if (start < 0) {
    throw new Error(`${header}: no Hybrid${viewName}Props class`);
  }
  const body = source.slice(start, source.indexOf('};', start));
  return [...body.matchAll(/^\s*nitro::ReactProp<(.+)>\s+(\w+);\s*$/gmu)].map(
    match => match[2],
  );
}

function viewManager({ name, impl }) {
  const props = `${namespace}::views::Hybrid${name}Props`;
  const spec = `${namespace}::Hybrid${name}Spec`;
  const setters = viewProps(name)
    .map(prop => {
      if (prop === 'hybridRef') {
        return `      if (oldViewProps == nullptr
              ? newViewProps.hybridRef.isProvided()
              : !newViewProps.hybridRef.hasSameValue(oldViewProps->hybridRef)) {
        const auto& maybeFunc = newViewProps.hybridRef.get();
        if (maybeFunc.has_value()) {
          maybeFunc.value()(std::static_pointer_cast<${spec}>(view_));
        }
      }`;
      }
      return `      if (oldViewProps == nullptr
              ? newViewProps.${prop}.isProvided()
              : !newViewProps.${prop}.hasSameValue(oldViewProps->${prop})) {
        view_->set${capitalize(prop)}(newViewProps.${prop}.get());
      }`;
    })
    .join('\n');
  return `class ${name}DesktopHostView final : public rngpui::extension::CppHostView {
 public:
  ${name}DesktopHostView() : view_(std::make_shared<${namespace}::${impl}>()) {}

  void update(
      const std::shared_ptr<const facebook::react::Props>& props,
      const std::shared_ptr<const facebook::react::Props>& oldProps) override {
    didDropView_ = false;
    const auto& newViewProps = *std::static_pointer_cast<const ${props}>(props);
    const auto* oldViewProps = static_cast<const ${props}*>(oldProps.get());
    const bool hasChanges = oldViewProps == nullptr
        ? newViewProps.hasAnyProvidedProps()
        : !newViewProps.hasSameProps(*oldViewProps);
    if (!hasChanges) {
      return;
    }
    view_->beforeUpdate();
${setters}
    view_->afterUpdate();
  }

  rngpui::extension::NativeView createNativeView(
      const rngpui::extension::NativeViewParent& parent) override {
    return view_->createNativeView(parent);
  }

  void unmount() override {
    if (didDropView_) {
      return;
    }
    didDropView_ = true;
    view_->onDropView();
  }

 private:
  std::shared_ptr<${namespace}::${impl}> view_;
  bool didDropView_ = false;
};
`;
}

const includes = new Set();
for (const impl of registrations.values())
  includes.add(`#include "${impl}.hpp"`);
for (const view of views) {
  includes.add(`#include "${view.impl}.hpp"`);
  includes.add(`#include "Hybrid${view.name}Component.hpp"`);
  includes.add(`#include "Hybrid${view.name}Spec.hpp"`);
}

const hybridCalls = [...registrations]
  .map(
    ([name, impl]) => `  HybridObjectRegistry::registerHybridObjectConstructor(
      ${JSON.stringify(name)},
      []() -> std::shared_ptr<HybridObject> {
        return std::make_shared<${namespace}::${impl}>();
      });`,
  )
  .join('\n');

const viewCalls = views
  .map(
    ({ name }) => `  rngpui::extension::registerCppHostComponent({
      ${JSON.stringify(name)},
      ${namespace}::views::Hybrid${name}ShadowNode::Handle(),
      &facebook::react::concreteComponentDescriptorProvider<${namespace}::views::Hybrid${name}ComponentDescriptor>,
      [](int32_t) { return std::make_unique<${name}DesktopHostView>(); }});`,
  )
  .join('\n');

const source = `// Generated by @react-native-gpui/nitro-modules; do not edit.
#include "GPUINitroHybridView.hpp"
#include "GpuiCppHostComponent.h"

#include <NitroModules/HybridObjectRegistry.hpp>
#include <react/renderer/core/ConcreteComponentDescriptor.h>

${[...includes].join('\n')}

namespace {
using margelo::nitro::HybridObject;
using margelo::nitro::HybridObjectRegistry;

${views.map(viewManager).join('\n')}
} // namespace

extern "C" void rn_gpui_nitro_init_${initSuffix}() {
${hybridCalls}
${viewCalls}
}
`;

fs.mkdirSync(path.dirname(output), { recursive: true });
if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== source) {
  fs.writeFileSync(output, source);
}
