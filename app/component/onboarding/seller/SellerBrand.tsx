import { StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import StyledTextInput from "../../helpers/forms/StyledTextInput";
import StyledText from "../../helpers/forms/StyledText";
import { RootState } from "@/app/store/store";
import { updateStoreInformationField } from "@/app/store/main/slices/onboardingSlice";
import { useThemeColor } from "@/hooks/useThemeColor";
import MarketVerticalPicker from "./MarketVerticalPicker";

interface SellerBrandProps {
  capConflictSlugs?: string[];
}

const SellerBrand = ({ capConflictSlugs = [] }: SellerBrandProps) => {
  const dispatch = useDispatch();
  const { storeInformationFormData } = useSelector(
    (state: RootState) => state.onboarding,
  );
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");

  return (
    <View style={styles.container}>
      <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
        <StyledText variant="labelLarge" style={{ color: textColor, marginBottom: 4 }}>
          Your brand
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconMuted, marginBottom: 12 }}>
          How customers will find you on Vhotis — no shop address needed
        </StyledText>

        <StyledTextInput
          label="Brand / business name"
          placeholder="Your brand name"
          value={storeInformationFormData?.businessName ?? ""}
          onChangeText={(text) =>
            dispatch(updateStoreInformationField({ field: "businessName", value: text }))
          }
        />

        <StyledTextInput
          label="About your business"
          placeholder="Tell customers what makes your catalog special"
          value={storeInformationFormData?.businessDescription ?? ""}
          onChangeText={(text) =>
            dispatch(
              updateStoreInformationField({ field: "businessDescription", value: text }),
            )
          }
          multiline
        />
      </View>

      <MarketVerticalPicker capConflictSlugs={capConflictSlugs} />
    </View>
  );
};

export default SellerBrand;

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 8,
  },
  section: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
});
