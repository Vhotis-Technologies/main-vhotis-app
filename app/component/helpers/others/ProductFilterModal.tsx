import { StyleSheet, TouchableOpacity, View, ScrollView } from "react-native";
import React, { useState, useMemo, useEffect } from "react";
import StyledText from "../forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FilterOptionValue } from "./FilterProductComponent";
import ProductCardInterface from "@/app/interfaces/main/product/Iteminterface";
import StyledButton from "../buttons/StyledButton";

export type PriceRange =
  | "under_25"
  | "under_50"
  | "under_100"
  | "under_200"
  | null;
export type RatingFilter = 4 | 3 | 2 | 1 | null;

interface ProductFilterModalProps {
  selectedSort?: FilterOptionValue | null;
  selectedPriceRange?: PriceRange;
  selectedRating?: RatingFilter;
  onApply: (filters: {
    sort?: FilterOptionValue | null;
    priceRange?: PriceRange;
    rating?: RatingFilter;
  }) => void;
  onClear: () => void;
  allProducts: ProductCardInterface[];
  getProductPrice: (product: any) => number;
  parseDistance: (distanceText?: string | number) => number;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
  setActiveFilterCount: (activeFilterCount: number) => void;
}

const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: "Under €25", value: "under_25" },
  { label: "Under €50", value: "under_50" },
  { label: "Under €100", value: "under_100" },
  { label: "Under €200", value: "under_200" },
];

const RATING_OPTIONS: { label: string; value: RatingFilter; stars: number }[] =
  [
    { label: "4 & Up", value: 4, stars: 4 },
    { label: "3 & Up", value: 3, stars: 3 },
    { label: "2 & Up", value: 2, stars: 2 },
    { label: "1 & Up", value: 1, stars: 1 },
  ];

const SORT_OPTIONS: { label: string; value: FilterOptionValue }[] = [
  { label: "Featured", value: "sponsored" },
  { label: "Price: Low to High", value: "price_low_to_high" },
  { label: "Price: High to Low", value: "price_high_to_low" },
  { label: "Avg. Customer Review", value: "rating" },
  { label: "Distance: Closest First", value: "distance_closest_first" },
  { label: "Distance: Furthest First", value: "distance_furthest_first" },
];

const FilterSection = ({
  title,
  children,
  isExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  isExpanded?: boolean;
}) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");

  return (
    <View style={[styles.section, { borderBottomColor: borderColor }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <StyledText
          variant="titleMedium"
          style={[styles.sectionTitle, { color: textColor }]}
        >
          {title}
        </StyledText>
        <MaterialCommunityIcons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={textColor}
        />
      </TouchableOpacity>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

const FilterButton = ({
  label,
  isSelected,
  onPress,
  icon,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");

  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor,
          borderColor: isSelected ? tintColor : borderColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.filterButtonIcon}>{icon}</View>}
      <StyledText
        variant="bodyMedium"
        style={[
          styles.filterButtonText,
          {
            color: isSelected ? tintColor : textColor,
            fontWeight: isSelected ? "600" : "400",
          },
        ]}
      >
        {label}
      </StyledText>
    </TouchableOpacity>
  );
};

const RatingStars = ({ count }: { count: number }) => {
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");

  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialCommunityIcons
          key={star}
          name={star <= count ? "star" : "star-outline"}
          size={16}
          color={star <= count ? tintColor : borderColor}
        />
      ))}
    </View>
  );
};

