import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import TicketListRow from "@/app/component/shared/support/TicketListRow";
import useBuyersTicket from "@/app/hook/main/useBuyersTicket";
import type {
  SupportTicket,
  TicketStatus,
} from "@/app/interfaces/main/support/TicketInterfaces";
import { useThemeColor } from "@/hooks/useThemeColor";

type FilterTab = "open" | "resolved";

const OPEN_STATUSES: TicketStatus[] = [
  "open",
  "in_progress",
  "waiting_response",
];
const RESOLVED_STATUSES: TicketStatus[] = ["resolved", "closed"];

export default function TicketListScreen() {
  const { tickets, isLoading, isError, refetch } = useBuyersTicket();
  const [tab, setTab] = useState<FilterTab>("open");
  const [refreshing, setRefreshing] = useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "borders");
  const accentColor = useThemeColor({}, "tint");

  const visible = useMemo(() => {
    const statuses = tab === "open" ? OPEN_STATUSES : RESOLVED_STATUSES;
    return tickets
      .filter((t: SupportTicket) => statuses.includes(t.status))
      .sort((a: SupportTicket, b: SupportTicket) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );
  }, [tickets, tab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading && tickets.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.tabs, { borderColor }]}>
        {(["open", "resolved"] as FilterTab[]).map((key) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            style={[
              styles.tab,
              tab === key && {
                borderBottomColor: accentColor,
                borderBottomWidth: 2,
              },
            ]}
          >
            <StyledText
              variant="labelMedium"
              style={{ fontWeight: tab === key ? "700" : "400" }}
            >
              {key === "open" ? "Open" : "Resolved"}
            </StyledText>
          </Pressable>
        ))}
      </View>

      {isError && (
        <View style={styles.errorBanner}>
          <StyledText variant="bodySmall">
            Could not load tickets. Pull to refresh.
          </StyledText>
        </View>
      )}

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <StyledText variant="bodyMedium">
              No tickets in this tab.
            </StyledText>
            <StyledText variant="bodySmall" style={styles.emptyHint}>
              Create a ticket to speak with support.
            </StyledText>
          </View>
        }
        renderItem={({ item }) => (
          <TicketListRow
            ticket={item}
            onPress={() =>
              router.push({
                pathname: "/main/mobile/(screens)/(support)/TicketChatScreen",
                params: {
                  ticketId: item.id,
                  ticketNumber: item.ticketNumber,
                },
              })
            }
          />
        )}
      />

      <Pressable
        style={[styles.fab, { backgroundColor: accentColor }]}
        onPress={() =>
          router.push("/main/mobile/(screens)/(support)/CreateTicketScreen")
        }
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  errorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.8,
  },
  list: {
    padding: 16,
    paddingBottom: 88,
  },
  empty: {
    alignItems: "center",
    paddingTop: 48,
    gap: 8,
  },
  emptyHint: {
    opacity: 0.7,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
