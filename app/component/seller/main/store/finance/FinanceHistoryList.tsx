import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import FinanceHistoryItem, {
  FinanceHistoryEntry,
} from "./FinanceHistoryItem";

type FinanceHistoryListProps = {
  title?: string;
  entries: FinanceHistoryEntry[];
  onSeeAll?: () => void;
  onItemPress?: (entry: FinanceHistoryEntry) => void;
};

const FinanceHistoryList = ({
  title = "History",
  entries,
  onSeeAll,
  onItemPress,
}: FinanceHistoryListProps) => {
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <StyledText
          variant="headlineSmall"
          style={[styles.heading, { color: textColor }]}
        >
          {title}
        </StyledText>
        {onSeeAll && (
          <Pressable
            onPress={onSeeAll}
            hitSlop={8}
            style={({ pressed }) => [
              styles.seeAll,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <MaterialIcons name="arrow-forward" size={22} color={textColor} />
          </Pressable>
        )}
      </View>

      {entries.length === 0 ? (
        <StyledText
          variant="bodySmall"
          style={[styles.empty, { color: iconMuted }]}
        >
          No transactions yet.
        </StyledText>
      ) : (
        <View>
          {entries.map((entry, index) => (
            <View key={entry.key}>
              <FinanceHistoryItem entry={entry} onPress={onItemPress} />
              {index < entries.length - 1 && (
                <View style={[styles.separator, { backgroundColor: borderColor }]} />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default FinanceHistoryList;

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: {
    fontWeight: "800",
  },
  seeAll: {
    padding: 4,
  },
  empty: {
    paddingVertical: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.6,
  },
});
