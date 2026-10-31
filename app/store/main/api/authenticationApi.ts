import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";

export const authenticationApi = createApi({
  reducerPath: "authenticationApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    /* Login api makes the request to the server and returns the user, token and refresh token */
    login: builder.mutation({
      query: (credentials) => ({
        url: "/api/v1/auth/login/",
        method: "POST",
        data: credentials,
      }),
    }),

    /* Send the notification token to the server */
    send_notification_token: builder.mutation({
      query: (credentials) => ({
        url: "/api/v1/auth/send-notification-token",
        method: "POST",
        data: credentials,
      }),
    }),

    /* Refresh token endpoint */
    refreshToken: builder.mutation({
      query: (token) => ({
        url: "/api/v1/auth/refresh/",
        method: "POST",
        data: { token: token },
      }),
    }),

    /* Send a new guest user to the server */
    createGuestUser: builder.mutation({
      query: () => ({
        url: "/api/v1/auth/create-guest-user/",
        method: "POST",
      }),
    }),

    /* Google login: exchange native ID token for app JWTs */
    googleLogin: builder.mutation({
      query: (body: { id_token: string }) => ({
        url: "/api/v1/auth/google/",
        method: "POST",
        data: body,
      }),
    }),

    /* Convert guest users to the a new user when the user provides the credentials */
    convertGuestUser: builder.mutation({
      query: (credentials) => ({
        url: "/api/v1/auth/convert-guest-user",
        method: "POST",
        data: credentials,
      }),
    }),

    /* Get user profile */
    getProfile: builder.query({
      query: () => ({
        url: "/api/v1/auth/profile/",
        method: "GET",
      }),
    }),

    /* Update user profile */
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: "/api/v1/auth/profile",
        method: "PUT",
        data: profileData,
      }),
    }),

    /* Update user location and push token */
    updateUserLocation: builder.mutation({
      query: (locationData) => ({
        url: "/api/v1/auth/update-location/",
        method: "PATCH",
        data: locationData,
      }),
    }),

    /* Send device information to server */
    sendDeviceInfo: builder.mutation({
      query: (deviceInfo) => ({
        url: "/api/v1/devices/save_device_info/",
        method: "POST",
        data: deviceInfo,
      }),
    }),

    /* Get device sessions */
    getDeviceSessions: builder.query({
      query: () => ({
        url: "/api/v1/devices/get_all_sessions/",
        method: "GET",
      }),
    }),

    /* Logout specific device session */
    logoutDeviceSession: builder.mutation({
      query: (sessionId) => ({
        url: "/api/v1/devices/logout_device_session/",
        method: "POST",
        data: { sessionId: sessionId },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSend_notification_tokenMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useCreateGuestUserMutation,
  useConvertGuestUserMutation,
  useGoogleLoginMutation,
  useUpdateUserLocationMutation,
  useSendDeviceInfoMutation,
  useGetDeviceSessionsQuery,
  useLogoutDeviceSessionMutation,
} = authenticationApi;
