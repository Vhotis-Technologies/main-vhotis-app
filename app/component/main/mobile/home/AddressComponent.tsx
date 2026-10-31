import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { DeliveryAddress } from "@/app/interfaces/main/home/HomeInterfaces";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";

const AddressComponent = ({
  props,
  onPress,
  isSelected = false,
  isDefault = false,
}: {
  props: DeliveryAddress;
  onPress: (selectedAddress: DeliveryAddress) => void;
  isSelected?: boolean;
  isDefault?: boolean;
}) => {
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");

  const formattedAddress = [props.address, props.city, props.zip_code]
    .filter(Boolean)
    .join(", ");

  return (
    <Pressable
      onPress={() => onPress(props)}
      style={({ pressed }) => [
        styles.row,
        {
          borderColor: isSelected ? tintColor : borderColor,
          backgroundColor: isSelected ? `${tintColor}12` : "transparent",
          opacity: pressed ? 0.7 : 1,
        },
        isSelected && styles.selectedRow,
      ]}
    >
      <MaterialIcons name="location-on" size={18} color={tintColor} />
      <View style={styles.textContainer}>
        <View style={styles.nameRow}>
          <StyledText
            children={props.delivery_name || "Delivery address"}
            variant="labelMedium"
            style={[styles.name, { color: textColor }]}
          />
          {isDefault ? (
            <StyledText
              children="Default"
              variant="labelSmall"
              style={{ color: tintColor, fontWeight: "700" }}
            />
          ) : null}
        </View>
        <StyledText
          children={formattedAddress || "No address details"}
          variant="bodySmall"
          style={{ color: textColor, opacity: 0.65 }}
          numberOfLines={2}
        />
      </View>
      {isSelected ? (
        <MaterialIcons name="check-circle" size={20} color={tintColor} />
      ) : (
        <MaterialIcons name="chevron-right" size={20} color={textColor} style={{ opacity: 0.4 }} />
      )}
    </Pressable>
  );
};

export default AddressComponent;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    gap: 10,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: "600",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  selectedRow: {
    borderWidth: 1.5,
  },
});
