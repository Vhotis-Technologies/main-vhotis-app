import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColor } from "../../../../hooks/useThemeColor";
import { MessageHeaderProps } from "../../../interfaces/seller/MessageInterfaces";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "../../helpers/forms/StyledText";

const MessageHeader: React.FC<MessageHeaderProps> = ({
  title,
  stats,
  onNewMessage,
  onSearch,
  style,
  ...props
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconsColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");
  const bordersColor = useThemeColor({}, "borders");
  return (
    <View
      style={[
        styles.container,
        { backgroundColor, borderBottomColor: bordersColor },
        style,
      ]}
      {...props}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.actions}>
          {onSearch && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onSearch("")}
            >
              <Ionicons name="search" size={24} color={textColor} />
            </TouchableOpacity>
          )}

          {onNewMessage && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onNewMessage}
            >
              <Ionicons name="add" size={24} color={textColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Row */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <StyledText style={[styles.statNumber, { color: textColor }]} children={stats.total} />
            <StyledText style={[styles.statLabel, { color: iconsColor }]} children="Total" />
          </View>

          <View
            style={[styles.statDivider, { backgroundColor: bordersColor }]}
          />

          <View style={styles.statItem}>
            <StyledText style={[styles.statNumber, { color: buttonColor }]} children={stats.unread} />
            <StyledText style={[styles.statLabel, { color: iconsColor }]} children="Unread" />
          </View>

          <View
            style={[styles.statDivider, { backgroundColor: bordersColor }]}
          />

          <View style={styles.statItem}>
            <StyledText style={[styles.statNumber, { color: "#4CAF50" }]} children={stats.open} />
            <StyledText style={[styles.statLabel, { color: iconsColor }]} children="Open" />
          </View>

          <View
            style={[styles.statDivider, { backgroundColor: bordersColor }]}
          />

          <View style={styles.statItem}>
            <StyledText style={[styles.statNumber, { color: "#FF9800" }]} children={stats.urgent} />
            <StyledText style={[styles.statLabel, { color: iconsColor }]} children="Urgent" />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 5,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 8,
  },
});

export default MessageHeader;
