import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StyledText from "./StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  getCountryDialOptions,
  type CountryDialOption,
} from "@/app/_utils/countryCallingCodes";

interface CountryDialCodePickerProps {
  visible: boolean;
  selectedDialCode: string;
  onSelect: (dialCode: string) => void;
  onClose: () => void;
}

const CountryDialCodePicker: React.FC<CountryDialCodePickerProps> = ({
  visible,
  selectedDialCode,
  onSelect,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const cardColor = useThemeColor({}, "cards");
  const buttonColor = useThemeColor({}, "button");

  const options = useMemo(() => getCountryDialOptions(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.dialCode.toLowerCase().includes(q) ||
        o.iso2.toLowerCase().includes(q)
    );
  }, [options, query]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: cardColor,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <StyledText
              variant="titleMedium"
              style={{ color: textColor, fontWeight: "600" }}
            >
              Country code
            </StyledText>
            <Pressable onPress={onClose} hitSlop={12}>
              <MaterialIcons name="close" size={24} color={textColor} />
            </Pressable>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search country or code"
            placeholderTextColor={`${textColor}99`}
            style={[
              styles.search,
              {
                color: textColor,
                borderColor,
                backgroundColor,
              },
            ]}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => `${item.iso2}-${item.dialCode}`}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            renderItem={({ item }) => {
              const selected = item.dialCode === selectedDialCode;
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.row,
                    { borderBottomColor: borderColor },
                    pressed && { opacity: 0.85 },
                    selected && { backgroundColor: `${buttonColor}22` },
                  ]}
                  onPress={() => {
                    onSelect(item.dialCode);
                    setQuery("");
                  }}
                >
                  <StyledText
                    variant="bodyMedium"
                    style={{ color: textColor, flex: 1 }}
                    numberOfLines={2}
                  >
                    {item.name}
                  </StyledText>
                  <StyledText
                    variant="bodyMedium"
                    style={{ color: textColor, fontWeight: "600" }}
                  >
                    {item.dialCode}
                  </StyledText>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <StyledText
                variant="bodyMedium"
                style={{ color: textColor, padding: 16, opacity: 0.7 }}
              >
                No matches
              </StyledText>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    maxHeight: "78%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  search: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
});

export default CountryDialCodePicker;
