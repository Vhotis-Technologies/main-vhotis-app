import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StoreLocationPicker from "@/app/component/seller/shared/StoreLocationPicker";
import useSellerInventory from "@/app/hook/seller/useSellerInventory";
import { ProductImportJob } from "@/app/store/seller/api/productImportApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppSelector, RootState } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";

const statusMeta: Record<
  string,
  { label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }
> = {
  uploaded: { label: "Uploaded", icon: "upload-file", color: "#64748b" },
  parsing: { label: "Parsing", icon: "data-object", color: "#2563eb" },
  queued: { label: "Queued", icon: "schedule", color: "#64748b" },
  processing: { label: "Processing", icon: "sync", color: "#2563eb" },
  awaiting_review: {
    label: "Ready for review",
    icon: "rule",
    color: "#f59e0b",
  },
  committing: { label: "Importing", icon: "rocket-launch", color: "#2563eb" },
  completed: { label: "Completed", icon: "check-circle", color: "#16a34a" },
  completed_with_errors: {
    label: "Completed with errors",
    icon: "warning",
    color: "#f59e0b",
  },
  failed: { label: "Failed", icon: "error", color: "#ef4444" },
  cancelled: { label: "Cancelled", icon: "cancel", color: "#64748b" },
};

const productCsvColumns = [
  { name: "name", status: "Required" },
  { name: "description", status: "Required" },
  { name: "category", status: "Required" },
  { name: "price", status: "Required" },
  { name: "size", status: "Defaults allowed" },
  { name: "weight", status: "Defaults allowed" },
  { name: "quantity", status: "Defaults allowed" },
  { name: "seller_sku", status: "Recommended" },
  { name: "barcode", status: "Optional" },
  { name: "information", status: "Optional" },
  { name: "image_urls", status: "Optional" },
];

