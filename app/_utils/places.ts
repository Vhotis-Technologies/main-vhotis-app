// @expo-router-ignore - This is a utility file, not a route
import { GOOGLE_MAPS_CONFIG } from "@/constants/Config";

export interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types?: string[];
}

export interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name?: string;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface PlacesApiResponse {
  predictions: PlacePrediction[];
  status: string;
}

export interface PlaceDetailsApiResponse {
  result: PlaceDetails;
  status: string;
}

/**
 * Get place predictions (autocomplete) from Google Places API as user types
 *
 * Provides real-time address suggestions as the user types their address.
 * Uses Google Places Autocomplete API with optional location bias for better relevance.
 *
 * Features:
 * - Debounced API calls (call this after user stops typing)
 * - Location bias support to prioritize results near user's location
 * - Automatic validation (minimum 2 characters required)
 * - Error handling for API failures
 *
 * @param {string} input - User input text (minimum 2 characters)
 * @param {Object} [location] - Optional bias location to prioritize results near user
 *   - latitude: {number} User's latitude
 *   - longitude: {number} User's longitude
 * @param {number} [radius=50000] - Optional radius in meters for location bias (default: 50km)
 *
 * @returns {Promise<PlacePrediction[]>} Array of place prediction objects with:
 *   - description: Full formatted address string
 *   - place_id: Unique Google Places identifier
 *   - structured_formatting: Object with main_text and secondary_text
 *   - types: Array of place types (street_address, establishment, etc.)
 *
 * @example
 * // Basic usage
 * const predictions = await getPlacePredictions("123 Main St");
 *
 * // With location bias
 * const predictions = await getPlacePredictions(
 *   "123 Main St",
 *   { latitude: 40.7128, longitude: -74.0060 },
 *   10000 // 10km radius
 * );
 */
