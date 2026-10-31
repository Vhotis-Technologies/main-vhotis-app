import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../../main/api/rtkBaseQuery";

export type ProductImportStatus =
  | "uploaded"
  | "parsing"
  | "queued"
  | "processing"
  | "awaiting_review"
  | "committing"
  | "completed"
  | "completed_with_errors"
  | "failed"
  | "cancelled";

export type ProductImportRowStatus =
  | "ready"
  | "warning"
  | "blocked"
  | "accepted"
  | "skipped"
  | "imported"
  | "failed";

export type ProductImportJob = {
  id: string;
  original_filename: string;
  gcs_path: string;
  content_type?: string | null;
  file_size?: number | null;
  status: ProductImportStatus;
  total_rows: number;
  processed_rows: number;
  success_count: number;
  failure_count: number;
  ready_count?: number;
  warning_count?: number;
  blocked_count?: number;
  accepted_count?: number;
  skipped_count?: number;
  imported_count?: number;
  created_at: string;
  updated_at: string;
};

export type ProductImportRow = {
  id: number;
  row_number: number;
  status: ProductImportRowStatus;
  product_id?: string | null;
  category?: number | null;
  category_name?: string | null;
  suggested_category?: number | null;
  suggested_category_name?: string | null;
  seller_sku?: string | null;
  barcode?: string | null;
  name?: string | null;
  raw_row: Record<string, unknown>;
  normalized_row: Record<string, unknown>;
  corrected_row: Record<string, unknown>;
  image_urls: string[];
  image_results: Record<string, unknown>[];
  field_errors: Record<string, string>;
  warnings: string[];
  last_error?: string | null;
};

type RowsResponse = {
  count: number;
  page: number;
  page_size: number;
  results: ProductImportRow[];
};

export type CommitImportRowsResponse = {
  started: boolean;
  queued_rows?: number;
  message?: string;
  job: ProductImportJob;
};

const productImportApi = createApi({
  reducerPath: "productImportApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ProductImportJob", "ProductImportRows"],
  endpoints: (builder) => ({
    getImportJobs: builder.query<ProductImportJob[], void>({
      query: () => ({
        url: "/api/v2/product-imports/list/",
        method: "GET",
      }),
      providesTags: ["ProductImportJob"],
    }),
    /* This api is tasked with the uoload of csv or other documents to the server */
    uploadImportCsv: builder.mutation<ProductImportJob, FormData>({
      query: (formData) => ({
        url: "/api/v2/product-imports/upload/",
        method: "POST",
        data: formData,
      }),
      invalidatesTags: ["ProductImportJob"],
    }),

    deleteImportJob: builder.mutation<{ message: string }, string>({
      query: (jobId) => ({
        url: "/api/v2/product-imports/delete/",
        method: "DELETE",
        params: { job_id: jobId },
      }),
      invalidatesTags: ["ProductImportJob"],
    }),
    
    getImportJob: builder.query<ProductImportJob, string>({
      query: (jobId) => ({
        url: "/api/v2/product-imports/detail/",
        method: "GET",
        params: { job_id: jobId },
      }),
      providesTags: (_result, _error, jobId) => [{ type: "ProductImportJob", id: jobId }],
    }),
    getImportRows: builder.query<
      RowsResponse,
      { jobId: string; status?: string; page?: number; pageSize?: number }
    >({
      query: ({ jobId, status = "all", page = 1, pageSize = 50 }) => ({
        url: "/api/v2/product-imports/rows/",
        method: "GET",
        params: { job_id: jobId, status, page, page_size: pageSize },
      }),
      providesTags: (_result, _error, args) => [{ type: "ProductImportRows", id: args.jobId }],
    }),
    patchImportRow: builder.mutation<
      ProductImportRow,
      { jobId: string; rowId: number; values: Record<string, unknown> }
    >({
      query: ({ jobId, rowId, values }) => ({
        url: "/api/v2/product-imports/row/",
        method: "PATCH",
        params: { job_id: jobId, row_id: rowId },
        data: { values },
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: "ProductImportJob", id: args.jobId },
        { type: "ProductImportRows", id: args.jobId },
      ],
    }),
    bulkImportRowAction: builder.mutation<
      { updated: number; job: ProductImportJob },
      { jobId: string; action: "accept" | "skip" | "apply_suggestion"; rowIds?: number[]; status?: string }
    >({
      query: ({ jobId, ...data }) => ({
        url: "/api/v2/product-imports/bulk_action/",
        method: "POST",
        params: { job_id: jobId },
        data,
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: "ProductImportJob", id: args.jobId },
        { type: "ProductImportRows", id: args.jobId },
      ],
    }),
    commitImportRows: builder.mutation<
      CommitImportRowsResponse,
      { jobId: string; rowIds?: number[]; replaceImages?: boolean }
    >({
      query: ({ jobId, rowIds, replaceImages = false }) => ({
        url: "/api/v2/product-imports/commit/",
        method: "POST",
        params: { job_id: jobId },
        data: { row_ids: rowIds, replace_images: replaceImages },
      }),
      invalidatesTags: (_result, _error, args) => [
        "ProductImportJob",
        { type: "ProductImportJob", id: args.jobId },
        { type: "ProductImportRows", id: args.jobId },
      ],
    }),
  }),
});

export const {
  useBulkImportRowActionMutation,
  useCommitImportRowsMutation,
  useDeleteImportJobMutation,
  useGetImportJobQuery,
  useGetImportJobsQuery,
  useGetImportRowsQuery,
  usePatchImportRowMutation,
  useUploadImportCsvMutation,
} = productImportApi;

export default productImportApi;
