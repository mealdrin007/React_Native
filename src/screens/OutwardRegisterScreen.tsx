import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import React, { useCallback, useContext, useState } from 'react';
import OutwardRegisterCard from '../components/outward/OutwardRegisterCard';
import PaginationBar from '../components/PaginationBar';
import { colors } from '../utils/Colors';
import HeaderComponentMobile from '../components/header/mobile/HeaderComponentMobile';
import OutwardRegisterDetailsAddModal from '../components/outward/modals/OutwardRegisterDetailsAddModal';
import {
  GetAllOutWardRegister,
  GetAllProductsWithoutPagination,
  GetAllUnitsWithoutPagination,
  formatDate,
  GetAllOutWardRegisterWithPagination,
  AddOutwardRegister,
  handleSessionExpired
} from '../utils/UrlConst';
import { MasterData, OutwardRegisterItem } from '../utils/Interfaces';
import AddAnEntryButton from '../components/buttons/AddAnEntryButton';
import DatePickerComponent from '../components/customDatePicker/DatePickerComponent';
import { GetAllCustomersWithoutPagination, screenWidth } from '../utils/UrlConst';
import { CustomerInterface } from '../utils/Interfaces';
import CustomAlert from '../components/CustomAlert';
import CommonSearchBar from '../components/search/CommonSearchBar';
import CsvExportComponent from '../components/customCsvExport/CsvExportComponent';
import { AuthContext } from '../context/AuthContext';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { debounce } from 'lodash';
import FooterComponent from '../components/FooterComponent';
import EmptyListView from '../components/EmptyListView';
import { http } from '../apiService';
import NetInfo from '@react-native-community/netinfo';

