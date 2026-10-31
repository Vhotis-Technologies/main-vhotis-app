/**
 * ManifestBuilderScreen — slice-driven, local-first inbound manifest builder.
 *
 * Flow:
 *   1. Seller adds each item (name, size, qty, unit, weight, flags) → stored in
 *      manifestBuilderSlice only. Nothing hits the server here.
 *   2. The growing list is shown and every item is editable / removable.
 *   3. "Submit & pay" creates the shipment, pushes all lines, and opens the
 *      Stripe payment sheet. The server resolves the delivery method from the
 *      seller's profile, so there is no method-selection step.
 *
 * Reached either fresh (Book inbound) or with ?shipmentId to keep editing a
 * draft that was started earlier.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAlertContext } from "@/app/contexts/AlertContext";
import { useAppDispatch } from "@/app/store/store";
import {
  addDraftLine,
  hydrateManifestBuilder,
  removeDraftLine,
  resetManifestBuilder,
  updateDraftLine,
} from "@/app/store/seller/slice/manifestBuilderSlice";
import {
  useManifestBuilderState,
  useManifestBuilderSubmit,
} from "@/app/hook/seller/useManifestBuilder";
import { useInboundDetail } from "@/app/hook/seller/useInbound";
import { useGetAllCategoriesQuery } from "@/app/store/seller/api/inventoryApi";
import { useUpload_manifest_imageMutation } from "@/app/store/seller/api/wmsApi";
import type {
  DraftManifestLine,
  ManifestUnit,
} from "@/app/interfaces/seller/FulfillmentInterface";

const UNITS: ManifestUnit[] = ["units", "kg", "bags", "cartons", "boxes", "pallets", "litres"];

type LineForm = {
  declared_name: string;
  declared_size: string;
  declared_sku: string;
  declared_quantity: string;
  declared_unit: ManifestUnit;
  declared_weight_kg: string;
  declared_price: string;
  declared_description: string;
  category_id: string;
  image_urls: string[];
  image_url_input: string;
  is_temperature_sensitive: boolean;
  requires_frozen: boolean;
  notes: string;
};

const EMPTY_FORM: LineForm = {
  declared_name: "",
  declared_size: "",
  declared_sku: "",
  declared_quantity: "",
  declared_unit: "units",
  declared_weight_kg: "",
  declared_price: "",
  declared_description: "",
  category_id: "",
  image_urls: [],
  image_url_input: "",
  is_temperature_sensitive: false,
  requires_frozen: false,
  notes: "",
};

function formFromLine(line: DraftManifestLine): LineForm {
  return {
    declared_name: line.declared_name,
    declared_size: line.declared_size,
    declared_sku: line.declared_sku,
    declared_quantity: String(line.declared_quantity),
    declared_unit: line.declared_unit,
    declared_weight_kg: line.declared_weight_kg != null ? String(line.declared_weight_kg) : "",
    declared_price: String(line.declared_price ?? ""),
    declared_description: line.declared_description,
    category_id: line.category_id != null ? String(line.category_id) : "",
    image_urls: [...line.image_urls],
    image_url_input: "",
    is_temperature_sensitive: line.is_temperature_sensitive,
    requires_frozen: line.requires_frozen,
    notes: line.notes,
  };
}

type CategoryOption = { id: number; title: string };

// ─── Item form ───────────────────────────────────────────────────────────────

function LineFormFields({
  form,
  setForm,
  categories,
  uploadingImage,
  onPickImage,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  form: LineForm;
  setForm: React.Dispatch<React.SetStateAction<LineForm>>;
  categories: CategoryOption[];
  uploadingImage: boolean;
  onPickImage: () => void;
  onSubmit: () => void;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");
  const bgColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "borders");
  const cardColor = useThemeColor({}, "cards");

  const set = (key: keyof LineForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const inputStyle = [styles.input, { borderColor, color: textColor, backgroundColor: bgColor }];

  return (
    <View style={[styles.formCard, { borderColor, backgroundColor: cardColor }]}>
      <StyledText variant="labelLarge" style={{ color: textColor, marginBottom: 8 }}>
        {submitLabel === "Add item" ? "New item" : "Edit item"}
      </StyledText>
      <StyledText variant="bodySmall" style={{ color: iconMuted, marginBottom: 14 }}>
        Listing goes live when we receive your stock. SKU, price, category, and photos are required.
      </StyledText>

      <StyledText variant="labelSmall" style={styles.fieldLabel}>Item name *</StyledText>
      <TextInput
        style={inputStyle}
        value={form.declared_name}
        onChangeText={(v) => set("declared_name", v)}
        placeholder="e.g. Frozen chicken thigh"
        placeholderTextColor={iconMuted}
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <StyledText variant="labelSmall" style={styles.fieldLabel}>SKU *</StyledText>
          <TextInput
            style={inputStyle}
            value={form.declared_sku}
            onChangeText={(v) => set("declared_sku", v)}
            placeholder="FCT-001"
            placeholderTextColor={iconMuted}
          />
        </View>
        <View style={{ flex: 1 }}>
          <StyledText variant="labelSmall" style={styles.fieldLabel}>Price *</StyledText>
          <TextInput
            style={inputStyle}
            value={form.declared_price}
            onChangeText={(v) => set("declared_price", v)}
            placeholder="8.99"
            placeholderTextColor={iconMuted}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <StyledText variant="labelSmall" style={styles.fieldLabel}>Category *</StyledText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {categories.map((cat) => {
          const active = form.category_id === String(cat.id);
          return (
            <Pressable
              key={cat.id}
              onPress={() => set("category_id", String(cat.id))}
              style={[
                styles.unitChip,
                {
                  backgroundColor: active ? `${tintColor}18` : bgColor,
                  borderColor: active ? tintColor : borderColor,
                  marginRight: 8,
                },
              ]}
            >
              <StyledText variant="labelSmall" style={{ color: active ? tintColor : iconMuted }}>
                {cat.title}
              </StyledText>
            </Pressable>
          );
        })}
      </ScrollView>

      <StyledText variant="labelSmall" style={styles.fieldLabel}>Description</StyledText>
      <TextInput
        style={[inputStyle, { minHeight: 56, textAlignVertical: "top" }]}
        value={form.declared_description}
        onChangeText={(v) => set("declared_description", v)}
        placeholder="What buyers should know"
        placeholderTextColor={iconMuted}
        multiline
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <StyledText variant="labelSmall" style={styles.fieldLabel}>Quantity *</StyledText>
          <TextInput
            style={inputStyle}
            value={form.declared_quantity}
            onChangeText={(v) => set("declared_quantity", v)}
            placeholder="20"
            placeholderTextColor={iconMuted}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <StyledText variant="labelSmall" style={styles.fieldLabel}>Size / pack</StyledText>
          <TextInput
            style={inputStyle}
            value={form.declared_size}
            onChangeText={(v) => set("declared_size", v)}
            placeholder="e.g. 500g, Large"
            placeholderTextColor={iconMuted}
          />
        </View>
      </View>

      <StyledText variant="labelSmall" style={styles.fieldLabel}>Unit</StyledText>
      <View style={styles.unitPicker}>
        {UNITS.map((u) => {
          const active = form.declared_unit === u;
          return (
            <Pressable
              key={u}
              onPress={() => set("declared_unit", u)}
              style={[
                styles.unitChip,
                {
                  backgroundColor: active ? `${tintColor}18` : bgColor,
                  borderColor: active ? tintColor : borderColor,
                },
              ]}
            >
              <StyledText variant="labelSmall" style={{ color: active ? tintColor : iconMuted }}>
                {u}
              </StyledText>
            </Pressable>
          );
        })}
      </View>

      <StyledText variant="labelSmall" style={styles.fieldLabel}>Total weight (kg)</StyledText>
      <TextInput
        style={inputStyle}
        value={form.declared_weight_kg}
        onChangeText={(v) => set("declared_weight_kg", v)}
        placeholder="optional"
        placeholderTextColor={iconMuted}
        keyboardType="decimal-pad"
      />

      <StyledText variant="labelSmall" style={styles.fieldLabel}>Product photos *</StyledText>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
        <StyledButton
          title={uploadingImage ? "Uploading…" : "Add photo"}
          variant="tonal"
          onPress={onPickImage}
          disabled={uploadingImage}
          buttonStyles={{ flex: 1 }}
        />
      </View>
      <TextInput
        style={[inputStyle, { minHeight: 48, textAlignVertical: "top" }]}
        value={form.image_url_input}
        onChangeText={(v) => set("image_url_input", v)}
        placeholder="Or paste image URL"
        placeholderTextColor={iconMuted}
        autoCapitalize="none"
      />
      {form.image_urls.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          {form.image_urls.map((url) => (
            <View key={url} style={{ marginRight: 10, alignItems: "center" }}>
              <Image source={{ uri: url }} style={styles.imageThumb} />
              <Pressable
                onPress={() =>
                  setForm((f) => ({ ...f, image_urls: f.image_urls.filter((u) => u !== url) }))
                }
              >
                <StyledText variant="labelSmall" style={{ color: tintColor, marginTop: 4 }}>Remove</StyledText>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.toggleRow}>
        {[
          { key: "is_temperature_sensitive" as const, label: "Temperature sensitive" },
          { key: "requires_frozen" as const, label: "Requires frozen storage" },
        ].map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => set(key, !form[key])}
            style={[
              styles.toggleChip,
              {
                borderColor: form[key] ? tintColor : borderColor,
                backgroundColor: form[key] ? `${tintColor}14` : cardColor,
              },
            ]}
          >
            <MaterialIcons
              name={form[key] ? "check-box" : "check-box-outline-blank"}
              size={18}
              color={form[key] ? tintColor : iconMuted}
            />
            <StyledText variant="labelSmall" style={{ color: form[key] ? tintColor : iconMuted, marginLeft: 6 }}>
              {label}
            </StyledText>
          </Pressable>
        ))}
      </View>

      <StyledText variant="labelSmall" style={styles.fieldLabel}>Notes</StyledText>
      <TextInput
        style={[inputStyle, { minHeight: 56, textAlignVertical: "top" }]}
        value={form.notes}
        onChangeText={(v) => set("notes", v)}
        placeholder="Anything the warehouse should know (optional)"
        placeholderTextColor={iconMuted}
        multiline
      />

      <View style={styles.formBtns}>
        {onCancel ? (
          <StyledButton title="Cancel" variant="tonal" onPress={onCancel} buttonStyles={{ flex: 1, marginRight: 8 }} />
        ) : null}
        <StyledButton title={submitLabel} onPress={onSubmit} buttonStyles={{ flex: 1 }} />
      </View>
    </View>
  );
}

// ─── Line card ───────────────────────────────────────────────────────────────

function LineCard({
  line,
  index,
  onEdit,
  onRemove,
}: {
  line: DraftManifestLine;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");
  const bgColor = useThemeColor({}, "background");

  const meta = [
    `${line.declared_quantity} ${line.declared_unit}`,
    line.declared_size ? line.declared_size : null,
    line.declared_price ? `€${line.declared_price.toFixed(2)}` : null,
    line.category_name ? line.category_name : null,
    line.image_urls.length ? `${line.image_urls.length} photo(s)` : null,
    line.declared_weight_kg ? `${line.declared_weight_kg} kg` : null,
    line.is_temperature_sensitive ? "temp-sensitive" : null,
    line.requires_frozen ? "frozen" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable onPress={onEdit} style={[styles.lineCard, { borderColor, backgroundColor: bgColor }]}>
      <View style={[styles.lineIndex, { backgroundColor: `${tintColor}14` }]}>
        <StyledText variant="labelSmall" style={{ color: tintColor, fontWeight: "700" }}>
          {index + 1}
        </StyledText>
      </View>
      <View style={{ flex: 1 }}>
        <StyledText variant="labelLarge" style={{ color: textColor }}>
          {line.declared_name}
          {line.declared_sku ? ` (${line.declared_sku})` : ""}
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
          {meta}
        </StyledText>
        <StyledText variant="labelSmall" style={{ color: tintColor, marginTop: 6 }}>
          Tap to edit
        </StyledText>
      </View>
      <Pressable onPress={onRemove} style={styles.removeBtn} hitSlop={8}>
        <MaterialIcons name="remove-circle-outline" size={22} color="#DC2626" />
      </Pressable>
    </Pressable>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

const ManifestBuilderScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { shipmentId: paramShipmentId } = useLocalSearchParams<{ shipmentId?: string }>();
  const builder = useManifestBuilderState();
  const { submitAndPay, isSubmitting } = useManifestBuilderSubmit();
  const { shipment } = useInboundDetail(paramShipmentId ?? "");
  const { data: categoriesRaw = [] } = useGetAllCategoriesQuery({} as never);
  const [uploadManifestImage] = useUpload_manifest_imageMutation();
  const { setAlertConfig, setIsVisible } = useAlertContext();

  const categories: CategoryOption[] = (categoriesRaw as { id: number; title: string }[]).map((c) => ({
    id: c.id,
    title: c.title,
  }));

  const [form, setForm] = useState<LineForm>(EMPTY_FORM);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");
  const bgColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");

  const showAlert = useCallback(
    (
      title: string,
      message: string,
      type: "success" | "error" | "warning" = "warning",
    ) => {
      setAlertConfig({
        title,
        message,
        type,
        isVisible: true,
        onConfirm: () => setIsVisible(false),
      });
    },
    [setAlertConfig, setIsVisible],
  );

  // Hydrate from an existing draft shipment when opened via ?shipmentId.
  useEffect(() => {
    if (!paramShipmentId || !shipment || builder.lines.length > 0) return;
    if (shipment.status !== "draft" && shipment.status !== "awaiting_payment") return;
    dispatch(
      hydrateManifestBuilder({
        shipmentId: shipment.id,
        deliveryMethod: shipment.deliveryMethod,
        referenceNotes: shipment.referenceNotes,
        lines: (shipment.manifestLines ?? []).map((l) => ({
          serverId: l.id,
          declared_name: l.declaredName,
          declared_sku: l.declaredSku,
          declared_size: l.declaredSize,
          declared_quantity: l.declaredQuantity,
          declared_unit: l.declaredUnit,
          declared_weight_kg: l.declaredWeightKg ?? undefined,
          declared_price: l.declaredPrice ?? 0,
          declared_description: l.declaredDescription,
          category_id: l.categoryId,
          category_name: l.categoryName ?? undefined,
          image_urls: l.imageUrls ?? [],
          is_temperature_sensitive: l.isTemperatureSensitive,
          requires_frozen: l.requiresFrozen,
          notes: l.notes,
        })),
      }),
    );
  }, [paramShipmentId, shipment, builder.lines.length, dispatch]);

  const lines = builder.lines;

  const parseForm = (): Omit<DraftManifestLine, "clientId" | "serverId"> | null => {
    if (!form.declared_name.trim()) {
      showAlert("Required", "Enter a name for this item.");
      return null;
    }
    if (!form.declared_sku.trim()) {
      showAlert("Required", "SKU is required.");
      return null;
    }
    const qty = parseInt(form.declared_quantity, 10);
    if (!qty || qty < 1) {
      showAlert("Required", "Enter a valid quantity.");
      return null;
    }
    const price = parseFloat(form.declared_price);
    if (!Number.isFinite(price) || price <= 0) {
      showAlert("Required", "Enter a selling price.");
      return null;
    }
    if (!form.category_id) {
      showAlert("Required", "Select a category.");
      return null;
    }
    const pastedUrl = form.image_url_input.trim();
    const image_urls = [...form.image_urls];
    if (pastedUrl) image_urls.push(pastedUrl);
    if (image_urls.length < 1) {
      showAlert("Required", "Add at least one product photo.");
      return null;
    }
    const category_id = parseInt(form.category_id, 10);
    const category_name = categories.find((c) => c.id === category_id)?.title;
    return {
      declared_name: form.declared_name.trim(),
      declared_size: form.declared_size.trim(),
      declared_sku: form.declared_sku.trim(),
      declared_quantity: qty,
      declared_unit: form.declared_unit,
      declared_weight_kg: form.declared_weight_kg ? parseFloat(form.declared_weight_kg) : undefined,
      declared_price: price,
      declared_description: form.declared_description.trim(),
      category_id: Number.isFinite(category_id) ? category_id : null,
      category_name,
      image_urls,
      is_temperature_sensitive: form.is_temperature_sensitive,
      requires_frozen: form.requires_frozen,
      notes: form.notes.trim(),
    };
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert(
        "Permission needed",
        "Allow photo access to upload product images.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingImage(true);
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("image", {
        uri: asset.uri,
        name: asset.fileName || "photo.jpg",
        type: asset.mimeType || "image/jpeg",
      } as unknown as Blob);
      const { url } = await uploadManifestImage(formData).unwrap();
      setForm((f) => ({ ...f, image_urls: [...f.image_urls, url] }));
    } catch {
      showAlert(
        "Upload failed",
        "Could not upload image. Try again or paste a URL.",
        "error",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddLine = () => {
    const payload = parseForm();
    if (!payload) return;
    dispatch(addDraftLine(payload));
    setForm(EMPTY_FORM);
    setShowAddForm(false);
  };

  const handleUpdateLine = () => {
    if (!editingId) return;
    const payload = parseForm();
    if (!payload) return;
    dispatch(updateDraftLine({ clientId: editingId, patch: payload }));
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleRemoveLine = (clientId: string) => {
    setAlertConfig({
      title: "Remove item",
      message: "Remove this item from the manifest?",
      type: "warning",
      isVisible: true,
      onClose: () => setIsVisible(false),
      onConfirm: () => {
        dispatch(removeDraftLine(clientId));
      },
    });
  };

  const startEdit = (line: DraftManifestLine) => {
    setEditingId(line.clientId);
    setShowAddForm(false);
    setForm(formFromLine(line));
  };

  const handleSubmit = async () => {
    if (lines.length === 0) {
      showAlert("Add items", "Add at least one item before submitting.");
      return;
    }
    try {
      const result = await submitAndPay();
      if (result.canceled) return; // seller dismissed the payment sheet
      if (!result.success) return;

      dispatch(resetManifestBuilder());

      if (result.deliveryMethod === "vhotis_collection") {
        router.replace({
          pathname: "/seller/main/store/fufillment/CollectionBookingScreen",
          params: { shipmentId: result.shipmentId },
        });
      } else {
        router.replace({
          pathname: "/seller/main/store/fufillment/InboundDetailScreen",
          params: { shipmentId: result.shipmentId },
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not complete submission.";
      showAlert("Submission failed", msg, "error");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <FlatList
        data={lines}
        keyExtractor={(item) => item.clientId}
        contentContainerStyle={[styles.list, { paddingBottom: 140 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <MaterialIcons name="arrow-back" size={22} color={iconMuted} />
              </Pressable>
              <View>
                <StyledText variant="titleMedium" style={{ color: textColor }}>
                  What are you sending?
                </StyledText>
                <StyledText variant="bodySmall" style={{ color: iconMuted }}>
                  {lines.length} item{lines.length !== 1 ? "s" : ""} · listings go live after warehouse receive
                </StyledText>
              </View>
            </View>

            {lines.length === 0 && !showAddForm && !editingId ? (
              <View style={[styles.emptyBox, { borderColor, backgroundColor: cardColor }]}>
                <MaterialIcons name="inventory-2" size={28} color={iconMuted} />
                <StyledText variant="bodyMedium" style={{ color: iconMuted, marginTop: 8, textAlign: "center" }}>
                  No items yet. Add each product you are sending in.
                </StyledText>
              </View>
            ) : null}

            {lines.length > 0 ? (
              <StyledText variant="labelMedium" style={{ color: iconMuted, marginBottom: 8 }}>
                ITEMS TO SEND
              </StyledText>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) =>
          editingId === item.clientId ? (
            <LineFormFields
              form={form}
              setForm={setForm}
              categories={categories}
              uploadingImage={uploadingImage}
              onPickImage={() => void handlePickImage()}
              onSubmit={handleUpdateLine}
              submitLabel="Save changes"
              onCancel={() => { setEditingId(null); setForm(EMPTY_FORM); }}
            />
          ) : (
            <LineCard
              line={item}
              index={index}
              onEdit={() => startEdit(item)}
              onRemove={() => handleRemoveLine(item.clientId)}
            />
          )
        }
        ListFooterComponent={
          <View style={{ marginTop: 8 }}>
            {editingId ? null : showAddForm ? (
              <LineFormFields
                form={form}
                setForm={setForm}
                categories={categories}
                uploadingImage={uploadingImage}
                onPickImage={() => void handlePickImage()}
                onSubmit={handleAddLine}
                submitLabel="Add item"
                onCancel={() => { setShowAddForm(false); setForm(EMPTY_FORM); }}
              />
            ) : (
              <Pressable onPress={() => setShowAddForm(true)} style={[styles.addBtn, { borderColor: tintColor }]}>
                <MaterialIcons name="add" size={18} color={tintColor} />
                <StyledText variant="labelMedium" style={{ color: tintColor, marginLeft: 6 }}>
                  {lines.length === 0 ? "Add item" : "Add another item"}
                </StyledText>
              </Pressable>
            )}
          </View>
        }
      />

      {/* Sticky submit bar */}
      {lines.length > 0 && !editingId && !showAddForm ? (
        <View
          style={[
            styles.submitBar,
            { backgroundColor: cardColor, borderTopColor: borderColor, paddingBottom: 12 + insets.bottom },
          ]}
        >
          <StyledButton
            title={isSubmitting ? "Processing…" : `Submit & pay · ${lines.length} item${lines.length !== 1 ? "s" : ""}`}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
          <StyledText variant="labelSmall" style={{ color: iconMuted, textAlign: "center", marginTop: 8 }}>
            You'll review the restocking fee in the payment sheet.
          </StyledText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  list: { padding: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  backBtn: { padding: 4 },
  emptyBox: { alignItems: "center", padding: 32, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  lineCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  lineIndex: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  removeBtn: { padding: 4, marginTop: 2 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  formCard: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 10 },
  fieldLabel: { marginBottom: 6, marginTop: 2, opacity: 0.8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 15,
  },
  row: { flexDirection: "row" },
  unitPicker: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  unitChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  toggleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  toggleChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  formBtns: { flexDirection: "row", marginTop: 4 },
  imageThumb: { width: 72, height: 72, borderRadius: 10 },
  submitBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});

export default ManifestBuilderScreen;
