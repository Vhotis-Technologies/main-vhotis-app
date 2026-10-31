import React from "react";
import { StyleSheet, View } from "react-native";
import FinanceCategoryCard, {
  FinanceCategoryItem,
} from "./FinanceCategoryCard";

type FinanceCategoryGridProps = {
  items: FinanceCategoryItem[];
  currencyCode?: string;
};

const FinanceCategoryGrid = ({ items, currencyCode }: FinanceCategoryGridProps) => {
  const rows: FinanceCategoryItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((item) => (
            <FinanceCategoryCard
              key={item.key}
              item={item}
              currencyCode={currencyCode}
            />
          ))}
          {row.length === 1 && <View style={styles.spacer} />}
        </View>
      ))}
    </View>
  );
};

export default FinanceCategoryGrid;

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  spacer: {
    flex: 1,
  },
});
