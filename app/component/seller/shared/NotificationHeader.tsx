import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColor } from "../../../../hooks/useThemeColor";
import { NotificationHeaderProps } from "../../../interfaces/seller/NotificationInterfaces";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  title,
  stats,
  onBack, 
  onSearch,
  onFilter,
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
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        )}

        <StyledText variant="titleMedium" style={[styles.title, { color: textColor }]} children={title} />

        <View style={styles.actions}>
          {onFilter && (
            <TouchableOpacity style={styles.actionButton} onPress={onFilter}>
              <Ionicons name="filter" size={24} color={textColor} />
            </TouchableOpacity>
          )}

          {onSearch && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onSearch("")}
            >
              <Ionicons name="search" size={24} color={textColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Row */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: textColor }]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, { color: iconsColor }]}>Total</Text>
          </View>

          <View
            style={[styles.statDivider, { backgroundColor: bordersColor }]}
          />

          <View style={styles.statItem}>
            <StyledText variant="titleMedium" style={[styles.statNumber, { color: buttonColor }]} children={stats.unread} />
            <StyledText variant="bodyMedium" style={[styles.statLabel, { color: iconsColor }]} children="Unread"/>
          </View>

          <View
            style={[styles.statDivider, { backgroundColor: bordersColor }]}
          />

          <View style={styles.statItem}>
            <StyledText variant="titleMedium" style={[styles.statNumber, { color: "#4CAF50" }]} children={stats.orders} />
            <StyledText variant="bodyMedium" style={[styles.statLabel, { color: iconsColor }]} children="Orders" />
          </View>

          <View
            style={[styles.statDivider, { backgroundColor: bordersColor }]}
          />

          <View style={styles.statItem}>
            <StyledText variant="titleMedium" style={[styles.statNumber, { color: "#2196F3" }]} children={stats.payments} />
            <StyledText variant="bodyMedium" style={[styles.statLabel, { color: iconsColor }]} children="Payments" />
          </View>

          <View
            style={[styles.statDivider, { backgroundColor: bordersColor }]}
          />

          <View style={styles.statItem}>
            <StyledText variant="titleMedium" style={[styles.statNumber, { color: "#FF9800" }]} children={stats.urgent} />
            <StyledText variant="bodyMedium" style={[styles.statLabel, { color: iconsColor }]} children="Urgent" />
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
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    paddingBottom: 12,
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
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
});

export default NotificationHeader;
