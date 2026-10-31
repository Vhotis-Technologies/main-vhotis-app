import { useState, useEffect, useCallback } from "react";
import {
  MessageThread,
  MessageStats,
  Message,
} from "../../interfaces/seller/MessageInterfaces";

interface UseSellerMessagesReturn {
  threads: MessageThread[];
  stats: MessageStats;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  selectedStatus: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedStatus: (status: string) => void;
  refreshMessages: () => Promise<void>;
  sendMessage: (threadId: string, content: string) => Promise<void>;
  markAsRead: (threadId: string) => Promise<void>;
  resolveThread: (threadId: string) => Promise<void>;
  closeThread: (threadId: string) => Promise<void>;
}

export const useSellerMessages = (): UseSellerMessagesReturn => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    unread: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock data for demonstration
  const mockMessages: Message[] = [
    {
      id: "1",
      subject: "Dispute Resolution Request",
      content:
        "Customer is disputing the quality of the delivered product. Need immediate attention to resolve this issue.",
      sender: "support",
      recipient: "seller",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      priority: "urgent",
      category: "dispute",
      status: "open",
      caseId: "CASE-2024-001",
      orderId: "ORD-12345",
    },
    {
      id: "2",
      subject: "Technical Support - Payment Issues",
      content:
        "Having trouble with payment processing. The system is not accepting credit card payments.",
      sender: "seller",
      recipient: "support",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      priority: "high",
      category: "support",
      status: "in_progress",
    },
    {
      id: "3",
      subject: "Case Review - Product Return",
      content:
        "Customer returned product due to manufacturing defect. Case needs review for refund approval.",
      sender: "system",
      recipient: "seller",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      priority: "medium",
      category: "case_review",
      status: "open",
      caseId: "CASE-2024-002",
      orderId: "ORD-12346",
    },
    {
      id: "4",
      subject: "General Inquiry - Shipping Policy",
      content:
        "Question about international shipping policies and delivery timeframes.",
      sender: "seller",
      recipient: "support",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      priority: "low",
      category: "general",
      status: "resolved",
    },
    {
      id: "5",
      subject: "Dispute - Wrong Item Delivered",
      content:
        "Customer received wrong item. Need to arrange return and correct item delivery.",
      sender: "support",
      recipient: "seller",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      priority: "high",
      category: "dispute",
      status: "closed",
      caseId: "CASE-2024-003",
      orderId: "ORD-12347",
    },
  ];

  const mockThreads: MessageThread[] = [
    {
      id: "1",
      subject: "Dispute Resolution Request",
      messages: [mockMessages[0]],
      lastMessage: mockMessages[0],
      unreadCount: 1,
      status: "active",
      category: "dispute",
      createdAt: mockMessages[0].timestamp,
      updatedAt: mockMessages[0].timestamp,
      caseId: "CASE-2024-001",
      orderId: "ORD-12345",
    },
    {
      id: "2",
      subject: "Technical Support - Payment Issues",
      messages: [mockMessages[1]],
      lastMessage: mockMessages[1],
      unreadCount: 0,
      status: "active",
      category: "support",
      createdAt: mockMessages[1].timestamp,
      updatedAt: mockMessages[1].timestamp,
    },
    {
      id: "3",
      subject: "Case Review - Product Return",
      messages: [mockMessages[2]],
      lastMessage: mockMessages[2],
      unreadCount: 1,
      status: "active",
      category: "case_review",
      createdAt: mockMessages[2].timestamp,
      updatedAt: mockMessages[2].timestamp,
      caseId: "CASE-2024-002",
      orderId: "ORD-12346",
    },
    {
      id: "4",
      subject: "General Inquiry - Shipping Policy",
      messages: [mockMessages[3]],
      lastMessage: mockMessages[3],
      unreadCount: 0,
      status: "resolved",
      category: "general",
      createdAt: mockMessages[3].timestamp,
      updatedAt: mockMessages[3].timestamp,
    },
    {
      id: "5",
      subject: "Dispute - Wrong Item Delivered",
      messages: [mockMessages[4]],
      lastMessage: mockMessages[4],
      unreadCount: 0,
      status: "closed",
      category: "dispute",
      createdAt: mockMessages[4].timestamp,
      updatedAt: mockMessages[4].timestamp,
      caseId: "CASE-2024-003",
      orderId: "ORD-12347",
    },
  ];

  const calculateStats = useCallback(
    (threads: MessageThread[]): MessageStats => {
      return {
        total: threads.length,
        unread: threads.filter((t) => t.unreadCount > 0).length,
        open: threads.filter((t) => t.status === "active").length,
        inProgress: threads.filter((t) => t.status === "active").length,
        resolved: threads.filter((t) => t.status === "resolved").length,
        urgent: threads.filter((t) => t.lastMessage.priority === "urgent")
          .length,
      };
    },
    []
  );

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setThreads(mockThreads);
      setStats(calculateStats(mockThreads));
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats]);

  const refreshMessages = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(async (threadId: string, content: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newMessage: Message = {
        id: Date.now().toString(),
        subject: "",
        content,
        sender: "seller",
        recipient: "support",
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: "medium",
        category: "general",
        status: "open",
      };

      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              messages: [...thread.messages, newMessage],
              lastMessage: newMessage,
              unreadCount: 0,
              updatedAt: newMessage.timestamp,
            };
          }
          return thread;
        })
      );
    } catch (err) {
      throw new Error("Failed to send message");
    }
  }, []);

  const markAsRead = useCallback(
    async (threadId: string) => {
      try {
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.id === threadId) {
              return {
                ...thread,
                unreadCount: 0,
                messages: thread.messages.map((msg) => ({
                  ...msg,
                  isRead: true,
                })),
              };
            }
            return thread;
          })
        );

        // Recalculate stats
        setStats(calculateStats(threads));
      } catch (err) {
        throw new Error("Failed to mark as read");
      }
    },
    [threads, calculateStats]
  );

  const resolveThread = useCallback(
    async (threadId: string) => {
      try {
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.id === threadId) {
              return {
                ...thread,
                status: "resolved" as const,
                updatedAt: new Date().toISOString(),
              };
            }
            return thread;
          })
        );

        // Recalculate stats
        setStats(calculateStats(threads));
      } catch (err) {
        throw new Error("Failed to resolve thread");
      }
    },
    [threads, calculateStats]
  );

  const closeThread = useCallback(
    async (threadId: string) => {
      try {
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.id === threadId) {
              return {
                ...thread,
                status: "closed" as const,
                updatedAt: new Date().toISOString(),
              };
            }
            return thread;
          })
        );

        // Recalculate stats
        setStats(calculateStats(threads));
      } catch (err) {
        throw new Error("Failed to close thread");
      }
    },
    [threads, calculateStats]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    threads,
    stats,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    selectedStatus,
    setSearchQuery,
    setSelectedCategory,
    setSelectedStatus,
    refreshMessages,
    sendMessage,
    markAsRead,
    resolveThread,
    closeThread,
  };
};
