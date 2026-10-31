import { Pressable, StyleSheet, View } from "react-native";
import StyledText from "../../helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { SellingPath } from "@/app/interfaces/others/OnboardingInterfaces";

const PATHS: {
  id: SellingPath;
  label: string;
  title: string;
  description: string;
  featured?: boolean;
}[] = [
  {
    id: "fulfillment",
    label: "Option 1 · Recommended",
    title: "Vhotis Fulfillment",
    description:
      "Rent warehouse space and let us store, pick, pack, and ship your orders.",
    featured: true,
  },
  {
    id: "self_fulfill",
    label: "Option 2 · Your store",
    title: "Manage your own store",
    description:
      "Keep inventory at your shop and we collect, deliver, and pay you out.",
  },
];

interface SellingPathStepProps {
  value: SellingPath | null;
  onChange: (path: SellingPath) => void;
}

const SellingPathStep = ({ value, onChange }: SellingPathStepProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");

  return (
    <View style={styles.container}>
      {PATHS.map((path) => {
        const selected = value === path.id;
        return (
          <Pressable
            key={path.id}
            onPress={() => onChange(path.id)}
            style={[
              styles.card,
              {
                backgroundColor: selected ? buttonColor : cardColor,
                borderColor: path.featured || selected ? buttonColor : borderColor,
              },
            ]}
          >
            <StyledText
              variant="labelSmall"
              style={{ color: selected ? "#fff" : iconMuted, marginBottom: 6 }}
            >
              {path.label}
            </StyledText>
            <StyledText
              variant="titleMedium"
              style={{ color: selected ? "#fff" : textColor, marginBottom: 6 }}
            >
              {path.title}
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={{ color: selected ? "rgba(255,255,255,0.85)" : iconMuted, lineHeight: 18 }}
            >
              {path.description}
            </StyledText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default SellingPathStep;

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
});
