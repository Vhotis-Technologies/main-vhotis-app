import { resolveShareRoutePath } from '@/app/_utils/main/shareNavigation';

/**
 * Rewrites incoming system deep links before Expo Router matches routes.
 *
 * Handles:
 * - Universal / App Links: https://host/main/{segment}
 * - Custom scheme: vhotisapp://share/{segment} or legacy vhotisapp://{segment}
 */
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): string {
  try {
    const shareRoute = resolveShareRoutePath(path);
    if (shareRoute) {
      return shareRoute;
    }
  } catch {
    // Fall through to default router handling.
  }
  return path;
}
