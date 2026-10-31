import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from "react-native";
import React, { useCallback, useState } from "react";
import countries from "world-countries";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "../../helpers/forms/StyledText";
import StyledTextInput from "../../helpers/forms/StyledTextInput";
import AddressAutocompleteInput from "../../helpers/forms/AddressAutocompleteInput";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { updateStoreInformationField } from "@/app/store/main/slices/onboardingSlice";
import { useThemeColor } from "@/hooks/useThemeColor";
import MarketVerticalPicker from "./MarketVerticalPicker";

const countryList = Object.entries(countries).map(([code, country]) => ({
  code,
  name: country.name.common as string,
}));

const SectionCard = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const buttonColor = useThemeColor({}, "button");
  const iconMuted = useThemeColor({}, "icons");

  return (
    <View
      style={[styles.sectionCard, { backgroundColor: cardColor, borderColor }]}
    >
      <View style={styles.sectionHeader}>
        <View
          style={[styles.sectionIconWrap, { backgroundColor: `${buttonColor}15` }]}
        >
          <MaterialIcons name={icon} size={18} color={buttonColor} />
        </View>
        <View style={styles.sectionHeaderText}>
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            {title}
          </StyledText>
          {subtitle ? (
            <StyledText
              variant="bodySmall"
              style={{ color: iconMuted, marginTop: 2 }}
            >
              {subtitle}
            </StyledText>
          ) : null}
        </View>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
};

