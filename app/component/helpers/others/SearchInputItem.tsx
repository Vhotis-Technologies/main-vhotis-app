import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import StyledTextInput from "../forms/StyledTextInput";

const SearchInputItem = ({
  value,
  setValue,
  
}: {
  value: string;
  setValue: (value: string) => void;
}) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="search-web"
        size={24}
        color="black"
        style={styles.icon}
      />
      <TextInput
        placeholder="Search"
        onChangeText={(text) => setValue(text)}
        value={value}
        style={styles.input}
      />
    </View>
  );
};

export default SearchInputItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.2,
    marginVertical: 5,
    marginHorizontal: 5,
    borderRadius: 20,
    gap: 10,
    backgroundColor: "#F7F7F7",
    borderColor: "#E0E0E0",
  },
  icon: {
    marginStart: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "RobotoRegular",
  },
});
