import { useState, useEffect } from "react";
import {
  useCreateAdminMutation,
  useListAdminsQuery,
  useRemoveAdminMutation,
  CreateAdminRequest,
  RemoveAdminRequest,
} from "@/app/store/seller/api/sellerAdminApi";
import { router } from "expo-router";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import { useGetSellerStoresQuery } from "@/app/store/seller/api/storeApi";
import { useAppSelector } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";

/**
 * Interface for admin form data structure
 * Contains all fields required for creating a new store admin
 */
export interface AdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

/**
 * Custom hook for managing seller admin operations
 *
 * This hook provides comprehensive functionality for:
 * - Creating new store admins with form validation
 * - Listing all admins associated with the seller's stores
 * - Removing admins from store associations
 * - Managing form state and validation for admin creation
 *
 * @returns {Object} An object containing:
 * - Form state: formData, errors, updateField, resetForm
 * - Validation: validateForm
 * - Submission: handleSubmitAdminForm
 * - Admin management: admins, adminsCount, createAdmin, removeAdmin
 * - Loading states: isLoadingAdmins, isCreatingAdmin, isRemovingAdmin
 * - Errors: adminsError
 * - Utilities: refetchAdmins
 *
 * @example
 * ```tsx
 * const {
 *   formData,
 *   errors,
 *   updateField,
 *   handleSubmitAdminForm,
 *   admins,
 *   removeAdmin
 * } = useSellerAdmin();
 * ```
 */
