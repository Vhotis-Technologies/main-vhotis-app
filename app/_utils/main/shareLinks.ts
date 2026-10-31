import { API_CONFIG } from '@/constants/Config';

/** baseURL from app.json — includes the /m prefix. */
export function normalizeShareBase(): string {
  return (API_CONFIG.baseURL || '').replace(/\/$/, '');
}

export function buildProductShareUrl(productId: string): string {
  return `${normalizeShareBase()}/${productId}`;
}

export function buildStoreShareUrl(slug: string): string {
  return `${normalizeShareBase()}/${slug.trim().toLowerCase()}`;
}

/** Custom-scheme fallback when Universal Links are unavailable. */
export function buildAppDeepLink(segment: string): string {
  return `vhotisapp://share/${encodeURIComponent(segment.trim())}`;
}

/**
 * Product ids use uppercase letters; store slugs are lowercase-only.
 * This avoids an extra API call when routing deep links.
 */
export function isLikelyProductId(segment: string): boolean {
  return /[A-Z]/.test(segment);
}

/**
 * Extract the share segment from an incoming app or web URL.
 * Handles https://host/m/{segment}, legacy https://host/main/{segment}, and vhotisapp://{segment}.
 */
export function parseShareSegment(url: string): string | null {
  if (!url?.trim()) return null;

  try {
    const withoutScheme = url.replace(/^[^:]+:\/\//, '');
    const pathPart = withoutScheme.includes('?')
      ? withoutScheme.split('?')[0]
      : withoutScheme;
    const hostAndPath = pathPart.includes('/')
      ? pathPart.substring(pathPart.indexOf('/'))
      : `/${pathPart}`;
    const parts = hostAndPath.split('/').filter(Boolean);

    if (!parts.length) return null;

    const prefixIdx = parts.findIndex((part) => part === 'm' || part === 'main');
    const segment =
      prefixIdx >= 0 && parts.length > prefixIdx + 1
        ? parts[prefixIdx + 1]
        : parts[parts.length - 1];

    if (!segment || segment === 'm' || segment === 'main' || segment === 'api' || segment === 'share') {
      return null;
    }

    const lower = segment.toLowerCase();
    if (
      lower === 'admin' ||
      lower === 'accounts' ||
      lower === 'b' ||
      lower === 'buyers' ||
      lower === 's' ||
      lower === 'seller' ||
      lower === 'l' ||
      lower === 'logistics' ||
      lower.startsWith('api')
    ) {
      return null;
    }

    return segment;
  } catch {
    return null;
  }
}
