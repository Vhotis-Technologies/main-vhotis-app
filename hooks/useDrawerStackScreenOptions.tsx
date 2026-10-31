import { useMemo } from "react";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useThemeColor } from "@/hooks/useThemeColor";
import { DrawerStackHeaderRight as DrawerHeaderRight } from "@/app/component/helpers/layout/navigation/DrawerStackHeaderRight";
import { DrawerStackHeaderLeft as DrawerHeaderLeft } from "@/app/component/helpers/layout/navigation/DrawerStackHeaderLeft";

/**
 * Drawer menu always on the left; step back on the far right when the stack has history.
 */
export function useDrawerStackScreenOptions(): NativeStackNavigationOptions {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");

  return useMemo(
    () => ({
      headerShown: true,
      headerStyle: {
        backgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
      },
      headerTintColor: textColor,
      headerTitleStyle: { fontFamily: "BarlowMedium", fontSize: 18 },
      headerLeft: () => <DrawerHeaderLeft />,
      headerRight: () => <DrawerHeaderRight />,
    }),
    [backgroundColor, borderColor, textColor],
  );
}
