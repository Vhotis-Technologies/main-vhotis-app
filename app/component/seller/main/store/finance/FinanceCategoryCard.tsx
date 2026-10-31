import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatWalletAmount } from "@/app/hook/seller/useSellerStore";

export type FinanceCategoryTone = "neutral" | "accent" | "warm";

export type FinanceCategoryItem = {
  key: string;
  label: string;
  amount: number;
  tone?: FinanceCategoryTone;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
};

type FinanceCategoryCardProps = {
  item: FinanceCategoryItem;
  currencyCode?: string;
};

const TONE_BACKGROUNDS: Record<FinanceCategoryTone, { light: string; dark: string }> = {
  neutral: { light: "#FFFFFF", dark: "#1E1E1E" },
  accent: { light: "#D6EE7C", dark: "#8FB339" },
  warm: { light: "#F2C9C2", dark: "#7A4F4A" },
};

const useToneBackground = (tone: FinanceCategoryTone) => {
  const fallback = useThemeColor({}, "cards");
  const light = TONE_BACKGROUNDS[tone]?.light;
  const dark = TONE_BACKGROUNDS[tone]?.dark;
  return useThemeColor(
    { light: light ?? fallback, dark: dark ?? fallback },
    "cards"
  );
};

const FinanceCategoryCard = ({ item, currencyCode = "EUR" }: FinanceCategoryCardProps) => {
  const tone = item.tone ?? "neutral";
  const backgroundColor = useToneBackground(tone);
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");

  const showBorder = tone === "neutral";

  return (
    <Pressable
      onPress={item.onPress}
      disabled={!item.onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor,
          borderColor: showBorder ? borderColor : "transparent",
          borderWidth: showBorder ? 1 : 0,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.actionCircle,
          { backgroundColor: cardColor },
        ]}
      >
        <MaterialIcons
          name={item.icon ?? "north-east"}
          size={16}
          color={textColor}
        />
      </View>
      <View style={styles.body}>
        <StyledText variant="bodySmall" style={{ color: iconMuted }}>
          {formatWalletAmount(item.amount, undefined, currencyCode)}
        </StyledText>
        <StyledText
          variant="titleMedium"
          style={[styles.label, { color: textColor }]}
        >
          {item.label}
        </StyledText>
      </View>
    </Pressable>
  );
};

export default FinanceCategoryCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 120,
    borderRadius: 22,
    padding: 16,
    justifyContent: "space-between",
  },
  actionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  body: {
    marginTop: 18,
    gap: 4,
  },
  label: {
    fontWeight: "700",
  },
});
