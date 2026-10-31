import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import ProductSideDetailsComponent from "./ProductSideDetailsComponent";
import StyledIconButton from "@/app/component/helpers/buttons/StyledIconButton";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

const AddProductVideo = ({ onPress }: { onPress: () => void }) => {
  const tintColor = useThemeColor 
  return (
    <View style={styles.maincontainer}>
      <View style={styles.leftsection}>
        <ProductSideDetailsComponent
          title="Video"
          body="Take a clear and professional product video that will help customers understand your product better"
        />
      </View>
      <View style={styles.rightsection}>
        <Pressable style={styles.button} onPress={onPress}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MaterialIcons name="add" size={24} color="black" />
            <StyledText
              variant="labelLarge"
              children="Click to add video"
              style={{ color: "blue" }}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default AddProductVideo;

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 5,
  },
  leftsection: {
    flex: 1,
    borderEndWidth: 1,
    borderColor: "white",
    shadowColor: "white",
    shadowOffset: { width: 0, height: 2 },
    boxShadow: "0px 0px 3px 3px rgba(251, 245, 245, 0.25)",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  rightsection: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 4,
    gap: 20,
    marginRight: 10,
  },
  button: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#000000",
    paddingVertical: 15,
  },
});
