import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Colors } from "../../../../constants/Colors";
import {
  MessageDetailProps,
  Message,
} from "../../../interfaces/seller/MessageInterfaces";
import { Ionicons } from "@expo/vector-icons";

const MessageDetail: React.FC<MessageDetailProps> = ({
  thread,
  onBack,
  onSendMessage,
  onResolve,
  onClose,
  style,
  ...props
}) => {
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!replyText.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(replyText.trim());
      setReplyText("");
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const getSenderName = (sender: string) => {
    switch (sender) {
      case "seller":
        return "You";
      case "support":
        return "Support Team";
      case "system":
        return "System";
      default:
        return "Unknown";
    }
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case "seller":
        return Colors.light.button;
      case "support":
        return "#4ECDC4";
      case "system":
        return "#FF9800";
      default:
        return Colors.light.icons;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "seller" ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.sender === "seller" ? styles.sentBubble : styles.receivedBubble,
          {
            backgroundColor:
              item.sender === "seller"
                ? Colors.light.button
                : Colors.light.button,
          },
        ]}
      >
        <View style={styles.messageHeader}>
          <Text
            style={[styles.senderName, { color: getSenderColor(item.sender) }]}
          >
            {getSenderName(item.sender)}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>

        <Text
          style={[
            styles.messageText,
            {
              color:
                item.sender === "seller"
                  ? Colors.light.buttonText
                  : Colors.light.text,
            },
          ]}
        >
          {item.content}
        </Text>

        {item.priority === "urgent" && (
          <View style={styles.priorityBadge}>
            <Ionicons name="warning" size={12} color="#FF6B6B" />
            <Text style={styles.priorityText}>Urgent</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderThreadInfo = () => (
    <View style={styles.threadInfo}>
      <View style={styles.threadHeader}>
        <Text style={styles.threadSubject}>{thread.subject}</Text>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  thread.status === "active" ? "#4CAF50" : "#9E9E9E",
              },
            ]}
          />
          <Text style={styles.statusText}>
            {thread.status.charAt(0).toUpperCase() + thread.status.slice(1)}
          </Text>
        </View>
      </View>

      {thread.caseId && (
        <View style={styles.caseInfo}>
          <Ionicons name="document" size={16} color={Colors.light.icons} />
          <Text style={styles.caseText}>Case #{thread.caseId}</Text>
        </View>
      )}

      {thread.orderId && (
        <View style={styles.orderInfo}>
          <Ionicons name="bag" size={16} color={Colors.light.icons} />
          <Text style={styles.orderText}>Order #{thread.orderId}</Text>
        </View>
      )}
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      {thread.status === "active" && onResolve && (
        <TouchableOpacity style={styles.actionButton} onPress={onResolve}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={[styles.actionText, { color: "#4CAF50" }]}>Resolve</Text>
        </TouchableOpacity>
      )}

      {thread.status === "active" && onClose && (
        <TouchableOpacity style={styles.actionButton} onPress={onClose}>
          <Ionicons name="close-circle" size={20} color="#FF6B6B" />
          <Text style={[styles.actionText, { color: "#FF6B6B" }]}>Close</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, style]} {...props}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Message Thread</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Thread Info */}
      {renderThreadInfo()}

      {/* Actions */}
      {renderActions()}

      {/* Messages */}
      <FlatList
        data={thread.messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Reply Input */}
      <View style={styles.replyContainer}>
        <TextInput
          style={styles.replyInput}
          placeholder="Type your reply..."
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxLength={1000}
          placeholderTextColor={Colors.light.icons}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!replyText.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!replyText.trim() || isSending}
        >
          <Ionicons
            name="send"
            size={20}
            color={
              replyText.trim() && !isSending
                ? Colors.light.buttonText
                : Colors.light.icons
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borders,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
  threadInfo: {
    padding: 16,  
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borders,
  },
  threadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  threadSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
  },
  statusBadge: {
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
    color: Colors.light.icons,
    textTransform: "capitalize",
  },
  caseInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  caseText: {
    fontSize: 14,
    color: Colors.light.icons,
    marginLeft: 8,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderText: {
    fontSize: 14,
    color: Colors.light.icons,
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borders,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.borders,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  sentMessage: {
    alignItems: "flex-end",
  },
  receivedMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  sentBubble: {
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 10,
    color: Colors.light.icons,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FF6B6B20",
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  priorityText: {
    fontSize: 10,
    color: "#FF6B6B",
    marginLeft: 4,
    fontWeight: "600",
  },
  replyContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borders,
    backgroundColor: Colors.light.background,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.borders,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 14,
    color: Colors.light.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.button,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.borders,
  },
});

export default MessageDetail;
