import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import WidthProvider from "./contexts/WidthProvider";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { SafeAreaView, StatusBar } from "react-native";
import { store } from "./store/store";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ThemeProvider, { useThemeContext } from "./contexts/ThemeProvider";
import AlertContext, { AlertProvider } from "./contexts/AlertContext";
import AuthContextProvider from "./contexts/AuthContextProvider";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import ExpoStripeProvider from "./contexts/ExpoStripeProvider";
import ShareLinkHandler from "./component/helpers/ShareLinkHandler";
import ModalServiceProvider from "./contexts/ModalServiceProvider";

export default function RootLayout() {
  const [loaded, setLoaded] = React.useState(false);
  const { currentTheme } = useThemeContext();
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PaperProvider>
          <ThemeProvider>
            <WidthProvider>
              <SnackbarProvider>
                <AlertProvider>
                  <ExpoStripeProvider>
                    <AuthContextProvider>
                      <KeyboardProvider preload={false}>
                        <ModalServiceProvider>
                          <GestureHandlerRootView style={{ flex: 1 }}>
                            <ShareLinkHandler />
                            <StatusBar
                              barStyle={
                                currentTheme === "dark"
                                  ? "light-content"
                                  : "dark-content"
                              }
                            />
                            <Stack screenOptions={{ headerShown: false }}>
                              <Stack.Screen
                                name="index"
                                options={{ headerShown: false }}
                              />
                              <Stack.Screen
                                name="onboarding"
                                options={{ headerShown: false }}
                              />
                              <Stack.Screen
                                name="seller"
                                options={{ headerShown: false }}
                              />
                              <Stack.Screen
                                name="main"
                                options={{ headerShown: false }}
                              />
                              <Stack.Screen
                                name="share"
                                options={{ headerShown: false }}
                              />
                            </Stack>
                          </GestureHandlerRootView>
                        </ModalServiceProvider>
                      </KeyboardProvider>
                    </AuthContextProvider>
                  </ExpoStripeProvider>
                </AlertProvider>
              </SnackbarProvider>
            </WidthProvider>
          </ThemeProvider>
        </PaperProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
