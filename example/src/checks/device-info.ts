import {
  getApplicationName,
  getBrand,
  getBuildNumber,
  getBundleId,
  getModel,
  getReadableVersion,
  getSystemVersion,
  getVersion,
  isTablet
} from "react-native-device-info";
import type { ModuleChecks } from "./types";

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const deviceInfo: ModuleChecks = {
  name: "device-info",
  checks: [
    [
      "returns the model and brand",
      () => {
        assert(typeof getModel() === "string" && getModel() !== "unknown", `model is ${getModel()}`);
        assert(getBrand() !== "unknown", `brand is ${getBrand()}`);
      }
    ],
    [
      "returns the system version",
      () => {
        assert(/^\d+/.test(getSystemVersion()), `version is ${getSystemVersion()}`);
      }
    ],
    [
      "returns the app version and build number",
      () => {
        assert(getVersion() !== "unknown", "version unknown");
        assert(getBuildNumber() !== "unknown", "build number unknown");
      }
    ],
    [
      "returns the application name, bundle id and readable version",
      () => {
        assert(getApplicationName() !== "unknown" && getApplicationName() !== "", `name is ${getApplicationName()}`);
        assert(getBundleId() !== "unknown" && getBundleId() !== "", `bundle id is ${getBundleId()}`);
        assert(
          getReadableVersion() === `${getVersion()}.${getBuildNumber()}`,
          `readable version is ${getReadableVersion()}`
        );
      }
    ],
    [
      "returns the values the native module reports",
      () => {
        assert(getVersion() === "0.0.0" || /^\d+\.\d+/.test(getVersion()), `version is ${getVersion()}`);
        assert(/^\d+$/.test(getBuildNumber()), `build number is ${getBuildNumber()}`);
        assert(getBrand() === "Apple", `brand is ${getBrand()}`);
      }
    ],
    [
      "is not a tablet",
      () => {
        assert(isTablet() === false, "isTablet is true");
      }
    ]
  ]
};

export default deviceInfo;
