import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColor } from "../../../../hooks/useThemeColor";
import { MessageThreadItemProps } from "../../../interfaces/seller/MessageInterfaces";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "../../helpers/forms/StyledText";

const MessageThreadItem: React.FC<MessageThreadItemProps> = ({
  thread,
  onPress,
  isSelected = false,
  style,
  ...props
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconsColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");
  const bordersColor = useThemeColor({}, "borders");
  const buttonTextColor = useThemeColor({}, "buttonText");
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "dispute":
        return "alert-circle";
      case "support":
        return "help-circle";
      case "case_review":
        return "document-text";
      default:
        return "chatbubble";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "dispute":
        return "#FF6B6B";
      case "support":
        return "#4ECDC4";
      case "case_review":
        return "#45B7D1";
      default:
        return "#96CEB4";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "resolved":
        return "#2196F3";
      case "closed":
        return "#9E9E9E";
      default:
        return "#FF9800";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor, borderColor: bordersColor },
        isSelected && [styles.selectedContainer, { borderColor: buttonColor }],
        style,
      ]}
      onPress={() => onPress(thread)}
      activeOpacity={0.7}
      {...props}
    >
      {/* Category Icon */}
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconBackground,
            { backgroundColor: getCategoryColor(thread.category) + "20" },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(thread.category) as any}
            size={20}
            color={getCategoryColor(thread.category)}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <StyledText
            style={[styles.subject, { color: textColor }]}
            numberOfLines={1}
            children={thread.subject}
          />
          <StyledText
            style={[styles.timestamp, { color: iconsColor }]}
            children={formatTimestamp(thread.lastMessage.timestamp)}
          />
        </View>

        <StyledText
          style={[styles.preview, { color: iconsColor }]}
          numberOfLines={2}
          children={truncateText(thread.lastMessage.content)}
        />

        <View style={styles.footer}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(thread.status) },
              ]}
            />
            <StyledText
              style={[styles.statusText, { color: iconsColor }]}
              children={thread.status.charAt(0).toUpperCase() + thread.status.slice(1)}
            />
          </View>

          {thread.caseId && (
            <View style={styles.caseContainer}>
              <Ionicons name="document" size={12} color={iconsColor} />
              <StyledText
                style={[styles.caseText, { color: iconsColor }]}
                children={`Case #${thread.caseId}`}
              />
            </View>
          )}
        </View>
      </View>

      {/* Unread Badge */}
      {thread.unreadCount > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: buttonColor }]}>
          <StyledText
            style={[styles.unreadCount, { color: buttonTextColor }]}
            children={thread.unreadCount > 99 ? "99+" : thread.unreadCount.toString() }
          />
        </View>
      )}

      {/* Priority Indicator */}
      {thread.lastMessage.priority === "urgent" && (
        <View style={styles.priorityIndicator}>
          <Ionicons name="warning" size={16} color="#FF6B6B" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  selectedContainer: {
    opacity: 0.1,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  subject: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  preview: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  caseContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  caseText: {
    fontSize: 12,
    marginLeft: 4,
  },
  unreadBadge: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  priorityIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});

export default MessageThreadItem;
