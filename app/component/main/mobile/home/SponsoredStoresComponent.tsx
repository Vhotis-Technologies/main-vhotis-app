/**
 * Horizontal rail of store-wide sponsored businesses on buyer home.
 * Tapping a card opens StoreFrontScreen for that store.
 */
import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

export type SponsoredStoreCard = {
  store_id: string;
  store_name: string;
  slug?: string | null;
  tagline?: string | null;
  city?: string | null;
  average_rating?: number | null;
  ratings_count?: number | null;
  image?: string | null;
};

type Props = {
  stores: SponsoredStoreCard[];
  onPressStore: (storeId: string) => void;
};

export default function SponsoredStoresComponent({
  stores,
  onPressStore,
}: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(280, width * 0.72);
  const surface = useThemeColor({}, "cards");
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "icons");
  const border = useThemeColor({}, "borders");
  const accent = useThemeColor({}, "tint");

  if (!stores?.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <StyledText variant="labelSmall" style={{ color: accent, letterSpacing: 1 }}>
          PARTNER STORES
        </StyledText>
        <StyledText variant="titleLarge" style={{ color: text, fontWeight: "700" }}>
          Sponsored businesses
        </StyledText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.track}
      >
        {stores.map((store) => {
          const rating =
            typeof store.average_rating === "number" && store.average_rating > 0
              ? store.average_rating.toFixed(1)
              : null;
          const cover =
            store.image ||
            `https://picsum.photos/seed/vhotis-store-${store.store_id}/480/320`;

          return (
            <TouchableOpacity
              key={store.store_id}
              activeOpacity={0.9}
              onPress={() => onPressStore(store.store_id)}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: surface,
                  borderColor: border,
                },
              ]}
            >
              <View style={styles.media}>
                <Image source={{ uri: cover }} style={styles.image} contentFit="cover" />
                <View style={[styles.badge, { backgroundColor: accent }]}>
                  <StyledText variant="labelSmall" style={styles.badgeText}>
                    Sponsored
                  </StyledText>
                </View>
              </View>
              <View style={styles.body}>
                <StyledText
                  variant="titleMedium"
                  style={{ color: text, fontWeight: "700" }}
                  numberOfLines={1}
                >
                  {store.store_name}
                </StyledText>
                {store.city ? (
                  <StyledText variant="bodySmall" style={{ color: muted }} numberOfLines={1}>
                    {store.city}
                  </StyledText>
                ) : null}
                {store.tagline ? (
                  <StyledText
                    variant="bodySmall"
                    style={{ color: muted, marginTop: 2 }}
                    numberOfLines={2}
                  >
                    {store.tagline}
                  </StyledText>
                ) : null}
                {rating ? (
                  <StyledText variant="labelMedium" style={styles.rating}>
                    {rating} ★
                  </StyledText>
                ) : null}
                <StyledText
                  variant="labelLarge"
                  style={{ color: text, marginTop: 8, fontWeight: "600" }}
                >
                  Visit storefront →
                </StyledText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 2,
  },
  track: {
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 4,
    overflow: "hidden",
  },
  media: {
    height: 140,
    backgroundColor: "#1a1f27",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    left: 8,
    top: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  body: {
    padding: 12,
  },
  rating: {
    marginTop: 4,
    color: "#c9943a",
    fontWeight: "600",
  },
});
