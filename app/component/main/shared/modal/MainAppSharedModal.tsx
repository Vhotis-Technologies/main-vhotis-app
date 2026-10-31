import {
  StyleSheet,
  View,
  Modal,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import React, { ReactNode } from "react";
import { AntDesign } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface MainAppSharedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  showCloseButton?: boolean;
  headerRight?: ReactNode;
}

const MainAppSharedModal = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  headerRight,
}: MainAppSharedModalProps) => {
  const cardColor = useThemeColor({}, "cards");

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <KeyboardAvoidingView style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
          <View style={styles.header}>
            <StyledText variant="titleMedium" children={title} />
            <View style={styles.headerButtons}>
              {headerRight}
              {showCloseButton && (
                <TouchableOpacity style={styles.iconButton} onPress={onClose}>
                  <AntDesign name="close" size={24} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.content}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default MainAppSharedModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 12,
    width: Platform.OS === "web" ? "60%" : "90%",
    maxWidth: 600,
    maxHeight: "80%",
    ...Platform.select({
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      default: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
});
