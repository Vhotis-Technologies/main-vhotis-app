/**
 * HomeScreen Component
 *
 * Main home screen that displays:
 * - Default delivery address selector
 * - Top performing categories
 * - Deals and promotions
 * - Product categories grid
 */
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DeliveryAddressComponent from "@/app/component/main/mobile/home/DeliveryAddress";
import NewAddressComponent from "@/app/component/main/mobile/home/NewAddressComponent";
import useMainHome from "@/app/hook/main/useMainHome";
import { router } from "expo-router";
import StyledText from "@/app/component/helpers/forms/StyledText";
import Categories from "@/app/component/main/mobile/shop/Categories";
import { useThemeColor } from "@/hooks/useThemeColor";
import WebHomeGridComponent from "@/app/component/main/mobile/home/DealsAndPromotionsComponent";
import { Divider } from "react-native-paper";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import MarkettinCardComponent from "@/app/component/main/mobile/home/MarkettinCardComponent";
import SponsoredStoresComponent from "@/app/component/main/mobile/home/SponsoredStoresComponent";
import { DeliveryAddress } from "@/app/interfaces/main/home/HomeInterfaces";

const { height: screenHeight } = Dimensions.get("window");

const HomeScreen = () => {
  const {
    defaultAddress,
    deliveryLabel,
    selectDeliveryAddress,
    isSettingDefault,
    fetchProductsByCategory,
    navigateToDealsProducts,
    navigateToSponsoredStore,
    categories,
    sponsoredStores,
    isHomeLoading,
  } = useMainHome();

  const { showModal, closeModal, currentModal } = useModalService();
  const [addressModalId, setAddressModalId] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");

  const openNewAddressModal = useCallback(() => {
    const modalIdRef = { current: null as string | null };

    const dismiss = () => {
      if (modalIdRef.current) {
        closeModal(modalIdRef.current);
      }
    };

    const modalId = showModal({
      modalType: "sheet",
      title: "Add New Address",
      maxHeight: screenHeight * 0.82,
      component: (
        <NewAddressComponent
          onPress={async (savedAddress) => {
            if (savedAddress) {
              await selectDeliveryAddress(savedAddress);
            }
            dismiss();
          }}
        />
      ),
    });

    modalIdRef.current = modalId;
  }, [showModal, closeModal, selectDeliveryAddress]);

  const handleAddressChosen = useCallback(
    async (address: DeliveryAddress) => {
      await selectDeliveryAddress(address);
    },
    [selectDeliveryAddress]
  );

  const openAddressModal = useCallback(() => {
    if (addressModalId && currentModal?.id === addressModalId) {
      closeModal(addressModalId);
      setAddressModalId(null);
      return;
    }

    const modalId = showModal({
      modalType: "center",
      title: "Delivery Addresses",
      maxHeight: screenHeight * 0.65,
      component: (
        <DeliveryAddressComponent
          selectedAddressId={defaultAddress?.id}
          onSelectAddress={async (address) => {
            await handleAddressChosen(address);
            closeModal(modalId);
            setAddressModalId(null);
          }}
          onAddNewAddress={() => {
            closeModal(modalId);
            setAddressModalId(null);
            setTimeout(() => openNewAddressModal(), 300);
          }}
          isUpdatingDefault={isSettingDefault}
        />
      ),
      onClose: () => setAddressModalId(null),
    });

    setAddressModalId(modalId);
  }, [
    addressModalId,
    currentModal?.id,
    closeModal,
    showModal,
    handleAddressChosen,
    openNewAddressModal,
    defaultAddress?.id,
    isSettingDefault,
  ]);

  if (isHomeLoading) {
    return (
      <View
        style={[styles.container, styles.centered, { backgroundColor }]}
      >
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <ScrollView>
        <View style={{ height: 500 }}>
          <TouchableOpacity
            onPress={openAddressModal}
            style={styles.locationButton}
            disabled={isSettingDefault}
          >
            <MaterialIcons name="location-on" size={24} color={iconColor} />
            <StyledText
              style={styles.locationText}
              children={`Deliver to ${deliveryLabel.name} - ${deliveryLabel.location}`}
            />
            {isSettingDefault ? (
              <ActivityIndicator size="small" color={tintColor} />
            ) : (
              <MaterialIcons name="arrow-drop-down" size={24} color={iconColor} />
            )}
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesSectionContent}
          >
            <MarkettinCardComponent
              title="Top Performing Categories"
              description="Browse our top performing categories"
              image={require("@/assets/images/user_image.jpg")}
              onPress={() => {
                router.push("/main/mobile/(tabs)/home/MainProductScreen");
              }}
            />
            <MarkettinCardComponent
              title="Top Performing Categories"
              description="Browse our top performing categories"
              image={require("@/assets/images/user_image.jpg")}
              onPress={() => {
                router.push("/main/mobile/(tabs)/home/MainProductScreen");
              }}
            />
          </ScrollView>
        </View>

        <Divider />

        <View style={styles.dealsContainer}>
          <WebHomeGridComponent
            item1={{
              image: require("@/assets/images/user_image.jpg"),
              label: "Buy 1 get 1 free",
              onPress: () => {
                navigateToDealsProducts("bogo");
              },
            }}
            item2={{
              image: require("@/assets/images/user_image.jpg"),
              label: "Percentage off",
              onPress: () => {
                navigateToDealsProducts("percentage");
              },
            }}
            item3={{
              image: require("@/assets/images/user_image.jpg"),
              label: "Flash Sale",
              onPress: () => {
                navigateToDealsProducts("flash_sale");
              },
            }}
            item4={{
              image: require("@/assets/images/user_image.jpg"),
              label: "Bundle Deals",
              onPress: () => {
                navigateToDealsProducts("bundle");
              },
            }}
            style={styles.dealsCard}
          />
        </View>

        <SponsoredStoresComponent
          stores={sponsoredStores}
          onPressStore={navigateToSponsoredStore}
        />

        <View style={styles.categoriesSection}>
          <View style={styles.categoriesContainer}>
            {categories?.map((category: any, index: number) => {
              return (
                <View style={styles.categoryWrapper} key={index}>
                  <Categories
                    categories={category}
                    onPress={(id) => {
                      fetchProductsByCategory(id);
                    }}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
  },
  locationText: {
    flex: 1,
  },
  dealsContainer: {
    marginVertical: 5,
    paddingHorizontal: 5,
    width: "100%",
  },
  dealsCard: {
    width: "100%",
    maxWidth: "100%",
  },
  categoriesSection: {},
  categoriesSectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    alignItems: "center",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    paddingHorizontal: 10,
    gap: 5,
  },
  categoryWrapper: {
    width: "49%",
    marginBottom: 5,
  },
});
