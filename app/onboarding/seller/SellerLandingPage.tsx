import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";

const { width } = Dimensions.get("window");

const BENEFITS = [
  {
    icon: "analytics" as const,
    title: "Real-time analytics",
    description: "Track sales, inventory, and customer trends from one dashboard.",
  },
  {
    icon: "bolt" as const,
    title: "Launch in minutes",
    description: "A streamlined setup so you can start selling right away.",
  },
  {
    icon: "payments" as const,
    title: "Secure payouts",
    description: "Get paid quickly with trusted, protected payment processing.",
  },
  {
    icon: "campaign" as const,
    title: "Built-in promotions",
    description: "Boost visibility with sponsorship and promotion tools.",
  },
];

const STATS = [
  { value: "10K+", label: "Active sellers" },
  { value: "500K+", label: "Products sold" },
  { value: "95%", label: "Satisfaction" },
];

const MobileSellerLandingPage = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const buttonColor = useThemeColor({}, "button");
  const buttonTextColor = useThemeColor({}, "buttonText");
  const borderColor = useThemeColor({}, "borders");
  const iconMuted = useThemeColor({}, "icons");

  const startOnboarding = () => {
    router.push("/onboarding/seller/SellerInformation");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={[buttonColor, `${buttonColor}CC`, backgroundColor]}
        style={styles.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={styles.heroBadge}>
          <MaterialIcons name="storefront" size={14} color={buttonTextColor} />
          <StyledText
            variant="labelSmall"
            style={{ color: buttonTextColor, letterSpacing: 1 }}
          >
            SELLER PROGRAM
          </StyledText>
        </View>

        <StyledText
          variant="headlineMedium"
          style={[styles.heroTitle, { color: buttonTextColor }]}
        >
          Grow your business on Vhotis
        </StyledText>

        <StyledText
          variant="bodyMedium"
          style={[styles.heroSubtitle, { color: buttonTextColor }]}
        >
          Reach thousands of customers, manage your store, and scale with tools
          built for modern sellers.
        </StyledText>

        <StyledButton
          variant="large"
          title="Start selling"
          onPress={startOnboarding}
          buttonStyles={[
            styles.heroCta,
            { backgroundColor: cardColor },
          ]}
          textStyles={{ color: textColor, fontWeight: "700" }}
        />
      </LinearGradient>

      {/* Stats strip */}
      <View
        style={[
          styles.statsRow,
          { backgroundColor: cardColor, borderColor },
        ]}
      >
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <StyledText
              variant="titleLarge"
              style={{ color: buttonColor, fontWeight: "700" }}
            >
              {stat.value}
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={{ color: iconMuted, textAlign: "center" }}
            >
              {stat.label}
            </StyledText>
          </View>
        ))}
      </View>

      {/* Benefits */}
      <View style={styles.section}>
        <StyledText
          variant="titleMedium"
          style={[styles.sectionHeading, { color: textColor }]}
        >
          Why sell with us
        </StyledText>
        <StyledText
          variant="bodyMedium"
          style={[styles.sectionSubheading, { color: iconMuted }]}
        >
          Everything you need to launch, manage, and grow your store.
        </StyledText>

        <View style={styles.benefitsGrid}>
          {BENEFITS.map((benefit) => (
            <View
              key={benefit.title}
              style={[
                styles.benefitCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <View
                style={[
                  styles.benefitIconWrap,
                  { backgroundColor: `${buttonColor}18` },
                ]}
              >
                <MaterialIcons
                  name={benefit.icon}
                  size={22}
                  color={buttonColor}
                />
              </View>
              <StyledText
                variant="labelLarge"
                style={{ color: textColor, marginBottom: 4 }}
              >
                {benefit.title}
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={{ color: iconMuted, lineHeight: 18 }}
              >
                {benefit.description}
              </StyledText>
            </View>
          ))}
        </View>
      </View>

      {/* How it works */}
      <View style={styles.section}>
        <StyledText
          variant="titleMedium"
          style={[styles.sectionHeading, { color: textColor }]}
        >
          How it works
        </StyledText>

        {[
          {
            step: "1",
            title: "Create your profile",
            desc: "Tell us about yourself and verify your identity.",
          },
          {
            step: "2",
            title: "Set up your store",
            desc: "Add your business details and go live.",
          },
          {
            step: "3",
            title: "Start selling",
            desc: "List products and reach customers instantly.",
          },
        ].map((item, index) => (
          <View
            key={item.step}
            style={[
              styles.howItWorksRow,
              { borderColor },
              index === 2 && { borderBottomWidth: 0 },
            ]}
          >
            <View
              style={[styles.howStepBadge, { backgroundColor: buttonColor }]}
            >
              <StyledText
                variant="labelMedium"
                style={{ color: buttonTextColor, fontWeight: "700" }}
              >
                {item.step}
              </StyledText>
            </View>
            <View style={styles.howTextWrap}>
              <StyledText variant="labelLarge" style={{ color: textColor }}>
                {item.title}
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={{ color: iconMuted, marginTop: 2 }}
              >
                {item.desc}
              </StyledText>
            </View>
          </View>
        ))}
      </View>

      {/* Bottom CTA */}
      <View
        style={[
          styles.bottomCta,
          { backgroundColor: cardColor, borderColor },
        ]}
      >
        <StyledText
          variant="titleMedium"
          style={{ color: textColor, textAlign: "center" }}
        >
          Ready to get started?
        </StyledText>
        <StyledText
          variant="bodyMedium"
          style={{
            color: iconMuted,
            textAlign: "center",
            marginTop: 8,
            marginBottom: 20,
          }}
        >
          Join thousands of sellers already on Vhotis.
        </StyledText>
        <StyledButton
          variant="small"
          title="Create your seller account"
          onPress={startOnboarding}
          buttonStyles={{ width: "100%" }}
        />
        <Pressable
          onPress={() => router.push("/onboarding/main/Signin")}
          style={styles.signInLink}
        >
          <StyledText variant="bodyMedium" style={{ color: iconMuted }}>
            Already have an account?{" "}
            <StyledText variant="bodyMedium" style={{ color: buttonColor }}>
              Sign in
            </StyledText>
          </StyledText>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default MobileSellerLandingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  heroGradient: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: "flex-start",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    opacity: 0.9,
  },
  heroTitle: {
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 12,
    maxWidth: width * 0.85,
  },
  heroSubtitle: {
    lineHeight: 22,
    opacity: 0.9,
    marginBottom: 28,
    maxWidth: width * 0.9,
  },
  heroCta: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    minWidth: 160,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionHeading: {
    fontWeight: "700",
    marginBottom: 6,
  },
  sectionSubheading: {
    marginBottom: 20,
    lineHeight: 20,
  },
  benefitsGrid: {
    gap: 12,
  },
  benefitCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  benefitIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  howItWorksRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  howStepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  howTextWrap: {
    flex: 1,
  },
  bottomCta: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  signInLink: {
    marginTop: 16,
    alignItems: "center",
  },
});
