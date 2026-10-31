import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./rtkBaseQuery";

export interface ApiNotification {
  id: string;
  title: string;
  details: string;
  event_time: string | null;
  received_time: string | null;
  is_new: boolean;
  group_date: string;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: ApiNotification[];
  unread_count: number;
}

export interface NotificationPreferences {
  allow_push_notification: boolean;
  allow_email_notification: boolean;
  allow_marketing_emails: boolean;
}

export interface UpdateNotificationPreferencesPayload {
  allow_push_notification?: boolean;
  allow_email_notification?: boolean;
  allow_marketing_emails?: boolean;
}

const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Notifications", "NotificationPreferences"],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => ({
        url: "/api/v1/notifications/get_notifications/",
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),
    markNotificationAsRead: builder.mutation<
      { success: boolean },
      { notification_id: string }
    >({
      query: (body) => ({
        url: "/api/v1/notifications/mark_as_read/",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/api/v1/notifications/mark_all_as_read/",
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => ({
        url: "/api/v1/notifications/get_notification_preferences/",
        method: "GET",
      }),
      providesTags: ["NotificationPreferences"],
    }),
    updateNotificationPreferences: builder.mutation<
      { success: boolean; preferences: NotificationPreferences },
      UpdateNotificationPreferencesPayload
    >({
      query: (body) => ({
        url: "/api/v1/notifications/update_notification_preferences/",
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["NotificationPreferences"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationApi;

export default notificationApi;
