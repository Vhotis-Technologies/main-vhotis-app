/**
 * Header component for the mobile homepage that alternates between showing
 * service features and a free delivery banner.
 */
import { Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
/**
 * HomepageHeader component that toggles between displaying service features
 * and a promotional banner for free delivery.
 * The display alternates every 5 seconds.
 *
 * @returns {JSX.Element} The rendered header component
 */
const HomepageHeader = () => {
  // State to control which view to show (features or banner)
  const [showHello, setShowHello] = useState(false);

  // Set up interval to toggle between views every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHello((prev) => !prev); // Toggle between true and false
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  /**
   * Sub-component to render individual feature icons with titles
   * @param {Object} props - Component props
   * @param {string} props.icon - Path to the icon image
   * @param {string} props.title - Text to display below the icon
   * @returns {JSX.Element} Rendered icon with title
   */
  const Icons = ({ icon, title }: { icon: string; title: string }) => {
    return (
      <View style={styles.iconsContainer}>
        <StyledText children={title} variant="labelSmall"/>
        <Image
          source={typeof icon === "string" ? { uri: icon } : icon}
          style={styles.icons}
        />
      </View>
    );
  };

  // Data for the feature icons to display
  const iconsData = [
    {
      icon: require("@/assets/images/fast-delivery.jpg"),
      title: "Fast Delivery",
    },
    {
      icon: require("@/assets/images/customer-support.jpg"),
      title: "24/7 Support",
    },
    {
      icon: require("@/assets/images/no-hidden-fees.jpg"),
      title: "No Hidden Charges",
    },
  ];

  // Display service features view
  if (showHello) {
    return (
      <View style={styles.iconsWrapper}>
        {iconsData.map((icon, index) => (
          <Icons key={index} icon={icon.icon} title={icon.title} />
        ))}
      </View>
    );
  }

  // Display free delivery promotional banner
  return (
    <View style={styles.freeDeliveryBanner}>
      <Text
        style={styles.freeDeliveryText}
      >{`Get free delivery on your first order below £${15}`}</Text>
      <Text style={styles.freeDeliveryTextDiscover}>Discover now</Text>
    </View>
  );
};

export default HomepageHeader;

const styles = StyleSheet.create({
  freeDeliveryBanner: {
    backgroundColor: "#007AFF",
    padding: 10,
    alignItems: "center",
  },
  freeDeliveryText: {
    textTransform: "capitalize",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "BarlowMedium",
  },
  freeDeliveryTextDiscover: {
    textTransform: "lowercase",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "BarlowLight",
  },

  iconsContainer: {
    padding: 5,
    alignItems: "center",
    gap: 10,
  },

  icons: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },

  iconsText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "BarlowLight",
  },

  iconsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: 10,
    backgroundColor: "#007AFF",
  },
});
