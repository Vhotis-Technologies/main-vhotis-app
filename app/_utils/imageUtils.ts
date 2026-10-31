/**
 * Utility functions for handling image URLs in the React Native app
 */

const BASE_URL = "https://60bb-51-37-143-144.ngrok-free.app";

/**
 * Converts a relative media URL to a full URL
 * @param relativeUrl - The relative URL from the server (e.g., '/media/products/images/...')
 * @returns The full URL that can be used by React Native Image components
 */
export const getFullImageUrl = (
  relativeUrl: string | null | undefined
): string | null => {
  if (!relativeUrl) {
    return null;
  }

  // If it's already a full URL, return as is
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }

  // Remove leading slash if present
  const cleanUrl = relativeUrl.startsWith("/")
    ? relativeUrl.slice(1)
    : relativeUrl;

  // Combine base URL with relative URL
  return `${BASE_URL}/${cleanUrl}`;
};

/**
 * Processes an array of image URLs, converting relative URLs to full URLs
 * @param images - Array of image URLs (can be relative or full URLs)
 * @returns Array of full URLs
 */
export const processImageUrls = (
  images: (string | null | undefined)[]
): string[] => {
  return images
    .map((url) => getFullImageUrl(url))
    .filter((url): url is string => url !== null);
};

/**
 * Processes a single image URL for use in Image components
 * @param imageUrl - The image URL from the server
 * @returns An object suitable for the Image source prop
 */
export const getImageSource = (imageUrl: string | null | undefined) => {
  const fullUrl = getFullImageUrl(imageUrl);
  return fullUrl ? { uri: fullUrl } : null;
};

// Default export for React component compatibility
export default {
  getFullImageUrl,
  processImageUrls,
  getImageSource,
};