interface OutwardRegisterScreenProps {
  navigation: NavigationProp<any>;
}

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}
const OutwardRegisterScreen: React.FC<OutwardRegisterScreenProps> = ({ navigation }) => {

  const { width } = useWindowDimensions();

  const [searchText, setSearchText] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outwardRegisterList, setOutwardRegisterList] = useState<
    OutwardRegisterItem[]
  >([]);
  const [masterData, setMasterData] = useState<MasterData>();
  const [selectedDate, setSelectedDate] = useState<DateRange>({
    startDate: null,
    endDate: null
  });
  const [productList, setProductList] = useState();
  const [customerList, setCustomerList] = useState<CustomerInterface[]>([]);
  const [unitList, setUnitList] = useState();
  const [csvData, setCsvData] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [rowCount, setRowCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deletedItem, setDeletedItem] = useState<OutwardRegisterItem | undefined>(undefined)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertVisible, setAlertVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OutwardRegisterItem | undefined>(undefined)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [sessionExpiredAlertShown, setSessionExpiredAlertShown] = useState(false);
  const [connection, setConnection] = useState<"connecting" |
    "connected" | "disconnected">("connecting");

  const authContext = useContext(AuthContext);

  const { role, token } = authContext;

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
          fetchOutwardRegisterListWithPagination(0, 10, null, null, null);
          fetchOutwardRegisterList();
          fetchCustomerList();
          fetchProductList();
          fetchUnitsList();
        } else {
          // Connecting
        }

      }
      const unsubscribe = NetInfo.addEventListener(state => {
        setConnection(state.isConnected ? "connected" : "disconnected");
      });

      return () => unsubscribe();
    }, [connection])
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

  const debouncedErrorAlert = debounce((alertMessage) => {
    Alert.alert('Error', alertMessage, [
      {
        text: 'ok',
      },
    ]);
  }, 300);

  const renderFooter = () => <FooterComponent loading={loading} />;

  const setAlertTimeout = () => {
    return setTimeout(() => {
      setStatusMessage('');
    }, 8000);
  };

  const startAlertTimeout = () => {
    const timerId = setAlertTimeout();
    return () => clearTimeout(timerId);
  };

  // Call startAlertTimeout here
  startAlertTimeout();


  const handleConfirmCalendar = (date: DateRange) => {
    fetchOutwardRegisterListWithPagination(0, 10, searchText, date.startDate, date.endDate)

  };


  const headers = [
    { label: 'Sl No', key: 'outwardRegID' },
    { label: 'Date', key: 'date' },
    { label: 'Customer Name', key: 'customerName' },
    { label: 'Product Name', key: 'productName' },
    { label: 'Unit', key: 'unit' },
    { label: 'Qty', key: 'qty' },
    { label: 'Unit Price', key: 'unitPrice' },
    { label: 'Total Value', key: 'totalValue' },
  ];

  const showAlert = (message: string) => {
    setAlertMessage(message);
  };

  const showAlertFunction = (message: string, item: any) => {
    setAlertMessage(message);
    setAlertVisible(true);
    setDeletedItem(item)
  };

  const fetchOutwardRegisterList = useCallback(debounce(async () => {
    setLoading(true);
    const responseJson = await http.fetchURL(GetAllOutWardRegister, token);

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      const formattedData = responseJson?.data?.map((item: any) => {
        return ({
          outwardRegID: item.outwardRegID,
          date: item.createdAt,
          customerName: item.customer.name,
          productName: item.productType.productName,
          unit: item.unit.description,
          qty: item.quantity,
          unitPrice: item.price,
          totalValue: item.quantity * item.price,
        })
      });
      setCsvData(formattedData ? formattedData : []);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
      setCsvData([])
    }
    else {
      setStatusMessage('No OutwardStock found.')
    }
    setLoading(false);
  }, 1000), [])

  const fetchOutwardRegisterListWithPagination = async (
    pageNum: number,
    count: number,
    searchValue: string | null,
    startDate: Date | null,
    endDate: Date | null
  ) => {
    setLoading(true);

    let jsonData = JSON.stringify({
      startIndex: pageNum,
      rowCount: count,
      searchString: searchValue,
      startDate: startDate,
      endDate: endDate
    });

    let methodtype = 'POST';



    const responseJson = await http.fetchURL(
      GetAllOutWardRegisterWithPagination,
      token,
      jsonData,
      methodtype,
    );


    if (responseJson.hasOwnProperty('status') && responseJson?.status === 1) {
      responseJson.data?.outwardStock.length > 10 && setStartIndex(prev => prev + rowCount);

      if (width > screenWidth) {
        setOutwardRegisterList(responseJson?.data?.outwardStock);
        setTotalCount(responseJson?.data?.searchRowMatchNo);

      } else {
        let mergeDetails;
        if (pageNum === 0) {
          mergeDetails = [...responseJson?.data?.outwardStock]
        } else {
          mergeDetails = [...outwardRegisterList, ...responseJson?.data?.outwardStock]
        }
        setOutwardRegisterList(mergeDetails)
        setTotalCount(responseJson?.data?.searchRowMatchNo);
      }
    }

    else if (responseJson.hasOwnProperty('status') && responseJson?.status === 0) {
      setStatusMessage(responseJson?.statusMessage)
      setOutwardRegisterList([]);
      setTotalCount(0);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured')
      debouncedErrorAlert("Some error occured2")
    }
    setLoading(false);
  };

  const fetchOutwardRegisterListMasterData = useCallback(debounce(async () => {
    const responseJson = await http.fetchURL(GetAllOutWardRegister, token);

    if (responseJson.hasOwnProperty('status') && responseJson?.status === 1) {
      setMasterData(responseJson?.data);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured fetching Master data')
      debouncedErrorAlert("Some error occured3")
    }
    setLoading(false);
  }, 1000), [])

  const handleDeleteClick = (id: number) => {
    const selectedData = outwardRegisterList.find(item => item?.outwardRegID === id);
    setDeletedItem(selectedData)

    if (width > screenWidth) {
      showAlertFunction('Are you sure you want to delete?', selectedData);
    } else {
      Alert.alert('Confirm Deletion', 'Are you sure you want to delete?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteOutwardList(selectedData),
        },
      ]);
    }
  };

  const deleteOutwardList = useCallback(debounce(async (item: any) => {
    setLoading(true);
    let jsonData = JSON.stringify({
      outwardRegID: item.outwardRegID,
      customerID: item.customerID,
      unitID: item.unitID,
      productTypeID: item.productTypeID,
      quantity: item.quantity,
      outwardDate: item.outWardDate,
      createdBy: item.createdBy,
      createdAt: item.createdAt,
      price: item.price,
      isActive: false
    });

    let methodtype = 'POST';

    const responseJson = await http.fetchURL(
      AddOutwardRegister,
      token,
      jsonData,
      methodtype,
    );


    if (responseJson?.status === 1) {
      setStatusMessage('Deleted Successfully')
      fetchOutwardRegisterListWithPagination(startIndex, rowCount, searchText, selectedDate.startDate, selectedDate.endDate)
    }
    else if (responseJson?.status === 0) {
      setStatusMessage(responseJson?.statusMessage)
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured4')
    }
    setLoading(false);
  }, 1000), [])

  const handleAlertClose = () => {
    setAlertVisible(false);
  };

  const handleDeleteWeb = () => {
    deleteOutwardList(deletedItem);
    setAlertVisible(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setStartIndex(0)
    if (text?.length > 3) {
      fetchOutwardRegisterListWithPagination(0, rowCount, text, selectedDate.startDate, selectedDate.endDate);
    }
    else if (text === '' || null) {
      fetchOutwardRegisterListWithPagination(0, rowCount, text, selectedDate.startDate, selectedDate.endDate);
    }
  };

  const handleEditClick = (id: number) => {
    const selectedItem = outwardRegisterList.find(item => item.outwardRegID === id);
    setSelectedItem(selectedItem)
    setModalVisible(true);
  };

  const fetchCustomerList = useCallback(debounce(async () => {
    setLoading(true);

    const responseJson = await http.fetchURL(GetAllCustomersWithoutPagination, token);

    if (responseJson.hasOwnProperty('status') && responseJson?.status === 1) {
      setCustomerList(responseJson?.data);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured')
      debouncedErrorAlert("Some error occured5")
    }
    setLoading(false);
  }, 1000), [])

  const fetchProductList = useCallback(debounce(async () => {
    setLoading(true);

    const responseJson = await http.fetchURL(GetAllProductsWithoutPagination, token);
    if (responseJson.hasOwnProperty('status') && responseJson?.status === 1) {
      setProductList(responseJson?.data);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured')
      debouncedErrorAlert("Some error occured6")
    }
    setLoading(false);
  }, 1000), [])

  const fetchUnitsList = useCallback(debounce(async () => {
    setLoading(true);
    const responseJson = await http.fetchURL(GetAllUnitsWithoutPagination, token);

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      setUnitList(responseJson.data);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured')
      debouncedErrorAlert("Some error occured7")

    }
    setLoading(false);
  }, 1000), [])

  const tableHeader = () => (
    <View style={styles.tableHeaderContainer}>
      <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
        <Text style={styles.tableHeaderColumnText}>Sl. No</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
        <Text style={styles.tableHeaderColumnText}>Date</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '15%' }]}>
        <Text style={styles.tableHeaderColumnText}>Customer Name</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '15%' }]}>
        <Text style={styles.tableHeaderColumnText}>Product Name</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
        <Text style={styles.tableHeaderColumnText}>Unit</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
        <Text style={styles.tableHeaderColumnText}>Qty</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
        <Text style={styles.tableHeaderColumnText}>Unit Price</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
        <Text style={styles.tableHeaderColumnText}>Total Value</Text>
      </View>
      {
        role === 1 &&
        <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
          <Text style={styles.tableHeaderColumnText}>Action</Text>
        </View>
      }
    </View>
  );

  const renderItem = ({ item }: { item: OutwardRegisterItem }) => {
    return (
      <View style={styles.tableBodyContainer}>
        <View style={[styles.tableBodyColumn, { width: '10%' }]}>
          <Text style={styles.tableBodyColumnText}>{item?.outwardRegID}</Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '10%' }]}>
          <Text style={styles.tableBodyColumnText}>
            {formatDate(item?.createdAt)}
          </Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '15%' }]}>
          <Text style={styles.tableBodyColumnText}>{item?.customer?.name}</Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '15%' }]}>
          <Text style={styles.tableBodyColumnText}>
            {item?.productType?.productName}
          </Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '10%' }]}>
          <Text style={styles.tableBodyColumnText}>
            {item?.unit?.description}
          </Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '10%' }]}>
          <Text style={styles.tableBodyColumnText}>{item?.quantity}</Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '10%' }]}>
          <Text style={styles.tableBodyColumnText}>{item?.price}</Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '10%' }]}>
          <Text style={styles.tableBodyColumnText}>
            {item?.price * item?.quantity}
          </Text>
        </View>
        {
          role === 1 &&
          <View style={[styles.tableActionColumn]}>
            <Pressable
              style={styles.editButton}
              onPress={() => handleEditClick(item?.outwardRegID)}>
              <Image
                source={{ uri: '/images/fe_edit.svg' }}
                style={{
                  height: 24,
                  width: 24,
                }}
              />
            </Pressable>
            <Pressable style={styles.deleteButton}
              onPress={() => handleDeleteClick(item?.outwardRegID)}
            >
              <Image
                source={{ uri: '/images/delete.svg' }}
                style={{
                  height: 18,
                  width: 16,
                }}
              />
            </Pressable>
          </View>
        }
      </View>
    );
  };

  const onNext = () => {
    if (startIndex + rowCount < totalCount) {
      setStartIndex(startIndex + rowCount);
      fetchOutwardRegisterListWithPagination(startIndex + rowCount, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
      setCurrentPage(currentPage + 1);
    }
  };

  const onPrev = () => {
    if (startIndex - rowCount >= 0) {
      setStartIndex(startIndex - rowCount);
      fetchOutwardRegisterListWithPagination(startIndex - rowCount, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleLoadMore = () => {
    if (outwardRegisterList?.length < totalCount) {
      fetchOutwardRegisterListWithPagination(startIndex, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
    }
  };

  const onPageClick = (pageNumber: number) => {
    const newStartIndex = (pageNumber - 1) * rowCount;
    setStartIndex(newStartIndex);
    fetchOutwardRegisterListWithPagination(newStartIndex, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
    setCurrentPage(pageNumber);
  };

  const handleAddEntry = () => {
    setModalVisible(true)
    setSelectedItem(undefined)
  }

  const handleCloseCalendar = () => {
    fetchOutwardRegisterListWithPagination(0, 10, searchText, selectedDate.startDate, selectedDate.endDate)
  };



  return (
    <View style={{ flex: 1 }}>
      {width > screenWidth ? (
        <View style={styles.subContainer}>
          <View style={{ flex: 1 }}>
            <View style={styles.webAlertTextContainer}>
              <Text style={styles.webAlertText}>{statusMessage}</Text>
            </View>
            <View style={styles.headerContainer}>
              <View>
                <Text style={styles.headerText}>Outward Register</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <CommonSearchBar
                  placeholder="Search"
                  handleSearchChange={handleSearchChange}
                  searchQuery={searchText}
                />
                <View style={styles.calendarSection}>
                  <DatePickerComponent
                    style={styles.datePickerContainerWeb}
                    handleConfirmCalendar={handleConfirmCalendar}
                    selectedDate={selectedDate}
                    setSeletedDate={(date: DateRange) => setSelectedDate(date)}

                  />
                </View>
                <CsvExportComponent
                  csvData={csvData}
                  headers={headers}
                />
              </View>
              <OutwardRegisterDetailsAddModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                masterData={masterData}
                fetchOutwardRegisterList={fetchOutwardRegisterList}
                showAlert={showAlert}
                productList={productList}
                unitList={unitList}
                customerList={customerList}
                selectedItem={selectedItem}
                fetchOutwardRegisterListWithPagination={fetchOutwardRegisterListWithPagination}
                startIndex={startIndex}
                rowCount={rowCount}
                searchText={searchText}
                selectedDate={selectedDate}
                navigation={navigation}
              />
              <CustomAlert
                visible={alertVisible}
                message={alertMessage}
                onClose={handleAlertClose}
                handleDeleteWeb={handleDeleteWeb}
              />
            </View>
            <AddAnEntryButton
              setModalVisible={setModalVisible}
              handleAddEntry={handleAddEntry}
            />
            <View style={{ flex: 1 }}>
              <FlatList
                scrollEnabled={true}
                persistentScrollbar={true}
                data={outwardRegisterList}
                ListHeaderComponent={tableHeader}
                stickyHeaderIndices={[0]}
                style={{ flex: 1, width: '100%' }}
                ListEmptyComponent={EmptyListView}
                renderItem={renderItem}
              />
              <View style={styles.paginationContainer}>
                {
                  outwardRegisterList?.length > 0 &&
                  <PaginationBar
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalCount / rowCount)}
                    onNext={onNext}
                    onPrev={onPrev}
                    onPageClick={onPageClick}
                  />
                }
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* {loading ? (
            <View style={{ flex: 1 }}>
              <ProgressBar />
            </View>
          ) : ( */}
          <View style={{ flex: 1 }}>
            <View style={{
              height: 100,
            }}>
              <HeaderComponentMobile
                setModalVisible={setModalVisible}
                handleSearchChange={handleSearchChange}
                searchQuery={searchText}
                title="Outward Register"
                selectedDate={selectedDate}
                style={styles.datePickerContainer}
                handleConfirmCalendar={handleConfirmCalendar}
                setSelectedDate={(date: DateRange) => setSelectedDate(date)}
              />
            </View>
            <OutwardRegisterDetailsAddModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              masterData={masterData}
              fetchOutwardRegisterList={fetchOutwardRegisterList}
              productList={productList}
              unitList={unitList}
              customerList={customerList}
              fetchOutwardRegisterListWithPagination={fetchOutwardRegisterListWithPagination}
              startIndex={startIndex}
              rowCount={rowCount}
              searchText={searchText}
              navigation={navigation}
              selectedDate={selectedDate}
              selectedItem={selectedItem}
            />
            <View style={{ flex: 1 }}>
              <FlatList
                data={outwardRegisterList}
                renderItem={({ item }) => (
                  <OutwardRegisterCard
                    item={item}
                    handleEditClick={() => handleEditClick(item.outwardRegID)}
                    handleDeleteClick={() => handleDeleteClick(item.outwardRegID)}
                  />
                )}
                keyExtractor={item => item.outwardRegID?.toString()}
                style={{
                }}
                contentContainerStyle={{
                }}
                ListEmptyComponent={EmptyListView}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0}
                ListFooterComponent={renderFooter}
              />
            </View>
          </View>
          {/* )} */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subContainer: {
    flex: 1,
    minWidth: 1000,
    margin: 10,
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
    borderColor: colors.Border_Color_Light_Black,
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
  tableHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    backgroundColor: colors.Background_Color_Light_Grey,
    borderWidth: 1,
    borderColor: colors.Border_Color_Gray86,
    borderStyle: 'solid',
  },
  tableHeaderColumn: {
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  tableHeaderColumnText: {
    textAlign: 'left',
    color: colors.Font_Text_Color_Dark_Gray,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 32,
    fontWeight: '400',
  },
  tableBodyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.White,
    borderWidth: 1,
    borderColor: colors.Border_Color_Gray86,
    borderStyle: 'solid',
  },
  tableBodyColumn: {
    height: 64,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  tableBodyColumnText: {
    textAlign: 'left',
    color: colors.Font_Text_Color_74828f,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 32,
    fontWeight: '400',
  },
  paginationContainer: {
    alignItems: 'flex-end',
    height: 50,
    marginTop: 10,
  },
  tableActionColumn: {
    height: 64,
    paddingHorizontal: 12,
    paddingVertical: 24,
    width: '10%',
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  uploadContainer: {
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
  exportCsvText: {
    flex: 1,
    color: colors.Border_Color_Grey,
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    height: 24,
    width: 24,
    margin: 4,
  },
  deleteButton: {
    height: 18,
    width: 16,
    margin: 4,
  },
  webAlertTextContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  webAlertText: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    fontWeight: '400',
    color: colors.Blue,
  },
  exportCsvTextStyle: {
    color: colors.Border_Color_Grey,
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  csvButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default OutwardRegisterScreen;
