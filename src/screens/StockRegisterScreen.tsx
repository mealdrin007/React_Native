import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import React, { useContext, useState } from 'react';
import { colors } from '../utils/Colors';
import PaginationBar from '../components/PaginationBar';
import UploadIcon from '../../public/images/PaperUpload.svg';
import CommonSearchBar from '../components/search/CommonSearchBar';
import StockRegisterCardMobile from '../components/dashboard/mobile/StockRegisterCardMobile';
import { http } from '../apiService';
import {
  GetAvailableStockWithPagination,
  formatDate,
  handleSessionExpired,
  screenWidth
} from '../utils/UrlConst';
import { StockRegisterItem } from '../utils/Interfaces';
import DatePickerComponent from '../components/customDatePicker/DatePickerComponent';
import CsvExportComponent from '../components/customCsvExport/CsvExportComponent';
import { AuthContext } from '../context/AuthContext';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { debounce } from 'lodash';
import FooterComponent from '../components/FooterComponent';
import EmptyListView from '../components/EmptyListView';
import NetInfo from '@react-native-community/netinfo';

interface StockRegisterScreenProps {
  navigation: NavigationProp<any>;
}

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

const StockRegisterScreen: React.FC<StockRegisterScreenProps> = ({ navigation }) => {

  const { width } = useWindowDimensions();

  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stockList, setStockList] = useState<StockRegisterItem[]>([]);
  const [csvData, setCsvData] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [rowCount, setRowCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [sessionExpiredAlertShown, setSessionExpiredAlertShown] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateRange>({
    startDate: null,
    endDate: null
  });
  const [connection, setConnection] = useState<"connecting" |
    "connected" | "disconnected">("connecting");
  const authContext = useContext(AuthContext);

  const { token } = authContext;

  useFocusEffect(
    React.useCallback(() => {
      // selectedDate.startDate(null)
      // selectedDate.endDate(null)
      if (token) {

        if (connection == "disconnected") {

          Alert.alert('Network Error', 'Please Check your Internet Connection.', [
            {
              text: 'Ok',
            },
          ]);

        } else if (connection == "connected") {
          fetchStockRegisterListWithPagination(0, 10, null, null, null);

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

  const debouncedErrorAlert = debounce(() => {
    Alert.alert('Error', 'Some error occured', [
      {
        text: 'ok',
      },
    ]);
  }, 300);

  const renderFooter = () => <FooterComponent loading={loading} />;

  const handleCloseCalendar = () => {
    fetchStockRegisterListWithPagination(0, 10, searchText, selectedDate.startDate, selectedDate.endDate)
  };

  const handleConfirmCalendar = (date: DateRange) => {
    fetchStockRegisterListWithPagination(0, 10, searchText, selectedDate.startDate, selectedDate.endDate)

  }

  const headers = [
    { label: 'Sl No', key: 'productID' },
    { label: 'Product Name', key: 'productName' },
    { label: 'Unit', key: 'unitDescription' },
    { label: 'Stock Value', key: 'stockValue' },
    { label: 'Last Purchased Date', key: 'lastPurchasedDate' },
  ];

  const fetchStockRegisterListWithPagination = async (
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
      GetAvailableStockWithPagination,
      token,
      jsonData,
      methodtype,
    );

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      setStatusMessage('')
      responseJson.data?.availableStock.length > 10 && setStartIndex(prev => prev + rowCount);

      if (width > screenWidth) {
        setStockList(responseJson.data?.availableStock);
        setTotalCount(responseJson.data?.searchRowMatchNo);
        // setCsvData(responseJson.data?.availableStock)
      } else {
        let mergeDetails;
        if (pageNum === 0) {
          mergeDetails = [...responseJson.data?.availableStock]
        } else {
          mergeDetails = [...stockList, ...responseJson.data?.availableStock]
        }
        setStockList(mergeDetails)
        setTotalCount(responseJson.data?.searchRowMatchNo);
      }

      const formattedData = responseJson?.data?.availableStock?.map((item: any) => ({
        productID: item.productID,
        productName: item.productType.productName,
        unitDescription: item.unit.description,
        stockValue: item.price,
        lastPurchasedDate: item.modifiedAt
      }));
      setCsvData(formattedData);
    }
    else if (responseJson.hasOwnProperty('status') && responseJson.status === 0) {
      setStatusMessage(responseJson?.statusMessage)
      setStockList([]);
      setTotalCount(0);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      setStatusMessage('Some error occured')
      debouncedErrorAlert()
    }
    setLoading(false);
  };

  const handleSearchChange = (text: string) => {
    setStartIndex(0)
    setSearchText(text);
    if (text?.length > 3) {
      fetchStockRegisterListWithPagination(0, rowCount, text, selectedDate.startDate, selectedDate.endDate);
    }
    else if (text === '' || null) {
      fetchStockRegisterListWithPagination(0, rowCount, null, selectedDate.startDate, selectedDate.endDate);
    }
  };

  // csv code mobile
  // const convertToCSV = (data: any): string => {
  //   const header = Object.keys(data[0]).join(',') + '\n';
  //   const rows = data
  //     .map((obj: any) => Object.values(obj).join(','))
  //     .join('\n');
  //   return header + rows;
  // };

  // Function to export data to CSV
  // const exportToCSV = async (data: any, filename: string) => {
  //   if (Platform.OS === 'android' || Platform.OS === 'ios') {
  //       const csvData = convertToCSV(data);
  //       const path = RNFS.DownloadDirectoryPath + `/${filename}.csv`;
  //       try {
  //           await RNFS.writeFile(path, csvData, 'utf8');
  //           console.log('CSV file saved:', path);
  //           const folderName = path.split('/').slice(-2, -1)[0];
  //           Alert.alert(
  //               'Success',
  //               `CSV file downloaded successfully at ${folderName}, ${filename}.csv`,
  //               [
  //                   { text: 'OK', onPress: () => console.log('OK Pressed') },
  //               ],
  //               { cancelable: false }
  //           );
  //       } catch (error) {
  //           console.error('Error writing CSV file:', error);
  //           Alert.alert(
  //               'Error',
  //               'Failed to download CSV file!',
  //               [
  //                   { text: 'OK', onPress: () => console.log('OK Pressed') },
  //               ],
  //               { cancelable: false }
  //           );
  //       }
  //   } else {
  //       console.log('This function is only supported on mobile devices.');
  //   }
  // };

  const handleExportButtonClick = () => {
    // Platform.OS === 'android' || 'ios'
    //   ? exportToCSV(stockList, 'example_data')
    //   : null;
  };

  const tableHeader = () => (
    <View style={styles.tableHeaderContainer}>
      <View style={[styles.tableHeaderColumn, { width: '14%' }]}>
        <Text style={styles.tableHeaderColumnText}>Sl. No</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '14%' }]}>
        <Text style={styles.tableHeaderColumnText}>Product Name</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '14%' }]}>
        <Text style={styles.tableHeaderColumnText}>Unit</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '14%' }]}>
        <Text style={styles.tableHeaderColumnText}>Qty</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '14%' }]}>
        <Text style={styles.tableHeaderColumnText}>Unit Price</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '14%' }]}>
        <Text style={styles.tableHeaderColumnText}>Stock Value</Text>
      </View>
      <View style={[styles.tableHeaderColumn, { width: '14%' }]}>
        <Text style={styles.tableHeaderColumnText}>Last Purchased Date</Text>
      </View>
    </View>
  );

  const renderItem = ({ item, index }: any) => {
    return (
      <View style={styles.tableBodyContainer} key={index}>
        <View style={[styles.tableBodyColumn, { width: '14%' }]}>
          <Text style={styles.tableBodyColumnText}>{item.stockID}</Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '14%' }]}>
          <Text style={styles.tableBodyColumnText}>
            {item.productType.productName}
          </Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '14%' }]}>
          <Text style={styles.tableBodyColumnText}>
            {item.unit.description}
          </Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '14%' }]}>
          <Text style={styles.tableBodyColumnText}>{item.quantity}</Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '14%' }]}>
          <Text style={styles.tableBodyColumnText}>{item.price}</Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '14%' }]}>
          <Text style={styles.tableBodyColumnText}>{item.price * item.quantity}</Text>
        </View>
        <View style={[styles.tableBodyColumn, { width: '14%' }]}>
          <Text style={styles.tableBodyColumnText}>
            {formatDate(item.modifiedAt)}
          </Text>
        </View>
      </View>
    );
  };

  const onNext = () => {
    if (startIndex + rowCount < totalCount) {
      setStartIndex(startIndex + rowCount);
      fetchStockRegisterListWithPagination(startIndex + rowCount, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
      setCurrentPage(currentPage + 1);
    }
  };

  const onPrev = () => {
    if (startIndex - rowCount >= 0) {
      setStartIndex(startIndex - rowCount);
      fetchStockRegisterListWithPagination(startIndex - rowCount, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
      setCurrentPage(currentPage - 1);
    }
  };

  const onPageClick = (pageNumber: number) => {
    const newStartIndex = (pageNumber - 1) * rowCount;
    setStartIndex(newStartIndex);
    fetchStockRegisterListWithPagination(newStartIndex, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
    setCurrentPage(pageNumber);
  };

  const handleLoadMore = () => {
    if (stockList?.length < totalCount) {
      fetchStockRegisterListWithPagination(startIndex, 10, searchText, selectedDate.startDate, selectedDate.endDate);
    }
  };

  return (
    <View style={styles.container}>
      {width > screenWidth ? (
        <View style={styles.subContainer}>
          <View style={styles.webAlertTextContainer}>
            <Text style={styles.webAlertText}>{statusMessage}</Text>
          </View>
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.headerText}>Stock Register</Text>
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
                  style={styles.datePickerContainer}
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
          </View>
          <View style={{ flex: 1 }}>
            <FlatList
              persistentScrollbar={true}
              data={stockList}
              ListHeaderComponent={tableHeader}
              stickyHeaderIndices={[0]}
              style={{ flex: 1, width: '100%' }}
              ListEmptyComponent={EmptyListView}
              renderItem={renderItem}
              keyExtractor={item => item.productID?.toString()}
            />
            {stockList?.length > 0 && (
              <View style={styles.paginationContainer}>
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalCount / rowCount)}
                  onNext={onNext}
                  onPrev={onPrev}
                  onPageClick={onPageClick}
                />
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.mobileContainer}>
          <View style={styles.mobileHeaderTextContainer}>
            <Text style={styles.mobileHeaderText}>Stock Register</Text>
            <Pressable
              style={styles.mobileUploadButton}
              onPress={handleExportButtonClick}>
              {
                Platform.OS === 'web' ?
                  <Image
                    source={{ uri: '/images/PaperUpload.svg' }}
                    style={styles.calendarIcon}
                  />
                  :
                  <UploadIcon
                    width={15.58}
                    height={18.33}
                    style={{
                      alignItems: 'center',
                    }}
                  />
              }
            </Pressable>
          </View>
          <View style={styles.mobileSearchContainer}>
            <View style={{
              flex: 1,
              paddingHorizontal: 5,
            }}>
              <CommonSearchBar
                placeholder="Search"
                handleSearchChange={handleSearchChange}
                searchQuery={searchText}
              />
            </View>
            <View style={{
              flex: 1,
              paddingHorizontal: 5,
            }}>
              <DatePickerComponent
                style={styles.datePickerContainer}
                handleConfirmCalendar={handleConfirmCalendar}
                selectedDate={selectedDate}
                setSeletedDate={(date: DateRange) => setSelectedDate(date)}
              />
            </View>
          </View>
          <View style={{}}>
            <FlatList
              data={stockList}
              renderItem={({ item }: any) => (
                <StockRegisterCardMobile key={item.productID} item={item} />
              )}
              keyExtractor={item => item.productID?.toString()}
              style={{
                marginBottom: 60,
                paddingBottom: 60,
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
  exportCsvTextStyle: {
    color: colors.Border_Color_Grey,
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  mobileContainer: {
    flex: 1,
  },
  mobileHeaderTextContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  mobileHeaderText: {
    fontFamily: 'Roboto-Italic',
    fontWeight: '700',
    fontSize: 22,
    color: colors.black_Heading,
  },
  mobileUploadButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.Border_Color_Grey,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mobileSearchContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 10,
    height: 30,
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
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default StockRegisterScreen;
