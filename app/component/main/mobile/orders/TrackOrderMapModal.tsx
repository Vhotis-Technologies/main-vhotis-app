import { StyleSheet, View, Platform } from "react-native";
import React, { useMemo } from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AppleMaps, GoogleMaps } from "expo-maps";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";

export type TrackOrderModalProps = {
  latitude?: number;
  longitude?: number;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  orderNumber: string;
  lastUpdated?: string | null;
  onClose: () => void;
};

/* Track Order Map Modal is used to display a map of the riders current location relative to the delivery address */
const TrackOrderMapModal = ({
  latitude,
  longitude,
  deliveryLatitude,
  deliveryLongitude,
  orderNumber,
  lastUpdated,
  onClose,
}: TrackOrderModalProps) => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");

  const isFiniteNumber = (value?: number | null) =>
    typeof value === "number" && Number.isFinite(value);

  const mapPoints = useMemo(() => {
    const points: { latitude: number; longitude: number }[] = [];
    if (isFiniteNumber(latitude) && isFiniteNumber(longitude)) {
      points.push({
        latitude: latitude as number,
        longitude: longitude as number,
      });
    }
    if (isFiniteNumber(deliveryLatitude) && isFiniteNumber(deliveryLongitude)) {
      points.push({
        latitude: deliveryLatitude as number,
        longitude: deliveryLongitude as number,
      });
    }
    return points;
  }, [latitude, longitude, deliveryLatitude, deliveryLongitude]);

  const cameraPosition = useMemo(() => {
    if (!mapPoints.length) {
      return undefined;
    }
    const avgLatitude =
      mapPoints.reduce((sum, point) => sum + point.latitude, 0) /
      mapPoints.length;
    const avgLongitude =
      mapPoints.reduce((sum, point) => sum + point.longitude, 0) /
      mapPoints.length;
    const zoom = mapPoints.length > 1 ? 12 : 14;

    return {
      coordinates: {
        latitude: avgLatitude,
        longitude: avgLongitude,
      },
      zoom,
    };
  }, [mapPoints]);

  const appleMarkers = useMemo<AppleMaps.Marker[]>(() => {
    if (Platform.OS !== "ios") {
      return [];
    }

    const markers: AppleMaps.Marker[] = [];

    if (isFiniteNumber(latitude) && isFiniteNumber(longitude)) {
      markers.push({
        id: "rider",
        coordinates: {
          latitude: latitude as number,
          longitude: longitude as number,
        },
        title: "Rider Location",
        systemImage: "bicycle",
        tintColor: "#007AFF",
      });
    }

    if (isFiniteNumber(deliveryLatitude) && isFiniteNumber(deliveryLongitude)) {
      markers.push({
        id: "delivery",
        coordinates: {
          latitude: deliveryLatitude as number,
          longitude: deliveryLongitude as number,
        },
        title: "Delivery Address",
        systemImage: "house.fill",
        tintColor: "#FF3B30",
      });
    }

    return markers;
  }, [latitude, longitude, deliveryLatitude, deliveryLongitude]);

  const googleMarkers = useMemo<GoogleMaps.Marker[]>(() => {
    if (Platform.OS !== "android") {
      return [];
    }

    const markers: GoogleMaps.Marker[] = [];

    if (isFiniteNumber(latitude) && isFiniteNumber(longitude)) {
      markers.push({
        id: "rider",
        coordinates: {
          latitude: latitude as number,
          longitude: longitude as number,
        },
        title: "Rider Location",
        anchor: { x: 0.5, y: 1 },
      });
    }

    if (isFiniteNumber(deliveryLatitude) && isFiniteNumber(deliveryLongitude)) {
      markers.push({
        id: "delivery",
        coordinates: {
          latitude: deliveryLatitude as number,
          longitude: deliveryLongitude as number,
        },
        title: "Delivery Address",
        anchor: { x: 0.5, y: 1 },
      });
    }

    return markers;
  }, [latitude, longitude, deliveryLatitude, deliveryLongitude]);

  const formattedTimestamp = useMemo(() => {
    if (!lastUpdated) {
      return null;
    }
    const parsed = new Date(lastUpdated);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toLocaleString();
  }, [lastUpdated]);

  return (
    <View style={[styles.modalContainer, { backgroundColor }]}>
      <StyledText
        variant="titleMedium"
        style={[styles.modalTitle, { color: textColor }]}
      >
        Rider Location
      </StyledText>
      <StyledText
        variant="bodySmall"
        style={[styles.modalSubtitle, { color: textColor }]}
      >
        {orderNumber}
      </StyledText>
      {formattedTimestamp && (
        <StyledText
          variant="bodySmall"
          style={[styles.modalTimestamp, { color: textColor, opacity: 0.7 }]}
        >
          Last updated {formattedTimestamp}
        </StyledText>
      )}
      <View style={styles.mapContainer}>
        {cameraPosition ? (
          Platform.OS === "ios" ? (
            <AppleMaps.View
              style={styles.mapView}
              cameraPosition={cameraPosition}
              markers={appleMarkers}
              properties={{
                isMyLocationEnabled: false,
                isTrafficEnabled: false,
              }}
              uiSettings={{
                compassEnabled: true,
                scaleBarEnabled: true,
              }}
            />
          ) : (
            <GoogleMaps.View
              style={styles.mapView}
              cameraPosition={cameraPosition}
              markers={googleMarkers}
              properties={{
                isMyLocationEnabled: false,
                isTrafficEnabled: false,
              }}
              uiSettings={{
                compassEnabled: true,
                zoomControlsEnabled: true,
              }}
            />
          )
        ) : (
          <View style={styles.mapFallback}>
            <StyledText
              variant="bodySmall"
              style={[styles.mapFallbackText, { color: textColor }]}
            >
              Location data is not available right now.
            </StyledText>
          </View>
        )}
      </View>
    </View>
  );
};

export default TrackOrderMapModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    gap: 12,
    padding: 5,
  },
  modalTitle: {
    fontWeight: "600",
  },
  modalSubtitle: {
    opacity: 0.8,
  },
  modalTimestamp: {
    fontSize: 12,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 5,
    overflow: "hidden",
  },
  mapView: {
    flex: 1,
  },
  mapFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  mapFallbackText: {
    textAlign: "center",
    opacity: 0.7,
  },
});
