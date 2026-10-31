import { useAppDispatch, useAppSelector } from "@/app/store/store";
import {
  ProductInterface,
  ProductReturnInterface,
} from "@/app/interfaces/seller/ProductInterface";
import { updateProduct } from "@/app/store/seller/slice/inventorySlice";
import * as ExpoImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import React, { useCallback, useState } from "react";
import { InteractionManager } from "react-native";
import { useAlertContext } from "@/app/contexts/AlertContext";
import {
  usePaginatedProductList,
  toPaginationQuerySlice,
} from "@/app/hook/main/usePaginatedProductList";
import {
  useGetAllCategoriesQuery,
  useGetProductsListQuery,
  useGetProductDetailsQuery,
  useAddProductMutation,
  useInitiateListingFeeMutation,
  useDeleteProductMutation,
  useEditProductMutation,
} from "@/app/store/seller/api/inventoryApi";
import {
  ProductImportRow,
  useBulkImportRowActionMutation,
  useCommitImportRowsMutation,
  useDeleteImportJobMutation,
  useGetImportJobQuery,
  useGetImportJobsQuery,
  useGetImportRowsQuery,
  usePatchImportRowMutation,
  useUploadImportCsvMutation,
} from "@/app/store/seller/api/productImportApi";
import { TrendingCategoryInterface } from "@/app/interfaces/main/home/HomeInterfaces";

/** Items per page — must match server default page_size (20) */
const PAGE_SIZE = 20;
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import { API_CONFIG } from "@/constants/Config";
import { Platform } from "react-native";
import { router } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import { Seller, isStoreAdminUser } from "@/app/interfaces/main/Authentication";
import { getListingFeeBreakdown } from "@/app/_utils/seller/listingFee";
import { useGetSellerStoresQuery } from "@/app/store/seller/api/storeApi";
import { SellerStoreSummary } from "@/app/interfaces/seller/StoreInterface";

export type ListingFeeBreakdownPayload = {
  unitFee: number;
  quantity: number;
  calculatedTotal: number;
  chargedTotal: number;
  currency: string;
};

type ListingFeeInitResponse = {
  required: boolean;
  feeBreakdown?: ListingFeeBreakdownPayload;
  paymentSheet?: {
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
    paymentIntentId: string;
    amount: number;
    unitFee?: number;
    quantity?: number;
    calculatedTotal?: number;
    currency: string;
  };
};

const getReadableErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.data?.error && typeof error.data.error === "string")
    return error.data.error;
  if (typeof error?.data === "string") return error.data;
  if (error?.message && typeof error.message === "string") return error.message;
  return "Failed to delete product";
};

/**
 * Returns the error presentation for the add product error
 * @param error - The error to be presented
 * @returns The title and message of the error
 */
function getAddProductErrorPresentation(error: any): {
  title: string;
  message: string;
} {
  if (error?.data === "Network Error" || error?.status === "FETCH_ERROR") {
    return {
      title: "Connection Error",
      message:
        "Cannot connect to server. Please check:\n1. Is the backend server running?\n2. Is your ngrok URL up to date?\n3. Check your internet connection",
    };
  }

  const status = error?.status;
  const apiMessage =
    typeof error?.data?.error === "string"
      ? error.data.error
      : typeof error?.data === "string"
        ? error.data
        : error?.message || "Failed to add product";

  if (status === 402) {
    return {
      title: "Payment required",
      message: apiMessage,
    };
  }

  if (status === 403) {
    return {
      title: "Plan limit",
      message: apiMessage,
    };
  }

  return {
    title: "Could not add product",
    message: apiMessage,
  };
}

export type BulkImportReviewFilter =
  | "all"
  | "blocked"
  | "warning"
  | "ready"
  | "accepted"
  | "skipped"
  | "imported"
  | "failed";

type UseSellerInventoryOptions = {
  enableBulkImports?: boolean;
  importJobId?: string;
  importRowFilter?: BulkImportReviewFilter;
};

const bulkImportEditableFields = [
  "name",
  "description",
  "category",
  "price",
  "quantity",
  "size",
  "weight",
  "seller_sku",
  "barcode",
  "image_urls",
];

/**
 * Custom hook for managing seller inventory operations including product creation,
 * image handling, and form data preparation for API submissions.
 *
 * This hook provides a comprehensive interface for sellers to:
 * - Update product information in the local state
 * - Handle image selection from camera or gallery
 * - Convert image URIs to File objects for upload
 * - Prepare FormData for product submission
 * - Manage image selection modal visibility
 *
 * @returns {Object} An object containing all inventory management functions and state
 * @returns {ProductInterface | null} returns.currentProduct - Current product data in state
 * @returns {Function} returns.handleProductUpdate - Function to update product fields
 * @returns {Function} returns.handleImageSelection - Function to process selected images
 * @returns {Function} returns.prepareProductFormData - Function to prepare FormData for upload
 * @returns {boolean} returns.isImageModalVisible - Modal visibility state
 * @returns {Function} returns.showImageSelectionModal - Function to show image modal
 * @returns {Function} returns.hideImageSelectionModal - Function to hide image modal
 * @returns {Function} returns.handleCameraSelection - Function to handle camera image capture
 * @returns {Function} returns.handleFileSelection - Function to handle gallery image selection
 */
