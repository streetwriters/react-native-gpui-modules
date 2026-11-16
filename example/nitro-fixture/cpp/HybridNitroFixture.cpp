#include "HybridNitroFixture.hpp"

#include <thread>

namespace margelo::nitro::nitrofixture {

double HybridNitroFixture::add(double a, double b) {
  return a + b;
}

std::string HybridNitroFixture::greet(const std::string& name) {
  return "hello " + name;
}

std::shared_ptr<Promise<double>> HybridNitroFixture::addAsync(double a, double b) {
  return Promise<double>::async([a, b]() { return a + b; });
}

void HybridNitroFixture::callBack(const std::string& value, const std::function<void(const std::string&)>& callback) {
  std::thread([value, callback]() { callback("called " + value); }).detach();
}

double HybridNitroFixture::sumBytes(const std::shared_ptr<ArrayBuffer>& buffer) {
  double sum = 0;
  for (size_t i = 0; i < buffer->size(); ++i) {
    sum += buffer->data()[i];
  }
  return sum;
}

} // namespace margelo::nitro::nitrofixture
