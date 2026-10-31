import { useCallback, useMemo } from "react";
import {
  ApiNotification,
  useGetNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "@/app/store/main/api/notificationApi";
import {
  Notification,
  NotificationSection,
} from "@/app/interfaces/main/notifications/NotificationInterface";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";

export function mapApiNotification(api: ApiNotification): Notification {
  const createdAt = new Date(api.created_at);
  const relativeTime = formatRelativeTime(createdAt);

  return {
    id: api.id,
    title: api.title,
    details: api.details,
    eventTime: relativeTime,
    receivedTime: relativeTime,
    isNew: api.is_new,
    groupDate: api.group_date || (api.is_new ? "New" : "Recent"),
    createdAt,
  };
}

export function groupNotificationsIntoSections(
  notifications: Notification[]
): NotificationSection[] {
  const sectionOrder = ["New", "Recent"];
  const sections = new Map<string, Notification[]>();

  for (const notification of notifications) {
    const title = notification.groupDate || "Recent";
    const existing = sections.get(title) ?? [];
    existing.push(notification);
    sections.set(title, existing);
  }

  const ordered: NotificationSection[] = [];
  for (const title of sectionOrder) {
    const data = sections.get(title);
    if (data?.length) {
      ordered.push({ title, data });
      sections.delete(title);
    }
  }

  for (const [title, data] of sections) {
    ordered.push({ title, data });
  }

  return ordered;
}

export function useMainNotifications() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetNotificationsQuery();
  const [markAsReadMutation] = useMarkNotificationAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllNotificationsAsReadMutation();

  const notifications = useMemo(
    () => (data?.notifications ?? []).map(mapApiNotification),
    [data?.notifications]
  );

  const notificationSections = useMemo(
    () => groupNotificationsIntoSections(notifications),
    [notifications]
  );

  const unreadCount = data?.unread_count ?? 0;

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await markAsReadMutation({ notification_id: notificationId }).unwrap();
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation().unwrap();
  }, [markAllAsReadMutation]);

  const refreshNotifications = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    notifications,
    notificationSections,
    unreadCount,
    isLoading,
    isFetching,
    isError,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  };
}
