export interface Notification {
  id: string;
  title: string;
  details: string;
  eventTime?: string;
  receivedTime?: string;
  isNew: boolean;
  groupDate: string; // For section grouping (e.g., "Today", "Yesterday", "This Week")
  createdAt: Date;
}

export interface NotificationSection {
  title: string;
  data: Notification[];
}

export interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}
