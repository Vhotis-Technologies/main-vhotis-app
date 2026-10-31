import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useThemeColor } from "../../../../hooks/useThemeColor";
import MessageHeader from "../../../component/seller/messages/MessageHeader";
import MessageList from "../../../component/seller/messages/MessageList";
import { useSellerMessages } from "../../../hook/seller/useSellerMessages";

const MessageScreen = () => {
  const backgroundColor = useThemeColor({}, "background");

  const {
    threads,
    stats,
    isLoading,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    refreshMessages,
    sendMessage,
    markAsRead,
    resolveThread,
    closeThread,
  } = useSellerMessages();

  const handleThreadPress = (thread: any) => {
    // Navigate to message detail screen
    Alert.alert("Message Thread", `Opening: ${thread.subject}`);
  };

  const handleNewMessage = () => {
    Alert.alert("New Message", "Create new message thread");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    // Handle back navigation for mobile
    Alert.alert("Back", "Navigate back to previous screen");
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <MessageHeader
        title="Messages"
        stats={stats}
        onBack={handleBack}
        onNewMessage={handleNewMessage}
        onSearch={handleSearch}
      />

      <MessageList
        threads={threads}
        onThreadPress={handleThreadPress}
        onRefresh={refreshMessages}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MessageScreen;
