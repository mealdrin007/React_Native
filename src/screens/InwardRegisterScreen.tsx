import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import React, { useCallback, useContext, useRef, useState } from 'react';
import InwardRegisterCard from '../components/inward/InwardRegisterCard';
import PaginationBar from '../components/PaginationBar';
import { colors } from '../utils/Colors';
import HeaderComponentMobile from '../components/header/mobile/HeaderComponentMobile';
import InwardRegisterDetailsAddModal from '../components/inward/modals/InwardRegisterDetailsAddModal';
import { http } from '../apiService';
import {
  GetAllInWardRegister,
  GetAllVendorsWithoutPagination,
  GetAllUnitsWithoutPagination,
  GetAllProductsWithoutPagination,
  formatDate,
  GetAllInWardRegisterWithPagination,
  AddInwardRegister,
  screenWidth,
  _retrieveItem,
  handleSessionExpired
} from '../utils/UrlConst';
import { InwardRegisterItem } from '../utils/Interfaces';
import AddAnEntryButton from '../components/buttons/AddAnEntryButton';
import DatePickerComponent from '../components/customDatePicker/DatePickerComponent';
import CustomAlert from '../components/CustomAlert';
import CommonSearchBar from '../components/search/CommonSearchBar';
import CsvExportComponent from '../components/customCsvExport/CsvExportComponent';
import { AuthContext } from '../context/AuthContext';
import { debounce } from 'lodash';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import FooterComponent from '../components/FooterComponent';
import EmptyListView from '../components/EmptyListView';
import NetInfo from '@react-native-community/netinfo';

interface InwardRegisterScreenProps {
  navigation: NavigationProp<any>;
}
interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface InwardEntryProps {
  productName: string;
  vendorName: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  date: Date | null;
  unitPrice: number;
  currentDate: any;
  createdBy: string | null;
}

