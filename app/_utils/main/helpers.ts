import { loginFailure } from "@/app/store/main/slices/authSlice";
import { useWindowDimensions } from "react-native";
import { Platform } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const useHelpers = () => {
  const isMobile =
    useWindowDimensions().width < 768 ? false : Platform.OS !== "web";
  /* Check the currency and display the correct symbol */
  const currencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return "£";
    }
  };

  const limitDescription = (description: string) => {
    if (description.length > 40) {
      return description.substring(0, 40) + "...";
    }
    return description;
  };

  /**
   * Validate the users password by checking if it meets the following criteria:
   * - At least 8 characters long
   * - Contains at least one letter and one number
   * @param password - The password to validate
   * @returns boolean indicating if the password is valid
   */
  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < minLength) {
      return false;
    }
    if (!hasLetter || !hasNumber) {
      return false;
    }
    return true;
  };

  const routeUser = (response: any) => {
    if (response.user.is_seller) {
      router.replace("/seller/main/dashboard/DashboardScreen");
    } else if (response.user.is_user) {
      router.replace("/main/mobile/(tabs)/home/HomeScreen");
    }
  };

  return {
    currencySymbol,
    limitDescription,
    routeUser,
    validatePassword,
  };
};

export default useHelpers;

/**
 * Check if the authenticated user is a seller
 * @param user - The user object from authentication state
 * @returns boolean indicating if user is a seller
 */
export function isUserSeller(user: any): boolean {
  return user && "seller_id" in user;
}

/**
 * Get user type for navigation and UI purposes
 * @param user - The user object from authentication state
 * @returns 'seller' | 'user' | null
 */
export function getUserType(user: any): "seller" | "user" | null {
  if (!user) return null;
  return isUserSeller(user) ? "seller" : "user";
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#10B981";
    case "inprogress":
      return "#F59E0B";
    case "pending":
      return "#3B82F6";
    case "cancelled":
      return "#EF4444"; // Red
    default:
      return "#6B7280"; // Gray
  }
};

export const formatDate = (dateString: string) => {
  if (!dateString || dateString.trim() === "") {
    return "N/A";
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // Check if the date string contains time information
  // This detects patterns like "2023-12-25T10:30:00" or "2023-12-25 10:30:00"
  const hasTime = /[T\s]\d{1,2}:\d{2}/.test(dateString);

  if (hasTime) {
    // Format with both date and time
    return date.toLocaleDateString("en-IE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else {
    // Format with date only
    return date.toLocaleDateString("en-IE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
};

/**
 * Format the currency based on the users country.
 * The method uses the users stored address to determine what country they are in.
 * If the country is not supported, the method will default to EUR.
 *
 * @param amount - The amount to format
 * @param country - The user's country (optional)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string, country?: string) => {
  if (country && country.toLocaleUpperCase() === "united kingdom") {
    if (typeof amount === "string") {
      amount = Number(amount);
    }
    return amount.toLocaleString("en-GB", {
      style: "currency",
      currency: "GBP",
    });
  } else if (country && country.toLocaleUpperCase() === "ireland") {
    return amount.toLocaleString("en-GB", {
      style: "currency",
      currency: "EUR",
    });
  } else {
    return amount.toLocaleString("en-GB", {
      style: "currency",
      currency: "EUR",
    });
  }
};

export const formatDuration = (duration: number) => {
  if (duration < 60) {
    return `${duration}m`;
  } else {
    return `${Math.floor(duration / 60)}h ${duration % 60}m`;
  }
};

export const limitDescription = (description: string) => {
  if (description.length > 50) {
    return description.substring(0, 50) + "...";
  }
  return description;
};

export const saveToStorage = async (
  user?: string,
  access?: string,
  refresh?: string
) => {
  try {
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    await SecureStore.setItemAsync("access", access || "");
    await SecureStore.setItemAsync("refresh", refresh || "");
    console.log("Saved to storage ok");
  } catch (error) {
    console.error("Error saving to storage:", error);
  }
};

export const formatWeight = (weight: number) => {
  if (weight < 1000) {
    return `${weight}g`;
  } else {
    return `${(weight / 1000).toFixed(1)}kg`;
  }
};

export const formatTotalSold = (totalSold: number) => {
  if (totalSold < 1000) {
    return `${totalSold}`;
  } else {
    return `${(totalSold / 1000).toFixed(1)}k`;
  }
};

/**
 * Format deal badge text based on deal type
 */
export const formatDealBadge = (dealType: string, dealInfo?: {
  discount_percentage?: number | null;
  discount_amount?: number | null;
  bogo_buy_quantity?: number;
  bogo_get_quantity?: number;
  bundle_price?: number | null;
  bundle_quantity?: number;
  discount_value?: number;
}): string | null => {
  if (!dealInfo) return null;

  switch (dealType) {
    case "percentage":
      const percent = dealInfo.discount_percentage ?? dealInfo.discount_value;
      return percent ? `${Math.round(percent)}% off` : null;
    
    case "fixed":
      const amount = dealInfo.discount_amount;
      return amount ? `€${amount.toFixed(2)} off` : null;
    
    case "bogo":
      const buyQty = dealInfo.bogo_buy_quantity ?? 1;
      const getQty = dealInfo.bogo_get_quantity ?? 1;
      return `Buy ${buyQty} Get ${getQty}`;
    
    case "bundle":
      const bundlePrice = dealInfo.bundle_price;
      if (bundlePrice) {
        return `Bundle €${bundlePrice.toFixed(2)}`;
      }
      return "Bundle Deal";
    
    case "flash_sale":
      return "Flash Sale";
    
    default:
      return null;
  }
};