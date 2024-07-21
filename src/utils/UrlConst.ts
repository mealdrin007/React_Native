import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp } from "@react-navigation/native";
import { Alert, Platform } from "react-native";

export const BaseUrl = 'https://api-twinlake.thoughtlinetech.com/api';

export const GetAllVendorsWithoutPagination = BaseUrl + '/Vendor/GetAllVendors';
export const GetAllVendors = BaseUrl + '/Vendor/GetVendorSearch';
export const EditVendors = BaseUrl + '/Vendor/UpdateVendor/';
export const DeleteVendors = BaseUrl + '/Vendor/DeleteVendor/';
export const AddVendors = BaseUrl + '/Vendor/AddVendor';

export const GetAllUnitsWithoutPagination = BaseUrl + '/Unit/GetAllUnits';
export const GetAllUnits = BaseUrl + '/Unit/GetUnitSearch';
export const EditUnits = BaseUrl + '/Unit/UpdateUnit/';
export const DeleteUnits = BaseUrl + '/Unit/DeleteUnit/';
export const AddUnits = BaseUrl + '/Unit/AddUnit';

export const GetAllProductsWithoutPagination =
  BaseUrl + '/ProductType/GetAllProductTypes';
export const GetAllProducts =
  BaseUrl + '/ProductType/GetProductTypeSearch';
export const EditProducts = BaseUrl + '/ProductType/UpdateProductType/';
export const DeleteProducts = BaseUrl + '/ProductType/DeleteProductType/';
export const AddProducts = BaseUrl + '/ProductType/AddProductType';

export const GetAllCustomersWithoutPagination =
  BaseUrl + '/Customer/GetAllCustomers';
export const GetAllCustomers =
  BaseUrl + '/Customer/GetCustomerSearch';
export const EditCustomers = BaseUrl + '/Customer/UpdateCustomer/';
export const DeleteCustomers = BaseUrl + '/Customer/DeleteCustomer/';
export const AddCustomers = BaseUrl + '/Customer/AddCustomer';

export const GetAllInWardRegister =
  BaseUrl + '/Masterdata/GetAllInWardRegister';

export const GetAllInWardRegisterWithPagination =
  BaseUrl + '/Masterdata/GetInwardStockSearch';

export const GetAllOutWardRegister =
  BaseUrl + '/Masterdata/GetAllOutWardRegister';

export const GetAllOutWardRegisterWithPagination =
  BaseUrl + '/Masterdata/GetOutwardStockSearch';

export const GetAvailableStock = BaseUrl + '/Masterdata/GetAvailableStock';
export const GetAvailableStockWithPagination =
  BaseUrl + '/Masterdata/GetAvailableStockSearch';

// export const GetAllMasterData = BaseUrl + '/Masterdata';
export const AddOutwardRegister = BaseUrl + '/Masterdata/OutwardRegister';
export const AddInwardRegister = BaseUrl + '/Masterdata/InwardRegister';

export const AvailableStockForDashboard =
  BaseUrl + '/Masterdata/GetAllAvailableStockForDashboard';

export const GetAllInwardStockForDashboard =
  BaseUrl + '/Masterdata/GetAllInwardStockForDashboard';

export const GetAllOutwardStockForDashboard =
  BaseUrl + '/Masterdata/GetAllOutwardStockForDashboard';

export const LoginApi = BaseUrl + '/Login/Login';

export const isEmail = (email: string): RegExpMatchArray | null => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

export const isValidPassword = (value: string): boolean => {
  let strongPassword = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
  );

  if (strongPassword.test(value)) {
    return true;
  }
  return false;
};

export const validateMobileNumber = (number: string): boolean => {
  const mobileNumberPattern = /^[0-9]{10}$/;
  return mobileNumberPattern.test(number);
};

export const validateMobile = (text: string): boolean => {
  // Validate the mobile number format
  return /^\d{10}$/.test(text);
};

export const isValidVendorName=(txt:string)=>{

  if(txt==""){
    return "blank"
  }

  const specialCharactersPattern = /[^a-zA-Z0-9\s]/;

  if(!txt || specialCharactersPattern.test(txt)){
    return "invalid"
  }

  if(txt.length<15){
    return "short"
  }


  return "valid"
}

export const isValidCustomerName=(txt:string)=>{

  if(txt==""){
    return "blank"
  }

  const specialCharactersPattern = /[^a-zA-Z0-9\s]/;

  if(!txt || specialCharactersPattern.test(txt)){
    return "invalid"
  }

  if(txt.length<15){
    return "short"
  }


  return "valid"
}


export const isValidVendorAddress=(txt:string)=>{

  if(txt==""){
    return "blank"
  }

  const specialCharactersPattern = /[^a-zA-Z0-9\s]/;

  if(!txt || specialCharactersPattern.test(txt)){
    return "invalid"
  }

  if(txt.length<20){
    return "short"
  }


  return "valid"
}

export const isValidUnitDescription=(txt:string)=>{

  if(txt==""){
    return "blank"
  }

  const specialCharactersPattern = /[^a-zA-Z0-9\s]/;

  if(!txt || specialCharactersPattern.test(txt)){
    return "invalid"
  }

  if(txt.length<20){
    return "short"
  }


  return "valid"
}

export const isValidProductName=(txt:string)=>{

  if(txt==""){
    return "blank"
  }

  const specialCharactersPattern = /[^a-zA-Z0-9\s]/;

  if(!txt || specialCharactersPattern.test(txt)){
    return "invalid"
  }

  if(txt.length<10){
    return "short"
  }


  return "valid"
}

export const isValidProductDescription=(txt:string)=>{

  if(txt==""){
    return "blank"
  }

  const specialCharactersPattern = /[^a-zA-Z0-9\s]/;

  if(!txt|| specialCharactersPattern.test(txt)){
    return "invalid"
  }
  
  if(txt.length<20){
    return "short"
  }


  return "valid"
}

export const isValidMobileNumber=(number:string)=>{

  if (number.trim() === "") {
    return "blank";
  }

  const mobileNumberPattern = /^[1-9]\d{9}$/;
  return mobileNumberPattern.test(number) ? "valid" : "invalid";

  
}


export function formatDate(inputDate: string): string {
  // Parse the input date
  const dateObj = new Date(inputDate);

  // Extract year, month, and day
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  // Assemble the formatted date
  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}

export const formatDatesObject = (date: Date | null): string => {
  if (date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
  }
  return '';
};

export const _storeData = async (key: any, value: any) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const _retrieveItem = async (key: string): Promise<any | null> => {
  try {
    const retrievedItem = await AsyncStorage.getItem(key);
    return retrievedItem ? JSON.parse(retrievedItem) : null;
  } catch (error: any) {
    return null;
  }
};

export const extractNameFromEmail = (email: string | null): string => {
  if (!email) {
    return '';
  }
  const parts = email.split('@');
  const namePart = parts[0] || '';

  // Remove digits and special characters, keep only letters
  return namePart.replace(/[^a-zA-Z]/g, '');
}
export const navigateToLogin = async (navigation: NavigationProp<any>) => {
  navigation.reset({
    index: 0,
    routes: [{ name: 'LoginScreen' }],
  });
  await AsyncStorage.clear();
};

export const handleSessionExpired = (navigation: NavigationProp<any>) => {
  if (Platform.OS === 'web') {
    navigateToLogin(navigation);
  } else {
    Alert.alert('Twinlake', 'Session expired', [
      {
        text: 'OK',
        onPress: () => navigateToLogin(navigation),
      },
    ]);
  }
};


export const screenWidth = 768;
export const forboxWidth = 1024;
export const tabletWidth = 765;
export const mobileWidth = 392;