const ProductFilterModal = ({
  selectedSort,
  selectedPriceRange,
  selectedRating,
  onApply,
  onClear,
  allProducts,
  getProductPrice,
  parseDistance,
  setIsFilterOpen,
  setActiveFilterCount,
}: ProductFilterModalProps) => {
  const [localSort, setLocalSort] = useState<FilterOptionValue | null>(
    selectedSort || null
  );
  const [localPriceRange, setLocalPriceRange] = useState<PriceRange>(
    selectedPriceRange || null
  );
  const [localRating, setLocalRating] = useState<RatingFilter>(
    selectedRating || null
  );

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localSort) count++;
    if (localPriceRange) count++;
    if (localRating) count++;
    return count;
  }, [localSort, localPriceRange, localRating]);

  /* Update parent component with active filter count */
  useEffect(() => {
    setActiveFilterCount(activeFilterCount);
  }, [activeFilterCount, setActiveFilterCount]);

  /* Compute filtered count based on local filter state */
  const filteredCount = useMemo(() => {
    let filtered = [...allProducts];

    /* Apply price range filter */
    if (localPriceRange) {
      const maxPrice = {
        under_25: 25,
        under_50: 50,
        under_100: 100,
        under_200: 200,
      }[localPriceRange];

      filtered = filtered.filter((product) => {
        const price = getProductPrice(product);
        return price <= maxPrice && price !== Number.POSITIVE_INFINITY;
      });
    }

    /* Apply rating filter */
    if (localRating) {
      filtered = filtered.filter((product) => {
        const rating = product.rating ?? 0;
        return rating >= localRating;
      });
    }

    /* Note: We don't apply sorting for count calculation, as sorting doesn't change the count
    Sorting only affects the order, not which products are included */

    return filtered.length;
  }, [allProducts, localPriceRange, localRating, getProductPrice]);

  const handleApply = () => {
    onApply({
      sort: localSort,
      priceRange: localPriceRange,
      rating: localRating,
    });
    setIsFilterOpen(false);
  };

  const handleClear = () => {
    setLocalSort(null);
    setLocalPriceRange(null);
    setLocalRating(null);
    onClear();
  };

  const handlePriceRangeToggle = (value: PriceRange) => {
    setLocalPriceRange((current) => (current === value ? null : value));
  };

  const handleRatingToggle = (value: RatingFilter) => {
    setLocalRating((current) => (current === value ? null : value));
  };

  const handleSortToggle = (value: FilterOptionValue) => {
    setLocalSort((current) => (current === value ? null : value));
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.scrollView}>
        {/* PRICE FILTER SECTION */}
        <FilterSection title="Price">
          <View style={styles.optionsGrid}>
            {PRICE_OPTIONS.map((option) => (
              <FilterButton
                key={option.value}
                label={option.label}
                isSelected={localPriceRange === option.value}
                onPress={() => handlePriceRangeToggle(option.value)}
              />
            ))}
          </View>
        </FilterSection>

        {/* CUSTOMER REVIEW FILTER SECTION */}
        <FilterSection title="Customer Review">
          <View style={styles.optionsGrid}>
            {RATING_OPTIONS.map((option) => (
              <FilterButton
                key={option.value}
                label={option.label}
                isSelected={localRating === option.value}
                onPress={() => handleRatingToggle(option.value)}
                icon={<RatingStars count={option.stars} />}
              />
            ))}
          </View>
        </FilterSection>

        {/* Sort By Section */}
        <FilterSection title="Sort by">
          <View style={styles.optionsGrid}>
            {SORT_OPTIONS.map((option) => (
              <FilterButton
                key={option.value}
                label={option.label}
                isSelected={localSort === option.value}
                onPress={() => handleSortToggle(option.value)}
              />
            ))}
          </View>
        </FilterSection>
      </View>

      {/* Action Buttons */}
      <View
        style={[
          styles.actionBar,
          { backgroundColor, borderTopColor: borderColor },
        ]}
      >

        <StyledButton
          title={activeFilterCount > 0
            ? `Clear filters (${activeFilterCount})`
            : "Clear filters"}
          onPress={handleClear}
          variant="tonal"
          disabled={activeFilterCount === 0}
          buttonStyles={{flex: 1}}
        />

        <StyledButton
          title={filteredCount > 0
            ? `Show ${filteredCount} result${filteredCount !== 1 ? "s" : ""}`
            : "Apply Filters"}
          onPress={handleApply}
          variant="small"
          buttonStyles={{flex: 1}}
        />
      </View>
    </View>
  );
};

export default ProductFilterModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: "50%",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  section: {
    borderBottomWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  sectionContent: {
    paddingTop: 4,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  filterButton: {
    flexDirection: "row",
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: "45%",
    marginBottom: 8,
    justifyContent: "center",
  },
  filterButtonIcon: {
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 12,
  },
  starsContainer: {
    flexDirection: "row",
  },
  actionBar: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    justifyContent: "space-between",
    gap: 10,
  },
});
