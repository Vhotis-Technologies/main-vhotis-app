import { useState, useEffect, useCallback } from "react";
import {
  Notification,
  NotificationStats,
  NotificationTypeValue,
  NotificationCategoryValue,
} from "../../interfaces/seller/NotificationInterfaces";

interface UseSellerNotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  selectedPriority: string;
  selectedType: string;
  showRead: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedPriority: (priority: string) => void;
  setSelectedType: (type: string) => void;
  setShowRead: (show: boolean) => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

export const useSellerNotifications = (): UseSellerNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    orders: 0,
    payments: 0,
    inventory: 0,
    reviews: 0,
    support: 0,
    promotions: 0,
    system: 0,
    urgent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showRead, setShowRead] = useState(true);

  // Mock data for demonstration
  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: "New Order Received",
      message: "Order #ORD-2024-001 has been placed by John Doe for $299.99",
      type: "order_placed",
      category: "orders",
      priority: "high",
      isRead: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      actionText: "View Order",
      actionUrl: "/orders/ORD-2024-001",
      metadata: {
        orderId: "ORD-2024-001",
        amount: 299.99,
        currency: "USD",
        customerId: "CUST-001",
      },
    },
    {
      id: "2",
      title: "Payment Received",
      message: "Payment of $299.99 has been received for Order #ORD-2024-001",
      type: "payment_received",
      category: "payments",
      priority: "medium",
      isRead: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      actionText: "View Payment",
      metadata: {
        orderId: "ORD-2024-001",
        amount: 299.99,
        currency: "USD",
      },
    },
    {
      id: "3",
      title: "Low Inventory Alert",
      message:
        'Product "Wireless Headphones" is running low on stock (5 items remaining)',
      type: "inventory_low",
      category: "inventory",
      priority: "urgent",
      isRead: true,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      actionText: "Restock Now",
      metadata: {
        productId: "PROD-001",
        quantity: 5,
      },
    },
    {
      id: "4",
      title: "New Product Review",
      message:
        'Customer Sarah Johnson left a 5-star review for "Wireless Headphones"',
      type: "product_review",
      category: "reviews",
      priority: "low",
      isRead: true,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      actionText: "View Review",
      metadata: {
        productId: "PROD-001",
        rating: 5,
        reviewText: "Excellent sound quality and comfortable fit!",
        customerId: "CUST-002",
      },
    },
    {
      id: "5",
      title: "Order Shipped",
      message: "Order #ORD-2024-002 has been shipped to the customer",
      type: "order_shipped",
      category: "orders",
      priority: "medium",
      isRead: true,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      actionText: "Track Order",
      metadata: {
        orderId: "ORD-2024-002",
      },
    },
    {
      id: "6",
      title: "Promotion Created",
      message:
        'New promotion "Summer Sale 20% Off" has been successfully created',
      type: "promotion_created",
      category: "promotions",
      priority: "low",
      isRead: true,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      actionText: "View Promotion",
      metadata: {
        promotionId: "PROMO-001",
      },
    },
    {
      id: "7",
      title: "System Maintenance",
      message:
        "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM",
      type: "system_maintenance",
      category: "system",
      priority: "medium",
      isRead: false,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      actionText: "Learn More",
    },
    {
      id: "8",
      title: "Payment Failed",
      message:
        "Payment for Order #ORD-2024-003 failed. Please contact the customer.",
      type: "payment_failed",
      category: "payments",
      priority: "high",
      isRead: false,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      actionText: "Contact Customer",
      metadata: {
        orderId: "ORD-2024-003",
        amount: 149.99,
        currency: "USD",
      },
    },
  ];

  const calculateStats = useCallback(
    (notifications: Notification[]): NotificationStats => {
      return {
        total: notifications.length,
        unread: notifications.filter((n) => !n.isRead).length,
        orders: notifications.filter((n) => n.category === "orders").length,
        payments: notifications.filter((n) => n.category === "payments").length,
        inventory: notifications.filter((n) => n.category === "inventory")
          .length,
        reviews: notifications.filter((n) => n.category === "reviews").length,
        support: notifications.filter((n) => n.category === "support").length,
        promotions: notifications.filter((n) => n.category === "promotions")
          .length,
        system: notifications.filter((n) => n.category === "system").length,
        urgent: notifications.filter((n) => n.priority === "urgent").length,
      };
    },
    []
  );

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setNotifications(mockNotifications);
      setStats(calculateStats(mockNotifications));
    } catch (err) {
      setError("Failed to load notifications");
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        setNotifications((prev) =>
          prev.map((notification) => {
            if (notification.id === notificationId) {
              return { ...notification, isRead: true };
            }
            return notification;
          })
        );

        // Recalculate stats
        setStats(calculateStats(notifications));
      } catch (err) {
        throw new Error("Failed to mark as read");
      }
    },
    [notifications, calculateStats]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      // Recalculate stats
      setStats(calculateStats(notifications));
    } catch (err) {
      throw new Error("Failed to mark all as read");
    }
  }, [notifications, calculateStats]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );

        // Recalculate stats
        setStats(calculateStats(notifications));
      } catch (err) {
        throw new Error("Failed to delete notification");
      }
    },
    [notifications, calculateStats]
  );

  const deleteAllNotifications = useCallback(async () => {
    try {
      setNotifications([]);
      setStats({
        total: 0,
        unread: 0,
        orders: 0,
        payments: 0,
        inventory: 0,
        reviews: 0,
        support: 0,
        promotions: 0,
        system: 0,
        urgent: 0,
      });
    } catch (err) {
      throw new Error("Failed to delete all notifications");
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    stats,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    selectedPriority,
    selectedType,
    showRead,
    setSearchQuery,
    setSelectedCategory,
    setSelectedPriority,
    setSelectedType,
    setShowRead,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
};
