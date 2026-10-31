import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import StyledText from "./StyledText";
import StyledTextInput from "./StyledTextInput";
import {
  getPlaceDetails,
  getPlacePredictions,
  parseAddressComponents,
  type PlacePrediction,
} from "@/app/_utils/places";
import { useThemeColor } from "@/hooks/useThemeColor";

export interface ResolvedAddressPayload {
  addressLine1: string;
  city: string;
  postcode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

interface AddressAutocompleteInputProps {
  label: string;
  placeholder?: string;
  info?: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Called when the user picks a suggestion; use to fill city / postcode / country (and line 1). */
  onAddressResolved: (fields: ResolvedAddressPayload) => void;
  /** Optional bias toward results near this point (e.g. from expo-location). */
  locationBias?: { latitude: number; longitude: number };
}

const DEBOUNCE_MS = 350;

const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({
  label,
  placeholder,
  info,
  value,
  onChangeText,
  onAddressResolved,
  locationBias,
}) => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cardBackground = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const secondaryTextColor = useThemeColor(
    { light: "#757575", dark: "#9E9E9E" },
    "text"
  );

  const clearDebounce = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearDebounce();
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  const fetchPredictions = useCallback(
    async (text: string) => {
      if (text.trim().length < 2) {
        setPredictions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const next = await getPlacePredictions(
          text.trim(),
          locationBias,
          50000
        );
        setPredictions(next);
        setShowSuggestions(next.length > 0);
      } finally {
        setLoading(false);
      }
    },
    [locationBias]
  );

  const handleChangeText = (text: string) => {
    onChangeText(text);
    clearDebounce();
    debounceRef.current = setTimeout(() => {
      fetchPredictions(text);
    }, DEBOUNCE_MS);
  };

  const handleSelectPrediction = async (p: PlacePrediction) => {
    clearDebounce();
    setShowSuggestions(false);
    setPredictions([]);

    const details = await getPlaceDetails(p.place_id);
    if (!details) {
      onAddressResolved({
        addressLine1: p.description,
        city: "",
        postcode: "",
        country: "",
        latitude: null,
        longitude: null,
      });
      return;
    }

    const parsed = parseAddressComponents(details);
    const payload: ResolvedAddressPayload = {
      addressLine1: parsed.address,
      city: parsed.city,
      postcode: parsed.zip_code,
      country: parsed.country,
      latitude: Number.isFinite(parsed.latitude) ? parsed.latitude : null,
      longitude: Number.isFinite(parsed.longitude) ? parsed.longitude : null,
    };

    // Resolve dependent fields first; parent owns line1 via onAddressResolved.
    onAddressResolved(payload);
  };

  const cancelHideSuggestions = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  const scheduleHideSuggestions = () => {
    cancelHideSuggestions();
    blurTimeoutRef.current = setTimeout(() => setShowSuggestions(false), 350);
  };

  return (
    <View style={styles.wrapper}>
      <StyledTextInput
        label={label}
        placeholder={placeholder}
        info={info}
        value={value}
        onChangeText={handleChangeText}
        onFocus={() => {
          cancelHideSuggestions();
          if (predictions.length > 0) setShowSuggestions(true);
        }}
        onBlur={scheduleHideSuggestions}
        blurOnSubmit={false}
        autoComplete="street-address"
        autoCapitalize="words"
        importantForAutofill="yes"
      />
      {(loading || (showSuggestions && predictions.length > 0)) && (
        <View
          style={[
            styles.suggestionsContainer,
            { backgroundColor: cardBackground, borderColor },
          ]}
        >
          {loading && predictions.length === 0 ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" />
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
            >
              {predictions.map((item) => (
                <Pressable
                  key={item.place_id}
                  style={({ pressed }) => [
                    styles.suggestionRow,
                    pressed && styles.suggestionPressed,
                  ]}
                  onPressIn={cancelHideSuggestions}
                  onPress={() => void handleSelectPrediction(item)}
                >
                  <StyledText
                    variant="bodyMedium"
                    style={{ color: textColor }}
                    numberOfLines={2}
                  >
                    {item.structured_formatting?.main_text ?? item.description}
                  </StyledText>
                  {item.structured_formatting?.secondary_text ? (
                    <StyledText
                      variant="bodySmall"
                      style={{
                        color: secondaryTextColor,
                        marginTop: 2,
                      }}
                      numberOfLines={2}
                    >
                      {item.structured_formatting.secondary_text}
                    </StyledText>
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "stretch",
    zIndex: 500,
    elevation: 12,
  },
  suggestionsContainer: {
    marginTop: 4,
    maxHeight: 220,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  scroll: {
    maxHeight: 220,
  },
  loadingRow: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128,128,128,0.35)",
  },
  suggestionPressed: {
    opacity: 0.85,
  },
});

export default AddressAutocompleteInput;
