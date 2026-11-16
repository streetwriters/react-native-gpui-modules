#include "Dispatcher.hpp"
#include "GpuiTurboModule.h"
#include "NitroLogger.hpp"
#include "ThreadUtils.hpp"

#include <glog/logging.h>

#include <functional>
#include <memory>
#include <sstream>
#include <string>
#include <thread>

#if defined(_WIN32)
#include <windows.h>
#else
#include <pthread.h>
#endif

#include "rn-gpui-sys/src/lib.rs.h"

namespace margelo::nitro {

namespace {
class UIThreadDispatcher final : public Dispatcher {
public:
  void runAsync(std::function<void()>&& function) override {
    rngpui::dispatchMain(std::move(function));
  }

  void runSync(std::function<void()>&& function) override {
    if (rngpui::rn_gpui_is_main_thread()) {
      function();
      return;
    }
    throw std::runtime_error("UIThreadDispatcher::runSync() is not implemented off the UI thread");
  }
};
} // namespace

std::string ThreadUtils::getThreadName() {
#if defined(_WIN32)
  PWSTR description = nullptr;
  if (SUCCEEDED(GetThreadDescription(GetCurrentThread(), &description)) && description != nullptr) {
    std::wstring wide(description);
    LocalFree(description);
    if (!wide.empty()) {
      const int size = WideCharToMultiByte(CP_UTF8, 0, wide.c_str(), -1, nullptr, 0, nullptr, nullptr);
      std::string name(size > 0 ? size - 1 : 0, '\0');
      if (size > 1) {
        WideCharToMultiByte(CP_UTF8, 0, wide.c_str(), -1, name.data(), size, nullptr, nullptr);
      }
      return name;
    }
  }
#else
  char name[64] = {};
  if (pthread_getname_np(pthread_self(), name, sizeof(name)) == 0 && name[0] != '\0') {
    return std::string(name);
  }
#endif
  std::stringstream stream;
  stream << std::this_thread::get_id();
  return std::string("Thread #") + stream.str();
}

void ThreadUtils::setThreadName(const std::string& name) {
#if defined(_WIN32)
  const int size = MultiByteToWideChar(CP_UTF8, 0, name.c_str(), -1, nullptr, 0);
  if (size > 0) {
    std::wstring wide(size - 1, L'\0');
    MultiByteToWideChar(CP_UTF8, 0, name.c_str(), -1, wide.data(), size);
    SetThreadDescription(GetCurrentThread(), wide.c_str());
  }
#elif defined(__APPLE__)
  pthread_setname_np(name.c_str());
#else
  pthread_setname_np(pthread_self(), name.substr(0, 15).c_str());
#endif
}

bool ThreadUtils::isUIThread() {
  return rngpui::rn_gpui_is_main_thread();
}

std::shared_ptr<Dispatcher> ThreadUtils::createUIThreadDispatcher() {
  return std::make_shared<UIThreadDispatcher>();
}

void Logger::nativeLog(LogLevel level, const char* tag, const std::string& message) {
  switch (level) {
    case LogLevel::Debug:
    case LogLevel::Info:
      LOG(INFO) << "[" << tag << "] " << message;
      break;
    case LogLevel::Warning:
      LOG(WARNING) << "[" << tag << "] " << message;
      break;
    case LogLevel::Error:
      LOG(ERROR) << "[" << tag << "] " << message;
      break;
  }
}

} // namespace margelo::nitro
