/**
 * Modal shell for ModalServiceProvider: fullscreen, sheet, or centered layouts with optional title.
 * Fullscreen body is not wrapped in ScrollView — child components own vertical scroll to avoid nested-scroll jank with inner lists.
 */
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Animated,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef } from "react";
import StyledText from "../forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ModalServicesProps {
  visible: boolean;
  onClose: () => void;
  component: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  modalType?: "fullscreen" | "sheet" | "center";
  animationType?: "slide" | "fade" | "none";
  backgroundColor?: string;
  borderRadius?: number;
  maxHeight?: number;
}

const ModalServices = ({
  visible,
  onClose,
  component,
  title,
  showCloseButton = true,
  modalType = "center",
  animationType = "fade",
  backgroundColor,
  borderRadius = 16,
  maxHeight = screenHeight * 0.8,
}: ModalServicesProps) => {
  const themeBackground = useThemeColor({}, "background");
  const themeText = useThemeColor({}, "text");
  const themeBorder = useThemeColor({}, "borders");
  const themeCard = useThemeColor({}, "cards");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const bgColor = backgroundColor || themeBackground;
  const cardBgColor = modalType === "fullscreen" ? themeBackground : themeCard;
  const centerMaxHeight = maxHeight ?? screenHeight * 0.8;
  const sheetMaxHeight = maxHeight ?? screenHeight * 0.55;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(screenHeight);
      scaleAnim.setValue(0.8);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        modalType === "sheet"
          ? Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            })
          : Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
      ]).start();
    } else {
      // Hide animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        modalType === "sheet"
          ? Animated.timing(slideAnim, {
              toValue: screenHeight,
              duration: 200,
              useNativeDriver: true,
            })
          : Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true,
            }),
      ]).start();
    }
  }, [visible, modalType]);

  const renderModalContent = () => {
    switch (modalType) {
      case "fullscreen":
        return (
          <SafeAreaView
            style={[
              styles.fullscreenContainer,
              { backgroundColor: themeBackground },
            ]}
            edges={["top"]} // Only safe area for top (status bar)
          >
            {title && (
              <View
                style={[
                  styles.fullscreenHeader,
                  { borderBottomColor: themeBorder },
                ]}
              >
                <StyledText
                  variant="titleMedium"
                  style={[styles.fullscreenTitle, { color: themeText }]}
                >
                  {title}
                </StyledText>
                {showCloseButton && (
                  <Pressable
                    style={styles.closeButton}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <StyledText
                      variant="titleMedium"
                      style={{ color: themeText }}
                    >
                      ✕
                    </StyledText>
                  </Pressable>
                )}
              </View>
            )}
            {/* Fullscreen: do not wrap in ScrollView — nested vertical ScrollView + inner
                horizontal lists (e.g. product modal) causes gesture conflicts and scroll jank.
                Let the child component own vertical scrolling. */}
            <View
              style={styles.fullscreenContent}
              pointerEvents="box-none"
            >
              <View
                style={[
                  styles.fullscreenScrollContent,
                  !title && { paddingTop: 30 },
                ]}
              >
                {component}
              </View>
            </View>
          </SafeAreaView>
        );

      case "sheet":
        return (
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                backgroundColor: themeBackground,
                transform: [{ translateY: slideAnim }],
                borderTopLeftRadius: borderRadius,
                borderTopRightRadius: borderRadius,
                maxHeight: sheetMaxHeight,
              },
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: themeBorder }]} />
            {title && (
              <View
                style={[styles.sheetHeader, { borderBottomColor: themeBorder }]}
              >
                <StyledText
                  variant="titleMedium"
                  style={[styles.sheetTitle, { color: themeText }]}
                >
                  {title}
                </StyledText>
                {showCloseButton && (
                  <Pressable
                    style={styles.closeButton}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <StyledText
                      variant="titleMedium"
                      style={{ color: themeText }}
                    >
                      ✕
                    </StyledText>
                  </Pressable>
                )}
              </View>
            )}
            <ScrollView
              style={styles.sheetContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContentContainer}
            >
              {component}
            </ScrollView>
          </Animated.View>
        );

      default: // center
        return (
          <Animated.View
            style={[
              styles.centerContainer,
              {
                backgroundColor: cardBgColor,
                borderRadius: borderRadius,
                transform: [{ scale: scaleAnim }],
                maxHeight: centerMaxHeight,
              },
            ]}
          >
            {title && (
              <View style={styles.centerHeader}>
                <StyledText
                  variant="titleMedium"
                  style={[styles.centerTitle, { color: themeText }]}
                >
                  {title}
                </StyledText>
                {showCloseButton && (
                  <Pressable
                    style={styles.closeButton}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <StyledText
                      variant="titleMedium"
                      style={{ color: themeText }}
                    >
                      ✕
                    </StyledText>
                  </Pressable>
                )}
              </View>
            )}
            <ScrollView
              style={styles.centerContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.centerContentContainer}
              nestedScrollEnabled={true}
            >
              {component}
            </ScrollView>
          </Animated.View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent={modalType !== "fullscreen"}
      animationType={animationType}
    >
      {/* Modal is rendered outside the app GestureHandlerRootView; wrap so nested
          gesture-handler components (e.g. horizontal lists) behave consistently. */}
      <GestureHandlerRootView style={styles.modalGestureRoot}>
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor:
              modalType === "fullscreen" ? "transparent" : "rgba(0, 0, 0, 0.5)",
            opacity: fadeAnim,
            justifyContent: modalType === "sheet" ? "flex-end" : "center",
          },
        ]}
      >
        {/* Pressable here stole scroll touches from nested ScrollViews when onPress was unused.
            Use Pressable only for dismissible overlay modals; fullscreen content handles its own gestures. */}
        {modalType === "fullscreen" ? (
          <View
            style={[
              styles.overlayPressable,
              styles.fullscreenOverlayInner,
            ]}
            pointerEvents="box-none"
          >
            {renderModalContent()}
          </View>
        ) : (
          <View
            style={[
              styles.overlayPressable,
              { justifyContent: modalType === "sheet" ? "flex-end" : "center" },
            ]}
          >
            <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
            <View
              style={
                modalType === "center"
                  ? styles.centerModalHost
                  : styles.sheetModalHost
              }
              pointerEvents="box-none"
            >
              {renderModalContent()}
            </View>
          </View>
        )}
      </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default ModalServices;

const styles = StyleSheet.create({
  modalGestureRoot: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayPressable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenOverlayInner: {
    justifyContent: "flex-start",
    alignItems: "stretch",
  },

  // Fullscreen styles
  fullscreenContainer: {
    flex: 1,
    width: "100%",
    marginTop: 0,
  },
  fullscreenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  fullscreenTitle: {
    fontWeight: "600",
  },
  fullscreenContent: {
    flex: 1,
    minHeight: 0,
  },
  fullscreenScrollContent: {
    flex: 1,
    paddingBottom: 20,
    minHeight: 0,
  },

  // Sheet styles
  sheetContainer: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontWeight: "600",
    fontSize: 15,
  },
  sheetContent: {
    maxHeight: "85%",
  },
  sheetContentContainer: {
    padding: 10,
  },

  // Center styles
  centerModalHost: {
    width: "100%",
    alignItems: "center",
  },
  sheetModalHost: {
    width: "100%",
  },
  centerContainer: {
    width: screenWidth * 0.9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  centerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  centerTitle: {
    fontWeight: "600",
  },
  centerContent: {
    maxHeight: "80%",
  },
  centerContentContainer: {
    padding: 20,
  },

  // Common styles
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
});
