// Force-included into the Nitro sources this adapter compiles. Nitro and the
// libraries built on it rely on standard headers that Apple's and Android's
// libc++ include transitively and libstdc++ does not.
#pragma once

#ifdef __cplusplus
#include <algorithm>
#include <cstdint>
#include <functional>
#include <memory>
#include <mutex>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <variant>
#include <vector>
#endif
