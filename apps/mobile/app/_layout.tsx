import { Stack } from "expo-router";

import { AppLifecycle } from "@/state/AppLifecycle";
import { useMobileFonts } from "@/theme/fonts";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useMobileFonts();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <AppLifecycle />
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="levels/[level]" options={{ title: "Level" }} />
      <Stack.Screen name="universes/[slug]" options={{ title: "Side Quest" }} />
      <Stack.Screen name="practices/[id]" options={{ title: "Practice" }} />
      <Stack.Screen name="practices/[id]/player" options={{ title: "Player" }} />
      <Stack.Screen name="diagnostics" options={{ title: "Diagnostics" }} />
    </Stack>
    </>
  );
}
