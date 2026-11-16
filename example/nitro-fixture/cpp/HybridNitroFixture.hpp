#pragma once

#include "HybridNitroFixtureSpec.hpp"

namespace margelo::nitro::nitrofixture {

class HybridNitroFixture : public HybridNitroFixtureSpec {
public:
  HybridNitroFixture() : HybridObject(TAG) {}

  double add(double a, double b) override;
  std::string greet(const std::string& name) override;
  std::shared_ptr<Promise<double>> addAsync(double a, double b) override;
  void callBack(const std::string& value, const std::function<void(const std::string&)>& callback) override;
  double sumBytes(const std::shared_ptr<ArrayBuffer>& buffer) override;
};

} // namespace margelo::nitro::nitrofixture
