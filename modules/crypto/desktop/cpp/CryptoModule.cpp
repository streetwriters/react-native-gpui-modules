#include "CryptoModule.hpp"

#include <RNGpuiCryptoSpec.h>

#include <algorithm>
#include <cstddef>
#include <cstdint>
#include <cstdio>
#include <memory>
#include <stdexcept>
#include <string>
#include <utility>

#if defined(_WIN32)
#include <windows.h>
#include <bcrypt.h>
#else
#include <sys/random.h>
#include <unistd.h>
#endif

namespace {
namespace jsi = facebook::jsi;
using facebook::react::CallInvoker;
using facebook::react::TurboModule;

constexpr size_t kMaxRandomBytes = 65536;

void fillRandom(uint8_t* data, size_t length) {
#if defined(_WIN32)
  if (BCryptGenRandom(nullptr, data, static_cast<ULONG>(length), BCRYPT_USE_SYSTEM_PREFERRED_RNG) != 0) {
    throw std::runtime_error("BCryptGenRandom failed");
  }
#else
  for (size_t offset = 0; offset < length; offset += 256) {
    const size_t chunk = std::min<size_t>(256, length - offset);
    if (getentropy(data + offset, chunk) != 0) {
      throw std::runtime_error("getentropy failed");
    }
  }
#endif
}

bool isIntegerView(const std::string& name) {
  static const char* const names[] = {
      "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array",
      "Uint16Array", "Int32Array", "Uint32Array", "BigInt64Array", "BigUint64Array"};
  return std::any_of(std::begin(names), std::end(names), [&](const char* n) { return name == n; });
}

jsi::Value getRandomValues(jsi::Runtime& rt, const jsi::Value* args, size_t count) {
  if (count < 1 || !args[0].isObject()) {
    throw jsi::JSError(rt, "TypeError: getRandomValues expects an integer typed array");
  }
  jsi::Object view = args[0].asObject(rt);
  jsi::Value constructor = view.getProperty(rt, "constructor");
  std::string name;
  if (constructor.isObject()) {
    jsi::Value n = constructor.asObject(rt).getProperty(rt, "name");
    if (n.isString()) name = n.asString(rt).utf8(rt);
  }
  jsi::Value bufferValue = view.getProperty(rt, "buffer");
  if (!isIntegerView(name) || !bufferValue.isObject()) {
    throw jsi::JSError(rt, "TypeMismatchError: getRandomValues expects an integer typed array");
  }
  const size_t byteLength = static_cast<size_t>(view.getProperty(rt, "byteLength").asNumber());
  const size_t byteOffset = static_cast<size_t>(view.getProperty(rt, "byteOffset").asNumber());
  if (byteLength > kMaxRandomBytes) {
    throw jsi::JSError(rt, "QuotaExceededError: getRandomValues can fill at most 65536 bytes");
  }
  jsi::ArrayBuffer buffer = bufferValue.asObject(rt).getArrayBuffer(rt);
  fillRandom(buffer.data(rt) + byteOffset, byteLength);
  return jsi::Value(rt, args[0]);
}

std::string randomUUID() {
  uint8_t b[16];
  fillRandom(b, sizeof(b));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  char out[37];
  std::snprintf(
      out, sizeof(out), "%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x",
      b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8], b[9], b[10], b[11], b[12], b[13],
      b[14], b[15]);
  return out;
}

class CryptoModule final : public facebook::react::NativeCryptoSpec<CryptoModule> {
 public:
  explicit CryptoModule(std::shared_ptr<CallInvoker> jsInvoker)
      : NativeCryptoSpec(std::move(jsInvoker)) {}

  bool install(jsi::Runtime& rt) {
    jsi::Object global = rt.global();
    jsi::Value existing = global.getProperty(rt, "crypto");
    jsi::Object crypto = existing.isObject() ? existing.asObject(rt) : jsi::Object(rt);

    crypto.setProperty(
        rt, "getRandomValues",
        jsi::Function::createFromHostFunction(
            rt, jsi::PropNameID::forAscii(rt, "getRandomValues"), 1,
            [](jsi::Runtime& r, const jsi::Value&, const jsi::Value* args, size_t count) {
              return getRandomValues(r, args, count);
            }));
    crypto.setProperty(
        rt, "randomUUID",
        jsi::Function::createFromHostFunction(
            rt, jsi::PropNameID::forAscii(rt, "randomUUID"), 0,
            [](jsi::Runtime& r, const jsi::Value&, const jsi::Value*, size_t) {
              return jsi::String::createFromUtf8(r, randomUUID());
            }));
    global.setProperty(rt, "crypto", crypto);
    return true;
  }
};
} // namespace

std::shared_ptr<TurboModule> create_crypto_module(
    const std::string& name,
    std::shared_ptr<CallInvoker> jsInvoker) {
  return rngpui::provideTurboModule<CryptoModule>(name, std::move(jsInvoker));
}