export async function getPlacePredictions(
  input: string,
  location?: { latitude: number; longitude: number },
  radius: number = 50000
): Promise<PlacePrediction[]> {
  if (!GOOGLE_MAPS_CONFIG.apiKey) {
    console.error("Google Maps API key not configured");
    return [];
  }

  if (!input || input.length < 2) {
    return [];
  }

  try {
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&types=address&key=${GOOGLE_MAPS_CONFIG.apiKey}`;

    // Add location bias if provided (helps prioritize results near user)
    if (location) {
      url += `&location=${location.latitude},${location.longitude}&radius=${radius}`;
    }

    const response = await fetch(url);
    const data: PlacesApiResponse = await response.json();

    console.log("data address predictions", data);

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Places API error:", data.status);
      return [];
    }

    return data.predictions || [];
  } catch (error) {
    console.error("Error fetching place predictions:", error);
    return [];
  }
}

/**
 * Get detailed place information by place_id from Google Places API
 *
 * Fetches comprehensive address information including:
 * - Formatted address string
 * - Structured address components (street, city, postal code, country)
 * - Geographic coordinates (latitude/longitude)
 * - Place name
 *
 * This is called after user selects a prediction from autocomplete to get
 * the complete address details needed to populate the address form.
 *
 * @param {string} placeId - Unique Google Places identifier from PlacePrediction
 *
 * @returns {Promise<PlaceDetails | null>} Place details object containing:
 *   - place_id: Unique identifier
 *   - formatted_address: Full formatted address string
 *   - geometry: Object with location coordinates (lat, lng)
 *   - name: Place name (if available)
 *   - address_components: Array of structured address components
 * Returns null if API call fails or place not found
 *
 * @example
 * // After user selects a prediction
 * const prediction = predictions[0];
 * const details = await getPlaceDetails(prediction.place_id);
 * if (details) {
 *   const parsed = parseAddressComponents(details);
 *   // Use parsed address to populate form
 * }
 */
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetails | null> {
  if (!GOOGLE_MAPS_CONFIG.apiKey) {
    console.error("Google Maps API key not configured");
    return null;
  }

  try {
    const fields = [
      "place_id",
      "formatted_address",
      "geometry",
      "name",
      "address_components",
    ].join(",");

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_CONFIG.apiKey}`;

    const response = await fetch(url);
    const data: PlaceDetailsApiResponse = await response.json();
    console.log("data address details", data);

    if (data.status !== "OK") {
      console.error("Place details API error:", data.status);
      return null;
    }

    return data.result;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
}

/**
 * Convert place details to RoutePoint format
 * @param placeDetails - Place details from getPlaceDetails
 * @returns RoutePoint with latitude, longitude, and address
 */
export function placeDetailsToRoutePoint(placeDetails: PlaceDetails): {
  latitude: number;
  longitude: number;
  address: string;
} {
  return {
    latitude: placeDetails.geometry.location.lat,
    longitude: placeDetails.geometry.location.lng,
    address: placeDetails.formatted_address,
  };
}

/**
 * Parse address components from Google Places PlaceDetails
 *
 * Extracts structured address information from Google Places API response.
 * Handles various address formats and missing components gracefully.
 *
 * Parsing Strategy:
 * - Address: Constructs from street_number + route, falls back to route or formatted_address
 * - City: Prefers locality, falls back to administrative_area_level_2 or administrative_area_level_1
 * - Postal Code: Extracts from postal_code type component
 * - Country: Uses country component long_name
 * - Coordinates: Extracts from geometry.location
 *
 * @param {PlaceDetails} placeDetails - Place details object from getPlaceDetails API call
 * @returns {Object} Parsed address object with the following structure:
 *   - address: {string} Street address (street number + route)
 *   - city: {string} City/locality name
 *   - zip_code: {string} Postal/ZIP code
 *   - country: {string} Country name (long form)
 *   - latitude: {number} Latitude coordinate
 *   - longitude: {number} Longitude coordinate
 *
 * @example
 * const details = await getPlaceDetails(placeId);
 * const parsed = parseAddressComponents(details);
 * // {
 * //   address: "123 Main Street",
 * //   city: "New York",
 * //   zip_code: "10001",
 * //   country: "United States",
 * //   latitude: 40.7128,
 * //   longitude: -74.0060
 * // }
 */
export function parseAddressComponents(placeDetails: PlaceDetails): {
  address: string;
  city: string;
  zip_code: string;
  country: string;
  latitude: number;
  longitude: number;
} {
  const components = placeDetails.address_components || [];

  // Helper function to find component by type
  const findComponent = (types: string[]) => {
    return components.find((component) =>
      types.some((type) => component.types.includes(type))
    );
  };

  // Extract street number and route for full address
  const streetNumber = findComponent(["street_number"]);
  const route = findComponent(["route"]);
  let address = placeDetails.formatted_address;

  // If we have street number and route, construct address from them
  if (streetNumber && route) {
    address = `${streetNumber.long_name} ${route.long_name}`;
  } else if (route) {
    address = route.long_name;
  }

  // Extract city: locality, postal_town (UK/IE), sublocality, then admin areas
  const cityComponent =
    findComponent(["locality"]) ||
    findComponent(["postal_town"]) ||
    findComponent(["sublocality", "sublocality_level_1"]) ||
    findComponent(["neighborhood"]) ||
    findComponent(["administrative_area_level_2"]) ||
    findComponent(["administrative_area_level_3"]) ||
    findComponent(["administrative_area_level_1"]);
  const city = cityComponent?.long_name || "";

  // Extract postal / ZIP / Eircode (Google uses postal_code; US may split suffix)
  const postalCodeComponent = findComponent(["postal_code"]);
  const postalSuffix = findComponent(["postal_code_suffix"]);
  let zip_code = postalCodeComponent?.long_name || "";
  if (zip_code && postalSuffix?.long_name) {
    zip_code = `${zip_code}-${postalSuffix.long_name}`;
  }
  if (!zip_code) {
    const pcPrefix = findComponent(["postal_code_prefix"]);
    if (pcPrefix?.long_name) {
      zip_code = postalSuffix?.long_name
        ? `${pcPrefix.long_name}-${postalSuffix.long_name}`
        : pcPrefix.long_name;
    }
  }

  // Extract country
  const countryComponent = findComponent(["country"]);
  const country = countryComponent?.long_name || "";

  // Extract coordinates (geometry is requested from Places Details API)
  const latRaw = placeDetails.geometry?.location?.lat;
  const lngRaw = placeDetails.geometry?.location?.lng;
  const latitude = typeof latRaw === "number" && Number.isFinite(latRaw) ? latRaw : NaN;
  const longitude = typeof lngRaw === "number" && Number.isFinite(lngRaw) ? lngRaw : NaN;

  return {
    address,
    city,
    zip_code,
    country,
    latitude,
    longitude,
  };
}
