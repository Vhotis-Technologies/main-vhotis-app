import * as Notifications from "expo-notifications";

export type OrderNotificationHandlers = {
  handleNotificationClaim: (claimId: string) => Promise<unknown>;
  handleNotificationView: (orderId: string) => void;
};

// Dedupe keys survive listener re-registration; cleared entries are not re-used
// for the same notification action in one app session.
const processedResponseKeys = new Set<string>();

const getResponseDedupeKey = (
  response: Notifications.NotificationResponse,
): string => {
  const { actionIdentifier, notification } = response;
  const requestId = notification.request.identifier;
  return `${requestId}:${actionIdentifier}`;
};

const markResponseProcessed = (
  response: Notifications.NotificationResponse,
): boolean => {
  const key = getResponseDedupeKey(response);
  if (processedResponseKeys.has(key)) {
    return false;
  }
  processedResponseKeys.add(key);
  return true;
};

// Configure notification categories for iOS
export const configureNotificationCategories = async () => {
  await Notifications.setNotificationCategoryAsync("ORDER_NOTIFICATION", [
    {
      identifier: "CLAIM_ORDER",
      buttonTitle: "Claim Order",
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
    {
      identifier: "VIEW_ORDER",
      buttonTitle: "View Details",
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
  ]);
};

const clearStoredNotificationResponse = async () => {
  try {
    await Notifications.clearLastNotificationResponseAsync();
  } catch (error) {
    console.log("Failed to clear last notification response:", error);
  }
};

/* Handles the notification responses when the user taps the action buttons  */
export const handleNotificationResponse = async (
  response: Notifications.NotificationResponse,
  getHandlers?: () => OrderNotificationHandlers | undefined,
) => {
  if (!markResponseProcessed(response)) {
    return;
  }

  const orderHandlers = getHandlers?.();
  const { actionIdentifier, notification } = response;
  const data = notification.request.content.data;
  const notificationId = notification.request.identifier;
  const claimIdRaw = data.claim_id ?? data.claimId;
  const orderIdRaw = data.order_id ?? data.orderId;
  const claimId =
    claimIdRaw != null && claimIdRaw !== "" ? String(claimIdRaw) : undefined;
  const orderId =
    orderIdRaw != null && orderIdRaw !== "" ? String(orderIdRaw) : undefined;

  try {
    if (actionIdentifier === "CLAIM_ORDER") {
      if (claimId && orderHandlers?.handleNotificationClaim) {
        await orderHandlers.handleNotificationClaim(claimId);
        await Notifications.dismissNotificationAsync(notificationId);
      }
    } else if (actionIdentifier === "VIEW_ORDER") {
      if (orderId && orderHandlers?.handleNotificationView) {
        orderHandlers.handleNotificationView(orderId);
        await Notifications.dismissNotificationAsync(notificationId);
      }
    }
  } finally {
    await clearStoredNotificationResponse();
  }
};

/* Sets up the notification listeners */
export const setupNotificationListeners = (
  getHandlers?: () => OrderNotificationHandlers | undefined,
) => {
  const processResponse = (response: Notifications.NotificationResponse) => {
    void handleNotificationResponse(response, getHandlers);
  };

  // Cold start: app opened from a notification action while killed.
  Notifications.getLastNotificationResponseAsync()
    .then((lastResponse) => {
      if (lastResponse) {
        processResponse(lastResponse);
      }
    })
    .catch((error) => {
      console.log("Failed to process last notification response:", error);
    });

  const responseListener =
    Notifications.addNotificationResponseReceivedListener(processResponse);

  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Notification received:", notification);
    },
  );

  return () => {
    responseListener.remove();
    notificationListener.remove();
  };
};
