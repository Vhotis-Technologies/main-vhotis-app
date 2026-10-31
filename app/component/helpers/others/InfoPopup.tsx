import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  Animated,
  Dimensions,
  ViewStyle,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface InfoPopupProps {
  visible: boolean;
  onClose: () => void;
  content: React.ReactNode;
  anchorRef?: React.RefObject<View | null>;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const InfoPopup = ({
  visible,
  onClose,
  content,
  anchorRef,
  position = "top-right",
}: InfoPopupProps) => {
  const themeBackground = useThemeColor({}, "background");
  const themeCard = useThemeColor({}, "cards");
  const themeBorder = useThemeColor({}, "borders");

  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Calculate position relative to anchor element
  useEffect(() => {
    if (visible && anchorRef?.current) {
      anchorRef.current.measure((x, y, width, height, pageX, pageY) => {
        let top = 0;
        let left = 0;

        switch (position) {
          case "top-right":
            top = pageY - 50 - 8; // 50px height + 8px spacing
            left = pageX + width - 100; // 100px width, align to right
            break;
          case "top-left":
            top = pageY - 50 - 8;
            left = pageX;
            break;
          case "bottom-right":
            top = pageY + height + 8;
            left = pageX + width - 100;
            break;
          case "bottom-left":
            top = pageY + height + 8;
            left = pageX;
            break;
        }

        // Ensure popup stays within screen bounds
        if (left < 0) left = 8;
        if (left + 100 > screenWidth) left = screenWidth - 100 - 8;
        if (top < 0) top = 8;
        if (top + 50 > screenHeight) top = screenHeight - 50 - 8;

        setPopupPosition({ top, left });
      });
    }
  }, [visible, anchorRef, position]);

  useEffect(() => {
    if (visible) {
      // Reset animations
      slideAnim.setValue(-50);
      opacityAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent={true}
      animationType="none"
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.popupContainer,
            {
              top: popupPosition.top,
              left: popupPosition.left,
              backgroundColor: themeCard,
              borderColor: themeBorder,
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>{content}</Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default InfoPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  popupContainer: {
    position: "absolute",
    width: 100,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
});
