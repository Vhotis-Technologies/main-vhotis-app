import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StyledText from "../forms/StyledText";
import ToggleComponent from "./helpers/ToggleComponent";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useThemeContext } from "@/app/contexts/ThemeProvider";

type ThemeOption = {
  id: "system" | "light" | "dark";
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "system",
    icon: "brightness-auto",
    title: "System default",
    subtitle: "Match your device light or dark mode",
  },
  {
    id: "light",
    icon: "light-mode",
    title: "Light",
    subtitle: "Bright backgrounds and dark text",
  },
  {
    id: "dark",
    icon: "dark-mode",
    title: "Dark",
    subtitle: "Reduced glare in low-light environments",
  },
];

const GeneralSettingComponent = () => {
  const { theme, setTheme, currentTheme } = useThemeContext();
  const [showAnimations, setShowAnimations] = useState(true);
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");

  const renderThemeOption = (option: ThemeOption, isLast: boolean) => {
    const selected = theme === option.id;
    return (
      <Pressable
        key={option.id}
        onPress={() => setTheme(option.id)}
        style={({ pressed }) => [
          styles.themeRow,
          !isLast && styles.rowDivider,
          !isLast && { borderBottomColor: borderColor },
          {
            backgroundColor: selected ? `${tintColor}10` : "transparent",
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View
          style={[styles.iconWrap, { backgroundColor: `${buttonColor}15` }]}
        >
          <MaterialIcons name={option.icon} size={20} color={buttonColor} />
        </View>
        <View style={styles.rowCopy}>
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            {option.title}
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: mutedColor }}>
            {option.subtitle}
          </StyledText>
        </View>
        <View
          style={[
            styles.checkBadge,
            {
              borderColor: selected ? tintColor : borderColor,
              backgroundColor: selected ? `${tintColor}20` : cardColor,
            },
          ]}
        >
          {selected ? (
            <MaterialIcons name="check" size={16} color={tintColor} />
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[`${tintColor}CC`, `${tintColor}55`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={[styles.heroIcon, { backgroundColor: cardColor }]}>
            <MaterialIcons name="tune" size={32} color={tintColor} />
          </View>
          <StyledText variant="headlineSmall" style={styles.heroTitle}>
            General
          </StyledText>
          <StyledText variant="bodySmall" style={styles.heroHint}>
            Appearance and motion on this device
          </StyledText>
        </LinearGradient>

        <View style={styles.sectionsGap}>
          <OnboardingSectionCard
            icon="palette"
            title="Theme"
            subtitle={`Currently showing ${currentTheme} mode`}
          >
            {THEME_OPTIONS.map((option, index) =>
              renderThemeOption(option, index === THEME_OPTIONS.length - 1),
            )}
          </OnboardingSectionCard>

          <OnboardingSectionCard
            icon="animation"
            title="Motion"
            subtitle="Local preference on this device"
          >
            <View style={styles.toggleRow}>
              <View style={styles.rowCopy}>
                <StyledText variant="labelLarge" style={{ color: textColor }}>
                  Show animations
                </StyledText>
                <StyledText variant="bodySmall" style={{ color: mutedColor }}>
                  Subtle transitions across lists and panels
                </StyledText>
              </View>
              <ToggleComponent
                label="Show animations"
                value={showAnimations}
                onValueChange={setShowAnimations}
                size="small"
              />
            </View>
          </OnboardingSectionCard>

          <View
            style={[
              styles.noteCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <MaterialIcons name="info-outline" size={18} color={mutedColor} />
            <StyledText
              variant="bodySmall"
              style={{ color: mutedColor, flex: 1, marginLeft: 10, lineHeight: 20 }}
            >
              Theme changes apply immediately. Notification preferences are
              managed under Notifications and sync with your account.
            </StyledText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default GeneralSettingComponent;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  hero: {
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "RobotoBold",
  },
  heroHint: {
    color: "rgba(255,255,255,0.88)",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
  sectionsGap: {
    gap: 14,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 10,
    gap: 12,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
});
