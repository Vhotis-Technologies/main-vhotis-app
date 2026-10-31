import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SellerStoreSummary } from "@/app/interfaces/seller/StoreInterface";

type StoreLocationPickerProps = {
  stores: SellerStoreSummary[];
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
  label?: string;
  isLoading?: boolean;
  allowAllOption?: boolean;
  allSelected?: boolean;
  onSelectAll?: () => void;
};

const StoreLocationPicker = ({
  stores,
  selectedStoreId,
  onSelectStore,
  label = "Store location",
  isLoading = false,
  allowAllOption = false,
  allSelected = false,
  onSelectAll,
}: StoreLocationPickerProps) => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const buttonColor = useThemeColor({}, "button");
  const borderColor = useThemeColor({}, "borders");
  const iconMuted = useThemeColor({}, "icons");

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="small" color={buttonColor} />
      </View>
    );
  }

  if (!stores.length) {
    return null;
  }

  if (stores.length === 1 && !allowAllOption) {
    const onlyStore = stores[0];
    return (
      <View
        style={[styles.singleStoreBanner, { borderColor, backgroundColor }]}
      >
        <StyledText variant="labelMedium" style={{ color: iconMuted }}>
          {label}
        </StyledText>
        <StyledText
          variant="titleSmall"
          style={{ color: textColor, marginTop: 4 }}
        >
          {onlyStore.business_name}
          {onlyStore.business_city ? ` · ${onlyStore.business_city}` : ""}
        </StyledText>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <StyledText
        variant="labelMedium"
        style={{ color: iconMuted, marginBottom: 8 }}
      >
        {label}
      </StyledText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {allowAllOption && onSelectAll ? (
          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor: allSelected ? buttonColor : backgroundColor,
                borderColor: buttonColor,
              },
            ]}
            onPress={onSelectAll}
          >
            <StyledText
              style={{
                color: allSelected ? "#fff" : textColor,
                fontWeight: allSelected ? "600" : "400",
              }}
            >
              All stores
            </StyledText>
          </TouchableOpacity>
        ) : null}

        {stores.map((store) => {
          const isSelected = !allSelected && selectedStoreId === store.id;
          return (
            <TouchableOpacity
              key={store.id}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? buttonColor : backgroundColor,
                  borderColor: buttonColor,
                },
              ]}
              onPress={() => onSelectStore(store.id)}
            >
              <StyledText
                style={{
                  color: isSelected ? "#fff" : textColor,
                  fontWeight: isSelected ? "600" : "400",
                }}
                numberOfLines={1}
              >
                {store.business_name}
              </StyledText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  chipRow: {
    paddingRight: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 220,
  },
  singleStoreBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  loadingWrap: {
    paddingVertical: 8,
    marginBottom: 12,
  },
});

export default StoreLocationPicker;
