import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import DeviceSessionsSection from "@/app/component/helpers/settings/DeviceSessionsSection";

const DevicesAndSession = () => {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      <DeviceSessionsSection />
    </ScrollView>
  );
};

export default DevicesAndSession;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
