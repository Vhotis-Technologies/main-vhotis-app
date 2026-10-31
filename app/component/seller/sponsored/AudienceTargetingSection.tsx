import React from "react";
import { StyleSheet, View } from "react-native";
import { Chip, Divider } from "react-native-paper";
import StyledText from "@/app/component/helpers/forms/StyledText";
import FormSection from "@/app/component/seller/shared/FormSection";
import { StorePromotionTargeting } from "@/app/interfaces/seller/PromotionsInterface";

export const SPONSOR_INTERESTS = [
  "Beauty & Personal Care",
  "Electronics & Gadgets",
  "Fashion & Apparel",
  "Fitness & Wellness",
  "Foodies & Cooking",
  "Home & Living",
  "Luxury Shoppers",
  "Parents & Families",
  "Travel & Adventure",
  "Other",
];

export const SPONSOR_AGE_RANGES = ["All", "18-24", "25-34", "35-44", "45-54", "55+"];
export const SPONSOR_GENDERS = ["All", "Female", "Male", "Non-binary", "Prefer not to say"];
export const SPONSOR_ETHNICITIES = [
  "Asian",
  "Black/African",
  "Hispanic/Latino",
  "Middle Eastern",
  "Mixed/Multiple ethnic groups",
  "Native American",
  "Pacific Islander",
  "White/Caucasian",
  "Other",
];

type AudienceTargetingSectionProps = {
  targeting: StorePromotionTargeting;
  onAgeRange: (value: string) => void;
  onInterest: (value: string) => void;
  onGender: (value: string) => void;
  onEthnicity: (value: string) => void;
  textColor: string;
  iconColor: string;
  borderColor: string;
  cardColor: string;
  chipBackgroundColor: string;
};

const AudienceTargetingSection = ({
  targeting,
  onAgeRange,
  onInterest,
  onGender,
  onEthnicity,
  textColor,
  iconColor,
  borderColor,
  cardColor,
  chipBackgroundColor,
}: AudienceTargetingSectionProps) => {
  const isAllAgesSelected =
    targeting.ageRanges.length === 1 && targeting.ageRanges.includes("All");

  return (
    <FormSection
      title="Audience"
      subtitle="Who should see your sponsored listings"
      icon="groups"
      iconColor="#6366F1"
      textColor={textColor}
      mutedColor={iconColor}
      borderColor={borderColor}
      surfaceColor={cardColor}
    >
      <StyledText variant="labelMedium" style={{ color: textColor }}>
        Age ranges
      </StyledText>
      <View style={styles.chipGroup}>
        {SPONSOR_AGE_RANGES.map((age) => (
          <Chip
            key={age}
            selected={targeting.ageRanges.includes(age)}
            disabled={age !== "All" && isAllAgesSelected}
            onPress={() => onAgeRange(age)}
            style={[styles.chip, { backgroundColor: chipBackgroundColor }]}
          >
            {age}
          </Chip>
        ))}
      </View>

      <StyledText variant="labelMedium" style={{ color: textColor }}>
        Interests
      </StyledText>
      <View style={styles.chipGroup}>
        {SPONSOR_INTERESTS.map((interest) => (
          <Chip
            key={interest}
            selected={targeting.interests.includes(interest)}
            onPress={() => onInterest(interest)}
            style={[styles.chip, { backgroundColor: chipBackgroundColor }]}
          >
            {interest}
          </Chip>
        ))}
      </View>

      <Divider />
      <StyledText variant="labelMedium" style={{ color: textColor }}>
        Gender
      </StyledText>
      <View style={styles.chipGroup}>
        {SPONSOR_GENDERS.map((gender) => (
          <Chip
            key={gender}
            selected={targeting.genders.includes(gender)}
            onPress={() => onGender(gender)}
            style={[styles.chip, { backgroundColor: chipBackgroundColor }]}
          >
            {gender}
          </Chip>
        ))}
      </View>

      <Divider />
      <StyledText variant="labelMedium" style={{ color: textColor }}>
        Ethnicity
      </StyledText>
      <View style={styles.chipGroup}>
        {SPONSOR_ETHNICITIES.map((ethnicity) => (
          <Chip
            key={ethnicity}
            selected={targeting.ethnicities.includes(ethnicity)}
            onPress={() => onEthnicity(ethnicity)}
            style={[styles.chip, { backgroundColor: chipBackgroundColor }]}
          >
            {ethnicity}
          </Chip>
        ))}
      </View>
    </FormSection>
  );
};

export default AudienceTargetingSection;

const styles = StyleSheet.create({
  chipGroup: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { marginVertical: 2 },
});
