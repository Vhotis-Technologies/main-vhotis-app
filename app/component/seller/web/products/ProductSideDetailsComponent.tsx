import { StyleSheet, Text, View } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";

const ProductSideDetailsComponent = ({
  title,
  body,
}: {
  title: string;
  body: string;
}) => {
  return (
    <View style={styles.container}>
      <StyledText variant="titleLarge" children={title} />
      <StyledText
        variant="bodyMedium"
        children={body}
        style={{ color: "#666" }}
      />
    </View>
  );
};

export default ProductSideDetailsComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    gap: 20,
    flexWrap: "wrap",
  },
});
