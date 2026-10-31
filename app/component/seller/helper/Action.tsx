import { View, StyleSheet, TouchableOpacity } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

type ActionsProps = {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onShare?: (id: string) => void;
  id: string;
  onClose?: () => void;
};

const Actions = ({ onDelete, onEdit, onShare, id, onClose }: ActionsProps) => {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const backgroundColor = useThemeColor({}, "background");

  const handleEdit = () => {
    onClose?.();
    onEdit(id);
  };

  const handleDelete = () => {
    onClose?.();
    onDelete(id);
  };

  const handleShare = () => {
    onClose?.();
    onShare?.(id);
  };

  return (
    <View style={[styles.actionContainer, { backgroundColor, borderColor }]}>
      <TouchableOpacity
        onPress={(event) => {
          event.stopPropagation();
          handleEdit();
        }}
        style={[
          styles.actionButton,
          styles.actionDivider,
          { borderBottomColor: borderColor },
        ]}
        activeOpacity={0.75}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={16}
            color="#2563EB"
          />
        </View>
        <StyledText variant="labelMedium" style={styles.actionText}>
          Edit product
        </StyledText>
      </TouchableOpacity>
      {onShare ? (
        <TouchableOpacity
          onPress={(event) => {
            event.stopPropagation();
            handleShare();
          }}
          style={[
            styles.actionButton,
            styles.actionDivider,
            { borderBottomColor: borderColor },
          ]}
          activeOpacity={0.75}
        >
          <View style={[styles.iconCircle, styles.shareIconCircle]}>
            <MaterialCommunityIcons
              name="share-variant-outline"
              size={16}
              color="#059669"
            />
          </View>
          <StyledText variant="labelMedium" style={styles.actionText}>
            Share link
          </StyledText>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        onPress={(event) => {
          event.stopPropagation();
          handleDelete();
        }}
        style={styles.actionButton}
        activeOpacity={0.75}
      >
        <View style={[styles.iconCircle, styles.dangerIconCircle]}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={16}
            color="#DC2626"
          />
        </View>
        <StyledText
          variant="labelMedium"
          style={[styles.actionText, styles.dangerText]}
        >
          Delete product
        </StyledText>
      </TouchableOpacity>
    </View>
  );
};

export default Actions;

const styles = StyleSheet.create({
  actionContainer: {
    width: 190,
    position: "absolute",
    right: 0,
    top: 36,
    zIndex: 20,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  actionButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  actionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
  },
  dangerIconCircle: {
    backgroundColor: "#FEF2F2",
  },
  shareIconCircle: {
    backgroundColor: "#ECFDF5",
  },
  actionText: {
    fontWeight: "600",
  },
  dangerText: {
    color: "#DC2626",
  },
});
