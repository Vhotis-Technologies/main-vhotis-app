import { useCallback, useMemo } from "react";
import { DeliveryAddress } from "@/app/interfaces/main/home/HomeInterfaces";
import {
  useGetAllAddressesQuery,
  useSetDefaultDeliveryAddressMutation,
} from "@/app/store/main/api/profileApi";

const formatDeliveryLabel = (address: DeliveryAddress | null | undefined) => {
  if (!address) {
    return { name: "User", location: "Set delivery address" };
  }

  const name = (address.delivery_name || "You").split(" ")[0];
  const location =
    address.city ||
    address.zip_code ||
    address.address?.split(",")[0] ||
    "Address";

  return { name, location };
};

/**
 * Buyer delivery address state backed by the server default flag.
 */
const useDeliveryAddress = () => {
  const {
    data: addresses = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAllAddressesQuery();

  const [setDefaultDeliveryAddress, setDefaultState] =
    useSetDefaultDeliveryAddressMutation();

  const defaultAddress = useMemo(
    () => addresses.find((item) => item.default) ?? addresses[0] ?? null,
    [addresses]
  );

  const selectDeliveryAddress = useCallback(
    async (address: DeliveryAddress) => {
      if (!address.id) {
        return { success: false as const, error: "Address id is missing" };
      }

      if (address.default) {
        return { success: true as const, address };
      }

      try {
        const result = await setDefaultDeliveryAddress({
          address_id: address.id,
        }).unwrap();
        return { success: true as const, address: result.delivery_address };
      } catch (err) {
        return { success: false as const, error: err };
      }
    },
    [setDefaultDeliveryAddress]
  );

  const deliveryLabel = useMemo(
    () => formatDeliveryLabel(defaultAddress),
    [defaultAddress]
  );

  return {
    addresses,
    defaultAddress,
    deliveryLabel,
    isLoading,
    isFetching,
    isSettingDefault: setDefaultState.isLoading,
    error,
    refetch,
    selectDeliveryAddress,
  };
};

export default useDeliveryAddress;
