import React, { useEffect, useRef } from "react";
import {
  configureNotificationCategories,
  setupNotificationListeners,
  type OrderNotificationHandlers,
} from "@/app/_utils/notificationHandler";
import useSellerOrder from "@/app/hook/seller/useSellerOrder";

const NotificationSetup: React.FC = () => {
  const { handleNotificationClaim, handleNotificationView } = useSellerOrder();

  const handlersRef = useRef<OrderNotificationHandlers>({
    handleNotificationClaim,
    handleNotificationView,
  });
  handlersRef.current = {
    handleNotificationClaim,
    handleNotificationView,
  };

  useEffect(() => {
    configureNotificationCategories();

    const cleanup = setupNotificationListeners(() => handlersRef.current);

    return cleanup;
  }, []);

  return null;
};

export default NotificationSetup;