const BulkInventoryScreen = () => {
  const user = useAppSelector(
    (state: RootState) => state.auth.user,
  ) as Seller | null;
  const bulkAllowed = user?.allows_bulk_import === true;

  const {
    importJobs,
    isLoadingImportJobs,
    refetchImportJobs,
    isUploadingImportCsv,
    isDeletingImportJob,
    openBulkImportJob,
    pickAndUploadCsv,
    showCsvTemplateHint,
    handleDeleteImportJob,
    sellerStores,
    isLoadingSellerStores,
    selectedUploadStoreId,
    setSelectedUploadStoreId,
  } = useSellerInventory({ enableBulkImports: true });

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");

  if (user && !bulkAllowed) {
    return (
      <View
        style={[styles.container, styles.upgradeContainer, { backgroundColor }]}
      >
        <MaterialIcons name="lock" size={48} color={iconColor} />
        <StyledText
          variant="titleMedium"
          style={{ color: textColor, marginTop: 16, textAlign: "center" }}
        >
          Bulk import is not on your plan
        </StyledText>
        <StyledText
          variant="bodyMedium"
          style={{ color: iconColor, marginTop: 8, textAlign: "center" }}
        >
          Upgrade your subscription to add products via CSV.
        </StyledText>
        <StyledButton
          title="View plans"
          onPress={() => router.replace("/seller/main/store/SubscriptionPlans")}
          style={{ marginTop: 24, minWidth: 200 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <StoreLocationPicker
          stores={sellerStores}
          selectedStoreId={selectedUploadStoreId}
          onSelectStore={setSelectedUploadStoreId}
          isLoading={isLoadingSellerStores}
          label="Import into store"
        />

        <View
          style={[
            styles.uploadPanel,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <View style={styles.uploadHeader}>
            <View>
              <StyledText
                variant="titleMedium"
                style={[styles.sectionTitle, { color: textColor }]}
              >
                Start with a CSV
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={[styles.mutedText, { color: iconColor }]}
              >
                No products are created until the validation review is approved.
              </StyledText>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={pickAndUploadCsv}
            style={[styles.dropzone, { borderColor: buttonColor }]}
          >
            <MaterialIcons name="cloud-upload" size={36} color={buttonColor} />
            <StyledText
              variant="titleSmall"
              style={[styles.dropzoneTitle, { color: textColor }]}
            >
              Choose supplier CSV
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={[styles.dropzoneText, { color: iconColor }]}
            >
              CSV up to 10,000 rows. Images can be passed as public URLs.
            </StyledText>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.requirementsCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <View style={styles.sectionHeader}>
            <StyledText
              variant="titleMedium"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Product CSV columns
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconColor }}>
              Based on Product model
            </StyledText>
          </View>
          <View style={styles.chipWrap}>
            {productCsvColumns.map((item) => (
              <View
                key={item.name}
                style={[
                  styles.columnChip,
                  { backgroundColor: `${buttonColor}12` },
                ]}
              >
                <MaterialIcons name="check" size={14} color={buttonColor} />
                <StyledText
                  variant="bodySmall"
                  style={{ color: buttonColor, fontWeight: "700" }}
                >
                  {item.name}
                </StyledText>
                <StyledText
                  variant="bodySmall"
                  style={[styles.columnStatus, { color: iconColor }]}
                >
                  {item.status}
                </StyledText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <StyledText
            variant="titleMedium"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            Import jobs
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconColor }}>
            {isLoadingImportJobs ? "Loading..." : "Tap to review"}
          </StyledText>
        </View>

        {isLoadingImportJobs ? (
          <ActivityIndicator color={buttonColor} />
        ) : importJobs.length ? (
          importJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              cardColor={cardColor}
              borderColor={borderColor}
              textColor={textColor}
              iconColor={iconColor}
              onPress={() => openBulkImportJob(job.id)}
              onDelete={() =>
                handleDeleteImportJob(job.id, job.original_filename)
              }
              isDeleting={isDeletingImportJob}
            />
          ))
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => refetchImportJobs()}
            style={[
              styles.jobCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <StyledText
              variant="titleSmall"
              style={{ color: textColor, fontFamily: "RobotoBold" }}
            >
              No imports yet
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconColor }}>
              Upload a CSV to start your first bulk product import.
            </StyledText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const JobCard = ({
  job,
  cardColor,
  borderColor,
  textColor,
  iconColor,
  onPress,
  onDelete,
  isDeleting,
}: {
  job: ProductImportJob;
  cardColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  onPress: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) => {
  const status = statusMeta[job.status] || statusMeta.uploaded;
  const ready =
    (job.ready_count || 0) +
    (job.warning_count || 0) +
    (job.accepted_count || 0);
  const issues = (job.blocked_count || 0) + job.failure_count;
  const imported = job.imported_count || 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.jobCard, { backgroundColor: cardColor, borderColor }]}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobFile}>
          <StyledText
            variant="titleSmall"
            style={[styles.jobTitle, { color: textColor }]}
          >
            {job.original_filename}
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconColor }}>
            {job.id} • {new Date(job.created_at).toLocaleString()}
          </StyledText>
        </View>
        <View
          style={[styles.statusPill, { backgroundColor: `${status.color}18` }]}
        >
          <MaterialIcons name={status.icon} size={15} color={status.color} />
          <StyledText
            variant="bodySmall"
            style={[styles.statusText, { color: status.color }]}
          >
            {status.label}
          </StyledText>
        </View>
      </View>

      <View style={styles.jobStats}>
        <Stat label="Rows" value={job.total_rows} color={textColor} />
        <Stat label="Ready" value={ready} color="#16a34a" />
        <Stat label="Issues" value={issues} color="#ef4444" />
        <Stat label="Imported" value={imported} color="#2563eb" />
      </View>

      <View style={styles.reviewLink}>
        <StyledText
          variant="bodySmall"
          style={{ color: iconColor, fontWeight: "700" }}
        >
          Open job details
        </StyledText>
        <View style={styles.jobActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isDeleting}
            onPress={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            style={[styles.deleteJobButton, { borderColor: "#ef4444" }]}
          >
            <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
            <StyledText variant="bodySmall" style={styles.deleteJobText}>
              Delete
            </StyledText>
          </TouchableOpacity>
          <MaterialIcons name="chevron-right" size={21} color={iconColor} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Stat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <View style={styles.stat}>
    <StyledText variant="titleSmall" style={[styles.statValue, { color }]}>
      {value}
    </StyledText>
    <StyledText variant="bodySmall" style={styles.statLabel}>
      {label}
    </StyledText>
  </View>
);

export default BulkInventoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  upgradeContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 36,
  },
  hero: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: "RobotoBold",
    marginBottom: 6,
  },
  heroText: {
    lineHeight: 19,
  },
  heroIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  uploadPanel: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  uploadHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: "RobotoBold",
  },
  mutedText: {
    lineHeight: 18,
    marginTop: 5,
  },
  safeBadge: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  safeBadgeText: {
    color: "#16a34a",
    fontWeight: "700",
  },
  dropzone: {
    alignItems: "center",
    borderRadius: 22,
    borderStyle: "dashed",
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  dropzoneTitle: {
    fontFamily: "RobotoBold",
    marginTop: 10,
  },
  dropzoneText: {
    lineHeight: 18,
    marginTop: 6,
    textAlign: "center",
  },
  uploadActions: {
    flexDirection: "row",
    gap: 10,
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
  secondaryButton: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  secondaryButtonText: {
    fontWeight: "700",
  },
  requirementsCard: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  columnChip: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  columnStatus: {
    fontSize: 8,
    fontWeight: "600",
  },
  jobCard: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  jobHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  jobFile: {
    flex: 1,
  },
  jobTitle: {
    fontFamily: "RobotoMedium",
    marginBottom: 4,
  },
  statusPill: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  statusText: {
    fontWeight: "700",
  },
  jobStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    alignItems: "center",
    minWidth: 58,
  },
  statValue: {
    fontFamily: "RobotoBold",
  },
  statLabel: {
    color: "#8a8a8a",
    marginTop: 2,
  },
  reviewLink: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  jobActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  deleteJobButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteJobText: {
    color: "#ef4444",
    fontWeight: "700",
  },
});
