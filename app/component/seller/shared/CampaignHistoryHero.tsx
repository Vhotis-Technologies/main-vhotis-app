import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import StyledText from "@/app/component/helpers/forms/StyledText";

type CampaignHistoryHeroProps = {
  accent: string;
  cardColor: string;
  statTextColor: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
};

const CampaignHistoryHero = ({
  accent,
  cardColor,
  statTextColor,
  icon,
  title,
  subtitle,
  stats,
}: CampaignHistoryHeroProps) => (
  <LinearGradient
    colors={[`${accent}CC`, `${accent}55`]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.hero}
  >
    <View style={[styles.heroIcon, { backgroundColor: cardColor }]}>
      <MaterialIcons name={icon} size={30} color={accent} />
    </View>
    <StyledText variant="headlineSmall" style={styles.heroTitle}>
      {title}
    </StyledText>
    <StyledText variant="bodySmall" style={styles.heroHint}>
      {subtitle}
    </StyledText>

    {stats.length > 0 ? (
      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View
            key={stat.label}
            style={[styles.statChip, { backgroundColor: cardColor }]}
          >
            <StyledText variant="labelSmall" style={{ color: accent }}>
              {stat.label}
            </StyledText>
            <StyledText
              variant="titleSmall"
              style={[styles.statValue, { color: statTextColor }]}
            >
              {stat.value}
            </StyledText>
          </View>
        ))}
      </View>
    ) : null}
  </LinearGradient>
);

export default CampaignHistoryHero;

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    paddingHorizontal: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    width: "100%",
    justifyContent: "center",
  },
  statChip: {
    flex: 1,
    maxWidth: 110,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontWeight: "700",
  },
});
