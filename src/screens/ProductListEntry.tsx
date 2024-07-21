import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '../utils/Colors';
import ProductListEntryVendor from '../components/productList/ProductListEntryVendor';
import ProductListEntryCustomer from '../components/productList/ProductListEntryCustomer';
import ProductListEntryUnits from '../components/productList/ProductListEntryUnits';
import ProductListEntryProducts from '../components/productList/ProductListEntryProducts';
import {
  TabView,
  SceneMap,
  TabBarProps,
  TabBar,
  Route,
} from 'react-native-tab-view';
import CommonSearchBar from '../components/search/CommonSearchBar';
import AddProductDetailsModal from '../components/productList/modals/AddProductDetailsModal';
import AddUnitDetailsModal from '../components/productList/modals/AddUnitDetailsModal';
import AddCustomerDetailsModal from '../components/productList/modals/AddCustomerDetailsModal';
import AddVendorDetailsModal from '../components/productList/modals/AddVendorDetailsModal';
import HeaderComponentMobile from '../components/header/mobile/HeaderComponentMobile';
import DatePickerComponent from '../components/customDatePicker/DatePickerComponent';
import { http } from '../apiService';
import { AddVendors, GetAllCustomersWithoutPagination, GetAllProductsWithoutPagination, GetAllUnitsWithoutPagination, GetAllVendorsWithoutPagination, formatDate, handleSessionExpired, screenWidth } from '../utils/UrlConst';
import CsvExportComponent from '../components/customCsvExport/CsvExportComponent';
import { AuthContext } from '../context/AuthContext';
import { NavigationProp } from '@react-navigation/native';
import { debounce } from 'lodash';
import AddAnEntryButton from '../components/buttons/AddAnEntryButton';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

