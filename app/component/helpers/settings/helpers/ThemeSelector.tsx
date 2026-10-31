import { StyleSheet, View, TouchableOpacity } from "react-native";
import React from "react";
import { ThemeOption } from "@/app/interfaces/others/SettingsInterface";
import StyledText from "../../forms/StyledText";

interface ThemeSelectorProps {
  selectedTheme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
}) => {
  const themeOptions: ThemeOption[] = [
    { id: "1", name: "Light", value: "light" },
    { id: "2", name: "Dark", value: "dark" },
    { id: "3", name: "System", value: "system" },
  ];

  return (
    <View style={styles.container}>
      {themeOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.themeOption,
            selectedTheme === option.value && styles.selectedTheme,
          ]}
          onPress={() => onThemeChange(option.value)}
        >
          <StyledText
            style={[
              styles.themeText,
              selectedTheme === option.value && styles.selectedThemeText,
            ]}
          >
            {option.name}
          </StyledText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ThemeSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  themeOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minWidth: 100,
    alignItems: "center",
  },
  selectedTheme: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  themeText: {
    fontSize: 16,
    color: "#333",
  },
  selectedThemeText: {
    color: "#fff",
  },
});
