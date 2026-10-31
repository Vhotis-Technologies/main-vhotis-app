import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ProductSideDetailsComponent from './ProductSideDetailsComponent'
import StyledTextInput from '@/app/component/helpers/forms/StyledTextInput'
import useSellerInventory from '@/app/hook/seller/useSellerInventory'

const AddSizeAndWeight = () => {
  const { handleProductUpdate, currentProduct } = useSellerInventory();
  return (
    <View style={styles.maincontainer}>
      <View style={styles.leftsection}>
        <ProductSideDetailsComponent
          title="product size and weight"
          body="Add the size and weight of your product for delivery purposes"
        />
      </View>
      <View style={styles.rightsection}>
        <View style={styles.section}>
          <StyledTextInput
            label="Size"
            placeholder="Tell us about the size of your product"
            info="Size is the physical dimensions of your product. It is used to calculate the shipping cost. make this is as detailed as possible to enable us serve you better"
            value={currentProduct?.size}
            onChangeText={(text) => handleProductUpdate({ field: "size", value: text })}
          />
          <StyledTextInput
            label="Weight"
            placeholder="Tell us about the weight of your product"
            info="Weight is the mass of your product. It is used to calculate the shipping cost. make this is as detailed as possible to enable us serve you better"
            value={currentProduct?.weight}
            onChangeText={(text) => handleProductUpdate({ field: "weight", value: text })}
          />
        </View>

      </View>
    </View>
  )
}

export default AddSizeAndWeight

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 5,
  },
  leftsection: {
    flex: 1,
    borderEndWidth: 1,
    borderColor: "white",
    shadowColor: "white",
    shadowOffset: { width: 0, height: 2 },
    boxShadow: "0px 0px 3px 3px rgba(251, 245, 245, 0.25)",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  rightsection: {
    flex: 4,
    gap: 20,
    marginRight: 10,
  },
  section: {
    marginHorizontal: 10,
    flexDirection: "row",
    gap: 10,
  },
});