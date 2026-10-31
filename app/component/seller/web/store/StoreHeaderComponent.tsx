import { StyleSheet, Text, View } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import CustomSwitchComponent from "@/app/component/helpers/others/CustomSwitchComponent";

interface StoreHeaderComponentProps {
  isStoreOpen: boolean;
  closeStore: () => void;
  isUpdatingStore: boolean;
}

const StoreHeaderComponent = ({
  isStoreOpen,
  closeStore,
  isUpdatingStore,
}: StoreHeaderComponentProps) => {

  return (
    <View style={styles.maincontiaer}>
      <View>
        <StyledText variant="titleMedium">Store</StyledText>
      </View>
      <View style={styles.rowSection}>
        <StyledText variant="labelLarge">Store Status</StyledText>
        <CustomSwitchComponent
          isOn={isStoreOpen}
          onToggle={closeStore}
          onText="OPEN"
          offText="CLOSED"
          style={styles.toggleButton}
          isLoading={isUpdatingStore}
        />
      </View>
    </View>
  );
};

export default StoreHeaderComponent;

const styles = StyleSheet.create({
  maincontiaer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  rowSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  button: {
    borderRadius: 5,
    borderWidth: 1,
  },
  toggleButton: {
    marginLeft: 10,
  },
});
