import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { useAppSelector } from '@/app/store/store';
import { API_CONFIG } from '@/constants/Config';
import { parseShareSegment } from '@/app/_utils/main/shareLinks';
import {
  isShareDeepLink,
  navigateToShareSegment,
} from '@/app/_utils/main/shareNavigation';

/**
 * Handles share URLs while the app is already open (warm start).
 * Cold starts are routed by +native-intent before Expo Router matches paths.
 */
export default function useShareLinkHandler() {
  const authReady = useAppSelector((state) => state.auth.isAuthReady);
  const pendingUrl = useRef<string | null>(null);
  const isHandling = useRef(false);

  useEffect(() => {
    if (!API_CONFIG.baseURL) return;

    const handleUrl = async (url: string | null) => {
      if (!url || isHandling.current || !isShareDeepLink(url)) return;
      const segment = parseShareSegment(url);
      if (!segment) return;

      if (!authReady) {
        pendingUrl.current = url;
        return;
      }

      isHandling.current = true;
      try {
        await navigateToShareSegment(segment);
      } finally {
        isHandling.current = false;
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });

    return () => subscription.remove();
  }, [authReady]);

  useEffect(() => {
    if (!authReady || !pendingUrl.current) return;
    const url = pendingUrl.current;
    pendingUrl.current = null;
    void (async () => {
      const segment = parseShareSegment(url);
      if (!segment || isHandling.current) return;
      isHandling.current = true;
      try {
        await navigateToShareSegment(segment);
      } finally {
        isHandling.current = false;
      }
    })();
  }, [authReady]);
}
