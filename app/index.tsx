/**
 * Main entry point for the Lapse application.
 * Modern, professional landing page with contemporary design elements.
 */
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import FeatureItem from "@/app/component/helpers/others/FeatureItem";
/**
 * Modern landing page component with professional design.
 * Features gradient backgrounds, improved typography, and contemporary UI elements.
 *
 * @returns {JSX.Element} The rendered modern landing page
 */
export default function Index() {
  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const buttonTextColor = useThemeColor({}, "buttonText");
  const buttonColor = useThemeColor({}, "button");
  const secondaryButtonColor = useThemeColor({}, "secondaryButton");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");

  const handleGetStarted = () => {
    router.push("/onboarding/main/OnboardingScreen");
  };

  const handleSignIn = () => {
    router.push("/onboarding/main/Signin");
  };

  const handleBecomeSeller = () => {
    router.push("/onboarding/seller/SellerLandingPage");
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main content */}
        <View style={styles.mainContent}>

          {/* Hero section */}
          <View style={styles.heroSection}>
            <StyledText
              style={[styles.heroTitle, { color: textColor }]}
              variant="titleMedium"
              children="Discover Authentic Ethnic Cuisines"
            />
            <StyledText
              style={[styles.heroSubtitle, { color: textColor }]}
              variant="labelMedium"
              children="Get all your ethnic food shopping needs delivered to your doorstep. Fresh ingredients, authentic flavors, all in one place."
            />
          </View>

          {/* Features section */}
          <View style={styles.featuresSection}>
            <FeatureItem iconName="leaf" title="Fresh Produce" />
            <FeatureItem iconName="time" title="Fast Delivery" />
            <FeatureItem iconName="shield-checkmark" title="Quality Assured" />
          </View>

          {/* Seller Card */}
          <View
            style={[
              styles.sellerCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <View style={styles.sellerCardContent}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: buttonColor + "20" },
                ]}
              >
                <Ionicons name="storefront" size={32} color={buttonColor} />
              </View>
              <View style={styles.sellerTextContent}>
                <StyledText
                  style={[styles.sellerCardTitle, { color: textColor }]}
                  variant="titleMedium"
                >
                  Become a Seller
                </StyledText>
                <StyledText
                  style={[
                    styles.sellerCardSubtitle,
                    { color: textColor, opacity: 0.7 },
                  ]}
                  variant="bodyMedium"
                >
                  Join our marketplace and reach thousands of customers
                </StyledText>
              </View>
              <Pressable
                style={[
                  styles.sellerCardButton,
                  { backgroundColor: buttonColor },
                ]}
                onPress={handleBecomeSeller}
              >
                <StyledText
                  style={styles.sellerCardButtonText}
                  variant="labelMedium"
                >
                  Start Selling
                </StyledText>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={buttonTextColor}
                />
              </Pressable>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionSection}>
            <Pressable style={styles.primaryButton} onPress={handleGetStarted}>
              <LinearGradient
                colors={[buttonColor, secondaryButtonColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <StyledText
                  style={[styles.primaryButtonText, { color: buttonTextColor }]}
                  variant="labelMedium"
                  children="Get Started"
                />
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={buttonTextColor}
                />
              </LinearGradient>
            </Pressable>

            <Pressable style={[styles.signInButton]} onPress={handleSignIn}>
              <StyledText
                style={[styles.signInText, { color: textColor }]}
                variant="labelMedium"
              >
                Already have an account?{" "}
                <StyledText style={{ color: buttonColor, fontWeight: "600" }}>
                  Sign In
                </StyledText>
              </StyledText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: Platform.OS === "web" ? 60 : 24,
    justifyContent: "space-between",
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: Platform.OS === "web" ? 500 : 300,
    height: Platform.OS === "web" ? 100 : 80,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
  },
  heroSection: {
    justifyContent: "center",
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: Platform.OS === "web" ? 35 : 28,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: Platform.OS === "web" ? 48 : 38,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
    opacity: 0.8,
  },
  featuresSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    gap: 10,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  actionSection: {
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    borderRadius: 30,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 12,
  },
  primaryButtonText: {
    fontWeight: "600",
    fontSize: 15,
  },
  signInButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  signInText: {
    fontSize: 14,
    textAlign: "center",
  },
  sellerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sellerCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  sellerTextContent: {
    flex: 1,
  },
  sellerCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sellerCardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  sellerCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    position: "absolute",
    right: -40,
    bottom: 65,
  },
  sellerCardButtonText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#fff",
  },
});
