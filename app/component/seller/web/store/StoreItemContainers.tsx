import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { StoreItemContainerInterface } from "@/app/interfaces/seller/StoreInterfaces";

const StoreItemContainers = ({
  id,
  title,
  icon,
  onPress,
  onDelete,
  description,
  website,
}: StoreItemContainerInterface) => {
  return (
    <View style={styles.maincontainer}>
      <View style={styles.rowSection}>
        {icon}
        <TouchableOpacity
          style={[styles.rowsection2, styles.deleteButton]}
          onPress={onDelete}
        >
          <Text>Disconnet</Text>
          <FontAwesome name="trash" size={18} color={"red"} />
        </TouchableOpacity>
      </View>
      {/* Title and description */}
      <View style={styles.columnSection}>
        <StyledText variant="h2" children={title} />
        <StyledText variant="body" children={description} />

        <View style={[styles.rowsection2, { marginTop: 10 }]}>
          <Text>{website}</Text>
          <MaterialIcons name="link" size={20} color={"blue"} />
        </View>
      </View>
    </View>
  );
};

export default StoreItemContainers;

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.2,
    borderColor: "gray",
    boxShadow: "0px 3px 3px 0px rgba(37, 35, 35, 0.25)",
    shadowColor: "#666",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
  },
  rowSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowsection2: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deleteButton: {
    borderWidth: 0.2,
    padding: 5,
    borderRadius: 10,
    boxShadow: "3px 3px 3px 3px rgba(37, 35, 35, 0.25)",
    shadowColor: "#666",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  columnSection: {
    flexDirection: "column",
    gap: 5,
  },
  icon: {
    borderRadius: 30,
  },
});
