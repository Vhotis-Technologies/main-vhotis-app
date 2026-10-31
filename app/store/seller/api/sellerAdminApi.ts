import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";

export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  storeId: string | null;
}

export interface AdminResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  store_id?: string;
  stores?: Array<{
    id: string;
    business_name: string;
  }>;
}

export interface CreateAdminResponse {
  message: string;
  admin_id: string;
  admin: AdminResponse;
}

export interface ListAdminsResponse {
  admins: AdminResponse[];
  count: number;
}

export interface RemoveAdminRequest {
  admin_id: string;
}

export interface RemoveAdminResponse {
  message: string;
}

const sellerAdminApi = createApi({
  reducerPath: "sellerAdminApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    /* Create a new admin for the seller's store */
    createAdmin: builder.mutation<CreateAdminResponse, CreateAdminRequest>({
      query: (credentials) => ({
        url: "/api/v2/seller_admin/create/",
        method: "POST",
        data: {
          ...credentials,
          store_id: credentials.storeId,
        },
      }),
    }),

    /* List all admins for the seller's stores */
    listAdmins: builder.query<ListAdminsResponse, void>({
      query: () => ({
        url: "/api/v2/seller_admin/list/",
        method: "GET",
      }),
    }),

    /* Remove an admin from store association */
    removeAdmin: builder.mutation<RemoveAdminResponse, RemoveAdminRequest>({
      query: (credentials) => ({
        url: "/api/v2/seller_admin/remove/",
        method: "DELETE",
        data: credentials,
      }),
    }),
  }),
});

export const {
  useCreateAdminMutation,
  useListAdminsQuery,
  useRemoveAdminMutation,
} = sellerAdminApi;

export default sellerAdminApi;
