import { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_CONFIG } from "@/constants/Config";
import { setIsAuthenticated, refreshTokenSuccess } from "../slices/authSlice";
import type { RootState } from "../../store";
import { Platform } from "react-native";

const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: 30000,
});

type RefreshTokensResult = { access: string; refresh: string };

type ApiLike = {
  getState: () => unknown;
  dispatch: (action: unknown) => void;
};

let refreshPromise: Promise<RefreshTokensResult> | null = null;

async function refreshAccessToken(api: ApiLike): Promise<RefreshTokensResult> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const state = api.getState() as RootState;
      const refreshToken =
        state.auth.refresh || (await SecureStore.getItemAsync("refresh"));

      if (!refreshToken) {
        throw new Error("NO_REFRESH_TOKEN");
      }

      const refreshResponse = await axiosInstance.post(
        "/api/v1/auth/refresh/",
        { refresh: refreshToken },
      );

      const { access, refresh } = refreshResponse.data;
      await SecureStore.setItemAsync("access", access);
      await SecureStore.setItemAsync("refresh", refresh);

      api.dispatch(setIsAuthenticated(true));
      api.dispatch(refreshTokenSuccess({ access, refresh }));

      return { access, refresh };
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function handleRefreshFailure(api: ApiLike) {
  api.dispatch(setIsAuthenticated(false));
  return {
    error: {
      status: 401,
      data: "Authentication failed",
    },
  };
}

// List of endpoints that don't require authentication
const publicEndpoints = [
  "/api/v1/authentication/login/",
  "/api/v1/authentication/refresh/",
  "/api/v1/auth/login/",
  "/api/v1/auth/refresh/",
  "/api/v1/auth/google/",
  "/api/v1/onboarding/onboarding_user/",
  "/api/v1/onboarding/onboarding_seller/",
  "/api/v1/onboarding/create_store/",
  "/api/v1/onboarding/send_verification_code/",
  "/api/v1/onboarding/verify_verification_code/",
];

// Custom base query for RTK Query using axios with token refresh
// Uses fetch API for FormData requests in React Native for better compatibility
export const axiosBaseQuery = (): BaseQueryFn => {
  return async ({ url, method, data, params, headers }, api, extraOptions) => {
    try {
      // Get access token from state using api.getState()
      const state = api.getState() as RootState;
      const access =
        state.auth.access || (await SecureStore.getItemAsync("access"));

      // Check if data is FormData (React Native compatible check)
      const isFormData =
        data instanceof FormData ||
        (data &&
          typeof data === "object" &&
          data.constructor &&
          data.constructor.name === "FormData") ||
        (data && typeof data === "object" && "_parts" in data);

      // For FormData in React Native, use fetch API instead of axios
      // Axios has issues with React Native FormData serialization
      if (isFormData && Platform.OS !== "web") {
        // Build URL with params
        let fullUrl = `${API_CONFIG.baseURL}${url}`;
        if (params) {
          const queryString = new URLSearchParams(params as any).toString();
          fullUrl += `?${queryString}`;
        }

        // Build headers
        const requestHeaders: HeadersInit = {};
        if (access && !publicEndpoints.includes(url || "")) {
          requestHeaders.Authorization = `Bearer ${access}`;
        }

        const response = await fetch(fullUrl, {
          method: method || "GET",
          headers: requestHeaders,
          body: data as FormData,
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = await response.text();
          }

          // Handle 401 errors with token refresh
          if (response.status === 401) {
            try {
              const { access: newAccess } = await refreshAccessToken(api);

              const retryResponse = await fetch(fullUrl, {
                method: method || "GET",
                headers: { Authorization: `Bearer ${newAccess}` },
                body: data as FormData,
              });

              if (!retryResponse.ok) {
                let retryErrorData;
                try {
                  retryErrorData = await retryResponse.json();
                } catch {
                  retryErrorData = await retryResponse.text();
                }
                return {
                  error: {
                    status: retryResponse.status,
                    data: retryErrorData,
                  },
                };
              }

              let retryResponseData;
              try {
                retryResponseData = await retryResponse.json();
              } catch {
                retryResponseData = await retryResponse.text();
              }

              return {
                data: retryResponseData,
                meta: {
                  response: retryResponse,
                },
              };
            } catch (refreshError) {
              if (
                refreshError instanceof Error &&
                refreshError.message === "NO_REFRESH_TOKEN"
              ) {
                api.dispatch(setIsAuthenticated(false));
                return {
                  error: {
                    status: 401,
                    data: "Authentication failed - no refresh token",
                  },
                };
              }
              return handleRefreshFailure(api);
            }
          }

          return {
            error: {
              status: response.status,
              data: errorData,
            },
          };
        }

        let responseData;
        try {
          responseData = await response.json();
        } catch {
          responseData = await response.text();
        }

        return {
          data: responseData,
          meta: {
            response: response,
          },
        };
      }

      // For non-FormData requests, use axios as before
      // Build headers with authentication if needed
      const requestHeaders = { ...headers };
      if (access && !publicEndpoints.includes(url || "")) {
        requestHeaders.Authorization = `Bearer ${access}`;
      }

      // Set Content-Type header based on data type
      if (data && typeof data === "object" && !requestHeaders["Content-Type"]) {
        requestHeaders["Content-Type"] = "application/json";
      }

      const config: AxiosRequestConfig = {
        url,
        method,
        data,
        params,
        headers: requestHeaders,
      };

      const response: AxiosResponse = await axiosInstance(config);

      return {
        data: response.data,
        meta: {
          response: response,
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      // Handle 401 errors with token refresh
      if (axiosError.response?.status === 401) {
        try {
          const { access: newAccess } = await refreshAccessToken(api);

          const retryHeaders = { ...headers };
          retryHeaders.Authorization = `Bearer ${newAccess}`;

          const retryConfig: AxiosRequestConfig = {
            url,
            method,
            data,
            params,
            headers: retryHeaders,
          };

          const retryResponse: AxiosResponse =
            await axiosInstance(retryConfig);

          return {
            data: retryResponse.data,
            meta: {
              response: retryResponse,
            },
          };
        } catch (refreshError) {
          if (
            refreshError instanceof Error &&
            refreshError.message === "NO_REFRESH_TOKEN"
          ) {
            api.dispatch(setIsAuthenticated(false));
            return {
              error: {
                status: 401,
                data: "Authentication failed - no refresh token",
              },
            };
          }
          return handleRefreshFailure(api);
        }
      }

      // Return other errors as normal
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data || axiosError.message,
        },
      };
    }
  };
};

export default axiosBaseQuery;
