import React, { useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StyledText from "./forms/StyledText";

/** Gap between a focused field and the sticky footer when the keyboard is open. */
const FOCUS_GAP = 12;

export type KeyboardWrapperProps = {
  backgroundColor: string;
  footer: React.ReactNode;
  children: React.ReactNode;
  header?: React.ReactNode;
  /** Rendered inside KeyboardStickyView below the footer (sign-in link, etc.). */
  footerExtra?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** When false, children fill the body without a scroll view (e.g. chat message lists). */
  scrollable?: boolean;
};

/**
 * Scrollable form layout with a sticky footer that lifts above the keyboard.
 */
const KeyboardWrapper = ({
  backgroundColor,
  header = null,
  footer,
  footerExtra,
  children,
  contentContainerStyle,
  scrollable = true,
}: KeyboardWrapperProps) => {
  const insets = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(0);

  const onFooterLayout = (event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    if (nextHeight !== footerHeight) {
      setFooterHeight(nextHeight);
    }
  };

  const bottomOffset =
    footerHeight > 0 ? footerHeight + FOCUS_GAP : FOCUS_GAP;

  return (
    <View style={[styles.root, { backgroundColor }]}>
      {header}
      {scrollable ? (
        <KeyboardAwareScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          bottomOffset={bottomOffset}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          automaticallyAdjustContentInsets={false}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View style={[styles.scroll, styles.body, contentContainerStyle]}>
          {children}
        </View>
      )}
      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
        <View onLayout={onFooterLayout}>
          {footer}
          {footerExtra}
          <StyledText variant="bodySmall" style={[styles.vhotistext, {backgroundColor}]} >Vhotis</StyledText>
        </View>
      </KeyboardStickyView>
    </View>
  );
};

export default KeyboardWrapper;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  body: {
    minHeight: 0,
  },
  scrollContent: {
    paddingHorizontal: 6,
    gap: 8,
  },
  vhotistext:{
    textAlign: 'center',
    fontSize:10,
    fontWeight: 'bold',
  }
});
