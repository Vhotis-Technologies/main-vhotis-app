import { StyleSheet, View } from "react-native";
import React from "react";

const DividerComponent = () => {
  return <View style={styles.divider} />;
};

export default DividerComponent;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    width: "100%",
    marginVertical: 5,
  },
});
