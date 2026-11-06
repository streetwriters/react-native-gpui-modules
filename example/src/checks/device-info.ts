import {
  getBrand,
  getBuildNumber,
  getModel,
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
      "is not a tablet",
      () => {
        assert(isTablet() === false, "isTablet is true");
      }
    ]
  ]
};

export default deviceInfo;
