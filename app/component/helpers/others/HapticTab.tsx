// components/helpers/HapticTab.tsx
import { ReactNode } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function HapticTab({ children, ...props }: any) {
  return (
    <TouchableOpacity {...props}>
      {children}
    </TouchableOpacity>
  );
}