const SellerStore = () => {
  const dispatch = useDispatch();

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const buttonTextColor = useThemeColor({}, "buttonText");
  const iconMuted = useThemeColor({}, "icons");

  const [isStoreCountryOpen, setIsStoreCountryOpen] = useState(false);

  const { storeInformationFormData } = useSelector(
    (state: RootState) => state.onboarding,
  );

  const physicalShopAnswer = storeInformationFormData?.useExistingAddress ?? "";
  const hasPhysicalShop = physicalShopAnswer === "yes";
  const businessCountryDisplay =
    storeInformationFormData?.businessCountry?.trim() || countryList[0].name;

  const setPhysicalShopAnswer = useCallback(
    (value: "yes" | "no") => {
      dispatch(
        updateStoreInformationField({ field: "useExistingAddress", value }),
      );
    },
    [dispatch],
  );

  return (
    <View style={styles.container}>
      {/* Business details */}
      <SectionCard
        icon="store"
        title="Business details"
        subtitle="This is how customers will see your store"
      >
        <StyledTextInput
          label="Business name"
          placeholder="Your store name"
          info="Displayed publicly on your store page"
          value={storeInformationFormData?.businessName}
          onChangeText={(text) =>
            dispatch(
              updateStoreInformationField({ field: "businessName", value: text }),
            )
          }
        />

        <StyledTextInput
          label="Registration number"
          placeholder="Reg number or n/a"
          info="Your company registration number, if applicable"
          value={storeInformationFormData?.businessReg}
          maxLength={10}
          onChangeText={(text) =>
            dispatch(
              updateStoreInformationField({ field: "businessReg", value: text }),
            )
          }
        />

        <StyledTextInput
          label="About your business"
          placeholder="Describe what you sell and what makes you unique"
          multiline
          numberOfLines={4}
          info="Helps us categorise your store and build customer trust"
          value={storeInformationFormData?.businessDescription}
          onChangeText={(text) =>
            dispatch(
              updateStoreInformationField({
                field: "businessDescription",
                value: text,
              }),
            )
          }
        />
      </SectionCard>

      {/* Physical shop toggle */}
      <SectionCard
        icon="storefront"
        title="Physical location"
        subtitle="Do you operate from a physical shop?"
      >
        <View style={[styles.segmentedControl, { borderColor, backgroundColor: `${borderColor}40` }]}>
          {(["yes", "no"] as const).map((option) => {
            const isActive = physicalShopAnswer === option;
            return (
              <Pressable
                key={option}
                onPress={() => setPhysicalShopAnswer(option)}
                style={[
                  styles.segmentOption,
                  isActive && {
                    backgroundColor: buttonColor,
                  },
                ]}
              >
                <MaterialIcons
                  name={option === "yes" ? "location-on" : "home-work"}
                  size={16}
                  color={isActive ? buttonTextColor : iconMuted}
                />
                <StyledText
                  variant="labelMedium"
                  style={{
                    color: isActive ? buttonTextColor : textColor,
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {option === "yes" ? "Yes, I have a shop" : "No, online only"}
                </StyledText>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.infoBox, { backgroundColor: `${buttonColor}10`, borderColor: `${buttonColor}30` }]}>
          <MaterialIcons name="info-outline" size={16} color={buttonColor} />
          <StyledText variant="bodySmall" style={{ color: iconMuted, flex: 1, lineHeight: 18 }}>
            {hasPhysicalShop
              ? "Enter your shop address below. This will be shown to customers for pickup or visits."
              : "Your residential address from step 1 will be used as your business address."}
          </StyledText>
        </View>
      </SectionCard>

      {/* Shop address */}
      {hasPhysicalShop && (
        <SectionCard
          icon="pin-drop"
          title="Shop address"
          subtitle="Where customers can find your physical store"
        >
          <View style={styles.fieldGroup}>
            <StyledText variant="labelMedium" style={{ color: textColor, marginBottom: 6 }}>
              Country
            </StyledText>
            <Pressable
              style={[styles.picker, { borderColor }]}
              onPress={() => setIsStoreCountryOpen(!isStoreCountryOpen)}
            >
              <StyledText variant="bodyMedium" style={{ color: textColor, flex: 1 }}>
                {businessCountryDisplay}
              </StyledText>
              <MaterialIcons
                name={isStoreCountryOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={22}
                color={iconMuted}
              />
            </Pressable>
            {isStoreCountryOpen && (
              <ScrollView
                style={[styles.pickerDropdown, { borderColor }]}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {countryList.map((country) => (
                  <Pressable
                    key={country.code}
                    style={[
                      styles.pickerItem,
                      businessCountryDisplay === country.name && {
                        backgroundColor: `${buttonColor}15`,
                      },
                    ]}
                    onPress={() => {
                      setIsStoreCountryOpen(false);
                      dispatch(
                        updateStoreInformationField({
                          field: "businessCountry",
                          value: country.name,
                        }),
                      );
                    }}
                  >
                    <StyledText variant="bodyMedium">{country.name}</StyledText>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          <AddressAutocompleteInput
            label="Address line 1"
            placeholder="Type for address suggestions"
            value={storeInformationFormData?.businessAddress ?? ""}
            onChangeText={(text) =>
              dispatch(
                updateStoreInformationField({
                  field: "businessAddress",
                  value: text,
                }),
              )
            }
            onAddressResolved={(p) => {
              dispatch(
                updateStoreInformationField({
                  field: "businessAddress",
                  value: p.addressLine1,
                }),
              );
              dispatch(
                updateStoreInformationField({
                  field: "businessCity",
                  value: p.city,
                }),
              );
              dispatch(
                updateStoreInformationField({
                  field: "businessPostcode",
                  value: p.postcode,
                }),
              );
              if (p.country) {
                dispatch(
                  updateStoreInformationField({
                    field: "businessCountry",
                    value: p.country,
                  }),
                );
              }
            }}
          />

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <StyledTextInput
                label="Post code / Zip"
                placeholder="Post code"
                value={storeInformationFormData?.businessPostcode}
                onChangeText={(text) =>
                  dispatch(
                    updateStoreInformationField({
                      field: "businessPostcode",
                      value: text,
                    }),
                  )
                }
              />
            </View>
            <View style={styles.fieldHalf}>
              <StyledTextInput
                label="City"
                placeholder="City"
                value={storeInformationFormData?.businessCity}
                onChangeText={(text) =>
                  dispatch(
                    updateStoreInformationField({
                      field: "businessCity",
                      value: text,
                    }),
                  )
                }
              />
            </View>
          </View>
        </SectionCard>
      )}

      <MarketVerticalPicker />
    </View>
  );
};

export default SellerStore;

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 8,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 12,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segmentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  fieldGroup: {
    gap: 0,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldHalf: {
    flex: 1,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerDropdown: {
    maxHeight: 180,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
});