const useSellerAdmin = () => {
  const { showSnackbarWithConfig } = useSnackbar();

  // Form state management
  const [formData, setFormData] = useState<AdminFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Partial<AdminFormData>>({});
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const user = useAppSelector((state) => state.auth.user) as Seller | null;
  const { data: storesData, isLoading: isLoadingStores } =
    useGetSellerStoresQuery();
  const sellerStores = storesData?.stores ?? [];
  const planLimits = storesData?.limits;

  useEffect(() => {
    if (!sellerStores.length) {
      return;
    }
    setSelectedStoreId((current) => current ?? sellerStores[0]?.id ?? null);
  }, [sellerStores]);

  // API hooks
  const {
    data: adminsData,
    isLoading: isLoadingAdmins,
    error: adminsError,
    refetch: refetchAdmins,
  } = useListAdminsQuery();

  const [createAdminMutation, { isLoading: isCreatingAdmin }] =
    useCreateAdminMutation();
  const [removeAdminMutation, { isLoading: isRemovingAdmin }] =
    useRemoveAdminMutation();

  const adminsCount = adminsData?.count || 0;
  const assignedStoreIds = new Set(
    (adminsData?.admins ?? []).flatMap((admin) =>
      admin.store_id
        ? [admin.store_id]
        : (admin.stores ?? []).map((store) => store.id),
    ),
  );
  const storesAvailableForAdmin = sellerStores.filter(
    (store) => !assignedStoreIds.has(store.id),
  );
  const canAddAdmin =
    (planLimits?.can_add_admin ?? user?.allows_seller_admins === true) &&
    (planLimits?.max_admins == null || adminsCount < planLimits.max_admins) &&
    storesAvailableForAdmin.length > 0;

  /**
   * Updates a specific field in the form data and clears any associated error
   *
   * @param {keyof AdminFormData} field - The field name to update
   * @param {string} value - The new value for the field
   *
   * @example
   * ```tsx
   * updateField("email", "admin@example.com");
   * ```
   */
  const updateField = (field: keyof AdminFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Resets the form data and errors to their initial empty state
   * Useful after successful form submission or when canceling form entry
   *
   * @example
   * ```tsx
   * resetForm();
   * ```
   */
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    });
    setErrors({});
  };

  /**
   * Validates the admin creation form data
   *
   * Performs comprehensive validation on all form fields:
   * - First name: Required, must not be empty
   * - Last name: Required, must not be empty
   * - Email: Required, must be a valid email format
   * - Password: Required, minimum 8 characters, must contain letters and numbers
   * - Confirm Password: Required, must match the password field
   * - Phone: Required, must not be empty
   *
   * @returns {boolean} True if all validations pass, false otherwise
   *
   * @example
   * ```tsx
   * const isValid = validateForm();
   * if (isValid) {
   *   // Proceed with submission
   * }
   * ```
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<AdminFormData> = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (
      !/[a-zA-Z]/.test(formData.password) ||
      !/\d/.test(formData.password)
    ) {
      newErrors.password = "Password must contain letters and numbers";
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!selectedStoreId) {
      showSnackbarWithConfig({
        message: "Select a store location for this admin",
        type: "error",
        duration: 3000,
      });
      return false;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showSnackbarWithConfig({
        message: "Please fix the highlighted fields below.",
        type: "error",
        duration: 3500,
      });
    }
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the submission of the admin creation form
   *
   * This method:
   * 1. Validates the form data
   * 2. Creates the admin via API if validation passes
   * 3. Resets the form on success
   * 4. Navigates back after a short delay to show success message
   * 5. Refetches the admin list to update the UI
   *
   * @returns {Promise<void>} Promise that resolves when submission is complete
   *
   * @example
   * ```tsx
   * <StyledButton
   *   title="Create Admin"
   *   onPress={handleSubmitAdminForm}
   *   loading={isCreatingAdmin}
   * />
   * ```
   */
  const handleSubmitAdminForm = async (): Promise<void> => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Create admin via API
    const result = await handleCreateAdmin({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone.trim(),
      storeId: selectedStoreId,
    });

    if (result.success) {
      resetForm();
      setTimeout(() => {
        router.back();
      }, 800);
    }
  };

  /**
   * Creates a new admin for the seller's store
   *
   * This method handles the API call to create a new admin user account
   * and associate them with the seller's active stores. It also provides
   * user feedback via snackbar notifications.
   *
   * @param {CreateAdminRequest} data - Admin creation data containing:
   *   - firstName: Admin's first name
   *   - lastName: Admin's last name
   *   - email: Admin's email address (will be normalized to lowercase)
   *   - password: Admin's password
   *   - phone: Admin's phone number (optional)
   *
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   *   Object indicating success/failure and containing response data or error message
   *
   * @example
   * ```tsx
   * const result = await createAdmin({
   *   firstName: "John",
   *   lastName: "Doe",
   *   email: "john@example.com",
   *   password: "SecurePass123",
   *   phone: "+1234567890"
   * });
   *
   * if (result.success) {
   *   console.log("Admin created:", result.data);
   * }
   * ```
   */
  const handleCreateAdmin = async (
    data: CreateAdminRequest,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const result = await createAdminMutation(data).unwrap();

      showSnackbarWithConfig({
        message: result.message || "Admin created successfully",
        type: "success",
        duration: 3000,
      });

      // Refetch admins list after successful creation
      await refetchAdmins();

      return { success: true, data: result };
    } catch (error: any) {
      // Debug: Log the full error structure to understand what we're receiving
      console.log("Full error object:", error);
      console.log("Error data:", error?.data);
      console.log("Error status:", error?.status);

      // Try multiple possible error structures
      let errorMessage = "Failed to create admin. Please try again.";

      if (error?.data?.error) {
        // Standard error structure: { data: { error: "message" } }
        errorMessage = error.data.error;
      } else if (typeof error?.data === "string") {
        // Error data might be a string directly
        errorMessage = error.data;
      } else if (error?.error) {
        // Error might be at the top level
        errorMessage = error.error;
      } else if (error?.message) {
        // Fallback to error message
        errorMessage = error.message;
      }

      console.log("Extracted error message:", errorMessage);

      showSnackbarWithConfig({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });

      return { success: false, error: errorMessage };
    }
  };

  /**
   * Removes an admin from store association
   *
   * This method removes an admin's access to the seller's stores by:
   * 1. Removing the admin from all store associations (ManyToMany relationship)
   * 2. Deactivating the admin account (sets is_active to false)
   * 3. Refreshing the admin list to reflect changes
   *
   * Note: This does not delete the admin user account, only removes their
   * association with the stores and deactivates their admin status.
   *
   * @param {string} adminId - The unique identifier of the admin to remove
   *
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   *   Object indicating success/failure and containing response data or error message
   *
   * @example
   * ```tsx
   * const result = await removeAdmin("admin-123");
   *
   * if (result.success) {
   *   console.log("Admin removed successfully");
   * }
   * ```
   */
  const handleRemoveAdmin = async (
    adminId: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const result = await removeAdminMutation({ admin_id: adminId }).unwrap();

      showSnackbarWithConfig({
        message: result.message || "Admin removed successfully",
        type: "success",
        duration: 3000,
      });

      // Refetch admins list after successful removal
      await refetchAdmins();

      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || "Failed to remove admin. Please try again.";

      showSnackbarWithConfig({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });

      return { success: false, error: errorMessage };
    }
  };

  return {
    // Form state
    formData,
    errors,
    updateField,
    resetForm,

    // Form validation and submission
    validateForm,
    handleSubmitAdminForm,

    // Admin data
    admins: adminsData?.admins || [],
    adminsCount,

    // Loading states
    isLoadingAdmins,
    isCreatingAdmin,
    isRemovingAdmin,

    // Errors
    adminsError,

    // Actions
    createAdmin: handleCreateAdmin,
    removeAdmin: handleRemoveAdmin,
    refetchAdmins,

    // Store assignment (owner creates admin for one location)
    sellerStores: storesAvailableForAdmin.length
      ? storesAvailableForAdmin
      : sellerStores,
    selectedStoreId,
    setSelectedStoreId,
    isLoadingStores,
    planLimits,
    canAddAdmin,
  };
};

export default useSellerAdmin;
