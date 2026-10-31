import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import StyledText from '@/app/component/helpers/forms/StyledText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { navigateToShareSegment } from '@/app/_utils/main/shareNavigation';

/**
 * Resolves store slugs (and non-obvious segments) then navigates to the
 * buyer product or storefront screen. Product IDs are routed directly by
 * +native-intent and usually never land here.
 */
export default function ShareRedirectScreen() {
  const params = useLocalSearchParams<{ segment?: string | string[] }>();
  const segment = Array.isArray(params.segment)
    ? params.segment[0]
    : params.segment;

  const [failed, setFailed] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (!segment?.trim()) {
      setFailed(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      const ok = await navigateToShareSegment(segment.trim());
      if (cancelled) return;
      if (!ok) {
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [segment]);

  if (failed) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <StyledText variant="titleMedium" style={{ color: textColor }}>
          Link not found
        </StyledText>
        <StyledText
          variant="bodySmall"
          style={{ color: textColor, opacity: 0.7, marginTop: 8, textAlign: 'center' }}
        >
          This shared link may be invalid or no longer available.
        </StyledText>
        <StyledText
          variant="labelMedium"
          style={{ color: tintColor, marginTop: 20 }}
          onPress={() => router.replace('/main/mobile/(tabs)/home/HomeScreen')}
        >
          Go to home
        </StyledText>
      </View>
    );
  }

  return (
    <View style={[styles.centered, { backgroundColor }]}>
      <ActivityIndicator size="large" color={tintColor} />
      <StyledText variant="bodyMedium" style={{ color: textColor, marginTop: 16 }}>
        Opening…
      </StyledText>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
