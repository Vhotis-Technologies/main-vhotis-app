import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function SearchBar({
  searchValue,
  setSearchValue,
  setIsFocused,
  isFocused,
  onSearch,
}: {
  searchValue: string;
  setSearchValue: (value: string) => void;
  setIsFocused: (value: boolean) => void;
  isFocused: boolean;
  onSearch?: () => void;
}) {
  const router = useRouter();

  // Show back button when focused OR when there's navigation history
  const showBackButton = isFocused || router.canGoBack();

  return (
    <View style={styles.container}>
      {showBackButton && (
        <Pressable
          onPress={() => {
            if (isFocused) {
              setIsFocused(false);
            } else {
              router.back();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={"black"} />
        </Pressable>
      )}
      <View style={styles.searchContainer}>
        <TextInput
          value={searchValue}
          onChangeText={(text) => setSearchValue(text)}
          placeholder="Search..."
          style={[
            styles.input,
            {
              color: "#000",
            },
          ]}
          placeholderTextColor={"#000"}
          onFocus={() => setIsFocused(true)}
          onSubmitEditing={onSearch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#000",
  },

  backButton: {
    padding: 4,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  searchIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    fontWeight: "400",
  },
});
