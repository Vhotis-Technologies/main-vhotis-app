
/* Get the country code based on the users country */
export const getCountryCode = async (country: string) => {
  try {
    switch (country) {
      case "United Kingdom":
        return "GB";
      case "Ireland":
        return "IE";
      default:
        return "GB";
    }
  } catch (error: any) {
    console.error("Error getting country code:", error);
    let message = "";
    if (error.response.data.error) {
      message = error.response.data.error;
    }
    throw new Error(message);
  }
};

export const currencyCode = async (country: string) => {
  try {
    switch (country) {
      case "United Kingdom":
        return "GBP";
      case "Ireland":
        return "EUR";
      default:
        return "EUR";
    }
  } catch (error: any) {
    console.error("Error getting currency code:", error);
    let message = "";
    if (error.response.data.error) {
      message = error.response.data.error;
    }
    throw new Error(message);
  }
};
