import { StyleSheet, View } from "react-native";
import React from "react";
import DateRangePicker from "@/app/component/seller/promotions/DateRangePicker";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import { formatCurrency } from "@/app/_utils/main/helpers";
import useSponsor from "@/app/hook/seller/useSponsor";
import FormSection from "@/app/component/seller/shared/FormSection";
import AudienceTargetingSection from "./AudienceTargetingSection";
import { useThemeColor } from "@/hooks/useThemeColor";

const StoreWideSponsorForm = () => {
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
    minimumDailyRate,
    budgetWarning,
    suggestedDurationDays,
  } = useSponsor();

  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const borderColor = useThemeColor({}, "borders");
  const cardColor = useThemeColor({}, "cards");
  const backgroundColor = useThemeColor({}, "background");
  const isDark = backgroundColor === "#000";
  const buttonColor = useThemeColor({}, "button");

  return (
    <View style={styles.container}>
      <FormSection
        title="Budget & schedule"
        subtitle="Set spend and how long your store stays featured"
        icon="payments"
        iconColor="#6366F1"
        textColor={textColor}
        mutedColor={iconColor}
        borderColor={borderColor}
        surfaceColor={cardColor}
      >
        <StyledTextInput
          label="Total budget"
          placeholder="Enter total budget"
          value={budgetInputValue}
          onChangeText={handleBudgetChange}
          keyboardType="numeric"
          info={`${formatCurrency(storeDraft.dailyBudget || minimumDailyRate)}/day • Min ${formatCurrency(validation.requiredBudget)}`}
        />
        <DateRangePicker
          startDate={startDate ?? new Date()}
          endDate={endDate ?? new Date()}
          onStartDateChange={(date) => setStartDate(date || null)}
          onEndDateChange={(date) => setEndDate(date || null)}
        />
        {!validation.isBudgetValid && validation.message ? (
          <StyledText variant="bodySmall" style={styles.error}>
            {validation.message}
          </StyledText>
        ) : null}
        {budgetWarning ? (
          <StyledText variant="bodySmall" style={styles.warning}>
            {budgetWarning}
          </StyledText>
        ) : null}
      </FormSection>

      <AudienceTargetingSection
        targeting={storeDraft.targeting}
        onAgeRange={handleAgeRangeSelection}
        onInterest={handleInterestSelection}
        onGender={handleGenderSelection}
        onEthnicity={handleEthnicitySelection}
        textColor={textColor}
        iconColor={iconColor}
        borderColor={borderColor}
        cardColor={cardColor}
        chipBackgroundColor={buttonColor}
      />

      <View style={[styles.summary, { backgroundColor, borderColor }]}>
        <StyledText variant="labelLarge" style={{ color: textColor, fontWeight: "700" }}>
          Campaign summary
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconColor }}>
          Reach ~{storeDraft.estimatedReach.toLocaleString()} •{" "}
          {storeDraft.dateRange.durationDays || 0} day(s) •{" "}
          {formatCurrency(storeDraft.budget)}
        </StyledText>
        {suggestedDurationDays > 0 && budgetWarning ? (
          <StyledText variant="bodySmall" style={styles.warning}>
            Suggested duration: {suggestedDurationDays} days
          </StyledText>
        ) : null}
      </View>
    </View>
  );
};

export default StoreWideSponsorForm;

const styles = StyleSheet.create({
  container: { gap: 14 },
  summary: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  error: { color: "#D32F2F" },
  warning: { color: "#F57C00" },
});
