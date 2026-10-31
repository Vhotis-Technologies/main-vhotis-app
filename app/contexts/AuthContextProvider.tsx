import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AuthContextInterface from "../interfaces/others/AuthContextInterface";
import {
  GuestUser,
  Seller,
  SigninFormData,
  User,
  canAccessSellerApp,
} from "../interfaces/main/Authentication";
import { useAppDispatch, useAppSelector, store } from "@/app/store/store";
import { useUpdateStoreStateMutation } from "@/app/store/seller/api/storeApi";
import {
  useCreateGuestUserMutation,
  useGoogleLoginMutation,
  useLoginMutation,
} from "@/app/store/main/api/authenticationApi";
import { usePostAuthDeviceSync } from "@/app/hook/usePostAuthDeviceSync";
import { useAlertContext } from "./AlertContext";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  getGoogleSignInDeveloperSetupMessage,
  GoogleSignInCancelledError,
  signInWithGoogle,
} from "@/app/_utils/GoogleAuthServices";

import {
  loginFailure,
  loginEnd,
  loginStart,
  loginSuccess,
  guestUserSuccess,
  updateLoginFormData,
  logout,
  setAuthReady,
} from "../store/main/slices/authSlice";
import { useSnackbar } from "./SnackbarContext";
import { saveToStorage } from "@/app/_utils/main/helpers";
import * as Linking from "expo-linking";
import { isShareDeepLink } from "@/app/_utils/main/shareNavigation";

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { showSnackbarWithConfig } = useSnackbar();
  const dispatch = useAppDispatch();
  const { loginFormData, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );
  const [login] = useLoginMutation();
  const [googleLoginMutation] = useGoogleLoginMutation();
  const { runPostAuthDeviceSync } = usePostAuthDeviceSync();
  const { setAlertConfig, setIsVisible } = useAlertContext();

  const [rememberMe, setRememberMe] = useState(false);

  const [
    createGuestUser,
    { error: createGuestUserError, isLoading: isCreatingGuestUser },
  ] = useCreateGuestUserMutation();

  const [updateStoreState] = useUpdateStoreStateMutation();

  /**
   * Send device information to the server after successful authentication
   * This is called separately from the login process to avoid sending device data
   * during the initial authentication request
   */
  const sendDeviceInfoToServer = useCallback(async () => {
    await runPostAuthDeviceSync();
  }, [runPostAuthDeviceSync]);

  /**
   * First check if the user is authenticated when the page mounts.
   * if they are, update the redux store with the user data.Set the isAuthenticated state to true.
   * if they are not, set the isAuthenticated state to false.
   *
   * TODO: Enable user biometrics authentication. for sellers.
   * @returns
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        const openedFromShareLink = isShareDeepLink(initialUrl);

        const user = await SecureStore.getItemAsync("user");
        const storedAccess = await SecureStore.getItemAsync("access");
        const storedRefresh = await SecureStore.getItemAsync("refresh");
        // Check if the user is authenticated.
        if (user && storedAccess && storedRefresh) {
          dispatch(
            loginSuccess({
              user: JSON.parse(user),
              access: storedAccess,
              refresh: storedRefresh,
            }),
          );
          // Deep links are handled by +native-intent / share redirect — do not
          // override with the default home route on cold start.
          if (!openedFromShareLink) {
            const userData = JSON.parse(user);
            if (canAccessSellerApp(userData)) {
              router.replace("/seller/main/dashboard/DashboardScreen");
            } else if (userData.is_user) {
              router.replace("/main/mobile/(tabs)/home/HomeScreen");
            } else if (userData.is_guest) {
              router.replace("/main/mobile/(tabs)/home/HomeScreen");
            }
          }
        } else {
          dispatch(
            loginFailure(
              "You have been logged out, please reauthenticate to continue",
            ),
          );
        }
      } finally {
        dispatch(setAuthReady(true));
      }
    };
    fetchData();
  }, [!isAuthenticated]);

  /**
   * Handle the users login state. this method will take the users email and password, and send it to the server.
   * If the login is successful, the user will be redirected to the appropriate page based on their role.
   * If the login is unsuccessful, the user will be alerted with an error message.
   * @returns
   */
  const onLogin = useCallback(async () => {
    if (!loginFormData?.email || !loginFormData?.password) {
      dispatch(loginFailure("Please fill in all required fields"));
      return;
    }
    dispatch(loginStart()); // Start the loading state.
    try {
      const response = await login(loginFormData).unwrap();
      // Route the user to the appropriate page based on the user's role.
      if (response.user || response.access || response.refresh) {
        if (rememberMe) {
          await saveToStorage(response.user, response.access, response.refresh);
        }
        dispatch(
          loginSuccess({
            user: response.user,
            access: response.access,
            refresh: response.refresh,
          }),
        );

        // Send device info to server after successful authentication
        // This is done asynchronously and doesn't block the login flow
        sendDeviceInfoToServer();

        if (canAccessSellerApp(response.user as Seller)) {
          router.replace("/seller/main/dashboard/DashboardScreen");
        } else if (response.user.is_user) {
          router.replace("/main/mobile/(tabs)/home/HomeScreen");
        } else if (response.user.is_guest) {
          router.replace("/main/mobile/(tabs)/home/HomeScreen");
        }
      }
    } catch (error: any) {
      let errorMessage = "";
      if (error?.data?.message) {
        errorMessage = error?.data?.message;
      } else if (error?.data?.error) {
        errorMessage = error?.data?.error;
      } else {
        errorMessage =
          "Authentication failed. Please check your data and try again";
      }
      showSnackbarWithConfig({
        message: errorMessage,
        type: "error",
        duration: 3000,
      });
    } finally {
      dispatch(loginEnd());
    }
  }, [
    loginFormData,
    login,
    dispatch,
    showSnackbarWithConfig,
    rememberMe,
    sendDeviceInfoToServer,
  ]);

  const onGoogleLogin = useCallback(async () => {
    if (Platform.OS === "web") {
      showSnackbarWithConfig({
        message: "Google sign-in is available in the iOS or Android app.",
        type: "info",
        duration: 4000,
      });
      return;
    }
    dispatch(loginStart());
    try {
      const { idToken } = await signInWithGoogle();
      const response = await googleLoginMutation({
        id_token: idToken,
      }).unwrap();
      if (response.user && response.access && response.refresh) {
        if (rememberMe) {
          await saveToStorage(
            response.user as never,
            response.access,
            response.refresh,
          );
        }
        dispatch(
          loginSuccess({
            user: response.user,
            access: response.access,
            refresh: response.refresh,
          }),
        );
        sendDeviceInfoToServer();
        const u = response.user as User;
        if (canAccessSellerApp(u)) {
          router.replace("/seller/main/dashboard/DashboardScreen");
        } else if (u.is_user) {
          router.replace("/main/mobile/(tabs)/home/HomeScreen");
        }
      }
    } catch (error: unknown) {
      if (error instanceof GoogleSignInCancelledError) {
        return;
      }
      const setupMsg = getGoogleSignInDeveloperSetupMessage(error);
      const err = error as {
        data?: { message?: string; error?: string };
        message?: string;
      };
      let errorMessage = "";
      const body = err?.data;
      if (setupMsg) {
        errorMessage = setupMsg;
      } else if (body?.message) {
        errorMessage = body.message;
      } else if (body?.error) {
        errorMessage = String(body.error);
      } else if (typeof err?.message === "string") {
        errorMessage = err.message;
      } else {
        errorMessage = "Google sign-in failed. Please try again.";
      }
      showSnackbarWithConfig({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });
    } finally {
      dispatch(loginEnd());
    }
  }, [
    dispatch,
    googleLoginMutation,
    rememberMe,
    sendDeviceInfoToServer,
    showSnackbarWithConfig,
  ]);

  /* Handle the users logout functionality */
  const handleLogout = useCallback(
    async (from_main_page?: boolean) => {
      let message = "";
      if (from_main_page && from_main_page === true) {
        message =
          "Clicking continue will log you out and take you to the next step in the seller onboarding process.\n\nDo you wish to continue?";
      } else {
        message = "Are you sure you want to logout?";
      }
      setAlertConfig({
        title: "Logout",
        message: message,
        type: "success",
        isVisible: true,
        onConfirm: async () => {
          try {
            const user = store.getState().auth.user as Seller | null;
            if (user?.is_seller) {
              try {
                await updateStoreState({ store_status: "closed" }).unwrap();
              } catch (closeErr) {
                console.warn(
                  "Could not set store to closed on logout (continuing)",
                  closeErr,
                );
              }
            }

            await SecureStore.deleteItemAsync("user");
            await SecureStore.deleteItemAsync("access");
            await SecureStore.deleteItemAsync("refresh");
            await SecureStore.deleteItemAsync("seller_id");
            await SecureStore.deleteItemAsync("store_id");

            // Clear Redux state for both auth and seller slices
            dispatch(logout());

            // Navigate to signin page
            if (from_main_page && from_main_page === true) {
              router.replace("/onboarding/seller/SellerLandingPage");
            } else {
              router.replace("/onboarding/main/Signin");
            }
          } catch (error) {
            console.error("Error during logout:", error);
            // Even if storage clearing fails, still logout from Redux and navigate
            dispatch(logout());
            router.replace("/onboarding/main/Signin");
          }
        },
        onClose: () => {
          setIsVisible(false);
        },
      });
    },
    [
      dispatch,
      showSnackbarWithConfig,
      setAlertConfig,
      setIsVisible,
      updateStoreState,
    ],
  );

  /**
   * Call the method to create a guest user.
   * If the guest user is created successfully, the user will be redirected to the appropriate page based on their role.
   * If the guest user is not created successfully, the user will be alerted with an error message.
   * @returns
   */
  const onGuestLogin = async () => {
    try {
      const response = await createGuestUser({}).unwrap();

      // Check if the guest user is created successfully. and then set the state
      if (response.user.is_guest) {
        dispatch(guestUserSuccess(response.user));

        // Send device info to server for guest users too
        // Note: Guest users might not have access tokens, so we'll handle this differently
        // For now, we'll skip device info for guest users
        // sendDeviceInfoToServer(response.access);

        router.replace("/main/mobile/(tabs)/home/HomeScreen");
      }
    } catch (error) {
      console.error("Error creating guest user:", error);
    }
  };

  const value: AuthContextInterface = {
    onLogin,
    onGoogleLogin,
    onGuestLogin,
    isCreatingGuestUser,
    handleLogout,
    rememberMe,
    setRememberMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthContextProvider",
    );
  }
  return context;
};

export default AuthContextProvider;