const useSellerInventory = (options: UseSellerInventoryOptions = {}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user) as Seller | null;
  const isStoreAdmin = isStoreAdminUser(user);
  const assignedStoreId = user?.assigned_store_id ?? null;
  const listingFeeAmount = Number.parseFloat(user?.listing_fee_amount || "0");
  const isStarterPlan =
    user?.subscription_tier_code === "starter" ||
    (user?.subscription_plan?.toLowerCase().includes("starter") ?? false);
  const showListingFeeNotice = listingFeeAmount > 0 || isStarterPlan;
  const listingUnitFee =
    listingFeeAmount > 0 ? listingFeeAmount : isStarterPlan ? 0.2 : 0;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const { showSnackbarWithConfig } = useSnackbar();
  const {
    enableBulkImports = false,
    importJobId = "",
    importRowFilter = "all",
  } = options;

  /* Get the current product in the state that is being created */
  const currentProduct = useAppSelector((state) => state.inventory.products);

  /**
   * Parse the listing quantity to a number for the listing fee calculation
   * @param raw - The raw quantity to be parsed
   * @returns The parsed quantity
   */
  const parseListingQuantity = useCallback((raw: unknown): number => {
    const parsed = parseInt(String(raw ?? "1"), 10);
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
  }, []);

  /**
   * Get the estimated listing fee total for the current product
   * @param rawQuantity - The raw quantity to be parsed
   * @returns The estimated listing fee total
   */
  const getEstimatedListingFeeTotal = useCallback(
    (rawQuantity?: unknown) => {
      const qty = parseListingQuantity(rawQuantity ?? currentProduct?.quantity);
      return getListingFeeBreakdown(listingUnitFee, qty).charged;
    },
    [currentProduct?.quantity, listingUnitFee, parseListingQuantity],
  );

  /**
   * Get the listing fee breakdown for the current product
   * @param rawQuantity - The raw quantity to be parsed
   * @returns The listing fee breakdown
   */
  const getListingFeeBreakdownForForm = useCallback(
    (rawQuantity?: unknown) => {
      const qty = parseListingQuantity(rawQuantity ?? currentProduct?.quantity);
      return getListingFeeBreakdown(listingUnitFee, qty);
    },
    [currentProduct?.quantity, listingUnitFee, parseListingQuantity],
  );

  /**
   * State for selected category - no default, will use first category or null
   * @returns The selected category
   */
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCatalogStoreId, setSelectedCatalogStoreId] = useState<
    string | null
  >(null);
  const [selectedUploadStoreId, setSelectedUploadStoreId] = useState<
    string | null
  >(null);

  /**
   * State for the image modal visibility
   * @returns The image modal visibility
   */
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  /**
   * Mutation to add a product to the store
   */
  const [
    addProduct,
    { isLoading: isLoadingAddProduct, isSuccess: isSuccessAddProduct },
  ] = useAddProductMutation();
  /**
   * Mutation to initiate the listing fee for the current product
   */
  const [initiateListingFee] = useInitiateListingFeeMutation();
  /**
   * Mutation to delete a product from the store
   */
  const [
    deleteProduct,
    { isLoading: isLoadingDeleteProduct, isSuccess: isSuccessDeleteProduct },
  ] = useDeleteProductMutation();
  /**
   * Mutation to edit a product in the store
   */
  const [editProduct, { isLoading: isLoadingEditProduct }] =
    useEditProductMutation();
  /**
   * State for the product edit modal visibility
   * @returns The product edit modal visibility
   */
  const [isProductEditModalVisible, setIsProductEditModalVisible] =
    useState(false);

  /**
   * Draft search text (input) vs applied search (sent to the API on submit).
   */
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [listingStatusFilter, setListingStatusFilter] = useState<
    "" | "draft" | "live" | "paused"
  >("");
  const [currentPage, setCurrentPage] = useState(1);

  const submitProductSearch = useCallback(() => {
    setAppliedSearchQuery(searchQuery.trim());
  }, [searchQuery]);

  const clearProductSearch = useCallback(() => {
    setSearchQuery("");
    setAppliedSearchQuery("");
  }, []);
  /**
   * State for the editing import row
   * @returns The editing import row
   */
  const [editingImportRow, setEditingImportRow] =
    useState<ProductImportRow | null>(null);
  /**
   * State for the import row edit values
   * @returns The import row edit values
   */
  const [importRowEditValues, setImportRowEditValues] = useState<
    Record<string, string>
  >({});

  const { data: sellerStoresData, isLoading: isLoadingSellerStores } =
    useGetSellerStoresQuery(undefined, { skip: isStoreAdmin });
  const sellerStores: SellerStoreSummary[] =
    isStoreAdmin && assignedStoreId
      ? [
          {
            id: assignedStoreId,
            business_name: user?.business_name || "Your store",
            business_city: user?.business_city,
            status: user?.store_status,
            is_active: true,
          },
        ]
      : (sellerStoresData?.stores ?? []);

  React.useEffect(() => {
    if (isStoreAdmin && assignedStoreId) {
      setSelectedUploadStoreId(assignedStoreId);
      setSelectedCatalogStoreId(assignedStoreId);
      return;
    }
    if (!sellerStores.length) {
      return;
    }
    setSelectedUploadStoreId(
      (current) => current ?? sellerStores[0]?.id ?? null,
    );
  }, [sellerStores, isStoreAdmin, assignedStoreId]);

  const productListParams = React.useMemo(() => {
    const params: {
      category_id?: string;
      store_id?: string;
      page: number;
      pageSize: number;
      search?: string;
      listing_status?: string;
    } = {
      page: currentPage,
      pageSize: PAGE_SIZE,
    };
    if (selectedCategory) {
      params.category_id = selectedCategory;
    }
    if (selectedCatalogStoreId) {
      params.store_id = selectedCatalogStoreId;
    }
    if (appliedSearchQuery) {
      params.search = appliedSearchQuery;
    }
    if (listingStatusFilter) {
      params.listing_status = listingStatusFilter;
    }
    return params;
  }, [
    selectedCategory,
    selectedCatalogStoreId,
    appliedSearchQuery,
    listingStatusFilter,
    currentPage,
  ]);

  const productListResetKey = `${selectedCategory ?? "all"}-${selectedCatalogStoreId ?? "all"}-${appliedSearchQuery}-${listingStatusFilter}`;

  const productsQuery = useGetProductsListQuery(productListParams);
  const isFulfillmentList = Boolean(productsQuery.data?.fulfillment);

  const {
    allProducts,
    isLoadingProducts,
    isFetchingProducts,
    isLoadingMore,
    isRefreshing,
    isInitialLoading,
    hasNextPage,
    loadMoreProducts,
    onRefresh,
  } = usePaginatedProductList(
    productListResetKey,
    false,
    toPaginationQuerySlice(productsQuery),
    currentPage,
    setCurrentPage,
  );

  const refetchProducts = onRefresh;

  /**
   * Get the categories list
   * @returns The categories list
   */
  const { data: categories, isLoading: isLoadingCategories } =
    useGetAllCategoriesQuery({} as TrendingCategoryInterface);

  /**
   * Get the import jobs list
   * @returns The import jobs list
   */
  const {
    data: importJobs = [],
    isLoading: isLoadingImportJobs,
    refetch: refetchImportJobs,
  } = useGetImportJobsQuery(undefined, { skip: !enableBulkImports });
  /**
   * Mutation to upload an import csv file
   */
  const [uploadImportCsv, { isLoading: isUploadingImportCsv }] =
    useUploadImportCsvMutation();
  /**
   * Mutation to delete an import job
   */
  const [deleteImportJob, { isLoading: isDeletingImportJob }] =
    useDeleteImportJobMutation();
  /**
   * Get the import job list that the user has created for bulk orders
   * @returns The import job list
   * @refetch - Refetch the import job list
   * The method skips if the bulk imports are not enabled or if the import job id is not set
   */
  const {
    data: importJob,
    isLoading: isLoadingImportJob,
    refetch: refetchImportJob,
  } = useGetImportJobQuery(importJobId, {
    skip: !enableBulkImports || !importJobId,
    pollingInterval: 5000,
  });
  /**
   * Get the import rows list for the import job
   * @returns The import rows list
   * @refetch - Refetch the import rows list
   * The method skips if the bulk imports are not enabled or if the import job id is not set
   * The method polls the import rows list every 5 seconds if the import job is processing or committing
   */
  const {
    data: importRowsPage,
    isLoading: isLoadingImportRows,
    refetch: refetchImportRows,
  } = useGetImportRowsQuery(
    { jobId: importJobId, status: importRowFilter, page: 1, pageSize: 100 },
    {
      skip: !enableBulkImports || !importJobId,
      pollingInterval:
        importJob?.status === "processing" || importJob?.status === "committing"
          ? 5000
          : 0,
    },
  );
  /**
   * Mutation to bulk import row action
   * @returns The bulk import row action
   * @isLoading - Whether the bulk import row action is loading
   */
  const [bulkImportRowAction, { isLoading: isBulkImportRowActionLoading }] =
    useBulkImportRowActionMutation();
  /**
   * Mutation to commit import rows for bulk imports
   * calls the backend endpoint to commit the import rows, so that the rows are updated in the database
   * @returns The commit import rows
   * @isLoading - Whether the commit import rows is loading
   */
  const [commitImportRows, { isLoading: isCommittingImportRows }] =
    useCommitImportRowsMutation();
  const [patchImportRow, { isLoading: isSavingImportRow }] =
    usePatchImportRowMutation();

  const importRows = importRowsPage?.results || [];
  const importReadyCount =
    (importJob?.ready_count || 0) +
    (importJob?.warning_count || 0) +
    (importJob?.accepted_count || 0);
  const importProgress = React.useMemo(() => {
    if (!importJob?.total_rows) return 0;
    return Math.min(
      100,
      Math.round(
        ((importJob.imported_count || importJob.processed_rows || 0) /
          importJob.total_rows) *
          100,
      ),
    );
  }, [importJob]);

  React.useEffect(() => {
    if (!editingImportRow) return;
    const payload = {
      ...editingImportRow.normalized_row,
      ...editingImportRow.corrected_row,
    };
    setImportRowEditValues(
      bulkImportEditableFields.reduce(
        (acc, field) => {
          const value = payload[field];
          acc[field] = Array.isArray(value)
            ? value.join(", ")
            : value == null
              ? ""
              : String(value);
          return acc;
        },
        {} as Record<string, string>,
      ),
    );
  }, [editingImportRow]);

  // Set default category when categories load
  React.useEffect(() => {
    if (categories && categories.length > 0 && selectedCategory === null) {
      // Set the first category or "staples" if it exists
      const staplesCategory = categories.find(
        (cat: TrendingCategoryInterface) =>
          cat.title?.toLowerCase() === "staples",
      );
      const firstCategory = categories[0];
      setSelectedCategory(
        staplesCategory?.id ||
          staplesCategory?.title?.toLowerCase() ||
          firstCategory?.id ||
          firstCategory?.title?.toLowerCase() ||
          null,
      );
    }
  }, [categories, selectedCategory]);

  /**
   * Creates file metadata for React Native file uploads.
   * In React Native, we don't convert to File objects - we use the URI directly with metadata.
   * This metadata will be used when creating FormData for upload.
   *
   * For web, falls back to fetch and blob conversion.
   *
   * @param {string} uri - The local URI of the file
   * @param {string} filename - The desired filename
   * @param {string} mimeType - The MIME type of the file
   * @returns {Promise<Object>} File metadata object compatible with React Native FormData
   */
  const uriToFile = async (
    uri: string,
    filename: string,
    mimeType: string = "image/jpeg",
  ): Promise<any> => {
    // For React Native, return file metadata directly
    if (Platform.OS !== "web") {
      return {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        name: filename,
        type: mimeType,
      };
    }

    // For web, use the old fetch/blob approach
    const response = await fetch(uri);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  /**
   * Updates the product data in the Redux store.
   * Handles both regular fields and the special case of images array.
   *
   * For images, it maintains the array structure and appends new images.
   * For other fields, it directly updates the value.
   *
   * @param {Object} params - The update parameters
   * @param {keyof ProductInterface} params.field - The field name to update
   * @param {string} params.value - The new value for the field
   */
  const handleProductUpdate = ({
    field,
    value,
  }: {
    field: keyof ProductInterface;
    value: string | string[] | number | undefined | null | any;
  }) => {
    // Initialize with empty object if currentProduct is null
    // This ensures we can build up the product state from scratch
    dispatch(
      updateProduct({
        ...(currentProduct || {}),
        [field]: value,
      } as ProductInterface),
    );
  };

  /**
   * Method is designed to delete a product from the store
   * @param pk - The primary key of the product to delete
   * Display a message to the user for them to validate their action.
   * if the action is validated go ahead and delete the product; otherwise do nothing
   */
  const handleDeleteProduct = useCallback(
    async (pk: string): Promise<void> => {
      console.log("Deleting product", pk);
      setAlertConfig({
        title: "Delete Product",
        message: "Are you sure you want to delete this product?",
        type: "error",
        isVisible: true,
        onConfirm: async () => {
          setIsVisible(false); // Close the alert modal while the product is being deleted
          try {
            const result = await deleteProduct(pk).unwrap();
            const successMessage =
              (typeof result === "string" && result) ||
              result?.message ||
              "Product deleted successfully";
            showSnackbarWithConfig({
              message: successMessage,
              type: "success",
              duration: 3000,
            });
            await onRefresh();
          } catch (error: any) {
            showSnackbarWithConfig({
              message: getReadableErrorMessage(error),
              type: "error",
              duration: 3000,
            });
          }
        },
        onClose: () => {
          setIsVisible(false);
        },
      });
    },
    [deleteProduct, showSnackbarWithConfig, onRefresh],
  );

  /**
   * Method is designed to update a product in the store
   * @param updatedProduct - The updated product data (may include images array)
   * @returns Promise<void>
   */
  const handleUpdateProduct = useCallback(
    async (
      updatedProduct: Partial<ProductInterface> & { images?: any[] },
    ): Promise<void> => {
      try {
        // Extract images from updatedProduct
        const images = updatedProduct.images || [];
        const { images: _, ...productData } = updatedProduct;

        // Convert product data to FormData
        const formData = new FormData();

        // Add product ID (required by backend)
        if (productData.id) {
          formData.append("id", productData.id);
        }

        // Add all product fields
        if (productData.name) {
          formData.append("name", productData.name);
        }
        if (productData.description) {
          formData.append("description", productData.description);
        }
        if (productData.information) {
          formData.append("information", productData.information);
        }
        if (!isFulfillmentList && productData.price !== undefined) {
          formData.append("price", productData.price.toString());
        }
        if (!isFulfillmentList && productData.quantity !== undefined) {
          formData.append("quantity", productData.quantity.toString());
        }
        if (productData.size) {
          formData.append("size", productData.size);
        }
        if (productData.weight) {
          formData.append("weight", productData.weight);
        }
        if (!isFulfillmentList && productData.category) {
          formData.append("category", productData.category);
        }

        // Add images - upload all images that should be kept
        // Note: Backend will replace all existing images with the new set
        if (images && Array.isArray(images)) {
          console.log(`Preparing ${images.length} image(s) for upload`);

          // Process all images that should be kept
          const imagesToUpload: any[] = [];

          for (let index = 0; index < images.length; index++) {
            const imageData = images[index];

            if (imageData.isExisting) {
              // Existing image - For React Native, remote URLs might not work directly with FormData
              // We'll attempt to use the URL directly, but this may not work in all cases
              // If it fails, the image won't be preserved (limitation)
              // For a production app, consider downloading and caching images first
              const imageFormData = {
                uri: imageData.uri,
                name: `existing_image_${index}.jpg`,
                type: "image/jpeg",
              };
              imagesToUpload.push(imageFormData);
              console.log(`Adding existing image ${index} to upload`);
            } else if (imageData.file) {
              // New image - upload it with file metadata
              const imageFormData = {
                uri: imageData.uri,
                name: imageData.filename || `image_${index}.jpg`,
                type: imageData.type || "image/jpeg",
              };
              imagesToUpload.push(imageFormData);
              console.log(`Adding new image ${index}:`, imageFormData);
            }
          }

          // Only append images if we have any to upload
          // If images array is empty, don't send images field - backend will keep existing images
          if (imagesToUpload.length > 0) {
            imagesToUpload.forEach((imageFormData) => {
              formData.append("images", imageFormData as any);
            });
            console.log(`Total images to upload: ${imagesToUpload.length}`);
          } else {
            console.log(
              "No images to upload - backend will keep existing images",
            );
          }
        }

        console.log("Sending FormData for product update");
        const result = await editProduct(formData).unwrap();
        showSnackbarWithConfig({
          message: result || "Product updated successfully",
          type: "success",
          duration: 3000,
        });
        await onRefresh();
        setIsProductEditModalVisible(false);
      } catch (error: any) {
        console.error("Error updating product:", error);
        // Handle different error response structures
        let errorMessage = "Failed to update product";
        if (error?.data?.error) {
          errorMessage = error.data.error;
        } else if (error?.data) {
          errorMessage = error.data;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        showSnackbarWithConfig({
          message: errorMessage,
          type: "error",
          duration: 3000,
        });
      }
    },
    [editProduct, showSnackbarWithConfig, onRefresh, isFulfillmentList],
  );

  /**
   * Processes a selected image by converting it to a File object and storing it in state.
   * Creates a timestamped filename and stores both the URI (for display) and File object (for upload).
   *
   * @param {string} imageUri - The URI of the selected image
   * @throws {Error} If image conversion fails
   */
  const handleImageSelection = async (imageUri: string) => {
    try {
      // Generate a filename based on timestamp
      const timestamp = Date.now();
      const filename = `image_${timestamp}.jpg`;

      // Convert URI to File object or file metadata (for React Native)
      const imageFile = await uriToFile(imageUri, filename, "image/jpeg");

      // Store both the URI (for display) and File object (for upload)
      const currentImages = currentProduct?.images || [];
      const imagesArray = Array.isArray(currentImages) ? currentImages : [];

      // Create an object with URI, File, and type for React Native FormData
      const imageData = {
        uri: imageUri,
        file: imageFile,
        filename: filename,
        type: "image/jpeg", // Store MIME type
      };

      // Update Redux state with the new image
      // Initialize with empty object if currentProduct is null
      dispatch(
        updateProduct({
          ...(currentProduct || {}),
          images: [...imagesArray, imageData],
        } as ProductInterface),
      );

      // Close the modal after successful selection
      hideImageSelectionModal();
    } catch (error) {
      console.error("Error converting image URI to File:", error);
      showSnackbarWithConfig({
        message: "Failed to process image. Please try again.",
        type: "error",
        duration: 3000,
      });
    }
  };

  /**
   * Shows the image selection modal to allow users to choose between camera and gallery.
   */
  const showImageSelectionModal = () => {
    setIsImageModalVisible(true);
  };

  /**
   * Hides the image selection modal.
   */
  const hideImageSelectionModal = () => {
    setIsImageModalVisible(false);
  };

  /**
   * Handles camera image capture using Expo ImagePicker.
   * Requests camera permissions and launches the camera interface.
   * Processes the captured image through handleImageSelection.
   * Closes the modal after the picker completes to fix Android ActivityResultLauncher issue.
   *
   * @throws {Error} If camera permissions are denied
   */
  const handleCameraSelection = async () => {
    // Request camera permissions first
    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      hideImageSelectionModal();
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    // Use InteractionManager to ensure all interactions are complete before launching picker
    // This ensures ActivityResultLauncher is properly registered
    InteractionManager.runAfterInteractions(async () => {
      try {
        let result = await ExpoImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          aspect: [4, 3],
          quality: 1,
        });

        // Close modal after picker completes
        hideImageSelectionModal();

        if (!result.canceled) {
          const image = result.assets[0].uri;
          await handleImageSelection(image);
        }
      } catch (error) {
        hideImageSelectionModal();
        console.error("Error launching camera:", error);
      }
    });
  };

  /**
   * Handles image selection from the device's media library using Expo ImagePicker.
   * Requests media library permissions and launches the image picker interface.
   * Processes the selected image through handleImageSelection.
   * Closes the modal after the picker completes to fix Android ActivityResultLauncher issue.
   *
   * @throws {Error} If media library permissions are denied
   */
  const handleFileSelection = useCallback(async (): Promise<void> => {
    // Request media library permissions first
    const { status } =
      await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      hideImageSelectionModal();
      showSnackbarWithConfig({
        message: "Sorry, we need media library permissions to make this work!",
        type: "error",
        duration: 3000,
      });
      return;
    }

    // Use InteractionManager to ensure all interactions are complete before launching picker
    // This ensures ActivityResultLauncher is properly registered
    InteractionManager.runAfterInteractions(async () => {
      try {
        let result = await ExpoImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          aspect: [4, 3],
          quality: 1,
        });

        // Close modal after picker completes
        hideImageSelectionModal();

        if (!result.canceled) {
          const image = result.assets[0].uri;
          await handleImageSelection(image);
        }
      } catch (error) {
        hideImageSelectionModal();
        console.error("Error launching image library:", error);
      }
    });
  }, [
    ExpoImagePicker,
    handleImageSelection,
    showSnackbarWithConfig,
    hideImageSelectionModal,
  ]);

  /**
   * Processes a selected video by converting it to a File object and storing it in state.
   * Creates a timestamped filename and stores both the URI (for display) and File object (for upload).
   *
   * @param {string} videoUri - The URI of the selected video
   * @throws {Error} If video conversion fails
   */
  const handleVideoSelection = async (videoUri: string) => {
    try {
      // Generate a filename based on timestamp
      const timestamp = Date.now();
      const filename = `video_${timestamp}.mp4`;

      // Convert URI to File object or file metadata (for React Native)
      const videoFile = await uriToFile(videoUri, filename, "video/mp4");

      // Store both the URI (for display), File object, and type for React Native FormData
      const videoData = {
        uri: videoUri,
        file: videoFile,
        filename: filename,
        type: "video/mp4", // Store MIME type
      };

      // Update Redux state with the video
      // Initialize with empty object if currentProduct is null
      dispatch(
        updateProduct({
          ...(currentProduct || {}),
          videos: videoData,
        } as ProductInterface),
      );
    } catch (error) {
      console.error("Error converting video URI to File:", error);
      showSnackbarWithConfig({
        message: "Failed to process video. Please try again.",
        type: "error",
        duration: 3000,
      });
    }
  };

  /**
   * Handles video selection from the device's media library using Expo ImagePicker.
   * Requests media library permissions and launches the video picker interface.
   * Processes the selected video through handleVideoSelection.
   * Note: Modal closing should be handled by the component that manages video modal state.
   *
   * @throws {Error} If media library permissions are denied
   */
  const handleVideoFileSelection = async () => {
    // Request media library permissions
    const { status } =
      await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      showSnackbarWithConfig({
        message: "Sorry, we need media library permissions to make this work!",
        type: "error",
        duration: 3000,
      });
      return;
    }

    let result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const video = result.assets[0].uri;
      await handleVideoSelection(video);
    }
  };

  /**
   * Handles video capture using camera with Expo ImagePicker.
   * Requests camera permissions and launches the camera interface for video recording.
   * Processes the captured video through handleVideoSelection.
   * Note: Modal closing should be handled by the component that manages video modal state.
   *
   * @throws {Error} If camera permissions are denied
   */
  const handleVideoCameraSelection = async () => {
    // Request camera permissions
    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    let result = await ExpoImagePicker.launchCameraAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const video = result.assets[0].uri;
      await handleVideoSelection(video);
    }
  };

  /**
   * Prepares FormData object for product upload to the API.
   * Converts all product fields and images to the format expected by the server.
   *
   * Handles:
   * - Basic product fields (name, description, price, quantity, etc.)
   * - Category arrays (converts to indexed form data)
   * - Image files (extracts File objects from stored image data)
   * - Video files (extracts File objects from stored video data)
   *
   * @returns {Promise<FormData | null>} A Promise that resolves to FormData object or null if no product data
   */
  const prepareProductFormData = async () => {
    console.log("preparing data for product", currentProduct);
    if (!currentProduct) return null;

    const formData = new FormData();

    // Add basic product fields
    if (currentProduct.name) formData.append("name", currentProduct.name);
    if (currentProduct.description)
      formData.append("description", currentProduct.description);
    if (currentProduct.information)
      formData.append("information", currentProduct.information);
    if (currentProduct.price)
      formData.append("price", currentProduct.price.toString());
    if (currentProduct.quantity)
      formData.append("quantity", currentProduct.quantity.toString());
    if (currentProduct.size)
      formData.append("size", currentProduct.size.toString());
    if (currentProduct.weight)
      formData.append("weight", currentProduct.weight.toString());
    if (currentProduct.category_id) {
      console.log(
        "Adding category_id to FormData:",
        currentProduct.category_id,
      );
      formData.append("category_id", currentProduct.category_id.toString());
    }

    const uploadStoreId =
      selectedUploadStoreId || sellerStores[0]?.id || undefined;
    if (uploadStoreId) {
      formData.append("store_id", uploadStoreId);
    }

    // Add images - React Native FormData requires uri, name, and type
    if (currentProduct.images && Array.isArray(currentProduct.images)) {
      console.log(`Adding ${currentProduct.images.length} images to FormData`);
      currentProduct.images.forEach((imageData, index) => {
        if (imageData.uri) {
          // React Native FormData expects an object with uri, name, and type
          const imageFormData = {
            uri: imageData.uri,
            name: imageData.filename || `image_${index}.jpg`,
            type: imageData.type || "image/jpeg",
          };
          console.log(`Image ${index}:`, imageFormData);
          formData.append("images", imageFormData as any);
        }
      });
    }

    // Add video - React Native FormData requires uri, name, and type
    if (currentProduct.videos && currentProduct.videos.uri) {
      const videoFormData = {
        uri: currentProduct.videos.uri,
        name: currentProduct.videos.filename || "video.mp4",
        type: currentProduct.videos.type || "video/mp4",
      };
      console.log("Adding video to FormData:", videoFormData);
      formData.append("videos", videoFormData as any);
    }

    console.log("FormData prepared successfully with all fields");
    return formData;
  };

  /**
   * Submits product FormData, optionally with a consumed listing-fee payment intent.
   */
  const submitProductWithOptionalFee = useCallback(
    async (formData: FormData, paymentIntentId?: string) => {
      if (paymentIntentId) {
        formData.append("listing_fee_payment_intent_id", paymentIntentId);
      }

      const maxAttempts = 6;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          return await addProduct(formData).unwrap();
        } catch (error: any) {
          const isProcessing =
            error?.status === 402 && error?.data?.code === "payment_processing";
          if (isProcessing && attempt < maxAttempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }
          throw error;
        }
      }
      throw new Error("Failed to add product");
    },
    [addProduct],
  );

  /**
   * Ask the server whether a listing fee is required; if so, run Stripe Payment Sheet.
   * Returns payment intent id when paid, null when no fee applies, or undefined when aborted.
   */
  const collectListingFeeBeforeCreate = useCallback(
    async (
      productName: string,
      quantity: number,
      storeId?: string | null,
    ): Promise<string | null | undefined> => {
      const listingQty = parseListingQuantity(quantity);
      const feeResult = (await initiateListingFee({
        product_name: productName,
        quantity: listingQty,
        store_id: storeId || selectedUploadStoreId || sellerStores[0]?.id,
      }).unwrap()) as ListingFeeInitResponse;

      if (!feeResult.required) {
        return null;
      }

      if (!feeResult.paymentSheet?.paymentIntentId) {
        showSnackbarWithConfig({
          message:
            "Could not start listing fee payment. Please try again or contact support.",
          type: "error",
          duration: 3000,
        });
        return undefined;
      }

      const {
        paymentIntent,
        ephemeralKey,
        customer,
        paymentIntentId: intentId,
        amount,
        currency,
      } = feeResult.paymentSheet;

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: paymentIntent,
        merchantDisplayName: "Vhotis",
        customerEphemeralKeySecret: ephemeralKey,
        customerId: customer,
        returnURL: "vhotis://payment-success",
        applePay: { merchantCountryCode: "IE" },
        googlePay: {
          merchantCountryCode: "IE",
          testEnv: __DEV__,
          currencyCode: currency || "EUR",
        },
        allowsDelayedPaymentMethods: true,
      });

      if (initError) {
        showSnackbarWithConfig({
          message: "Failed to initialize payment. Please try again.",
          type: "error",
        });
        return undefined;
      }

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === "Canceled") {
          showSnackbarWithConfig({
            message: "Listing fee payment was canceled",
            type: "info",
          });
          return undefined;
        }
        showSnackbarWithConfig({
          message: presentError.message || "Payment failed. Please try again.",
          type: "error",
        });
        return undefined;
      }

      const unitFee = feeResult.paymentSheet?.unitFee ?? listingUnitFee;
      const paidQty = feeResult.paymentSheet?.quantity ?? listingQty;

      showSnackbarWithConfig({
        message: `Listing fee of €${(amount ?? unitFee * paidQty).toFixed(2)} paid (€${unitFee.toFixed(2)} × ${paidQty} units). Creating your product…`,
        type: "success",
        duration: 2500,
      });

      // Brief pause so webhook can mark the fee paid before create runs.
      await new Promise((resolve) => setTimeout(resolve, 800));

      return intentId;
    },
    [
      initiateListingFee,
      initPaymentSheet,
      presentPaymentSheet,
      showSnackbarWithConfig,
      listingUnitFee,
      parseListingQuantity,
      selectedUploadStoreId,
      sellerStores,
    ],
  );

  /**
   * Submits the prepared product data to the API using the addProduct mutation.
   * Handles success and error cases with appropriate user feedback.
   * After successful creation, refetches the products list and clears the form.
   *
   * @throws {Error} If form data preparation fails or API call fails
   */
  const handleAddProduct = useCallback(async (): Promise<void> => {
    console.log("currentProduct", currentProduct);
    try {
      // Validate required fields
      if (
        !currentProduct?.name ||
        !currentProduct?.description ||
        !currentProduct?.price ||
        !currentProduct?.category_id
      ) {
        showSnackbarWithConfig({
          message:
            "Please fill in all required fields including product name, description, price, and category",
          type: "error",
          duration: 2000,
        });
        return;
      }

      const uploadStoreId =
        selectedUploadStoreId || sellerStores[0]?.id || null;
      if (!uploadStoreId && sellerStores.length === 0) {
        showSnackbarWithConfig({
          message:
            "No store location found. Create a store before adding products.",
          type: "error",
        });
        return;
      }

      const formData = await prepareProductFormData();
      console.log("formData", formData);
      if (!formData) {
        showSnackbarWithConfig({
          message: "Please fill in all required product information",
          type: "error",
        });
        return;
      }

      let paymentIntentId: string | null | undefined;
      const listingQty = parseListingQuantity(currentProduct.quantity);

      paymentIntentId = await collectListingFeeBeforeCreate(
        currentProduct.name || "",
        listingQty,
        selectedUploadStoreId || sellerStores[0]?.id,
      );
      if (paymentIntentId === undefined) {
        return;
      }

      const result = await submitProductWithOptionalFee(
        formData,
        paymentIntentId ?? undefined,
      );
      if (result && result.success && result.message) {
        showSnackbarWithConfig({
          message: result.message,
          type: "success",
          duration: 3000,
        });
        await onRefresh();
        dispatch(updateProduct(null));
        router.back();
      }
    } catch (error: any) {
      const { title, message } = getAddProductErrorPresentation(error);

      setAlertConfig({
        title,
        message,
        type: "error",
        isVisible: true,
        onConfirm: () => {
          setIsVisible(false);
        },
      });
    }
  }, [
    collectListingFeeBeforeCreate,
    parseListingQuantity,
    submitProductWithOptionalFee,
    showSnackbarWithConfig,
    currentProduct,
    onRefresh,
    dispatch,
    setAlertConfig,
    setIsVisible,
  ]);

  const openBulkImportJob = useCallback((jobId: string) => {
    router.push({
      pathname: "/seller/main/products/BulkInventoryDetailScreen",
      params: { jobId },
    });
  }, []);

  const pickAndUploadCsv = useCallback(async () => {
    try {
      /* Get the document using the document picker */
      let document = null;
      try {
        document = await DocumentPicker.getDocumentAsync({
          type: ["*/*"],
          copyToCacheDirectory: true,
          multiple: false,
        });

        if (document.canceled || !document.assets?.[0]) {
          return;
        }

        console.log("document", document);
      } catch (error: any) {
        console.error("Error getting document:", error);
        return;
      }
      const asset = document.assets[0];
      const formData = new FormData();

      console.log("asset", asset);
      formData.append("file", {
        uri: asset.uri,
        name: asset.name || "products.csv",
        type: asset.mimeType || "text/csv",
      } as any);

      const uploadStoreId =
        selectedUploadStoreId || sellerStores[0]?.id || undefined;
      if (uploadStoreId) {
        formData.append("store_id", uploadStoreId);
      }

      const job = await uploadImportCsv(formData).unwrap();
      openBulkImportJob(job.id);
    } catch (error: any) {
      setAlertConfig({
        title: "CSV upload failed",
        message: error?.data?.error || error?.message || "Please try again.",
        type: "error",
        isVisible: true,
        onConfirm: () => {
          setIsVisible(false);
        },
      });
    }
  }, [
    openBulkImportJob,
    selectedUploadStoreId,
    sellerStores,
    setAlertConfig,
    setIsVisible,
    uploadImportCsv,
  ]);

  const showCsvTemplateHint = useCallback(() => {
    setAlertConfig({
      title: "CSV template",
      message:
        "Use columns: name, description, category, price, size, weight, quantity, seller_sku, barcode, information, image_urls.",
      type: "warning" as const,
      isVisible: true,
      onConfirm: () => {
        setIsVisible(false);
      },
    });
  }, [setAlertConfig, setIsVisible]);

  const handleDeleteImportJob = useCallback(
    (jobId: string, filename?: string) => {
      setAlertConfig({
        title: "Delete import job",
        message: `Delete ${filename || "this import job"}? This removes the import review rows, but products already imported will remain.`,
        type: "error",
        isVisible: true,
        onConfirm: async () => {
          setIsVisible(false);
          try {
            const result = await deleteImportJob(jobId).unwrap();
            showSnackbarWithConfig({
              message: result?.message || "Import job deleted.",
              type: "success",
              duration: 3000,
            });
            await refetchImportJobs();
          } catch (error: any) {
            showSnackbarWithConfig({
              message:
                error?.data?.error ||
                error?.message ||
                "Could not delete import job.",
              type: "error",
              duration: 3000,
            });
          }
        },
        onClose: () => {
          setIsVisible(false);
        },
      });
    },
    [
      deleteImportJob,
      refetchImportJobs,
      setAlertConfig,
      setIsVisible,
      showSnackbarWithConfig,
    ],
  );

  const refetchImportReview = useCallback(() => {
    if (importJobId) {
      refetchImportJob();
      refetchImportRows();
    }
  }, [importJobId, refetchImportJob, refetchImportRows]);

  const handleCommitImportRows = useCallback(async () => {
    try {
      const result = await commitImportRows({ jobId: importJobId }).unwrap();
      setAlertConfig({
        title: result.started ? "Import started" : "Import not started",
        message:
          result.message ||
          (result.started
            ? `${result.queued_rows || 0} rows are being imported. You can watch the progress on this screen.`
            : "No rows were queued for import."),
        type: "success",
        isVisible: true,
        onConfirm: () => {
          setIsVisible(false);
        },
      });
      refetchImportReview();
    } catch (error: any) {
      setAlertConfig({
        title: "Import failed",
        message: error?.data?.error || error?.message || "Please try again.",
        type: "error",
        isVisible: true,
        onConfirm: () => {
          setIsVisible(false);
        },
      });
    }
  }, [
    commitImportRows,
    importJobId,
    refetchImportReview,
    setAlertConfig,
    setIsVisible,
  ]);

  const handleImportRowAction = useCallback(
    async (row: ProductImportRow) => {
      try {
        if (row.suggested_category) {
          await bulkImportRowAction({
            jobId: importJobId,
            action: "apply_suggestion",
            rowIds: [row.id],
          }).unwrap();
        } else if (row.status === "ready" || row.status === "warning") {
          await bulkImportRowAction({
            jobId: importJobId,
            action: "accept",
            rowIds: [row.id],
          }).unwrap();
        } else {
          setEditingImportRow(row);
          return;
        }
        refetchImportReview();
      } catch (error: any) {
        setAlertConfig({
          title: "Row update failed",
          message: error?.data?.error || error?.message || "Please try again.",
          type: "error",
          isVisible: true,
          onConfirm: () => {
            setIsVisible(false);
          },
        });
      }
    },
    [
      bulkImportRowAction,
      importJobId,
      refetchImportReview,
      setAlertConfig,
      setIsVisible,
    ],
  );

  const handleSkipImportRow = useCallback(
    async (row: ProductImportRow) => {
      try {
        await bulkImportRowAction({
          jobId: importJobId,
          action: "skip",
          rowIds: [row.id],
        }).unwrap();
        refetchImportReview();
      } catch (error: any) {
        setAlertConfig({
          title: "Could not skip row",
          message: error?.data?.error || error?.message || "Please try again.",
          type: "error",
          isVisible: true,
          onConfirm: () => {
            setIsVisible(false);
          },
        });
      }
    },
    [
      bulkImportRowAction,
      importJobId,
      refetchImportReview,
      setAlertConfig,
      setIsVisible,
    ],
  );

  const handleSaveImportRow = useCallback(async () => {
    if (!editingImportRow) return;
    try {
      await patchImportRow({
        jobId: importJobId,
        rowId: editingImportRow.id,
        values: importRowEditValues,
      }).unwrap();
      setEditingImportRow(null);
      refetchImportReview();
    } catch (error: any) {
      setAlertConfig({
        title: "Could not save row",
        message: error?.data?.error || error?.message || "Please try again.",
        type: "error",
        isVisible: true,
        onConfirm: () => {
          setIsVisible(false);
        },
      });
    }
  }, [
    editingImportRow,
    importJobId,
    importRowEditValues,
    patchImportRow,
    refetchImportReview,
    setAlertConfig,
    setIsVisible,
  ]);

  const showErrorCsvHint = useCallback(() => {
    setAlertConfig({
      title: "Error CSV",
      message:
        "Use the backend endpoint /api/v2/product-imports/error_csv/?job_id={jobId} to download blocked rows.",
      type: "warning" as const,
      isVisible: true,
      onConfirm: () => {
        setIsVisible(false);
      },
    });
  }, [setAlertConfig, setIsVisible]);

  return {
    currentProduct,
    handleProductUpdate,
    handleImageSelection,
    handleVideoSelection,
    prepareProductFormData,
    isImageModalVisible,
    showImageSelectionModal,
    hideImageSelectionModal,
    handleCameraSelection,
    handleFileSelection,
    handleVideoCameraSelection,
    handleVideoFileSelection,
    handleAddProduct,
    isLoadingAddProduct,
    isSuccessAddProduct,
    showListingFeeNotice,
    listingUnitFee,
    getEstimatedListingFeeTotal,
    getListingFeeBreakdownForForm,
    categories,
    isLoadingCategories,
    searchQuery,
    setSearchQuery,
    appliedSearchQuery,
    submitProductSearch,
    clearProductSearch,
    listingStatusFilter,
    setListingStatusFilter,
    isFulfillmentList,
    selectedCategory,
    setSelectedCategory,
    sellerStores,
    isLoadingSellerStores,
    selectedCatalogStoreId,
    setSelectedCatalogStoreId,
    selectedUploadStoreId,
    setSelectedUploadStoreId,
    isLoadingProducts,
    isFetchingProducts,
    isLoadingMore,
    isRefreshing,
    isInitialLoading,
    hasNextPage,
    allProducts,
    loadMoreProducts,
    onRefresh,
    filteredProducts: allProducts,
    handleDeleteProduct,
    handleUpdateProduct,
    isProductEditModalVisible,
    setIsProductEditModalVisible,
    refetchProducts,
    importJobs,
    isLoadingImportJobs,
    refetchImportJobs,
    isUploadingImportCsv,
    isDeletingImportJob,
    openBulkImportJob,
    pickAndUploadCsv,
    showCsvTemplateHint,
    handleDeleteImportJob,
    importJob,
    isLoadingImportJob,
    importRows,
    isLoadingImportRows,
    importReadyCount,
    importProgress,
    editingImportRow,
    setEditingImportRow,
    importRowEditValues,
    setImportRowEditValues,
    isBulkImportRowActionLoading,
    isCommittingImportRows,
    isSavingImportRow,
    handleCommitImportRows,
    handleImportRowAction,
    handleSkipImportRow,
    handleSaveImportRow,
    showErrorCsvHint,
    bulkImportEditableFields,
  };
};

export default useSellerInventory;
