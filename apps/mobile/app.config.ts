import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "The User Manual",
  slug: "the-user-manual",
  scheme: "usermanual",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  ios: {
    bundleIdentifier: "com.onewiththesun.usermanual",
    supportsTablet: true,
  },
  android: {
    package: "com.onewiththesun.usermanual",
  },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_USER_MANUAL_API_BASE_URL ?? "https://tutorial.yogawithethan.com",
    islandsAuthorizeUrl:
      process.env.EXPO_PUBLIC_ISLANDS_AUTHORIZE_URL ?? "https://islands.bio/auth/authorize",
    islandsClientId: process.env.EXPO_PUBLIC_ISLANDS_CLIENT_ID ?? "tutorial-mobile",
  },
};

export default config;
