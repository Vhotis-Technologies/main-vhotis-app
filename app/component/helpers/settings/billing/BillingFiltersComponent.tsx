import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Button, TextInput, Chip } from "react-native-paper";
import { BillingFilters } from "@/app/interfaces/others/BillingInterface";
import { useThemeColor } from "@/hooks/useThemeColor";

interface BillingFiltersComponentProps {
  onFiltersChange: (filters: BillingFilters) => void;
}

const BillingFiltersComponent = ({
  onFiltersChange,
}: BillingFiltersComponentProps) => {
  const [filters, setFilters] = useState<BillingFilters>({});

  const cardColor = useThemeColor({}, "cards");

  const statusOptions: Array<"pending" | "paid" | "failed" | "refunded"> = [
    "pending",
    "paid",
    "failed",
    "refunded",
  ];

  const handleStatusToggle = (
    status: "pending" | "paid" | "failed" | "refunded"
  ) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    const newFilters = {
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    };

    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateChange = (value: string, isStart: boolean) => {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const newFilters = {
          ...filters,
          dateRange: {
            start: isStart ? date : filters.dateRange?.start || new Date(),
            end: isStart ? filters.dateRange?.end || new Date() : date,
          },
        };
        setFilters(newFilters);
        onFiltersChange(newFilters);
      }
    } catch (error) {
      // Invalid date format, ignore
    }
  };

  const handleAmountChange = (value: string, isMin: boolean) => {
    const amount = parseFloat(value);
    const newFilters = {
      ...filters,
      [isMin ? "minAmount" : "maxAmount"]: isNaN(amount) ? undefined : amount,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  return (
    <View style={[styles.container, { backgroundColor: cardColor }]}>
      <View style={styles.dateContainer}>
        <TextInput
          label="Start Date"
          placeholder="YYYY-MM-DD"
          value={filters.dateRange?.start?.toISOString().split("T")[0] || ""}
          onChangeText={(value) => handleDateChange(value, true)}
          style={styles.dateInput}
        />
        <TextInput
          label="End Date"
          placeholder="YYYY-MM-DD"
          value={filters.dateRange?.end?.toISOString().split("T")[0] || ""}
          onChangeText={(value) => handleDateChange(value, false)}
          style={styles.dateInput}
        />
      </View>

      <View style={styles.amountContainer}>
        <TextInput
          label="Min Amount"
          value={filters.minAmount?.toString() || ""}
          onChangeText={(value) => handleAmountChange(value, true)}
          keyboardType="numeric"
          style={styles.amountInput}
        />
        <TextInput
          label="Max Amount"
          value={filters.maxAmount?.toString() || ""}
          onChangeText={(value) => handleAmountChange(value, false)}
          keyboardType="numeric"
          style={styles.amountInput}
        />
      </View>

      <View style={styles.statusContainer}>
        {statusOptions.map((status) => (
          <Chip
            key={status}
            selected={filters.status?.includes(status)}
            onPress={() => handleStatusToggle(status)}
            style={styles.statusChip}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Chip>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={clearFilters}
        style={styles.clearButton}
      >
        Clear Filters
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  amountInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  statusChip: {
    margin: 4,
  },
  clearButton: {
    marginTop: 8,
  },
});

export default BillingFiltersComponent;
