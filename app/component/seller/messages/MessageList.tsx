import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  ScrollView,
} from "react-native";
import { useThemeColor } from "../../../../hooks/useThemeColor";
import {
  MessageListProps,
  MessageThread,
} from "../../../interfaces/seller/MessageInterfaces";
import MessageThreadItem from "./MessageThreadItem";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "../../helpers/forms/StyledText";

const MessageList: React.FC<MessageListProps> = ({
  threads = [],
  onThreadPress,
  onRefresh,
  isLoading = false,
  searchQuery = "",
  onSearchChange,
  selectedCategory = "all",
  onCategoryChange,
  style,
  ...props
}) => {
  const [refreshing, setRefreshing] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const headerColor = useThemeColor({}, "button");
  const textColor = useThemeColor({}, "text");
  const iconsColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");
  const bordersColor = useThemeColor({}, "borders");

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setRefreshing(false);
  };

  const categories = [
    { id: "all", name: "All", color: buttonColor },
    { id: "dispute", name: "Disputes", color: "#FF6B6B" },
    { id: "support", name: "Support", color: "#4ECDC4" },
    { id: "case_review", name: "Case Reviews", color: "#45B7D1" },
    { id: "general", name: "General", color: "#96CEB4" },
  ];

  const filteredThreads = threads.filter((thread) => {
    const matchesSearch =
      thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessage.content
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || thread.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderThreadItem = (thread: MessageThread) => (
    <MessageThreadItem
      key={thread.id}
      thread={thread}
      onPress={onThreadPress}
    />
  );

  const renderCategoryFilter = () => (
    <View style={{ marginBottom: 10 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
              { borderColor: category.color },
            ]}
            onPress={() => onCategoryChange?.(category.id)}
          >
            <StyledText
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
              children={category.name}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={iconsColor} />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        No messages found
      </Text>
      <Text style={[styles.emptySubtitle, { color: iconsColor }]}>
        {searchQuery
          ? "Try adjusting your search terms"
          : "You're all caught up!"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }, style]} {...props}>
      {/* Search Bar */}
      {onSearchChange && (
        <View
          style={[styles.searchContainer, { backgroundColor: headerColor }]}
        >
          <Ionicons name="search" size={20} color={iconsColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor={iconsColor}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange("")}>
              <Ionicons name="close-circle" size={20} color={iconsColor} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Category Filters */}
      {onCategoryChange && renderCategoryFilter()}

      {/* Message List */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={handleRefresh}
            colors={[buttonColor]}
            tintColor={buttonColor}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredThreads.length > 0
          ? filteredThreads.map(renderThreadItem)
          : renderEmptyState()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 4,
  },
  categoryContent: {
    paddingHorizontal: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipActive: {
    opacity: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoryTextActive: {
    fontWeight: "600",
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});

export default MessageList;
