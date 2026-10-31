import { StyleSheet, View } from "react-native";
import React from "react";
import { Chip, SegmentedButtons, Divider } from "react-native-paper";
import DateRangePicker from "./DateRangePicker";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "../../helpers/forms/StyledTextInput";
import { formatCurrency } from "@/app/_utils/main/helpers";
import usePromotions from "@/app/hook/seller/usePromotions";
import { PromotionPriority } from "@/app/interfaces/seller/PromotionsInterface";

/* Interest segments to help sellers reach similar shoppers */
const INTERESTS = [
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

/* Age range for the promotion to target */
const AGE_RANGES = ["All", "18-24", "25-34", "35-44", "45-54", "55+"];

const GENDERS = ["All", "Female", "Male", "Non-binary", "Prefer not to say"];

const ETHNICITIES = [
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

function StoreWidePromotion() {
  const {
    budgetInputValue,
    handleBudgetChange,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    storeDraft,
    validation,
    handleAgeRangeSelection,
    handleInterestSelection,
    handleGenderSelection,
    handleEthnicitySelection,
    setPriority,
    minimumDailyRate,
    budgetWarning,
    suggestedDurationDays,
  } = usePromotions();

  const isAllAgesSelected =
    storeDraft.targeting.ageRanges.length === 1 &&
    storeDraft.targeting.ageRanges.includes("All");

  return (
    <View style={styles.container}>
      <View style={[styles.card]}>
        <StyledText variant="labelLarge" children="Budget & Duration" />

        <StyledTextInput
          label="Total Budget"
          placeholder="Enter total budget"
          value={budgetInputValue}
          onChangeText={handleBudgetChange}
          keyboardType="numeric"
          info={`Daily Budget: ${formatCurrency(
            storeDraft.dailyBudget || minimumDailyRate,
          )} • Min Required: ${formatCurrency(
            validation.requiredBudget,
          )} (${minimumDailyRate.toFixed(2)} €/day)`}
        />

        <DateRangePicker
          startDate={startDate ?? new Date()}
          endDate={endDate ?? new Date()}
          onStartDateChange={(date) => setStartDate(date || null)}
          onEndDateChange={(date) => setEndDate(date || null)}
        />

        {!validation.isBudgetValid && validation.message && (
          <StyledText variant="bodySmall" style={styles.validationText}>
            {validation.message}
          </StyledText>
        )}
        {budgetWarning && (
          <StyledText variant="bodySmall" style={styles.warningText}>
            {budgetWarning}
          </StyledText>
        )}
      </View>

      <View style={[styles.card]}>
        <View>
          <StyledText variant="labelMedium" children="Age Ranges" />
          <View style={styles.chipGroup}>
            {AGE_RANGES.map((age) => (
              <Chip
                key={age}
                selected={storeDraft.targeting.ageRanges.includes(age)}
                disabled={age !== "All" && isAllAgesSelected}
                onPress={() => handleAgeRangeSelection(age)}
                style={styles.chip}
              >
                {age}
              </Chip>
            ))}
          </View>

          <StyledText variant="labelMedium" children="Interests" />
          <View style={styles.chipGroup}>
            {INTERESTS.map((interest) => (
              <Chip
                key={interest}
                selected={storeDraft.targeting.interests.includes(interest)}
                onPress={() => handleInterestSelection(interest)}
                style={styles.chip}
              >
                {interest}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          <StyledText variant="labelMedium" children="Gender" />
          <View style={styles.chipGroup}>
            {GENDERS.map((gender) => (
              <Chip
                key={gender}
                selected={storeDraft.targeting.genders.includes(gender)}
                onPress={() => handleGenderSelection(gender)}
                style={styles.chip}
              >
                {gender}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          <StyledText variant="labelMedium" children="Ethnicity" />
          <View style={styles.chipGroup}>
            {ETHNICITIES.map((ethnicity) => (
              <Chip
                key={ethnicity}
                selected={storeDraft.targeting.ethnicities.includes(ethnicity)}
                onPress={() => handleEthnicitySelection(ethnicity)}
                style={styles.chip}
              >
                {ethnicity}
              </Chip>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.card]}>
        <View>
          <StyledText variant="labelLarge" children="Promotion Priority" />
          <SegmentedButtons
            value={storeDraft.priority}
            onValueChange={(value) => setPriority(value as PromotionPriority)}
            buttons={[
              { label: "High", value: "high" },
              { label: "Medium", value: "medium" },
              { label: "Low", value: "low" },
            ]}
          />
        </View>
      </View>

      <View style={[styles.card, styles.summaryCard]}>
        <StyledText variant="labelLarge" children="Summary" />
        <StyledText variant="labelMedium">
          Estimated Reach: {storeDraft.estimatedReach.toLocaleString()}
        </StyledText>
        <StyledText variant="labelMedium">
          Total Budget: {formatCurrency(storeDraft.budget)}
        </StyledText>
        <StyledText variant="bodySmall" style={styles.summaryText}>
          Duration: {storeDraft.dateRange.durationDays || 0} day(s) • Minimum
          Cost: {formatCurrency(validation.requiredBudget)}
        </StyledText>
        {budgetWarning && suggestedDurationDays > 0 && (
          <StyledText variant="bodySmall" style={styles.summaryText}>
            Suggested duration for this budget: {suggestedDurationDays} day(s)
          </StyledText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    gap: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    color: "#000",
  },
  subsectionTitle: {
    marginBottom: 8,
    color: "#000",
  },
  input: {
    marginBottom: 8,
  },
  infoText: {
    marginBottom: 16,
    color: "#666",
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  chip: {
    margin: 4,
  },
  divider: {
    marginVertical: 16,
  },
  validationText: {
    marginTop: 12,
    color: "#D32F2F",
  },
  summaryCard: {
    paddingVertical: 8,
  },
  summaryText: {
    marginTop: 6,
    color: "#666",
  },
  warningText: {
    marginTop: 8,
    color: "#F57C00",
  },
  createButtonContainer: {
    margin: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default StoreWidePromotion;
