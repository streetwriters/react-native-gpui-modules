#include "HybridMMKVPlatformContextDesktop.hpp"

#include <cstdlib>
#include <filesystem>
#include <stdexcept>
#include <string>
#include <system_error>

#if defined(_WIN32)
#include <windows.h>
#elif defined(__APPLE__)
#include <mach-o/dyld.h>
#else
#include <unistd.h>
#endif

namespace margelo::nitro::mmkv {

namespace {

namespace fs = std::filesystem;

std::string envValue(const char* name) {
  const char* value = std::getenv(name);
  return value ? value : "";
}

std::string sanitize(const std::string& id) {
  std::string out;
  for (char c : id) {
    switch (c) {
    case '/': case '\\': case ':': case '*': case '?': case '"': case '<': case '>': case '|': case '\0':
      out.push_back('-');
      break;
    default:
      out.push_back(c);
    }
  }
  const auto first = out.find_first_not_of(".-");
  if (first == std::string::npos) {
    return {};
  }
  return out.substr(first, out.find_last_not_of(".-") - first + 1);
}

fs::path executablePath() {
#if defined(_WIN32)
  wchar_t buffer[MAX_PATH];
  const DWORD length = GetModuleFileNameW(nullptr, buffer, MAX_PATH);
  return length ? fs::path(std::wstring(buffer, length)) : fs::path();
#elif defined(__APPLE__)
  uint32_t size = 0;
  _NSGetExecutablePath(nullptr, &size);
  std::string buffer(size, '\0');
  if (_NSGetExecutablePath(buffer.data(), &size) != 0) {
    return {};
  }
  return fs::path(buffer.c_str());
#else
  std::error_code error;
  return fs::read_symlink("/proc/self/exe", error);
#endif
}

fs::path platformDataDirectory() {
#if defined(_WIN32)
  const std::string appData = envValue("APPDATA");
  return appData.empty() ? fs::path() : fs::path(appData);
#elif defined(__APPLE__)
  const std::string home = envValue("HOME");
  return home.empty() ? fs::path() : fs::path(home) / "Library" / "Application Support";
#else
  const std::string xdg = envValue("XDG_DATA_HOME");
  if (!xdg.empty()) {
    return fs::path(xdg);
  }
  const std::string home = envValue("HOME");
  return home.empty() ? fs::path() : fs::path(home) / ".local" / "share";
#endif
}

// Mirrors the application data folder the other desktop modules use.
fs::path appDataDirectory() {
  std::string id = sanitize(envValue("RN_GPUI_APP_ID"));
  if (id.empty()) {
    id = sanitize(executablePath().stem().string());
  }
  if (id.empty()) {
    id = "rn-gpui-app";
  }
  const std::string root = envValue("RN_GPUI_APP_DATA_DIR");
  if (!root.empty()) {
    return fs::path(root) / id;
  }
  const fs::path base = platformDataDirectory();
  if (base.empty()) {
    return fs::temp_directory_path() / id;
  }
  return base / id;
}

} // namespace

std::string HybridMMKVPlatformContextDesktop::getBaseDirectory() {
  const fs::path directory = appDataDirectory() / "mmkv";
  std::error_code error;
  fs::create_directories(directory, error);
  if (error) {
    throw std::runtime_error("Could not create the MMKV directory " + directory.string() + ": " + error.message());
  }
  return directory.string();
}

std::optional<std::string> HybridMMKVPlatformContextDesktop::getAppGroupDirectory() {
  return std::nullopt;
}

} // namespace margelo::nitro::mmkv
