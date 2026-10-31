import { ReactNode } from "react";
import { ViewProps } from "react-native";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationTypeValue;
  category: NotificationCategoryValue;
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: NotificationMetadata;
  expiresAt?: string;
}

export type NotificationTypeValue =
  | "order_placed"
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "order_returned"
  | "payment_received"
  | "payment_failed"
  | "payment_refunded"
  | "inventory_low"
  | "inventory_out"
  | "product_review"
  | "customer_support"
  | "promotion_created"
  | "promotion_expired"
  | "system_maintenance"
  | "security_alert"
  | "account_verification"
  | "store_analytics"
  | "competitor_alert";

export type NotificationCategoryValue =
  | "orders"
  | "payments"
  | "inventory"
  | "reviews"
  | "support"
  | "promotions"
  | "system"
  | "security"
  | "analytics"
  | "general";

export interface NotificationMetadata {
  orderId?: string;
  productId?: string;
  customerId?: string;
  amount?: number;
  currency?: string;
  quantity?: number;
  rating?: number;
  reviewText?: string;
  storeId?: string;
  promotionId?: string;
  [key: string]: any;
}

export interface NotificationStats {
  total: number;
  unread: number;
  orders: number;
  payments: number;
  inventory: number;
  reviews: number;
  support: number;
  promotions: number;
  system: number;
  urgent: number;
}

export interface NotificationListProps extends ViewProps {
  notifications: Notification[];
  onNotificationPress: (notification: Notification) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  onMarkAllRead?: () => void;
  onDeleteAll?: () => void;
}

export interface NotificationItemProps extends ViewProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onMarkRead?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  isSelected?: boolean;
}

export interface NotificationHeaderProps extends ViewProps {
  title: string;
  stats?: NotificationStats;
  onBack?: () => void;
  onMarkAllRead?: () => void;
  onDeleteAll?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
}

export interface NotificationScreenProps extends ViewProps {
  stats?: NotificationStats;
  notifications?: Notification[];
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onNotificationPress: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onDeleteAll?: () => void;
}

export interface NotificationFiltersProps extends ViewProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  showRead: boolean;
  onShowReadChange: (show: boolean) => void;
}

export interface NotificationCategory {
  id: string;
  name: string;
  icon: ReactNode;
  color: string;
  count: number;
}

export interface NotificationPriority {
  id: string;
  name: string;
  color: string;
  icon: ReactNode;
}

export interface NotificationType {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  color: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderNotifications: boolean;
  paymentNotifications: boolean;
  inventoryNotifications: boolean;
  reviewNotifications: boolean;
  supportNotifications: boolean;
  promotionNotifications: boolean;
  systemNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface NotificationPreferences {
  userId: string;
  settings: NotificationSettings;
  categories: {
    [key in NotificationCategoryValue]: boolean;
  };
  types: {
    [key in NotificationTypeValue]: boolean;
  };
}

export interface NotificationTemplate {
  id: string;
  type: NotificationTypeValue;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  variables: string[];
}

export interface NotificationBatch {
  id: string;
  notifications: Notification[];
  createdAt: string;
  status: "pending" | "sent" | "failed";
  recipientCount: number;
  successCount: number;
  failureCount: number;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalRead: number;
  totalClicked: number;
  averageReadTime: number;
  categoryBreakdown: {
    [key in NotificationCategoryValue]: {
      sent: number;
      read: number;
      clicked: number;
    };
  };
  typeBreakdown: {
    [key in NotificationTypeValue]: {
      sent: number;
      read: number;
      clicked: number;
    };
  };
  timeSeries: {
    date: string;
    sent: number;
    read: number;
    clicked: number;
  }[];
}
