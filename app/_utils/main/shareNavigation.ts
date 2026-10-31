import { router } from 'expo-router';
import {
  isLikelyProductId,
  normalizeShareBase,
  parseShareSegment,
} from '@/app/_utils/main/shareLinks';

export type ShareResolvePayload =
  | { type: 'product'; data: { id: string } }
  | { type: 'store'; data: { store_id: string } };

export const PRODUCT_DESCRIPTION_ROUTE =
  '/main/mobile/(tabs)/home/ProductDescriptionScreen' as const;

export const STORE_FRONT_ROUTE =
  '/main/mobile/(tabs)/home/StoreFrontScreen' as const;

export async function fetchShareTarget(
  segment: string,
): Promise<ShareResolvePayload | null> {
  const base = normalizeShareBase();
  if (!base) return null;

  const url = `${base}/api/v1/public/share/resolve/?segment=${encodeURIComponent(segment)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    success?: boolean;
    type?: string;
    data?: { id?: string; store_id?: string };
  };
  if (!json.success || !json.type || !json.data) return null;

  if (json.type === 'product' && json.data.id) {
    return { type: 'product', data: { id: json.data.id } };
  }
  if (json.type === 'store' && json.data.store_id) {
    return { type: 'store', data: { store_id: json.data.store_id } };
  }
  return null;
}

/** Expo Router path for a share segment (sync — slugs use /share/[segment] resolver). */
export function resolveShareRoutePath(rawPath: string): string | null {
  const segment = parseShareSegment(rawPath);
  if (!segment) return null;

  if (isLikelyProductId(segment)) {
    return `${PRODUCT_DESCRIPTION_ROUTE}?id=${encodeURIComponent(segment)}`;
  }

  return `/share/${encodeURIComponent(segment)}`;
}

export async function navigateToShareSegment(segment: string): Promise<boolean> {
  if (isLikelyProductId(segment)) {
    router.replace({
      pathname: PRODUCT_DESCRIPTION_ROUTE,
      params: { id: segment },
    });
    return true;
  }

  const resolved = await fetchShareTarget(segment);
  if (!resolved) return false;

  if (resolved.type === 'product') {
    router.replace({
      pathname: PRODUCT_DESCRIPTION_ROUTE,
      params: { id: resolved.data.id },
    });
    return true;
  }

  router.replace({
    pathname: STORE_FRONT_ROUTE,
    params: { storeId: resolved.data.store_id },
  });
  return true;
}

/** True when the URL is a shared product or storefront link. */
export function isShareDeepLink(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return parseShareSegment(url) != null;
}
