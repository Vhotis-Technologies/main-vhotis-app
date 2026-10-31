import { Platform, useWindowDimensions } from "react-native";

const isMobile = () => {
  return useWindowDimensions().width < 768 &&
    (Platform.OS === "android" || Platform.OS === "ios");
};

export default isMobile;