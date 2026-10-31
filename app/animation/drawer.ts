import { Animated } from "react-native";

export const useDrawerAnimation = (show: boolean) => {
  const translateX = new Animated.Value(show ? 0 : -320);

  const animateDrawer = (show: boolean) => {
    Animated.spring(translateX, {
      toValue: show ? 0 : -320,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
      bounciness: 10,
      speed: 300,
    }).start();
  };

  return {
    translateX,
    animateDrawer,
  };
};
