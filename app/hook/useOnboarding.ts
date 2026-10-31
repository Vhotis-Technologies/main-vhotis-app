import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import * as SecureStore from "expo-secure-store";
import {
  useRegister_sellerMutation,
  useConfigure_user_storeMutation,
  useRegister_userMutation,
} from "@/app/store/main/api/onboardingApi";
import {
  loadingStart,
  loadingEnd,
  onboardingError,
  setSellerId,
  setOperatingMode,
  setCapConflictSlugs,
  resetRegistrationFormData,
  clearRegistrationFormData,
} from "@/app/store/main/slices/onboardingSlice";
import { RootState, useAppDispatch, useAppSelector } from "@/app/store/store";
import { saveToStorage } from "@/app/_utils/main/helpers";
import { router } from "expo-router";
import { loginSuccess } from "../store/main/slices/authSlice";
import { validateDateOfBirth } from "@/app/_utils/validateDateOfBirth";
import {
  toRegistrationApiBody,
  validateNationalPhoneInput,
} from "@/app/_utils/phoneFormat";
import { usePostAuthDeviceSync } from "@/app/hook/usePostAuthDeviceSync";
import type { SellingPath } from "@/app/interfaces/others/OnboardingInterfaces";

const useOnboarding = () => {
  const dispatch = useAppDispatch();
  const { runPostAuthDeviceSync } = usePostAuthDeviceSync();
  const {
    registrationFormData,
    storeInformationFormData,
    isLoading,
    isError,
    seller_id,
    operatingMode,
    capConflictSlugs,
  } = useAppSelector((state: RootState) => state.onboarding);

  const [registerSeller, { isLoading: isRegistering, error: registerError }] =
    useRegister_sellerMutation();
  const [
    registerUser,
    { isLoading: isRegisteringUser, isSuccess: isRegisterSuccess },
  ] = useRegister_userMutation();
  const [configureStore, { isLoading: isConfiguring }] =
    useConfigure_user_storeMutation();

  const { showSnackbarWithConfig } = useSnackbar();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 3;

  const [confirmPassword, setConfirmPassword] = useState<string>();

  useEffect(() => {
    const restoreDraftFromStorage = async () => {
      try {
        const storedSellerId = await SecureStore.getItemAsync("seller_id");
        const storedMode = await SecureStore.getItemAsync("operating_mode");
        if (storedMode === "fulfillment" || storedMode === "self_fulfill") {
          dispatch(setOperatingMode(storedMode));
        }
        if (storedSellerId && !seller_id) {
          dispatch(setSellerId(storedSellerId));
          setCurrentPage(3);
        } else if (storedMode && !storedSellerId) {
          setCurrentPage(2);
        }
      } catch (error) {
        console.error("Error restoring onboarding draft from storage:", error);
      }
    };

    restoreDraftFromStorage();
  }, [dispatch, seller_id]);

  useEffect(() => {
    if (seller_id && currentPage < 3) {
      setCurrentPage(3);
    }
  }, [seller_id, currentPage]);

  /**
   * The method handle the users registration process.
   * When the user clicks the next button, given the current page the method will send the appropriate data to the server.
   * If the current page is 1, the method will send the user's details to the server.
   * if the current page is 2, the method will send the store/business information to the server.
   * if the current page is 3 the method will handle the helpers which enables the user to verify their identity.
   *
   *
   * The registration result process returns a message and a user_id, which will be used to associate the user with the store.
   *
   */
  const handleSellerOnboarding = useCallback(async () => {
    try {
      switch (currentPage) {
        case 1:
          if (!operatingMode) {
            showSnackbarWithConfig({
              message: "Please choose how you want to sell",
              type: "error",
              duration: 3000,
            });
            return;
          }
          await SecureStore.setItemAsync("operating_mode", operatingMode);
          setCurrentPage(2);
          break;

        case 2:
          if (registrationFormData?.password !== confirmPassword) {
            dispatch(onboardingError(["Passwords do not match"]));
            showSnackbarWithConfig({
              message: "Passwords do not match",
              type: "error",
              duration: 3000,
            });
            return;
          }

          if (
            !registrationFormData ||
            !registrationFormData.email ||
            !registrationFormData.password ||
            !registrationFormData.firstName ||
            !registrationFormData.lastName ||
            !registrationFormData.phone ||
            !registrationFormData.dob
          ) {
            showSnackbarWithConfig({
              message: "Please fill in all required information",
              type: "error",
              duration: 3000,
            });
            return;
          }

          const dobResult = validateDateOfBirth(registrationFormData.dob);
          if (!dobResult.ok) {
            showSnackbarWithConfig({
              message: dobResult.message,
              type: "error",
              duration: 4000,
            });
            return;
          }

          const phoneResult = validateNationalPhoneInput(
            registrationFormData.phone,
            registrationFormData.phoneCountryCode,
          );
          if (!phoneResult.ok) {
            showSnackbarWithConfig({
              message: phoneResult.message,
              type: "error",
              duration: 4000,
            });
            return;
          }

          try {
            dispatch(loadingStart());
            const result = await registerSeller({
              ...toRegistrationApiBody(registrationFormData),
              operatingMode: operatingMode ?? "self_fulfill",
            }).unwrap();
            if (result?.seller_id) {
              showSnackbarWithConfig({
                message: result.message,
                type: "success",
                duration: 3000,
              });
              dispatch(setSellerId(result.seller_id));
              await SecureStore.setItemAsync("seller_id", result.seller_id);
              dispatch(loadingEnd());
              setCurrentPage(3);
            }
          } catch (error: any) {
            const message = error?.data?.error ?? "Registration failed";
            dispatch(loadingEnd());
            showSnackbarWithConfig({ message, type: "error", duration: 3000 });
          }
          break;

        case 3: {
          if (!seller_id) {
            showSnackbarWithConfig({
              message: "User ID not found. Please complete registration first.",
              type: "error",
              duration: 3000,
            });
            return;
          }

          if (!storeInformationFormData?.businessName?.trim()) {
            showSnackbarWithConfig({
              message: "Business name is required",
              type: "error",
              duration: 3000,
            });
            return;
          }
          if (!storeInformationFormData?.businessDescription?.trim()) {
            showSnackbarWithConfig({
              message: "Business description is required",
              type: "error",
              duration: 3000,
            });
            return;
          }

          const isFulfillment = operatingMode === "fulfillment";
          if (
            !isFulfillment &&
            (!storeInformationFormData.useExistingAddress ||
              (storeInformationFormData.useExistingAddress === "yes" &&
                (!storeInformationFormData.businessAddress ||
                  !storeInformationFormData.businessCity ||
                  !storeInformationFormData.businessPostcode ||
                  !storeInformationFormData.businessCountry)))
          ) {
            showSnackbarWithConfig({
              message: "Please complete your business and shop details",
              type: "error",
              duration: 3000,
            });
            return;
          }

          dispatch(loadingStart());
          dispatch(setCapConflictSlugs([]));
          const storePayload = {
            ...storeInformationFormData,
            seller_id,
            operatingMode: operatingMode ?? "self_fulfill",
            marketVerticalSlugs:
              storeInformationFormData.marketVerticalSlugs ?? [],
            useExistingAddress: isFulfillment
              ? "no"
              : storeInformationFormData.useExistingAddress,
          };
          try {
            const store_result = await configureStore(storePayload).unwrap();
            await saveToStorage(
              store_result.user,
              store_result.access,
              store_result.refresh,
            );

            if (
              store_result?.user &&
              store_result.refresh &&
              store_result.access
            ) {
              await SecureStore.deleteItemAsync("seller_id");
              await SecureStore.deleteItemAsync("operating_mode");

              showSnackbarWithConfig({
                message: "Onboarding completed successfully!",
                type: "success",
                duration: 3000,
              });

              if (operatingMode === "fulfillment") {
                router.replace(
                  "/seller/main/store/fufillment/FulfillmentOnboardingScreen",
                );
              } else {
                router.replace("/seller/main/dashboard/DashboardScreen");
              }
            }
          } catch (error: any) {
            const message = error?.data?.error ?? "Registration failed";
            if (
              error?.data?.code === "vertical_cap_reached" &&
              error?.data?.verticals
            ) {
              dispatch(setCapConflictSlugs(error.data.verticals));
            }
            dispatch(loadingEnd());
            showSnackbarWithConfig({ message, type: "error", duration: 3000 });
          }
          break;
        }

        default:
          if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
          }
          break;
      }
    } catch (error: any) {
      dispatch(loadingEnd());
      const errorMessage =
        error?.data?.message ?? error?.data?.error ?? "Registration failed";
      showSnackbarWithConfig({
        message: errorMessage,
        type: "error",
        duration: 3000,
      });
    }
  }, [
    registrationFormData,
    confirmPassword,
    seller_id,
    operatingMode,
    storeInformationFormData,
    currentPage,
    totalPages,
    dispatch,
    showSnackbarWithConfig,
    registerSeller,
    configureStore,
  ]);

  /**
   * Handle the back button to take the user back to the previous page.
   * Check if the user already has an ongoing registration process.and prefill the form with the registrationData from store.
   */
  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  /* The methods here on are for the creation of the  */

  /**
   * Method is used for proper and advanced navigations between components and steps in the screen.
   * Send the user data to the server when the user gets to the last step.
   * Connect the
   */
  const handleUserOnboarding = useCallback(async () => {
    // Check the logininformation to ensure the user has entered all the required details.
    // Using the switch statement to manage each steps
    switch (currentStep) {
      case 1: {
        if (
          !registrationFormData?.firstName ||
          !registrationFormData?.lastName ||
          !registrationFormData?.email ||
          !registrationFormData?.phone ||
          !registrationFormData?.ethnicity
        ) {
          showSnackbarWithConfig({
            message: "Please fill in all required fields",
            type: "error",
            duration: 3000,
          });
          break;
        }

        const dobResult = validateDateOfBirth(registrationFormData.dob);
        if (!dobResult.ok) {
          showSnackbarWithConfig({
            message: dobResult.message,
            type: "error",
            duration: 4000,
          });
          break;
        }

        const phoneResult = validateNationalPhoneInput(
          registrationFormData.phone,
          registrationFormData.phoneCountryCode,
        );
        if (!phoneResult.ok) {
          showSnackbarWithConfig({
            message: phoneResult.message,
            type: "error",
            duration: 4000,
          });
          break;
        }

        setCurrentStep((prev) => prev + 1);
        break;
      }
      case 2:
        if (
          registrationFormData?.address1 &&
          registrationFormData?.city &&
          registrationFormData?.country &&
          registrationFormData?.postcode
        ) {
          setCurrentStep((prev) => prev + 1);
        } else {
          showSnackbarWithConfig({
            message: "Please fill in all fields not marked as optional",
            type: "error",
            duration: 3000,
          });
        }
        break;

      case 3:
        if (!registrationFormData?.password) {
          showSnackbarWithConfig({
            message: "Please enter a password",
            type: "error",
            duration: 3000,
          });
          return;
        }
        try {
          const result = await registerUser(
            toRegistrationApiBody(registrationFormData),
          ).unwrap();
          if (result && result.user && result.access && result.refresh) {
            await saveToStorage(result.user, result.access, result.refresh);
            dispatch(
              loginSuccess({
                user: result.user,
                access: result.access,
                refresh: result.refresh,
              }),
            );
            void runPostAuthDeviceSync();
          }
          // Clear the registration form data and route to the home screen
          dispatch(clearRegistrationFormData());
          router.replace("/main/mobile/(tabs)/home/HomeScreen");
        } catch (error: any) {
          let errorMessage = "";
          if (error?.data?.message) {
            errorMessage = error?.data?.message;
          } else if (error?.data?.error) {
            errorMessage = error?.data?.error;
          } else {
            errorMessage = "Registration failed";
          }
          dispatch(loadingEnd());
          showSnackbarWithConfig({
            message: errorMessage,
            type: "error",
            duration: 3000,
          });
        }
        break;
    }
  }, [
    currentStep,
    registrationFormData,
    registerUser,
    showSnackbarWithConfig,
    dispatch,
    runPostAuthDeviceSync,
  ]);

  return {
    registrationFormData,
    resetRegistrationFormData: () => {
      dispatch(resetRegistrationFormData());
    },
    handleNext: handleSellerOnboarding,
    handleBack,
    currentPage,
    totalPages,
    operatingMode,
    setOperatingMode: (mode: SellingPath) => {
      dispatch(setOperatingMode(mode));
      void SecureStore.setItemAsync("operating_mode", mode);
    },
    capConflictSlugs,
    isRegistering: isLoading || isRegistering || isConfiguring,
    confirmPassword,
    setConfirmPassword,
    currentStep,
    setCurrentStep,
    totalSteps,
    isLoading,
    isRegisteringUser,
    isRegisterSuccess,
    handleUserOnboarding,
  };
};

export default useOnboarding;
