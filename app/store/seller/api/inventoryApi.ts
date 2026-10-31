import { createApi, QueryDefinition } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";
import { updateProductList } from "../slice/inventorySlice";
import { ProductReturnInterface } from "@/app/interfaces/seller/ProductInterface";

export interface SellerProductsListResponse {
  results: ProductReturnInterface[];
  count: number;
  next: boolean;
  previous: boolean;
  page: number;
  page_size: number;
  fulfillment?: boolean;
}

export interface SellerProductsListQueryArgs {
  category_id?: string;
  store_id?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  listing_status?: string;
}

const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    /**
     * Add a new product to the store.
     * (Credentials are passed in the header)
     * The credentials will contain the {ProductInterface} data to be added to the store
     */
    addProduct: builder.mutation<
      { success: boolean; message: string },
      FormData
    >({
      query: (formData) => ({
        url: "/api/v2/products/add_product_to_store/",
        method: "POST",
        data: formData,
      }),
    }),

    /**
     * Handles how the listing fee is calculated and displayed to the user.
     * The credentials will contain the {product_name} and {quantity} to be used to calculate the listing fee.
     * The response will contain the {feeBreakdown} and {paymentSheet} to be used to display the listing fee to the user.
     * The {feeBreakdown} will contain the {unitFee}, {quantity}, {calculatedTotal}, {chargedTotal}, and {currency}.
     * The {paymentSheet} will contain the {paymentIntent}, {ephemeralKey}, {customer}, {paymentIntentId}, {amount}, {unitFee}, {quantity}, {calculatedTotal}, and {currency}.
     * The {paymentIntent} is used to create a payment intent for the listing fee.
     * The {ephemeralKey} is used to create a ephemeral key for the payment intent.
     * The {customer} is used to create a customer for the payment intent.
     */
    initiateListingFee: builder.mutation<
      {
        required: boolean;
        feeBreakdown?: {
          unitFee: number;
          quantity: number;
          calculatedTotal: number;
          chargedTotal: number;
          currency: string;
        };
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
      },
      { product_name?: string; quantity?: number; store_id?: string }
    >({
      query: (body) => ({
        url: "/api/v2/products/initiate_listing_fee/",
        method: "POST",
        data: body,
      }),
    }),

    /* The api is used to update a product given the product id. 
       The credentials will contains the {ProductInterface} data to be updated to the store
       The response will contain the {success} and {message} to be used to display the result to the user.
       The {success} will be true if the product is updated successfully, otherwise false.
       The {message} will be the message to be displayed to the user.
    */
    updateProduct: builder.mutation({
      query: ({
        id,
        formData,
      }: {
        id: string;
        formData: ProductReturnInterface;
      }) => ({
        url: `/api/v2/products/update_product/`,
        method: "PATCH",
        data: formData,
        params: { id: id },
      }),
    }),

    /**
     * Get all the product list with minimal data (for list view)
     * @param category_id - The id of the category to get the products for or empty if no category is selected
     * @returns the list of products
     */
    getProductsList: builder.query<
      SellerProductsListResponse,
      SellerProductsListQueryArgs
    >({
      query: (params = {}) => {
        const queryParams: Record<string, string | number> = {
          page: params.page ?? 1,
          page_size: params.pageSize ?? 20,
        };
        if (params.category_id) {
          queryParams.category_id = params.category_id;
        }
        if (params.store_id) {
          queryParams.store_id = params.store_id;
        }
        if (params.search?.trim()) {
          queryParams.search = params.search.trim();
        }
        if (params.listing_status) {
          queryParams.listing_status = params.listing_status;
        }
        return {
          url: "/api/v2/products/get_products_list/",
          method: "GET",
          params: queryParams,
        };
      },
    }),

    /**
     * Get detailed product data using the id (for detail view)
     * @param id - The id of the product to get the details for
     * @returns the details of the product
     */
    getProductDetails: builder.query({
      query: (id) => ({
        url: `/api/v2/products/product_details/`,
        method: "GET",
        params: { id: id },
      }),
    }),

    /**
     * Get all the categories in the store
     * @returns the list of categories
     */
    getAllCategories: builder.query({
      query: () => ({
        url: "/api/v2/products/all_categories/",
        method: "GET",
      }),
    }),

    /* Delete a product from the store */
    deleteProduct: builder.mutation({
      query: (pk) => ({
        url: `/api/v2/products/delete_product/`,
        params: { pk },
        data: { pk: pk },
        method: "DELETE",
      }),
    }),

    /* Edit a product in the store */
    editProduct: builder.mutation({
      query: (formData) => ({
        url: "/api/v2/products/edit_product/",
        method: "PATCH",
        data: formData,
      }),
    }),
  }),
});

export const {
  useAddProductMutation,
  useInitiateListingFeeMutation,
  useDeleteProductMutation,
  useEditProductMutation,
  useGetProductsListQuery,
  useGetProductDetailsQuery,
  useGetAllCategoriesQuery,
} = inventoryApi;
export default inventoryApi;
