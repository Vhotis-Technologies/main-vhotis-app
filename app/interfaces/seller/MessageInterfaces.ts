import { ReactNode } from "react";
import { ViewProps } from "react-native";

export interface Message {
  id: string;
  subject: string;
  content: string;
  sender: "seller" | "support" | "system";
  recipient: "seller" | "support" | "system";
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  category: "dispute" | "support" | "case_review" | "general";
  attachments?: MessageAttachment[];
  status: "open" | "in_progress" | "resolved" | "closed";
  caseId?: string;
  orderId?: string;
  productId?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: "image" | "document" | "video";
  url: string;
  size: number;
}

export interface MessageThread {
  id: string;
  subject: string;
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
  status: "active" | "resolved" | "closed";
  category: "dispute" | "support" | "case_review" | "general";
  createdAt: string;
  updatedAt: string;
  caseId?: string;
  orderId?: string;
  productId?: string;
}

export interface MessageListProps extends ViewProps {
  threads: MessageThread[];
  onThreadPress: (thread: MessageThread) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export interface MessageThreadItemProps extends ViewProps {
  thread: MessageThread;
  onPress: (thread: MessageThread) => void;
  isSelected?: boolean;
}

export interface MessageDetailProps extends ViewProps {
  thread: MessageThread;
  onBack: () => void;
  onSendMessage: (content: string, attachments?: File[]) => void;
  onResolve?: () => void;
  onClose?: () => void;
}

export interface MessageInputProps extends ViewProps {
  onSend: (content: string, attachments?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export interface MessageFiltersProps extends ViewProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
}

export interface MessageStats {
  total: number;
  unread: number;
  open: number;
  inProgress: number;
  resolved: number;
  urgent: number;
}

export interface MessageScreenProps extends ViewProps {
  stats?: MessageStats;
  threads?: MessageThread[];
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onThreadPress: (thread: MessageThread) => void;
  onNewMessage?: () => void;
}

export interface MessageHeaderProps extends ViewProps {
  title: string;
  stats?: MessageStats;
  onBack?: () => void;
  onNewMessage?: () => void;
  onSearch?: (query: string) => void;
}

export interface MessageSearchProps extends ViewProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export interface MessageCategory {
  id: string;
  name: string;
  icon: ReactNode;
  color: string;
  count: number;
}

export interface MessageStatus {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface MessagePriority {
  id: string;
  name: string;
  color: string;
  icon: ReactNode;
}
