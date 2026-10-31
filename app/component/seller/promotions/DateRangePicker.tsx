import { StyleSheet, View, Platform, Pressable } from "react-native";
import React, { useCallback } from "react";
import { Button, Text, Portal, Modal, TextInput } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import type { DatePickerModalSingleProps } from "react-native-paper-dates";
import { DateRangePickerProps } from "@/app/interfaces/seller/PromotionsInterface";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import StyledText from "@/app/component/helpers/forms/StyledText";
const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const [showStartPicker, setShowStartPicker] = React.useState(false);
  const [showEndPicker, setShowEndPicker] = React.useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const handleDateChange = (isStart: boolean, dateString: string | Date) => {
    try {
      const date =
        dateString instanceof Date ? dateString : new Date(dateString);
      if (!isNaN(date.getTime())) {
        if (isStart) {
          onStartDateChange(date);
        } else {
          onEndDateChange(date);
        }
      }
    } catch (error) {
      console.error("Invalid date:", error);
    }
  };

  const onDismissStart = React.useCallback(() => {
    setShowStartPicker(false);
  }, [setShowStartPicker]);

  const onDismissEnd = React.useCallback(() => {
    setShowEndPicker(false);
  }, [setShowEndPicker]);

  const onConfirmStart: DatePickerModalSingleProps["onConfirm"] = useCallback(
    ({ date }) => {
      setShowStartPicker(false);
      if (date) handleDateChange(true, date);
    },
    [handleDateChange]
  );

  const onConfirmEnd: DatePickerModalSingleProps["onConfirm"] = useCallback(
    ({ date }) => {
      setShowEndPicker(false);
      if (date) handleDateChange(false, date);
    },
    [handleDateChange]
  );

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <View style={styles.dateField}>
          <StyledText variant="labelMedium" children="Start Date" />
          {Platform.OS === "web" ? (
            <input
              type="date"
              value={startDate.toISOString().split("T")[0]}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleDateChange(true, e.target.value)}
              style={styles.webInput}
            />
          ) : (
            <>
              <Pressable onPress={() => setShowStartPicker(true)}>
                <StyledTextInput
                  value={formatDate(startDate)}
                  style={styles.input}
                  editable={false}
                  info="Select the start date for the promotion"
                  pointerEvents="none"
                />
              </Pressable>
              <DatePickerModal
                locale="en"
                visible={showStartPicker}
                onDismiss={onDismissStart}
                date={startDate}
                onConfirm={onConfirmStart}
                validRange={{
                  startDate: new Date(),
                }}
                mode="single"
              />
            </>
          )}
        </View>

        <View style={styles.dateField}>
          <StyledText variant="labelMedium" children="End Date" />
          {Platform.OS === "web" ? (
            <input
              type="date"
              value={endDate.toISOString().split("T")[0]}
              min={startDate.toISOString().split("T")[0]}
              onChange={(e) => handleDateChange(false, e.target.value)}
              style={styles.webInput}
            />
          ) : (
            <>
              <Pressable onPress={() => setShowEndPicker(true)}>
                <StyledTextInput
                  value={formatDate(endDate)}
                  style={styles.input}
                  editable={false}
                  info="Select the end date for the promotion"
                  pointerEvents="none"
                />
              </Pressable>
              <DatePickerModal
                locale="en"
                visible={showEndPicker}
                onDismiss={onDismissEnd}
                date={endDate}
                onConfirm={onConfirmEnd}
                validRange={{
                  startDate: startDate,
                }}
                mode="single"
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "black",
  },
  label: {
    color: "black",
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  dateField: {
    flex: 1,
    gap: 5,
  },
  input: {
    backgroundColor: "#fff",
  },
  webInput: {
    width: "100%",
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
  },
});

export default DateRangePicker;
