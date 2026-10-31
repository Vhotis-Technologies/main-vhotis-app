import { useGetStoreFrontQuery } from "@/app/store/main/api/storeFrontApi";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { useAlertContext } from "@/app/contexts/AlertContext";
import FinancialAccessCodeModal from "@/app/component/seller/main/store/finance/FinancialAccessCodeModal";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { useLazyCheckWalletCodeStatusQuery } from "@/app/store/seller/api/financeApi";
import { useAppSelector } from "@/app/store/store";
import { Seller, isStoreAdminUser } from "@/app/interfaces/main/Authentication";

const getErrorMessage = (error: unknown, fallback: string) => {
  const responseError = error as {
    data?: { error?: string; message?: string };
    error?: string;
  };

  return (
    responseError?.data?.error ||
    responseError?.data?.message ||
    responseError?.error ||
    fallback
  );
};
/**
 * Custom hook for fetching store front data
 * @param storeId - The ID of the store to fetch
 * @returns Object containing store data, loading state, error, and refetch function
 */
const useStoreFront = (storeId: string | undefined) => {
  /* Import the alert modal to trigger alerts */
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const { showCenterModal, closeAllModals } = useModalService();
  const user = useAppSelector((s) => s.auth.user) as Seller | null;
  const isStoreAdmin = isStoreAdminUser(user);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useGetStoreFrontQuery(storeId || "", {
    skip: !storeId,
  });

  const [
    triggerCheckWalletCodeStatus,
    { isFetching: isCheckingFinancialAccess },
  ] = useLazyCheckWalletCodeStatusQuery();

  /**
   * The method is used to trigger a call when clicked
   * @returns void
   * @param phone - The ID of the store to fetch
   */
  const triggerPhoneCall = useCallback(async (phone: string) => {
    try {
      const supported = await Linking.canOpenURL(
        `tel:${phone.replace(/[^0-9]/g, "")}`
      );
      if (supported) {
        await Linking.openURL(`tel:${phone}`);
      } else {
        setAlertConfig({
          title: "Error",
          message: "Phone number is not supported",
          type: "error",
          isVisible: true,
          onConfirm: () => {
            setIsVisible(false);
          },
        });
      }
    } catch (error) {
      console.error("Error triggering store front:", error);
    }
  }, [setAlertConfig, setIsVisible]);


  const checkWalletCodeStatus = useCallback(
    async (): Promise<string | undefined> => {
      try {
        const response = await triggerCheckWalletCodeStatus().unwrap();
        return response.status;
      } catch (error) {
        console.error("Error checking wallet code status:", error);
      }
    },
    [triggerCheckWalletCodeStatus]
  );

  const navigateToFinancialAnalytics = useCallback(() => {
    closeAllModals();
    router.push("/seller/main/store/finance/FinanceScreen");
  }, [closeAllModals]);

  /* Before the financial analytics screen is opened, we need to check if the seller has a wallet code set up.
   * If the seller does not have a wallet code set up, we need to show a modal to set up a wallet code.
   * If the seller has a wallet code set up, we need to show a modal to verify the wallet code.
   * If the wallet code is verified, we can navigate to the financial analytics screen.
   * If the wallet code is not verified, we need to show an error modal.
   */
  const openFinancialAnalytics = useCallback(async () => {
    if (isStoreAdmin) {
      setAlertConfig({
        title: "Not available",
        message: "Store admins cannot access business finance.",
        type: "error",
        isVisible: true,
        onConfirm: () => {
          setIsVisible(false);
        },
      });
      return;
    }

    if (isCheckingFinancialAccess) {
      return;
    }

    try {
      const response = await triggerCheckWalletCodeStatus().unwrap();
      const mode = response.has_wallet_code ? "verify" : "setup";

      showCenterModal(
        React.createElement(FinancialAccessCodeModal, {
          mode,
          onSuccess: navigateToFinancialAnalytics,
        }),
        response.has_wallet_code
          ? "Verify financial access"
          : "Set up financial access"
      );
    } catch (error) {
      setAlertConfig({
        title: "Could not open analytics",
        message: getErrorMessage(
          error,
          "We could not check your finance code status. Please try again."
        ),
        type: "error",
        isVisible: true,
        onConfirm: () => {
          setIsVisible(false);
        },
      });
    }
  }, [
    isCheckingFinancialAccess,
    isStoreAdmin,
    navigateToFinancialAnalytics,
    setAlertConfig,
    setIsVisible,
    showCenterModal,
    triggerCheckWalletCodeStatus,
  ]);

  return {
    storeData: response?.data || null,
    isLoading,
    error,
    refetch,
    triggerPhoneCall,
    checkWalletCodeStatus,
    openFinancialAnalytics,
    isCheckingFinancialAccess,
  };
};

export default useStoreFront;
