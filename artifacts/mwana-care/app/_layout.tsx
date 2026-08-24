import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MwanaProvider, useMwana } from "@/context/MwanaContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { profile } = useMwana();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure context is loaded
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return null;

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
        // Redirect to onboarding if profile doesn't exist or onboarding not completed
        redirect={!profile?.onboardingCompleted}
      />
      <Stack.Screen 
        name="onboarding" 
        options={{ headerShown: false }}
        redirect={profile?.onboardingCompleted ? "(tabs)" : undefined}
      />
      <Stack.Screen name="lesson/[id]" options={{ title: "Lesson" }} />
      <Stack.Screen name="practice/[id]" options={{ title: "Practice" }} />
      <Stack.Screen name="coach" options={{ title: "MWANA Coach" }} />
      <Stack.Screen name="admin" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="low-tech" options={{ title: "Low-Tech Demo" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <MwanaProvider>
            <RootLayoutNav />
          </MwanaProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