interface ProductListEntryScreenProps {
  navigation: NavigationProp<any>;
}
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const ProductListEntryScreen: React.FC<ProductListEntryScreenProps> = ({ navigation }) => {

  const { width } = useWindowDimensions()
  const [searchText, setSearchText] = useState<string>("");
  const [searchTextUpdate, setSearchTextUpdate] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [rowCount, setRowCount] = useState(10);
  const [loading, setLoading] = useState(false)
  const [vendorCurrentPage, setVendorCurrentPage] = useState(1);
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [unitCurrentPage, setUnitCurrentPage] = useState(1);
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [index, setIndex] = useState(0);
  const [vendorCsv, setVendorCsv] = useState([]);
  const [customerCsv, setCustomerCsv] = useState([]);
  const [unitCsv, setUnitCsv] = useState([]);
  const [productCsv, setProductCsv] = useState([]);
  const [sessionExpiredAlertShown, setSessionExpiredAlertShown] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [selectedDates, setSelectedDates] = useState<{
    vendor: DateRange,
    customer: DateRange,
    unit: DateRange,
    product: DateRange
  }>({
    vendor: {
      startDate: null,
      endDate: null
    },
    customer: {
      startDate: null,
      endDate: null
    },
    unit: {
      startDate: null,
      endDate: null
    },
    product: {
      startDate: null,
      endDate: null
    }
  });

  const [connection, setConnection] = useState<"connecting" |
    "connected" | "disconnected">("connecting");


  const vendorListRef = useRef<any>(null);
  const customerListRef = useRef<any>(null);
  const unitListRef = useRef<any>(null);
  const productListRef = useRef<any>(null);


  const authContext = useContext(AuthContext);

  const { token } = authContext;

  useFocusEffect(
    React.useCallback(() => {
      if (token) {

        if (connection == "disconnected") {

          Alert.alert('Network Error', 'Please Check your Internet Connection.', [
            {
              text: 'Ok',
            },
          ]);

        } else if (connection == "connected") {
          // handleApiListing()
          fetchVendorListWithoutPagination()
          fetchCustomerListWithoutPagination()
          fetchUnitListWithoutPagination()
          fetchProductListWithoutPagination()
        } else {
          // Connecting
        }

      }
      const unsubscribe = NetInfo.addEventListener(state => {
        setConnection(state.isConnected ? "connected" : "disconnected");
      });

      return () => unsubscribe();
    }, [token])
  );

  const handleSessionExpiredAlert = () => {
    if (!sessionExpiredAlertShown) {
      // Set the flag to true to indicate that the alert has been shown
      setSessionExpiredAlertShown(true);
      handleSessionExpired(navigation);
    }
  };
  // Define the debounced function
  // Adjust the debounce delay as needed (e.g., 1000ms)
  const debouncedHandleSessionExpiredAlert = debounce(handleSessionExpiredAlert, 1000);

  const setAlertTimeout = () => {
    return setTimeout(() => {
      setStatusMessage('');
      setAlertMessage('')
    }, 8000);
  };

  const debouncedErrorAlert = debounce(() => {
    Alert.alert('Error', 'Some error occured', [
      {
        text: 'ok',
      },
    ]);
  }, 300);

  const startAlertTimeout = () => {
    const timerId = setAlertTimeout();
    return () => clearTimeout(timerId);
  };

  // Call startAlertTimeout here
  startAlertTimeout();

  const vendorListHeaders = [
    { label: 'Sl.No', key: 'vendorID' },
    { label: 'Date', key: 'Date' },
    { label: 'Vendor Name', key: 'VendorName' },
    { label: 'Mobile', key: 'Mobile' },
    { label: 'Address', key: 'Address' },
  ];
  const customerListHeaders = [
    { label: 'Sl.No', key: 'customerID' },
    { label: 'Date', key: 'Date' },
    { label: 'Customer Name', key: 'CustomerName' },
    { label: 'Mobile', key: 'Mobile' },
    { label: 'Address', key: 'Address' },
  ];
  const unitListHeaders = [
    { label: 'Sl.No', key: 'unitID' },
    { label: 'Date', key: 'Date' },
    { label: 'Description', key: 'Description' },
  ];
  const productListHeaders = [
    { label: 'Sl.No', key: 'productTypeID' },
    { label: 'Date', key: 'Date' },
    { label: 'Product Name', key: 'ProductName' },
    { label: 'Description', key: 'Description' },
  ];


  const handleApiListing = () => {
    if (index === 0) {
      vendorListRef.current.updateVendorList({ startDate: null, endDate: null });
    }
    else if (index === 1) {
      customerListRef.current.updateCustomerList({ startDate: null, endDate: null });
    }
    else if (index === 2) {
      unitListRef.current.updateUnitList({ startDate: null, endDate: null });
    }
    else if (index === 3) {
      productListRef.current.updateProductList({ startDate: null, endDate: null });
    }
    setSearchText('')
    setSelectedStartDate(null)
    setSelectedEndDate(null)
  }

  const fetchVendorListWithoutPagination = async () => {
    setLoading(true)
    const responseJson = await http.fetchURL(GetAllVendorsWithoutPagination, token);
    if (
      responseJson.hasOwnProperty('status') &&
      responseJson.status === 1
    ) {
      const formattedData = responseJson?.data?.vendors?.map((item: any) => ({
        vendorID: item.vendorID,
        Date: formatDate(item.createdAt),
        VendorName: item.name,
        Mobile: item.mobileNo,
        Address: item.address
      }));
      setVendorCsv(formattedData ? formattedData : []);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      debouncedErrorAlert()
    }
    setLoading(false)
  }

  const fetchCustomerListWithoutPagination = async () => {
    setLoading(true)
    const responseJson = await http.fetchURL(GetAllCustomersWithoutPagination, token);
    if (
      responseJson.hasOwnProperty('status') &&
      responseJson.status === 1
    ) {
      const formattedData = responseJson?.data?.customers?.map((item: any) => ({
        customerID: item.customerID,
        Date: formatDate(item.createdAt),
        CustomerName: item.name,
        Mobile: item.mobileNo,
        Address: item.address
      }));

      setCustomerCsv(formattedData ? formattedData : []);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      debouncedErrorAlert()
    }
    setLoading(false)
  }

  const fetchUnitListWithoutPagination = async () => {
    setLoading(true)
    const responseJson = await http.fetchURL(GetAllUnitsWithoutPagination, token);
    if (
      responseJson.hasOwnProperty('status') &&
      responseJson.status === 1
    ) {
      const formattedData = responseJson?.data?.units?.map((item: any) => ({
        unitID: item.unitID,
        Date: formatDate(item.createdAt),
        Description: item.description,
      }));

      setUnitCsv(formattedData ? formattedData : []);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      debouncedErrorAlert()
    }
    setLoading(false)
  }

  const fetchProductListWithoutPagination = async () => {
    setLoading(true)
    const responseJson = await http.fetchURL(GetAllProductsWithoutPagination, token);
    if (
      responseJson.hasOwnProperty('status') &&
      responseJson.status === 1
    ) {
      const formattedData = responseJson?.data?.productTypes?.map((item: any) => ({
        productTypeID: item.productTypeID,
        Date: formatDate(item.createdAt),
        ProductName: item.productName,
        Description: item.description,
      }));
      setProductCsv(formattedData ? formattedData : []);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      debouncedErrorAlert()
    }
    setLoading(false)
  }

  const handleDateChange = (date: DateRange) => {

    switch (index) {
      case 0:
        setSelectedDates((prevState) => ({
          ...prevState,
          vendor: { startDate: date.startDate, endDate: date.endDate }
        }));
        break;
      case 1:
        setSelectedDates((prevState) => ({
          ...prevState,
          customer: { startDate: date.startDate, endDate: date.endDate }
        }));
        break;
      case 2:
        setSelectedDates((prevState) => ({
          ...prevState,
          unit: { startDate: date.startDate, endDate: date.endDate }
        }));

        break;
      case 3:
        setSelectedDates((prevState) => ({
          ...prevState,
          product: { startDate: date.startDate, endDate: date.endDate }
        }));

        break;
    }
  };

  const handleConfirmCalendar = (date: DateRange) => {
    setSelectedStartDate(date.startDate);
    setSelectedEndDate(date.endDate);

    if (index === 0) {

      vendorListRef.current.updateVendorList(date);

    }
    if (index === 1) {

      customerListRef.current.updateCustomerList(date);

    }
    else if (index === 2) {

      unitListRef.current.updateUnitList(date);

    }
    else if (index === 3) {

      productListRef.current.updateProductList(date);

    }
  };


  const showAlert = (message: string) => {
    setAlertMessage(message);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (text?.length > 3) {
      setSearchTextUpdate(text)
    }
    else if (text?.length <= 0) {
      setSearchTextUpdate("")
    }
  };

  const FirstRoute = () => (
    <View style={{ flex: 1 }}>
      <ProductListEntryVendor
        setDeleteAlertMessage={setAlertMessage}
        setEditAlertMessage={setAlertMessage}
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
        searchText={searchTextUpdate}
        navigation={navigation}
        ref={vendorListRef}
        currentPage={vendorCurrentPage}
        setCurrentPage={setVendorCurrentPage}

      />
    </View>
  );

  const SecondRoute = () => (
    <View style={{ flex: 1 }}>
      <ProductListEntryCustomer
        setDeleteAlertMessage={setAlertMessage}
        setEditAlertMessage={setAlertMessage}
        currentPage={customerCurrentPage}
        setCurrentPage={setCustomerCurrentPage}
        loading={loading}
        setLoading={setLoading}
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
        searchText={searchText}
        navigation={navigation}
        ref={customerListRef}
      />
    </View>
  );
  const ThirdRoute = () => (
    <View style={{ flex: 1 }}>
      <ProductListEntryUnits
        setDeleteAlertMessage={setAlertMessage}
        setEditAlertMessage={setAlertMessage}
        rowCount={rowCount}
        setRowCount={setRowCount}
        currentPage={unitCurrentPage}
        setCurrentPage={setUnitCurrentPage}
        loading={loading}
        setLoading={setLoading}
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
        searchText={searchText}
        navigation={navigation}
        ref={unitListRef}
      />
    </View>
  );
  const FourthRoute = () => (

    <View style={{ flex: 1 }}>

      <ProductListEntryProducts
        setDeleteAlertMessage={setAlertMessage}
        setEditAlertMessage={setAlertMessage}
        rowCount={rowCount}
        setRowCount={setRowCount}
        currentPage={productCurrentPage}
        setCurrentPage={setProductCurrentPage}
        loading={loading}
        setLoading={setLoading}
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
        searchText={searchText}
        navigation={navigation}
        ref={productListRef}
      />
    </View>
  );

  const renderScene = useMemo(() => SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
    fourth: FourthRoute,
  }), [searchTextUpdate]);

  const [routes] = React.useState([
    { key: 'first', title: 'Vendor' },
    { key: 'second', title: 'Customer' },
    { key: 'third', title: 'Units' },
    { key: 'fourth', title: 'Products' },
  ]);

  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);
  };

  const handleAddEntry = () => {
    setModalVisible(true)
  }

  const renderTabBar: React.FC<TabBarProps<Route>> = props => (
    <View style={{}}>
      {width > screenWidth ? (
        <View>
          <View style={styles.webAlertTextContainer}>
            <Text style={styles.webAlertText}>{alertMessage}{statusMessage}</Text>
          </View>
          <TabBar
            {...props}
            style={styles.tabBar}
            activeColor={colors.Blue}
            labelStyle={styles.tabBarLabel}
            renderLabel={({ route, focused, color }) => (
              <Text style={{ color: colors.Black }}>{route.title}</Text>
            )}
            indicatorStyle={styles.tabBarIndicationStyle}
          />
          <View style={styles.borderLine} />
          <AddAnEntryButton
            setModalVisible={setModalVisible}
            handleAddEntry={handleAddEntry}
          />
        </View>
      ) : (
        <View style={styles.mobileTabBarContainer}>
          <TabBar
            scrollEnabled={false}
            {...props}
            style={styles.mobileTabBarStyle}
            activeColor={colors.Blue}
            labelStyle={styles.mobileTabBarLabel}
            renderLabel={({ route, focused, color }) => (
              <Text style={{ color }}>{route.title}</Text>
            )}
            indicatorStyle={styles.mobileTabBarindicatorStyle}
          />
          <View style={styles.mobileBorder} />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {width > screenWidth ? (
          <View style={styles.subContainer}>
            <View style={styles.headerContainer}>
              {index === 0 ? (
                <AddVendorDetailsModal
                  modalVisible={modalVisible}
                  setModalVisible={setModalVisible}
                  showAlert={showAlert}
                  setAlertMessage={setAlertMessage}
                  searchText={searchText}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  refreshVendorList={handleApiListing}
                />
              ) : index === 1 ? (
                <AddCustomerDetailsModal
                  modalVisible={modalVisible}
                  setModalVisible={setModalVisible}
                  showAlert={showAlert}
                  setAlertMessage={setAlertMessage}
                  searchText={searchText}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  refreshCustomerList={handleApiListing}

                />
              ) : index === 2 ? (
                <AddUnitDetailsModal
                  modalVisible={modalVisible}
                  setModalVisible={setModalVisible}
                  showAlert={showAlert}
                  setAlertMessage={setAlertMessage}
                  searchText={searchText}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  refreshUnitList={handleApiListing}

                />
              ) : (
                index === 3 && (
                  <AddProductDetailsModal
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    showAlert={showAlert}
                    setAlertMessage={setAlertMessage}
                    searchText={searchText}
                    selectedStartDate={selectedStartDate}
                    selectedEndDate={selectedEndDate}
                    refreshProdctList={handleApiListing}

                  />
                )
              )}
              <View>
                <Text style={styles.headerText}>Product List Entry</Text>
              </View>
              <View style={styles.headerContainerRightSection}>
                <CommonSearchBar
                  placeholder="Search"
                  handleSearchChange={handleSearchChange}
                  searchQuery={searchText}
                />
                <View style={styles.calendarSection}>
                  <DatePickerComponent
                    style={styles.datePickerContainerWeb}
                    handleConfirmCalendar={handleConfirmCalendar}
                    selectedDate={index === 0 ? selectedDates.vendor :
                      index === 1 ? selectedDates.customer :
                        index === 2 ? selectedDates.unit :
                          selectedDates.product}
                    setSeletedDate={(date: DateRange) => handleDateChange(date)}
                  />
                </View>
                <CsvExportComponent
                  csvData={index === 0 ? vendorCsv : index === 1 ? customerCsv : index === 2 ? unitCsv : productCsv}
                  headers={index === 0 ? vendorListHeaders : index === 1 ? customerListHeaders : index === 2 ? unitListHeaders : productListHeaders}
                />
              </View>
            </View>
            <View
              style={{
                flex: 1,
              }}>
              <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                sceneContainerStyle={{ flex: 1 }}
                renderTabBar={renderTabBar}
              />
            </View>
          </View>
        ) : (
          <View style={styles.mobileContainer}>
            <View style={styles.mobileHeaderSection}>
              <HeaderComponentMobile
                setModalVisible={setModalVisible}
                handleSearchChange={handleSearchChange}
                searchQuery={searchText}
                title="Product List Entry"
                style={styles.datePickerContainer}
                handleConfirmCalendar={handleConfirmCalendar}
                selectedDate={index === 0 ? selectedDates.vendor :
                  index === 1 ? selectedDates.customer :
                    index === 2 ? selectedDates.unit :
                      selectedDates.product}
                setSelectedDate={(date: DateRange) => handleDateChange(date)}
              />
            </View>
            {index === 0 ? (
              <AddVendorDetailsModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                searchText={searchText}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                refreshVendorList={handleApiListing}

              />
            ) : index === 1 ? (
              <AddCustomerDetailsModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                searchText={searchText}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                refreshCustomerList={handleApiListing}

              />
            ) : index === 2 ? (
              <AddUnitDetailsModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                searchText={searchText}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                refreshUnitList={handleApiListing}

              />
            ) : (
              index === 3 && (
                <AddProductDetailsModal
                  modalVisible={modalVisible}
                  setModalVisible={setModalVisible}
                  searchText={searchText}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  refreshProdctList={handleApiListing}

                />
              )
            )}
            <View
              style={{
                flex: 1,
              }}>
              <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={handleIndexChange}
                sceneContainerStyle={{ flex: 1, zIndex: 99999 }}
                renderTabBar={renderTabBar}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Background_Color_F2F2F2,
  },
  subContainer: {
    flex: 1,
    margin: 10,
    minWidth: 1000,
    backgroundColor: colors.White,
    borderStyle: 'solid',
    borderRadius: 20,
    borderColor: colors.Card_Border_Color,
    shadowColor: colors.Card_Shadow_Color,
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    padding: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.Color_2F69F4,
    paddingBottom: 20,
    marginBottom: 30,
  },
  headerText: {
    fontFamily: 'Roboto-Italic',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 37.5,
    color: colors.black_Heading,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 180,
    height: 32,
    borderWidth: 1.35,
    borderRadius: 8,
    borderColor: colors.Border_Color_Grey,
    borderStyle: 'solid',
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  searchIcon: {
    width: 17,
    height: 17,
    paddingRight: 10,
  },
  searchInput: {
    width: 100,
    fontSize: 14,
    fontWeight: '700',
    color: colors.Border_Color_Grey,
    marginLeft: 10,
    height: 30,
    paddingHorizontal: 5,
    fontFamily: 'Roboto-Bold',
  },
  calendarIcon: {
    width: 22,
    height: 22,
  },
  headerContainerRightSection: {
    flexDirection: 'row',
  },
  calendarSection: {
    height: 32,
    width: 227,
    marginHorizontal: 10,
  },
  selectRangeText: {
    flex: 1,
    color: colors.Border_Color_Grey,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
    fontSize: 14,
    fontWeight: '700',
  },
  uploadSection: {
    borderRadius: 8,
    borderStyle: 'solid',
    borderColor: colors.Border_Color_Grey,
    borderWidth: 1.35,
    paddingHorizontal: 8,
    paddingVertical: 4,
    height: 32,
    flexDirection: 'row',
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportCSVText: {
    flex: 1,
    color: colors.Border_Color_Grey,
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  mobileContainer: {
    flex: 1,
    height: 100,
  },
  mobileHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileHeaderText: {
    fontFamily: 'Roboto-Bold',
    fontWeight: '700',
    fontSize: 24,
    color: colors.Font_Text_Color_101828,
  },
  tabBar: {
    height: 50,
    width: 400,
    backgroundColor: colors.White,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  tabBarLabel: {
    color: colors.Border_Color_Grey,
    textAlign: 'left',
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  tabBarIndicationStyle: {
    backgroundColor: colors.Color_2F69F4,
    height: 2,
    flex: 1,
  },
  borderLine: {
    borderBottomWidth: 1,
    marginBottom: 10,
    borderBottomColor: colors.Color_E7E8F1,
  },
  addButtonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  addButtonSection: {
    width: 163,
    height: 30,
    backgroundColor: colors.Blue_Color_006cff,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.Blue_Color_006cff,
    borderRadius: 5,
    shadowColor: colors.Card_Shadow_Color,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addEntryText: {
    color: colors.White,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
    marginRight: 10,
  },
  mobileTabBarContainer: {
    flex: 1,
    marginTop: 20,
    marginBottom: 30,
    zIndex: 99999,
  },
  mobileTabBarStyle: {
    height: 50,
    backgroundColor: colors.Background_Color_F2F2F2,
    zIndex: 99999,
  },
  mobileTabBarLabel: {
    color: colors.Border_Color_Grey,
    textAlign: 'left',
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  mobileTabBarindicatorStyle: {
    backgroundColor: colors.Color_2F69F4,
    height: 2,
    flex: 1,
  },
  mobileBorder: {
    borderBottomWidth: 1,
    marginBottom: 10,
    borderBottomColor: colors.Color_E7E8F1,
  },
  webAlertTextContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  webAlertText: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    fontWeight: '400',
    color: colors.Blue,
  },
  datePickerContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    borderStyle: 'solid',
    borderColor: colors.Border_Color_Grey,
    borderWidth: 1.35,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerContainerWeb: {
    flexDirection: 'row',
    borderRadius: 8,
    borderStyle: 'solid',
    borderColor: colors.Border_Color_Grey,
    borderWidth: 1.35,
    paddingHorizontal: 8,
    paddingVertical: 4,
    height: 32,
    width: 227,
    alignItems: 'center',
    justifyContent: 'center',
  },
  csvButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportCsvTextStyle: {
    color: colors.Border_Color_Grey,
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProductListEntryScreen;
