import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TrendingCategoryInterface } from "@/app/interfaces/main/home/HomeInterfaces";
import { SellerStoreSummary } from "@/app/interfaces/seller/StoreInterface";

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accentColor: string;
  textColor: string;
  surfaceColor: string;
  borderColor: string;
};

const FilterChip = ({
  label,
  selected,
  onPress,
  accentColor,
  textColor,
  surfaceColor,
  borderColor,
}: FilterChipProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[
      styles.chip,
      {
        backgroundColor: selected ? accentColor : surfaceColor,
        borderColor: selected ? accentColor : borderColor,
      },
    ]}
  >
    <StyledText
      variant="labelMedium"
      style={{
        color: selected ? "#FFFFFF" : textColor,
        fontWeight: selected ? "600" : "500",
      }}
      numberOfLines={1}
    >
      {label}
    </StyledText>
  </TouchableOpacity>
);

type FilterSectionProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  iconColor: string;
  mutedColor: string;
  children: React.ReactNode;
  isLoading?: boolean;
};

const FilterSection = ({
  icon,
  title,
  iconColor,
  mutedColor,
  children,
  isLoading,
}: FilterSectionProps) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: `${iconColor}18` }]}>
        <MaterialIcons name={icon} size={16} color={iconColor} />
      </View>
      <StyledText variant="labelMedium" style={{ color: mutedColor }}>
        {title}
      </StyledText>
      {isLoading ? (
        <ActivityIndicator size="small" color={iconColor} style={styles.sectionLoader} />
      ) : null}
    </View>
    {children}
  </View>
);

type ProductCatalogFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  isSearching?: boolean;
  categories: TrendingCategoryInterface[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
  isLoadingCategories?: boolean;
  stores: SellerStoreSummary[];
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
  onSelectAllStores: () => void;
  isLoadingStores?: boolean;
  showStoreFilter?: boolean;
  showListingFilter?: boolean;
  selectedListingStatus?: "" | "draft" | "live" | "paused";
  onSelectListingStatus?: (status: "" | "draft" | "live" | "paused") => void;
};

const ProductCatalogFilters = ({
  search,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  isSearching = false,
  categories,
  selectedCategory,
  onSelectCategory,
  isLoadingCategories = false,
  stores,
  selectedStoreId,
  onSelectStore,
  onSelectAllStores,
  isLoadingStores = false,
  showStoreFilter = true,
  showListingFilter = false,
  selectedListingStatus = "",
  onSelectListingStatus,
}: ProductCatalogFiltersProps) => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const buttonColor = useThemeColor({}, "button");
  const borderColor = useThemeColor({}, "borders");
  const iconColor = useThemeColor({}, "icons");
  const placeholderColor = useThemeColor(
    { light: "#757575", dark: "#9E9E9E" },
    "text",
  );

  const chipProps = {
    accentColor: buttonColor,
    textColor,
    surfaceColor: backgroundColor,
    borderColor,
  };

  const activeStore =
    stores.find((store) => store.id === selectedStoreId) ?? stores[0] ?? null;
  const showStoreSection =
    showStoreFilter && (isLoadingStores || stores.length > 0);

  return (
    <View style={[styles.panel, { backgroundColor: cardColor, borderColor }]}>
      <View style={styles.searchRow}>
        <View style={[styles.searchWrap, { borderColor, backgroundColor }]}>
          <MaterialIcons name="search" size={20} color={iconColor} />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            placeholder="Search by name"
            placeholderTextColor={placeholderColor}
            style={[styles.searchInput, { color: textColor }]}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 ? (
            <TouchableOpacity
              onPress={onSearchClear}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearButton}
            >
              <MaterialIcons name="close" size={18} color={iconColor} />
            </TouchableOpacity>
          ) : null}
        </View>
        <Pressable
          onPress={onSearchSubmit}
          style={[styles.searchButton, { borderColor, backgroundColor }]}
          accessibilityRole="button"
          accessibilityLabel="Search products"
        >
          {isSearching ? (
            <ActivityIndicator size="small" color={buttonColor} />
          ) : (
            <MaterialIcons name="search" size={22} color={buttonColor} />
          )}
        </Pressable>
      </View>

      {showStoreSection ? (
        <>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <FilterSection
            icon="storefront"
            title="Store"
            iconColor={buttonColor}
            mutedColor={iconColor}
            isLoading={isLoadingStores}
          >
            {stores.length === 1 && !isLoadingStores ? (
              <View style={[styles.singleStorePill, { borderColor, backgroundColor }]}>
                <MaterialIcons name="location-on" size={16} color={buttonColor} />
                <StyledText
                  variant="labelMedium"
                  style={{ color: textColor, flex: 1 }}
                  numberOfLines={1}
                >
                  {activeStore?.business_name}
                  {activeStore?.business_city
                    ? ` · ${activeStore.business_city}`
                    : ""}
                </StyledText>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                <FilterChip
                  label="All stores"
                  selected={!selectedStoreId}
                  onPress={onSelectAllStores}
                  {...chipProps}
                />
                {stores.map((store) => (
                  <FilterChip
                    key={store.id}
                    label={store.business_name}
                    selected={selectedStoreId === store.id}
                    onPress={() => onSelectStore(store.id)}
                    {...chipProps}
                  />
                ))}
              </ScrollView>
            )}
          </FilterSection>
        </>
      ) : null}

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      <FilterSection
        icon="category"
        title="Category"
        iconColor={buttonColor}
        mutedColor={iconColor}
        isLoading={isLoadingCategories}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <FilterChip
            label="All"
            selected={selectedCategory === null}
            onPress={() => onSelectCategory("")}
            {...chipProps}
          />
          {categories.map((category) => {
            const isSelected =
              selectedCategory === category.id ||
              selectedCategory === category.title?.toLowerCase();

            return (
              <FilterChip
                key={category.id}
                label={category.title ?? "Category"}
                selected={Boolean(isSelected)}
                onPress={() =>
                  onSelectCategory(
                    category.id || category.title?.toLowerCase() || "",
                  )
                }
                {...chipProps}
              />
            );
          })}
        </ScrollView>
      </FilterSection>

      {showListingFilter && onSelectListingStatus ? (
        <>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <FilterSection
            icon="sell"
            title="Listing status"
            iconColor={buttonColor}
            mutedColor={iconColor}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {(
                [
                  { value: "" as const, label: "All" },
                  { value: "live" as const, label: "Live" },
                  { value: "draft" as const, label: "Draft" },
                  { value: "paused" as const, label: "Paused" },
                ] as const
              ).map((option) => (
                <FilterChip
                  key={option.value || "all"}
                  label={option.label}
                  selected={selectedListingStatus === option.value}
                  onPress={() => onSelectListingStatus(option.value)}
                  {...chipProps}
                />
              ))}
            </ScrollView>
          </FilterSection>
        </>
      ) : null}
    </View>
  );
};

export default ProductCatalogFilters;

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    gap: 8,
    overflow: "hidden",
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontFamily: "BarlowRegular",
    fontSize: 14,
  },
  clearButton: {
    flexShrink: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLoader: {
    marginLeft: "auto",
  },
  chipRow: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 200,
  },
  singleStorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