const InwardRegisterScreen: React.FC<InwardRegisterScreenProps> = ({ navigation }: any) => {
  const { width } = useWindowDimensions();

  const [searchText, setSearchText] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inwardRegisterList, setInwardRegisterList] = useState<
    InwardRegisterItem[]
  >([]);
  const [vendorList, setVendorList] = useState();
  const [unitList, setUnitList] = useState();
  const [productList, setProductList] = useState();
  const [alertMessage, setAlertMessage] = useState('');
  const [startIndex, setStartIndex] = useState(0);
  const [rowCount, setRowCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState<DateRange>({
    startDate: null,
    endDate: null
  })
  const [csvData, setCsvData] = useState([]);
  const [deletedItem, setDeletedItem] = useState<InwardRegisterItem | undefined>(undefined)
  const [alertVisible, setAlertVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InwardRegisterItem | null>(null);
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
          // fetchInwardRegisterList();
          fetchVendorList();
          fetchProductList();
          fetchUnitList();
          fetchInwardRegisterListWithPagination(0, 10, null, null, null);
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
    fetchInwardRegisterListWithPagination(0, 10, searchText, date.startDate, date.endDate)
  }

  const headers = [
    { label: 'Sl No', key: 'logId' },
    { label: 'Date', key: 'date' },
    { label: 'Vendor Name', key: 'vendorName' },
    { label: 'Product Name', key: 'productName' },
    { label: 'Unit', key: 'unit' },
    { label: 'Qty', key: 'qty' },
    { label: 'Unit Price', key: 'unitPrice' },
    { label: 'Total Value', key: 'totalValue' }
  ];

  const showAlert = (message: string) => {
    setAlertMessage(message);
  };

  // const fetchInwardRegisterList = useCallback(debounce(async () => {
  //   setLoading(true);

  //   const responseJson = await http.fetchURL(GetAllInWardRegister, token);

  //   if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
  //     const formattedData = responseJson?.data.map((item: any) => ({
  //       logId: item.logID,
  //       date: item.createdAt,
  //       vendorName: item.vendor.name,
  //       productName: item.productType.productName,
  //       unit: item.unit.description,
  //       qty: item.quantity,
  //       unitPrice: item.price,
  //       totalValue: item.quantity * item.price,
  //     }));
  //     setCsvData(formattedData);

  //   } else if (responseJson?.status === 2) {
  //     debouncedHandleSessionExpiredAlert();
  //   }
  //   else {
  //     setStatusMessage('Some error occured2')
  //   }
  //   setLoading(false);
  // }, 1000), [])

  const updateInwardList = (inwardStock: any) => {
    // console.log("inwardStock: " + JSON.stringify(inwardStock))
    // console.log("existing data: " + JSON.stringify(inwardRegisterList))
    // {
    //   "inwardRegisterID": 75, 
    //   "productTypeID": 7, 
    //   "productType": { 
    //     "productTypeID": 7, 
    //     "productName": "Abhilash product 1", 
    //     "createdBy": "abhilash", 
    //     "createdAt": "2024-06-19T09:36:29.465", 
    //     "modifiedBy": "abhilash@gmail.com", 
    //     "modifiedAt": "2024-06-21T08:46:30.9603398", 
    //     "description": "Abhilash product description " }
    //   }
    // setInwardRegisterList(prev => [...prev, inwardStock])
  }

  const fetchInwardRegisterListWithPagination = async (
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
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    });


    let methodtype = 'POST';

    const responseJson = await http.fetchURL(
      GetAllInWardRegisterWithPagination,
      token,
      jsonData,
      methodtype,
    );

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      responseJson.data?.inwardStock.length > 10 && setStartIndex(prev => prev + rowCount);

      if (width > screenWidth) {
        setInwardRegisterList(responseJson.data?.inwardStock);
        setTotalCount(responseJson.data?.searchRowMatchNo);


      } else {
        let mergeDetails;
        if (pageNum === 0) {
          mergeDetails = [...responseJson.data?.inwardStock]
        } else {
          mergeDetails = [...inwardRegisterList, ...responseJson.data?.inwardStock]
        }
        setInwardRegisterList(mergeDetails)
        setTotalCount(responseJson.data?.searchRowMatchNo);
      }
    }
    else if (responseJson.hasOwnProperty('status') && responseJson.status === 0) {
      setStatusMessage(responseJson?.statusMessage)
      setInwardRegisterList([]);
      setTotalCount(0);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured3')
    }
    setLoading(false);
  };

  const fetchVendorList = async () => {
    setLoading(true);
    const responseJson = await http.fetchURL(GetAllVendorsWithoutPagination, token);

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      setVendorList(responseJson.data);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured4')
    }
    setLoading(false);
  };

  const fetchProductList = async () => {
    setLoading(true);
    const responseJson = await http.fetchURL(GetAllProductsWithoutPagination, token);

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      setProductList(responseJson.data);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured5')
    }
    setLoading(false);
  };

  const fetchUnitList = async () => {
    setLoading(true);
    const responseJson = await http.fetchURL(GetAllUnitsWithoutPagination, token);

    if (responseJson.hasOwnProperty('status') && responseJson?.status === 1) {
      setUnitList(responseJson?.data);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured6')
    }
    setLoading(false);
  };

  const handleSearchChange = (text: string) => {
    setStartIndex(0)
    setSearchText(text);
    if (text?.length > 3) {
      fetchInwardRegisterListWithPagination(0, rowCount, text, null, null)
    }
    else if (text === '' || null) {
      fetchInwardRegisterListWithPagination(0, rowCount, null, null, null)
    }
  };

  const handleEditClick = (id: number) => {
    const selectedItem = inwardRegisterList.find(item => item.inwardRegisterID === id);

    selectedItem && setSelectedItem(selectedItem)
    setModalVisible(true);
  };

  const showAlertFunction = (message: string, item: any) => {
    setAlertMessage(message);
    setAlertVisible(true);
    setDeletedItem(item)
  };

  const handleDeleteClick = (id: number) => {
    const selectedData = inwardRegisterList.find(item => item?.inwardRegisterID === id);
    setDeletedItem(selectedData);

    if (Platform.OS === 'web') {
      showAlertFunction('Are you sure you want to delete?', selectedData);
    } else {
      Alert.alert('Confirm Deletion', 'Are you sure you want to delete?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteInwardList(selectedData),
        },
      ]);
    }
  };

  const deleteInwardList = async (item: any) => {
    setLoading(true);

    let jsonData = JSON.stringify({
      inwardRegID: item.inwardRegisterID,
      productTypeID: item.productTypeID,
      unitID: item.unitID,
      vendorID: item.vendorID,
      quantity: item.quantity,
      createdBy: item.createdBy,
      createdAt: item.createdAt,
      price: item.price,
      isActive: false
    });

    let methodtype = 'POST';

    const responseJson = await http.fetchURL(
      AddInwardRegister,
      token,
      jsonData,
      methodtype,
    );

    if (responseJson?.status === 1) {
      setStatusMessage('Deleted Successfully')
      fetchInwardRegisterListWithPagination(startIndex, rowCount, searchText, selectedDate.startDate, selectedDate.endDate)
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured7')
    }
    setLoading(false);
  };

  const handleDeleteWeb = () => {
    deleteInwardList(deletedItem);
    setAlertVisible(false);
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
    setAlertMessage('')
  };

  const tableHeader = () => (
    <View style={styles.tableHeaderContainer}>
      <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
        <Text style={styles.tableHeaderColumnText}>Sl. No</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
        <Text style={styles.tableHeaderColumnText}>Date</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '15%' }]}>
        <Text style={styles.tableHeaderColumnText}>Vendor Name</Text>
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
      {role === 1 &&
        <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
          <Text style={styles.tableHeaderColumnText}>Action</Text>
        </View>
      }
    </View>
  );

  const renderItem = ({ item }: { item: InwardRegisterItem }) => {
    return (
      <View style={styles.tableBodyContainer}>
        <View style={[styles.tableBodyColumn, { width: '10%' }]}>
          <Text style={styles.tableBodyColumnText}>{item?.unitID}</Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '10%' }]}>
          <Text style={styles.tableBodyColumnText}>
            {formatDate(item?.createdAt)}
          </Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '15%' }]}>
          <Text style={styles.tableBodyColumnText}>{item?.vendor?.vendorName}</Text>
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
          <View style={styles.tableActionColumn}>
            <Pressable
              style={styles.editButton}
              onPress={() => handleEditClick(item?.inwardRegisterID)}>
              <Image
                source={{ uri: '/images/fe_edit.svg' }}
                style={{
                  height: 24,
                  width: 24,
                }}
              />
            </Pressable>
            <Pressable style={styles.deleteButton}
              onPress={() => handleDeleteClick(item?.inwardRegisterID)}
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
      fetchInwardRegisterListWithPagination(startIndex + rowCount, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
      setCurrentPage(currentPage + 1);
    }
  };

  const onPrev = () => {
    if (startIndex - rowCount >= 0) {
      setStartIndex(startIndex - rowCount);
      fetchInwardRegisterListWithPagination(startIndex - rowCount, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
      setCurrentPage(currentPage - 1);
    }
  };

  const onPageClick = (pageNumber: number) => {
    const newStartIndex = (pageNumber - 1) * rowCount;
    setStartIndex(newStartIndex);
    fetchInwardRegisterListWithPagination(newStartIndex, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
    setCurrentPage(pageNumber);
  };

  const handleAddEntry = () => {
    setSelectedItem(null)
    setModalVisible(true)
  }

  const handleLoadMore = () => {
    if (inwardRegisterList?.length < totalCount) {
      fetchInwardRegisterListWithPagination(startIndex, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
    }
  };


  return (
    <View style={{ flex: 1 }}>
      {width > screenWidth ? (
        <View style={styles.subContainer}>
          {/* {loading ? (
            <View style={{ flex: 1 }}>
              <ProgressBar />
            </View>
          ) : ( */}
          <View style={{ flex: 1 }}>
            <View style={styles.webAlertTextContainer}>
              <Text style={styles.webAlertText}>{statusMessage}</Text>
            </View>
            <View style={styles.headerContainer}>
              <View>
                <Text style={styles.headerText}>Inward Register</Text>
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
                <View style={styles.inwardRegCalendarSection}>
                  <DatePickerComponent
                    style={styles.datePickerContainerWeb}
                    handleConfirmCalendar={handleConfirmCalendar}
                    selectedDate={selectedDate}
                    setSeletedDate={(date: DateRange) => setSelectedDate(date)} />
                </View>
                <CsvExportComponent
                  csvData={csvData}
                  headers={headers}
                />
              </View>
              <InwardRegisterDetailsAddModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                vendorList={vendorList}
                unitList={unitList}
                productList={productList}
                showAlert={showAlert}
                selectedItem={selectedItem}
                fetchInwardRegisterListWithPagination={fetchInwardRegisterListWithPagination}
                startIndex={startIndex}
                rowCount={rowCount}
                searchText={searchText}
                selectedDate={selectedDate}
                setSelectedDate={(date: DateRange) => setSelectedDate(date)}
                setStatusMessage={setStatusMessage}
                navigation={navigation}
                updateInwardList={(e: any) => updateInwardList(e)}

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
                data={inwardRegisterList}
                ListHeaderComponent={tableHeader}
                stickyHeaderIndices={[0]}
                style={{ flex: 1, width: '100%' }}
                ListEmptyComponent={EmptyListView}
                renderItem={renderItem}
              />
              <View style={styles.paginationContainer}>
                {
                  inwardRegisterList?.length > 0 &&
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
          {/* )} */}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                height: 100,
              }}>
              <HeaderComponentMobile
                setModalVisible={setModalVisible}
                handleSearchChange={handleSearchChange}
                searchQuery={searchText}
                title="Inward Register"
                style={styles.datePickerContainer}
                handleConfirmCalendar={handleConfirmCalendar}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}

              />
            </View>
            <InwardRegisterDetailsAddModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              vendorList={vendorList}
              unitList={unitList}
              productList={productList}
              fetchInwardRegisterListWithPagination={fetchInwardRegisterListWithPagination}
              startIndex={startIndex}
              rowCount={rowCount}
              searchText={searchText}
              selectedDate={selectedDate}
              setStatusMessage={setStatusMessage}
              navigation={navigation}
              updateInwardList={updateInwardList}
              setSelectedDate={(date: DateRange) => setSelectedDate(date)}
              selectedItem={selectedItem}
            />
            <View style={{ flex: 1 }}>
              <FlatList
                data={inwardRegisterList}
                renderItem={({ item }: any) => {

                  return (<InwardRegisterCard
                    item={item}
                    handleEditClick={() => handleEditClick(item.inwardRegisterID)}
                    handleDeleteClick={() => handleDeleteClick(item.inwardRegisterID)}
                  />);
                }
                }
                keyExtractor={item => item.inwardRegisterID.toString()}
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
        </View>
      )
      }
    </View >
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
    width: 200,
    height: 32,
    borderWidth: 1.35,
    borderRadius: 8,
    borderColor: colors.Border_Color_Grey,
    borderStyle: 'solid',
    paddingVertical: 5,
    paddingLeft: 5
  },
  searchIcon: {
    width: 17,
    height: 17,
    paddingRight: 10,
  },
  searchInput: {
    width: 180,
    fontSize: 14,
    fontWeight: '700',
    color: colors.Border_Color_Grey,
    borderRadius: 8,
    marginLeft: 8,
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
  inwardRegCalendarSection: {
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
  csvText: {
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
  },
  webAlertText: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    fontWeight: '400',
    color: colors.Blue,
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

export default InwardRegisterScreen;
