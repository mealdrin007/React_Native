import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import React, { useContext, useState } from 'react';
import { colors } from '../utils/Colors';
import StockManagementDashboardMobileCard from '../components/dashboard/mobile/StockManagementDashboardMobileCard';
import UploadIcon from '../../public/images/PaperUpload.svg';
import DatePickerComponent from '../components/customDatePicker/DatePickerComponent';
import { http } from '../apiService';
import {
  AvailableStockForDashboard,
  GetAllOutwardStockForDashboard,
  GetAllInwardStockForDashboard,
  _retrieveItem,
} from '../utils/UrlConst';
import { AuthContext } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import { handleSessionExpired } from '../utils/UrlConst';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import debounce from 'lodash/debounce';
import { AvailableStock, DashboardInwardStock, DashboardOutwardStock } from '../utils/Interfaces';
import NetInfo from '@react-native-community/netinfo';
import ProductStockProgress from '../components/dashboard/ProductStockProgressCard';
import CustomerSpending from '../components/dashboard/CustomerSpending';
import CustomerVendorCard from '../components/dashboard/CustomerVendorCard';
import StockValueCard from '../components/dashboard/StockValueCard';
import useDimensions from '../utils/hooks/useDimensions';

interface DashboardScreenProps {
  navigation: NavigationProp<any>;
}
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }: any) => {
  const dimensions = useDimensions();
  var screenWidth = dimensions.width;
  var mobileWidth = dimensions.breakPoints.mobileWidth;
  var tabletWidth = dimensions.breakPoints.tabletWidth;
  var webWidth = dimensions.breakPoints.webWidth;

  const [inwardSelectedDate, setInwardSelectedDate] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now())
  });
  const [outwardSelectedDate, setOutwardSelectedDate] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now())
  });
  const [endDateOutward, setEndDateOutward] = useState<Date>(new Date(Date.now()));
  const [loading, setLoading] = useState(false);
  const [availableStock, setAvailableStock] = useState<AvailableStock | null>(null);
  const [inwardStock, setInwardStock] = useState<DashboardInwardStock | null>(null);
  const [outwardStock, setOutwardStock] = useState<DashboardOutwardStock | null>(null);
  const [sessionExpiredAlertShown, setSessionExpiredAlertShown] = useState(false);
  const [connection, setConnection] = useState<"connecting" |
    "connected" | "disconnected">("connecting");

  const authContext = useContext(AuthContext);
  const { token } = authContext;

  const handleSessionExpiredAlert = () => {
    if (!sessionExpiredAlertShown) {
      // Set the flag to true to indicate that the alert has been shown
      setSessionExpiredAlertShown(true);
      handleSessionExpired(navigation);
    }
  };
  // Define the debounced function
  // Adjust the debounce delay as needed.
  const debouncedHandleSessionExpiredAlert = debounce(handleSessionExpiredAlert, 1000);

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
          fetchAvailableStock();
          fetchOutwardStock(outwardSelectedDate.startDate, outwardSelectedDate.endDate);
          fetchInwardStock(inwardSelectedDate.startDate, inwardSelectedDate.endDate);
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

  const debouncedErrorAlert = debounce(() => {
    Alert.alert('Error', 'Some error occured', [
      {
        text: 'ok',
      },
    ]);
  }, 50);

  const fetchAvailableStock = async () => {
    setLoading(true);

    const responseJson = await http.fetchURL(
      AvailableStockForDashboard,
      token
    );

    if (responseJson.hasOwnProperty('status')
      && responseJson.status === 1) {
      setAvailableStock(responseJson?.data);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
    }
    else {
      debouncedErrorAlert()
    }
    setLoading(false);
  };

  const fetchInwardStock = async (startDate: Date | null, endDate: Date | null) => {
    setLoading(true);

    let jsonData = JSON.stringify({
      searchString: null,
      startIndex: 0,
      rowCount: 0,
      startDateReq: startDate,
      endDateReq: endDate,
    });

    let methodtype = 'POST';

    const responseJson = await http.fetchURL(
      GetAllInwardStockForDashboard,
      token,
      jsonData,
      methodtype,
    );

    if (responseJson.hasOwnProperty('status') && responseJson?.status === 1) {
      setInwardStock(responseJson?.dashboardData);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
      setInwardStock(null)
    }
    else {
      debouncedErrorAlert()
    }
    setLoading(false);
  };

  const fetchOutwardStock = async (startDate: Date | null, endDate: Date | null) => {
    setLoading(true);

    let jsonData = JSON.stringify({
      startDateReq: startDate,
      endDateReq: endDate,
    });

    let methodtype = 'POST';

    const responseJson = await http.fetchURL(
      GetAllOutwardStockForDashboard,
      token,
      jsonData,
      methodtype,
    );

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      setOutwardStock(responseJson?.dashboardData);
    }
    else if (responseJson?.status === 2) {
      debouncedHandleSessionExpiredAlert();
      setOutwardStock(null)
    } else {
      debouncedErrorAlert()
    }
    setLoading(false);
  };

  const handleCloseCalendarInward = () => {
    fetchInwardStock(inwardSelectedDate.startDate, inwardSelectedDate.endDate)
  };

  const handleCloseCalendarStockValue = () => {
    fetchOutwardStock(outwardSelectedDate.startDate, outwardSelectedDate.endDate)
    fetchInwardStock(inwardSelectedDate.startDate, inwardSelectedDate.endDate)
  };

  const [productComponentLayout, setProductComponentLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isProductInViewport, setProductsInViewport] = useState(false);
  const handleLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setProductComponentLayout({ x, y, width, height });
  };

  const handleScroll = (event: any) => {
    const { y } = event.nativeEvent.contentOffset;
    setScrollPosition(y);
  };

  const checkProductsInViewport = () => {
    if (!isProductInViewport) {
      const { y, height } = productComponentLayout;
      const viewportHeight = 600;

      if (y < scrollPosition + viewportHeight && y + height > scrollPosition) {
        setProductsInViewport(true);
      }
    }
  };
  // Recalculate on every scroll and layout change
  React.useEffect(() => {
    if (!isProductInViewport) {
      checkProductsInViewport();
    }
  }, [productComponentLayout, scrollPosition]);
  // console.log("width: " + Dimensions.get("window").width)
  return (
    <View style={{ flex: 1, backgroundColor: "honeydew" }}>
      {
        (screenWidth < mobileWidth) ? (
          <View style={styles.mobileContainer}>
            {loading ? (
              <View style={{ flex: 1 }}>
                <ProgressBar />
              </View>
            ) : (
              <View style={styles.mobileContainer}>
                <View style={styles.mobileSubContainer}>
                  <Text style={styles.mobileHeaderText}>
                    Stock Management Overview
                  </Text>
                  <Pressable style={styles.mobileUploadIconContainer}>
                    {
                      Platform.OS === 'web' ?
                        <Image
                          source={{ uri: '/images/PaperUpload.svg' }}
                          style={{
                            width: 15.58,
                            height: 18.33,
                            alignItems: 'center'
                          }}
                        /> :
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
                <View style={styles.mobileHeaderBorderBottom} />
                <View
                  style={{
                    marginTop: 10,
                  }}>
                  <View
                    style={{
                      paddingBottom: 10,
                      justifyContent: 'center',
                    }}>
                    <Text style={styles.mobileHeaderSubText}>Available Stock</Text>
                  </View>
                  <View style={styles.mobileAvailableStockCardSection}>
                    <StockManagementDashboardMobileCard
                      header="Number of Product Available"
                      text={availableStock?.totalRows}
                    />
                    <StockManagementDashboardMobileCard
                      header="Total Product Value"
                      text={`₹ ${availableStock?.totalValue}`}
                    />
                    <StockManagementDashboardMobileCard
                      header="Negative Stock Count"
                      text="5"
                    />
                  </View>
                </View>
                <View style={styles.mobileCardSectionDevider} />
                <View
                  style={{
                    marginTop: 10,
                  }}>
                  <View style={styles.mobileInwardStockHeaderSection}>
                    <Text style={styles.mobileHeaderSubText}>Inward Stock</Text>
                    <DatePickerComponent
                      collapse
                      style={[styles.datePickerContainer, {
                        height: mobileWidth > screenWidth ? 32 : 21,
                      }]}
                      selectedDate={{ startDate: null, endDate: null }}
                      setSeletedDate={() => { }}

                      handleConfirmCalendar={handleCloseCalendarInward}
                    />
                  </View>
                  <View style={styles.mobileInwardCardSection}>
                    <StockManagementDashboardMobileCard
                      header="Total Number of Vendors"
                      text={inwardStock?.totalVendor.toString()}
                    />
                    <StockManagementDashboardMobileCard
                      header="Total Number of Products"
                      text={inwardStock?.totalProduct.toString()}
                    />
                    <StockManagementDashboardMobileCard
                      header="Total Product Value"
                      text={`₹ ${availableStock?.totalValue}`}
                    />
                  </View>
                </View>
                <View style={styles.mobileCardSectionDevider} />
                <View
                  style={{
                    marginTop: 10,
                  }}>
                  <View style={styles.mobileOutwardStockHeaderSection}>
                    <Text style={styles.mobileHeaderSubText}>Outward Stock</Text>
                    <DatePickerComponent
                      selectedDate={{ startDate: null, endDate: null }}
                      style={[styles.datePickerContainer, {
                        height: mobileWidth > screenWidth ? 32 : 21,
                      }]}
                      setSeletedDate={() => { }}
                      handleConfirmCalendar={handleCloseCalendarStockValue}
                    />
                  </View>
                  <View style={styles.outwardMobileCardSection}>
                    <StockManagementDashboardMobileCard
                      header="Total Number of Customers"
                      text={outwardStock?.totalCustomer.toString()}
                    />
                    <StockManagementDashboardMobileCard
                      header="Total Number of Products"
                      text={outwardStock?.totalProduct.toString()}
                    />
                  </View>
                </View>
              </View>)}
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {loading ? (
              <View style={{ flex: 1 }}>
                <ProgressBar />
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
                  <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>Stock Management Dashboard</Text>
                    <Pressable onPress={() => console.log('Download Clicked')} style={styles.downloadButtonContainer}>
                      <Image
                        source={{ uri: '/images/Download.svg' }}
                        style={styles.downloadIcon}
                      />
                      <Text style={styles.downloadText}>Download</Text>
                    </Pressable>
                  </View>
                  <View style={[screenWidth < tabletWidth ? styles.vertCardContainer : styles.horiCardContainer]}>
                    <CustomerVendorCard outwardStock={outwardStock} inwardStock={inwardStock} />
                    <StockValueCard
                      outwardStock={outwardStock}
                      inwardStock={inwardStock}
                      handleCloseCalendar={handleCloseCalendarStockValue}
                      selectedDate={outwardSelectedDate} setSeletedDate={(_date: DateRange) => {
                        setOutwardSelectedDate(_date)
                        setInwardSelectedDate(_date)
                      }} />
                  </View>

                  <View style={[screenWidth < webWidth ? styles.vertCardContainer : styles.horiCardContainer, { marginTop: 10 }]}
                    onLayout={handleLayout}>
                    <View style={[styles.cardContainer, { flex: 1 }]}>
                      <View style={[styles.vertCardContainer, { alignItems: 'center' }]}>
                        <View style={{ paddingBottom: 8 }}>
                          <Text style={styles.titleText}>Products</Text>
                        </View>
                        <ProductStockProgress inViewport={isProductInViewport} />
                      </View>
                    </View>
                    <View style={[styles.cardContainer, { flex: 1 }]}>
                      <View style={[styles.vertCardContainer, {}]}>
                        <View style={{ paddingBottom: 8, }}>
                          <Text style={styles.titleText}>Customers</Text>
                        </View>
                        <CustomerSpending />
                      </View>
                    </View>
                  </View>

                </ScrollView>
              </View>)
            }
          </View >
        )
      }
    </View >
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: colors.Dashboard_Border_Color,
  },
  headerText: {
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 37.5,
    color: colors.black_Heading,
  },
  downloadButtonContainer: {
    borderColor: colors.Border_Color_Grey,
    borderWidth: 1.5,
    borderRadius: 8,
    height: 32,
    width: 137,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  downloadIcon: {
    height: 22,
    width: 22,
  },
  downloadText: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16.41,
    color: colors.Border_Color_Grey,
    height: 16,
  },
  cardSection: {
    // margin: 10,
  },
  titleText: {
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 32.81,
    color: colors.black_Heading,
    textAlign: 'center'
  },
  cardContainer: {
    borderRadius: 16,
    backgroundColor: "white",
    padding: 28,
    margin: 8,
    shadowColor: colors.Color_9e9e9e,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  outwardCardSection: {
    marginHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  vertCardContainer: {
    // justifyContent: 'center',

  },
  horiCardContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'space-between',
    flex: 1,
  },

  datePickerContainer: {
    // position: 'absolute',
    right: 0,
    borderRadius: 8,
    borderStyle: 'solid',
    borderColor: colors.Border_Color_Grey,
    borderWidth: 1.35,
    paddingHorizontal: 8,
    paddingVertical: 4,
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  cardHeaderContainer3: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  mobileContainer: {
    flex: 1,
  },
  mobileSubContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  mobileHeaderText: {
    fontFamily: 'Roboto-Italic',
    fontWeight: '700',
    fontSize: 20,
    color: colors.black_Heading,
  },
  mobileUploadIconContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.Border_Color_Grey,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mobileHeaderBorderBottom: {
    borderWidth: 1,
    height: 1,
    borderStyle: 'solid',
    backgroundColor: colors.Dashboard_Background_Color,
    borderColor: colors.Dashboard_Border_Color,
    marginTop: 10,
    marginBottom: 10,
  },
  mobileHeaderSubText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    color: colors.black_Heading,
  },
  mobileCardSectionDevider: {
    borderWidth: 1,
    height: 1,
    borderStyle: 'solid',
    backgroundColor: colors.Dashboard_Background_Color,
    borderColor: colors.Color_Light_Gray_Gradient,
    marginTop: 10,
    marginBottom: 10,
  },
  mobileInwardCalendarSection: {
    position: 'absolute',
    right: 0,
    width: 104,
    height: 21,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: colors.Border_Color_Grey,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  selectRangeText: {
    color: colors.Border_Color_Grey,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
    fontSize: 10,
    fontWeight: '700',
  },
  outWardStockCalendarSection: {
    position: 'absolute',
    right: 0,
    width: 104,
    height: 21,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: colors.Border_Color_Grey,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  outwardMobileCardSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  mobileOutwardStockHeaderSection: {
    paddingBottom: 10,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  mobileInwardCardSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mobileInwardStockHeaderSection: {
    paddingBottom: 10,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  mobileAvailableStockCardSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calendarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});

export default DashboardScreen;

