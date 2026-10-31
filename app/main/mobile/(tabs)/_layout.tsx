import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Tabs } from "expo-router";
import { useColorScheme, StyleSheet, View, Text } from "react-native";
import HapticTab from "../../../component/helpers/others/HapticTab";
import TabBarBackground from "../../../component/helpers/others/TabBarBackground";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RootState, useAppSelector } from "@/app/store/store";
import StyledText from "@/app/component/helpers/forms/StyledText";

interface TabIconProps {
  name: string;
  color: string;
  size: number;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ name, color, size, focused }) => {
  const scale = focused ? 1.0 : 0.8;
  const iconSize = focused ? 22 : 20;
  return (
    <View style={[styles.iconContainer, { transform: [{ scale }] }]}>
      <Ionicons name={name as any} color={color} size={iconSize} />
    </View>
  );
};

interface CartTabIconProps {
  color: string;
  size: number;
  focused: boolean;
  itemCount: number;
}

/**
 * Cart tab icon with badge for the number of items in the cart 
 * @param param0 
 * @returns 
 */
const CartTabIcon: React.FC<CartTabIconProps> = ({
  color,
  size,
  focused,
  itemCount,
}) => {
  const buttonColor = useThemeColor({}, "button");
  const scale = focused ? 1.2 : 0.8;

  return (
    <View style={[styles.iconContainer, { transform: [{ scale }] }]}>
      <View style={{ position: "relative" }}>
        <Ionicons name="cart-outline" color={color} size={size} />
        {itemCount > 0 && (
          <View style={[styles.cartBadge]}>
            <StyledText style={styles.cartBadgeText}>{itemCount}</StyledText>
          </View>
        )}
      </View>
    </View>
  );
};

export default function MainTabLayout() {
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const { cartItems } = useAppSelector((state: RootState) => state.cart);
  const totalItems = cartItems.length;

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarInactiveTintColor: tintColor,
          tabBarStyle: {
            backgroundColor: backgroundColor,
            borderTopWidth: 1,
            borderTopColor: "gray",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name="home-outline"
                color={color}
                size={size}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name="person-outline"
                color={color}
                size={size}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            tabBarIcon: ({ color, size, focused }) => (
              <CartTabIcon
                color={color}
                size={size}
                focused={focused}
                itemCount={totalItems}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: "Menu",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name="menu"
                color={color}
                size={size}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  activeIndicator: {
    width: 20,
    height: 4,
    backgroundColor: "#000",
    borderRadius: 2,
    marginBottom: 4,
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    width: 15,
    height: 15,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
