import { Alert, FlatList, Image, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import React, { memo, useContext, useState } from 'react'
import PaginationBar from '../PaginationBar';
import EditIcon from '../../../public/images/edit_mobile.svg'
import DeleteIcon from '../../../public/images/delete_mobile.svg'
import AddVendorDetailsModal from './modals/AddVendorDetailsModal';
import { DeleteVendors, formatDate, handleSessionExpired, screenWidth } from '../../utils/UrlConst';
import { http } from '../../apiService';
import { VendorListInterface } from '../../utils/Interfaces';
import ProgressBar from '../ProgressBar';
import CustomAlert from '../CustomAlert';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/Colors';
import FooterComponent from '../FooterComponent';
import { NavigationProp } from '@react-navigation/native';
import EmptyListView from '../EmptyListView';

interface ProductListEntryVendorProps {
    setDeleteAlertMessage: (message: string) => void;
    setEditAlertMessage: (message: string) => void
    vendorList: VendorListInterface[]
    startIndex: number
    fetchVendorList: (startIndex: number, rowCount: number, searchValue: string | null, startDate: Date | null, endDate: Date | null) => void
    setStartIndex: (pageNumber: number) => void;
    totalCount: number
    setCurrentPage: (pageNumber: number) => void;
    rowCount: number
    currentPage: number
    setRowCount: (pageNumber: number) => void;
    loading: boolean
    setLoading: (state: boolean) => void
    searchText: string | null
    selectedStartDate: Date | null
    selectedEndDate: Date | null,
    navigation: NavigationProp<any>
}

const ProductListEntryVendorqqq: React.FC<ProductListEntryVendorProps> = ({ setDeleteAlertMessage,
    setEditAlertMessage,
    fetchVendorList,
    startIndex,
    rowCount,
    setCurrentPage,
    setStartIndex,
    vendorList,
    totalCount,
    currentPage,
    loading,
    setLoading,
    selectedStartDate,
    selectedEndDate,
    searchText,
    navigation
}) => {
    const { width } = useWindowDimensions();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<VendorListInterface>()
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [delId, setDelId] = useState<number | undefined>()

    const authContext = useContext(AuthContext);

    const { role, token } = authContext;

    const showAlert = (message: string, id: number) => {
        setAlertMessage(message);
        setAlertVisible(true);
        setDelId(id)
    };

    const handleAlertClose = () => {
        setAlertVisible(false);
    };

    const handleDeleteWeb = () => {
        deleteVendorList(delId)
        setAlertVisible(false);
    }

    const deleteConfirm = (id: number) => {

        if (Platform.OS === 'web') {
            showAlert('Are you sure you want to delete?', id)
        }
        else {
            Alert.alert(
                'Confirm Deletion',
                'Are you sure you want to delete?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        onPress: () => deleteVendorList(id)
                    }])
        }
    }

    const deleteVendorList = async (id: number | undefined) => {

        setLoading(true)
        let jsonData = JSON.stringify({
        });

        let methodtype = 'DELETE';

        let DeleteVendorUrl = `${DeleteVendors}${id}`

        const responseJson = await http.fetchURL(DeleteVendorUrl, token, jsonData, methodtype);

        if (
            responseJson.hasOwnProperty('status') &&
            responseJson.status === 1
        ) {
            fetchVendorList(startIndex, rowCount, searchText, selectedStartDate, selectedEndDate)
            setModalVisible(false)
            setDeleteAlertMessage('Vendor Deleted Successfully')
        }
        else if (responseJson?.status === 2) {
            handleSessionExpired(navigation);
        }
        else {
            setDeleteAlertMessage('')
            Alert.alert('Error', 'Some error occured', [
                {
                    text: 'ok',
                },
            ]);
        }
        setLoading(false)
    };

    const handleEditClick = (id: number) => {
        const selectedItem = vendorList.find((item: any) => item.vendorID === id);
        setSelectedItem(selectedItem)
        setModalVisible(true);
    }

    const tableHeader = () => (
        <View style={styles.tableHeaderContainer}>
            <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
                <Text style={styles.tableHeaderColumnText}>
                    Sl. No
                </Text>
            </View>
            <View style={[styles.tableHeaderColumn, { width: '15%' }]}>
                <Text style={styles.tableHeaderColumnText}>
                    Date
                </Text>
            </View>
            <View style={[styles.tableHeaderColumn, { width: '15%' }]}>
                <Text style={styles.tableHeaderColumnText}>
                    Vendor Name
                </Text>
            </View>
            <View style={[styles.tableHeaderColumn, { width: '15%' }]}>
                <Text style={styles.tableHeaderColumnText}>
                    Mobile
                </Text>
            </View>
            <View style={[styles.tableHeaderColumn, { width: '35%' }]}>
                <Text style={styles.tableHeaderColumnText}>
                    Address
                </Text>
            </View>
            {
                role === 1 &&
                <View style={[styles.tableHeaderColumn, { width: '10%' }]}>
                    <Text style={styles.tableHeaderColumnText}>
                        Action
                    </Text>
                </View>
            }
        </View>
    );

    const renderItem = ({ item, index }: any) => {
        return (
            <View style={[styles.tableBodyContainer]}>
                <View style={[styles.tableBodyColumn, { width: '10%' }]}>
                    <Text style={styles.tableBodyColumnText}>{item.vendorID}</Text>
                </View>
                <View style={[styles.tableBodyColumn, { width: '15%' }]}>
                    <Text style={styles.tableBodyColumnText}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={[styles.tableBodyColumn, { width: '15%' }]}>
                    <Text style={styles.tableBodyColumnText}>{item.name}</Text>
                </View>
                <View style={[styles.tableBodyColumn, { width: '15%' }]}>
                    <Text style={styles.tableBodyColumnText}>{item.mobileNo}</Text>
                </View>
                <View style={[styles.tableBodyColumn, { width: '35%' }]}>
                    <Text style={styles.tableBodyColumnText}>{item.address}</Text>
                </View>
                {
                    role === 1 &&
                    <View style={styles.tableActionColumn}>
                        <Pressable
                            style={styles.editButton}
                            onPress={() => handleEditClick(item.vendorID)}
                        >
                            <Image source={{ uri: "/images/fe_edit.svg" }} style={{
                                height: 24,
                                width: 24
                            }} />
                        </Pressable>
                        <Pressable
                            style={styles.deleteButton}
                            onPress={() => deleteConfirm(item.vendorID)}
                        >
                            <Image source={{ uri: "/images/delete.svg" }} style={{
                                height: 18,
                                width: 16
                            }} />
                        </Pressable>
                    </View>
                }
            </View>
        );
    };

    const renderItemMobile = ({ item, index }: any) => {
        return (
            <View style={styles.mobileCardContainer}>
                <View style={styles.cardHeaderSection}>
                    <Text style={styles.mobileCardHeaderText}>
                        {item.name}
                    </Text>
                    {
                        role === 1 &&
                        <View style={styles.buttonContainer}>
                            <Pressable
                                onPress={() => handleEditClick(item.vendorID)}
                                style={{
                                    height: 24,
                                    width: 24,
                                    marginHorizontal: 4
                                }}>
                                {
                                    Platform.OS === 'web' ?
                                        <Image
                                            source={{ uri: '/images/edit_mobile.svg' }}
                                            style={{
                                                height: 24,
                                                width: 24
                                            }}
                                        />
                                        :
                                        <EditIcon
                                            height={24}
                                            width={24}
                                        />
                                }
                            </Pressable>
                            <Pressable
                                onPress={() => deleteConfirm(item.vendorID)}
                                style={{
                                    height: 24,
                                    width: 24,
                                    marginHorizontal: 4
                                }}>
                                {
                                    Platform.OS === 'web' ?
                                        <Image
                                            source={{ uri: '/images/delete_mobile.svg' }}
                                            style={{
                                                height: 24,
                                                width: 24
                                            }}
                                        />
                                        :
                                        <DeleteIcon
                                            height={24}
                                            width={24}
                                        />
                                }
                            </Pressable>
                        </View>
                    }
                </View>
                <View style={styles.mobileCardItemSection}>
                    <Text style={styles.mobileCardLeftTitle}>Mobile</Text>
                    <Text style={styles.mobileCardRightTitle}>{item.mobileNo}</Text>
                </View>
                <View style={styles.mobileCardItemSection}>
                    <Text style={styles.mobileCardLeftTitle}>Address</Text>
                    <Text style={styles.mobileCardRightTitle}>{item.address}</Text>
                </View>
                <View style={styles.mobileCardItemSection}>
                    <Text style={styles.mobileCardLeftTitle}>Date</Text>
                    <Text style={styles.mobileCardRightTitle}>{formatDate(item.createdAt)}</Text>
                </View>
            </View>
        );
    };

    const onNext = () => {
        if (startIndex + rowCount < totalCount) {
            setStartIndex(startIndex + rowCount)
            fetchVendorList(startIndex + rowCount, rowCount, searchText, selectedStartDate, selectedEndDate)
            setCurrentPage(currentPage + 1)
        }
    };

    const onPrev = () => {
        if (startIndex - rowCount >= 0) {
            setStartIndex(startIndex - rowCount)
            fetchVendorList(startIndex - rowCount, rowCount, searchText, selectedStartDate, selectedEndDate)
            setCurrentPage(currentPage - 1)
        }
    };

    const handleLoadMore = () => {
        if (vendorList?.length < totalCount) {
            setLoading(true)
            fetchVendorList(startIndex, 10, searchText, selectedStartDate, selectedEndDate);
        }
    };

    const onPageClick = (pageNumber: number) => {
        const newStartIndex = (pageNumber - 1) * rowCount;
        setStartIndex(newStartIndex);
        fetchVendorList(newStartIndex, rowCount, searchText, selectedStartDate, selectedEndDate);
        setCurrentPage(pageNumber);
    };

    const renderFooter = () => <FooterComponent loading={!loading} />;

    return (
        <View style={{ flex: 1 }}>
            {
                width > screenWidth ?
                    (
                        <View style={{ flex: 1 }}>
                            {/* {loading ? (
                                <View style={{ flex: 1 }}>
                                    <ProgressBar />
                                </View>
                            ) : ( */}
                            <View style={{ flex: 1 }}>
                                <CustomAlert visible={alertVisible}
                                    message={alertMessage}
                                    onClose={handleAlertClose}
                                    handleDeleteWeb={handleDeleteWeb}
                                />
                                <FlatList
                                    persistentScrollbar={true}
                                    data={vendorList}
                                    ListHeaderComponent={tableHeader}
                                    stickyHeaderIndices={[0]}
                                    style={{ flex: 1, width: '100%' }}
                                    ListEmptyComponent={EmptyListView}
                                    renderItem={renderItem}
                                    maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                                />
                                <AddVendorDetailsModal
                                    modalVisible={modalVisible}
                                    setModalVisible={setModalVisible}
                                    selectedItem={selectedItem}
                                    fetchVendorList={fetchVendorList}
                                    setEditAlertMessage={setEditAlertMessage}
                                    startIndex={startIndex}
                                    rowCount={rowCount}
                                    searchText={searchText}
                                    selectedStartDate={selectedStartDate}
                                    selectedEndDate={selectedEndDate}
                                />
                                {Platform.OS === 'web' && vendorList?.length > 0 && (
                                    <View style={styles.paginationContainer}>
                                        <PaginationBar currentPage={currentPage}
                                            totalPages={Math.ceil(totalCount / rowCount)} onNext={onNext} onPrev={onPrev}
                                            onPageClick={onPageClick}
                                        />
                                    </View>)}
                            </View>
                            {/* )} */}
                        </View>
                    ) : (
                        <View style={{
                            flex: 1,
                        }}>
                            <View style={{
                                flex: 1,
                            }}>
                                <FlatList
                                    persistentScrollbar={true}
                                    data={vendorList}
                                    style={{
                                        marginTop: 20,
                                    }}
                                    contentContainerStyle={{
                                    }}
                                    keyExtractor={item => item.vendorID.toString()}
                                    ListEmptyComponent={EmptyListView}
                                    renderItem={renderItemMobile}
                                    ListFooterComponent={renderFooter}
                                    onEndReached={handleLoadMore}
                                    onEndReachedThreshold={0.5}
                                />
                                <AddVendorDetailsModal
                                    modalVisible={modalVisible}
                                    setModalVisible={setModalVisible}
                                    selectedItem={selectedItem}
                                    fetchVendorList={fetchVendorList}
                                    startIndex={startIndex}
                                    rowCount={rowCount}
                                    searchText={searchText}
                                    selectedStartDate={selectedStartDate}
                                    selectedEndDate={selectedEndDate}
                                />
                            </View>
                        </View>
                    )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    tableHeaderContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
        backgroundColor: colors.Background_Color_Light_Grey,
        borderWidth: 1,
        borderColor: colors.Border_Color_Gray86,
        borderStyle: 'solid'
    },
    tableHeaderColumn: {
        justifyContent: 'center',
        height: 44,
        paddingHorizontal: 12,
        paddingVertical: 24
    },
    tableHeaderColumnText: {
        textAlign: 'left',
        color: colors.Font_Text_Color_Dark_Gray,
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        lineHeight: 32,
        fontWeight: '400'
    },
    tableBodyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.White,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.Border_Color_Gray86,
        borderStyle: 'solid'
    },
    tableBodyColumn: {
        height: 64,
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 24
    },
    tableActionColumn: {
        height: 64,
        paddingHorizontal: 12,
        paddingVertical: 24,
        width: '10%',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    tableBodyColumnText: {
        textAlign: 'left',
        color: colors.Font_Text_Color_74828f,
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        lineHeight: 32,
        fontWeight: '400'
    },
    paginationContainer: {
        alignItems: 'flex-end',
        height: 50,
        marginTop: 10,
    },
    mobileCardContainer: {
        paddingVertical: 12,
        borderRadius: 8,
        margin: 5,
        backgroundColor: colors.White,
        shadowColor: colors.Color_000000,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    cardHeaderSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderColor: colors.Color_959595,
        borderStyle: 'solid',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    mobileCardHeaderText: {
        fontFamily: 'Inter-SemiBold',
        textAlign: 'left',
        fontSize: 14,
        fontWeight: '600',
        color: colors.Color_1b2128
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
    },
    mobileCardItemSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        paddingHorizontal: 20,
    },
    mobileCardLeftTitle: {
        fontFamily: 'Inter-Bold',
        color: colors.Color_959595,
        textAlign: 'left',
        fontSize: 14,
        fontWeight: '700',
        paddingVertical: 5
    },
    mobileCardRightTitle: {
        fontFamily: 'Inter-Regular',
        textAlign: 'left',
        fontSize: 14,
        fontWeight: '600',
        color: colors.Color_1b2128
    },
    editButton: {
        height: 24,
        width: 24,
        margin: 4
    },
    deleteButton: {
        height: 18,
        width: 16,
        margin: 4
    },
    footerContainer: {
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        textAlign: 'center'
    }
})

export default memo(ProductListEntryVendorqqq) 