import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { PayoutMethod } from "@/app/interfaces/seller/FinanceInterface";

type WithdrawMethodPickerProps = {
  methods: PayoutMethod[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddMethod?: () => void;
};

const iconForType = (
  type: PayoutMethod["type"]
): keyof typeof MaterialIcons.glyphMap =>
  type === "bank_account" ? "account-balance" : "credit-card";

const WithdrawMethodPicker = ({
  methods,
  selectedId,
  onSelect,
  onAddMethod,
}: WithdrawMethodPickerProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");

  return (
    <View style={styles.container}>
      <StyledText
        variant="labelLarge"
        style={[styles.heading, { color: textColor }]}
      >
        Payout method
      </StyledText>

      <View style={styles.list}>
        {methods.map((method) => {
          const isSelected = method.id === selectedId;
          return (
            <Pressable
              key={method.id}
              onPress={() => onSelect(method.id)}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: cardColor,
                  borderColor: isSelected ? textColor : borderColor,
                  borderWidth: isSelected ? 2 : 1,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: `${textColor}10` },
                ]}
              >
                <MaterialIcons
                  name={iconForType(method.type)}
                  size={20}
                  color={textColor}
                />
              </View>

              <View style={styles.copy}>
                <StyledText
                  variant="titleSmall"
                  numberOfLines={1}
                  style={{ color: textColor, fontWeight: "700" }}
                >
                  {method.label}
                </StyledText>
                <StyledText
                  variant="bodySmall"
                  style={[styles.cardMask, { color: iconMuted }]}
                >
                  {`**** ${method.last4}`}
                </StyledText>
              </View>

              <MaterialIcons
                name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
                size={22}
                color={isSelected ? textColor : iconMuted}
              />
            </Pressable>
          );
        })}

        {onAddMethod && (
          <Pressable
            onPress={onAddMethod}
            style={({ pressed }) => [
              styles.addRow,
              {
                borderColor,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <MaterialIcons name="add" size={20} color={textColor} />
            <StyledText
              variant="labelLarge"
              style={{ color: textColor, fontWeight: "600" }}
            >
              Add new method
            </StyledText>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default WithdrawMethodPicker;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  heading: {
    fontWeight: "700",
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  cardMask: {
    letterSpacing: 1,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
  },
});
