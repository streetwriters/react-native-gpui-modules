#pragma once

// react-native-mmkv expects Apple's namespaced MMKV; the portable core used on
// desktop declares its types globally, so they are aliased into `mmkv`.
#include <MMKV/MMKV.h>

namespace mmkv {
using MMKV = ::MMKV;
using MMKVMode = ::MMKVMode;
using MMKVLogLevel = ::MMKVLogLevel;

constexpr auto MMKVLogDebug = ::MMKVLogDebug;
constexpr auto MMKVLogInfo = ::MMKVLogInfo;
constexpr auto MMKVLogWarning = ::MMKVLogWarning;
constexpr auto MMKVLogError = ::MMKVLogError;
constexpr auto MMKVLogNone = ::MMKVLogNone;

constexpr auto MMKV_SINGLE_PROCESS = ::MMKV_SINGLE_PROCESS;
constexpr auto MMKV_MULTI_PROCESS = ::MMKV_MULTI_PROCESS;
constexpr auto MMKV_READ_ONLY = ::MMKVMode::MMKV_READ_ONLY;
} // namespace mmkv
