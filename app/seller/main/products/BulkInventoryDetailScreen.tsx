import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import StyledText from "@/app/component/helpers/forms/StyledText";
import useSellerInventory, {
  BulkImportReviewFilter,
} from "@/app/hook/seller/useSellerInventory";
import { ProductImportRow } from "@/app/store/seller/api/productImportApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const filterOptions: BulkImportReviewFilter[] = [
  "all",
  "blocked",
  "warning",
  "ready",
  "accepted",
  "skipped",
  "imported",
  "failed",
];

const statusLabel: Record<string, string> = {
  uploaded: "Uploaded",
  parsing: "Parsing",
  queued: "Queued",
  processing: "Processing",
  awaiting_review: "Awaiting review",
  committing: "Importing",
  completed: "Completed",
  completed_with_errors: "Completed with errors",
  failed: "Failed",
  cancelled: "Cancelled",
};

const timeline = [
  "CSV uploaded",
  "Rows parsed",
  "Rows validated",
  "Awaiting seller review",
  "Products imported",
];

const BulkInventoryDetailScreen = () => {
  const params = useLocalSearchParams<{ jobId?: string }>();
  const [filter, setFilter] = useState<BulkImportReviewFilter>("all");

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");

  const jobId = params.jobId || "";
  const {
    importJob: job,
    isLoadingImportJob: isJobLoading,
    importRows: rows,
    isLoadingImportRows,
    importReadyCount: readyCount,
    importProgress: progress,
    editingImportRow,
    setEditingImportRow,
    importRowEditValues,
    setImportRowEditValues,
    isBulkImportRowActionLoading,
    isCommittingImportRows,
    isSavingImportRow,
    handleCommitImportRows,
    handleImportRowAction,
    handleSkipImportRow,
    handleSaveImportRow,
    showErrorCsvHint,
    bulkImportEditableFields,
  } = useSellerInventory({
    enableBulkImports: true,
    importJobId: jobId,
    importRowFilter: filter,
  });

  if (isJobLoading || !job) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator color={buttonColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <StyledText
              variant="titleLarge"
              style={[styles.title, { color: textColor }]}
            >
              Import review
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={[styles.subtext, { color: iconColor }]}
            >
              {job.original_filename} •{" "}
              {new Date(job.created_at).toLocaleString()}
            </StyledText>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${buttonColor}16` },
            ]}
          >
            <MaterialIcons name="rule" size={16} color={buttonColor} />
            <StyledText
              variant="bodySmall"
              style={{ color: buttonColor, fontWeight: "700" }}
            >
              {statusLabel[job.status] || job.status}
            </StyledText>
          </View>
        </View>

        <View
          style={[
            styles.summaryPanel,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <View>
            <View>
              <StyledText
                variant="titleMedium"
                style={[styles.sectionTitle, { color: textColor }]}
              >
                {job.id}
              </StyledText>
              <StyledText variant="bodySmall" style={{ color: iconColor }}>
                Preflight validation progress
              </StyledText>
            </View>
            <StyledText
              variant="titleMedium"
              style={{ color: buttonColor, fontFamily: "RobotoBold" }}
            >
              {progress}%
            </StyledText>
          </View>

          <View
            style={[
              styles.progressTrack,
              { backgroundColor: `${borderColor}80` },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: buttonColor },
              ]}
            />
          </View>

          <View style={styles.summaryGrid}>
            <Summary label="Rows" value={job.total_rows} color={textColor} />
            <Summary label="Ready" value={readyCount} color="#16a34a" />
            <Summary
              label="Warnings"
              value={job.warning_count || 0}
              color="#f59e0b"
            />
            <Summary
              label="Blocked"
              value={job.blocked_count || job.failure_count}
              color="#ef4444"
            />
          </View>
        </View>

        <View
          style={[
            styles.actionPanel,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <StyledText
            variant="titleMedium"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            Next best action
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={[styles.subtext, { color: iconColor }]}
          >
            Fix blocked rows, then import the ready and accepted products.
          </StyledText>
          <View style={styles.actionRow}>
            <StyledButton
              title={job.status === "committing" ? "Importing rows..." : "Import ready rows"}
              onPress={handleCommitImportRows}
              disabled={
                isCommittingImportRows ||
                job.status === "committing" ||
                readyCount === 0
              }
              loading={isCommittingImportRows || job.status === "committing"}
              variant="small"
            />
            <StyledButton
              title="Download error CSV"
              onPress={showErrorCsvHint}
              variant="small"
            />
          </View>
        </View>

        <View
          style={[
            styles.timelinePanel,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <StyledText
            variant="titleMedium"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            Validation timeline
          </StyledText>
          {timeline.map((item, index) => (
            <View key={item} style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  {
                    backgroundColor:
                      index === timeline.length - 1 ? "#f59e0b" : "#16a34a",
                  },
                ]}
              />
              <StyledText variant="bodySmall" style={{ color: textColor }}>
                {item}
              </StyledText>
            </View>
          ))}
        </View>

        <View style={styles.filterRow}>
          {filterOptions.map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => setFilter(item)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filter === item ? buttonColor : `${buttonColor}10`,
                },
              ]}
            >
              <StyledText
                variant="bodySmall"
                style={{
                  color: filter === item ? "#fff" : buttonColor,
                  fontWeight: "700",
                  textTransform: "capitalize",
                }}
              >
                {item}
              </StyledText>
            </TouchableOpacity>
          ))}
        </View>

        {isLoadingImportRows || isBulkImportRowActionLoading ? (
          <ActivityIndicator color={buttonColor} />
        ) : rows.length ? (
          rows.map((row) => (
            <RowReviewCard
              key={row.id}
              row={row}
              cardColor={cardColor}
              borderColor={borderColor}
              buttonColor={buttonColor}
              textColor={textColor}
              iconColor={iconColor}
              onPrimaryAction={() => handleImportRowAction(row)}
              onSecondaryAction={() => handleSkipImportRow(row)}
            />
          ))
        ) : (
          <View
            style={[
              styles.rowCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <StyledText variant="bodySmall" style={{ color: iconColor }}>
              No rows match this filter.
            </StyledText>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!editingImportRow}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingImportRow(null)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <StyledText
              variant="titleMedium"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Fix row {editingImportRow?.row_number}
            </StyledText>
            <ScrollView contentContainerStyle={styles.modalFields}>
              {bulkImportEditableFields.map((field) => (
                <View key={field} style={styles.inputGroup}>
                  <StyledText
                    variant="bodySmall"
                    style={{ color: iconColor, textTransform: "capitalize" }}
                  >
                    {field.replace("_", " ")}
                  </StyledText>
                  <TextInput
                    value={importRowEditValues[field] || ""}
                    onChangeText={(value) =>
                      setImportRowEditValues((current) => ({
                        ...current,
                        [field]: value,
                      }))
                    }
                    multiline={
                      field === "description" || field === "image_urls"
                    }
                    style={[
                      styles.textInput,
                      { borderColor, color: textColor },
                    ]}
                    placeholderTextColor={iconColor}
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setEditingImportRow(null)}
                style={[styles.outlineButton, { borderColor, flex: 1 }]}
              >
                <StyledText
                  variant="bodySmall"
                  style={{ color: iconColor, fontWeight: "700" }}
                >
                  Cancel
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSavingImportRow}
                onPress={handleSaveImportRow}
                style={[styles.primaryButton, { backgroundColor: buttonColor }]}
              >
                <StyledText
                  variant="bodySmall"
                  style={styles.primaryButtonText}
                >
                  {isSavingImportRow ? "Saving..." : "Save row"}
                </StyledText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Summary = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <View style={styles.summaryItem}>
    <StyledText variant="titleMedium" style={[styles.summaryValue, { color }]}>
      {value}
    </StyledText>
    <StyledText variant="bodySmall" style={styles.summaryLabel}>
      {label}
    </StyledText>
  </View>
);

const RowReviewCard = ({
  row,
  cardColor,
  borderColor,
  buttonColor,
  textColor,
  iconColor,
  onPrimaryAction,
  onSecondaryAction,
}: {
  row: ProductImportRow;
  cardColor: string;
  borderColor: string;
  buttonColor: string;
  textColor: string;
  iconColor: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}) => {
  const colors = {
    blocked: "#ef4444",
    warning: "#f59e0b",
    ready: "#16a34a",
    accepted: "#2563eb",
    imported: "#16a34a",
    failed: "#ef4444",
    skipped: "#64748b",
  };
  const color = colors[row.status] || "#64748b";
  const errors = Object.values(row.field_errors || {});
  const issue =
    errors[0] ||
    row.warnings?.[0] ||
    row.last_error ||
    "Validated and ready to import.";
  const suggestion = row.suggested_category_name
    ? `Suggested category: ${row.suggested_category_name}`
    : row.status === "imported"
      ? `Created product ${row.product_id || ""}`
      : "Review or import this row.";
  const actionLabel = row.suggested_category
    ? "Apply category"
    : row.status === "ready" || row.status === "warning"
      ? "Accept row"
      : "Edit row";

  return (
    <View style={[styles.rowCard, { backgroundColor: cardColor, borderColor }]}>
      <View style={styles.rowHeader}>
        <View style={styles.rowTitleGroup}>
          <StyledText
            variant="titleSmall"
            style={[styles.rowTitle, { color: textColor }]}
          >
            Row {row.row_number}: {row.name || "Unnamed product"}
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconColor }}>
            SKU {row.seller_sku || "Not provided"}
          </StyledText>
        </View>
        <View style={[styles.rowBadge, { backgroundColor: `${color}18` }]}>
          <StyledText
            variant="bodySmall"
            style={{ color, fontWeight: "700", textTransform: "capitalize" }}
          >
            {row.status}
          </StyledText>
        </View>
      </View>

      <View style={styles.issueLine}>
        <MaterialIcons
          name={row.status === "ready" ? "check-circle" : "error-outline"}
          size={18}
          color={color}
        />
        <View style={styles.issueTextGroup}>
          <StyledText variant="bodySmall" style={{ color: textColor }}>
            {issue}
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconColor }}>
            {suggestion}
          </StyledText>
        </View>
      </View>

      <View style={styles.rowActions}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPrimaryAction}
          style={[
            styles.rowPrimaryAction,
            { backgroundColor: `${buttonColor}14` },
          ]}
        >
          <StyledText
            variant="bodySmall"
            style={{ color: buttonColor, fontWeight: "700" }}
          >
            {actionLabel}
          </StyledText>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onSecondaryAction}
          style={[styles.rowSecondaryAction, { borderColor }]}
        >
          <StyledText
            variant="bodySmall"
            style={{ color: iconColor, fontWeight: "700" }}
          >
            Skip row
          </StyledText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BulkInventoryDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 36,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontFamily: "RobotoBold",
    marginBottom: 6,
  },
  subtext: {
    lineHeight: 19,
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  summaryPanel: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: "RobotoBold",
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
    minWidth: 64,
  },
  summaryValue: {
    fontFamily: "RobotoBold",
  },
  summaryLabel: {
    color: "#8a8a8a",
    marginTop: 2,
  },
  actionPanel: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
  actionRow: {
    flexDirection: "row",
    gap: 5,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 16,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  outlineButton: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  timelinePanel: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
  timelineItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  timelineDot: {
    borderRadius: 999,
    height: 9,
    width: 9,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  rowCard: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 13,
    padding: 14,
  },
  rowHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  rowTitleGroup: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: "RobotoMedium",
    marginBottom: 4,
  },
  rowBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  issueLine: {
    flexDirection: "row",
    gap: 9,
  },
  issueTextGroup: {
    flex: 1,
    gap: 4,
  },
  rowActions: {
    flexDirection: "row",
    gap: 8,
  },
  rowPrimaryAction: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    paddingVertical: 10,
  },
  rowSecondaryAction: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  modalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: "88%",
    padding: 16,
    gap: 14,
  },
  modalFields: {
    gap: 12,
    paddingBottom: 10,
  },
  inputGroup: {
    gap: 6,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
