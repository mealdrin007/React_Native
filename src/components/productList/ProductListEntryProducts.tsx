import { Alert, FlatList, Image, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import React, { forwardRef, memo, useContext, useImperativeHandle, useState } from 'react';
import PaginationBar from '../PaginationBar';
import EditIcon from '../../../public/images/edit_mobile.svg';
import DeleteIcon from '../../../public/images/delete_mobile.svg';
import AddProductDetailsModal from './modals/AddProductDetailsModal';
import { ProductInterface } from '../../utils/Interfaces';
import { http } from '../../apiService';
import { DeleteProducts, formatDate, GetAllProducts, handleSessionExpired, screenWidth } from '../../utils/UrlConst';
import ProgressBar from '../ProgressBar';
import CustomAlert from '../CustomAlert';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/Colors';
import FooterComponent from '../FooterComponent';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import EmptyListView from '../EmptyListView';

interface ProductListEntryProductsProps {
    setDeleteAlertMessage: (message: string) => void;
    setEditAlertMessage: (message: string) => void
    setCurrentPage: (pageNumber: number) => void;
    rowCount: number;
    currentPage: number;
    setRowCount: (pageNumber: number) => void;
    loading: boolean;
    setLoading: (state: boolean) => void;
    searchText: string | null;
    selectedStartDate: Date | null;
    selectedEndDate: Date | null;
    navigation: NavigationProp<any>;
    ref: any
}
interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

const ProductListEntryProducts: React.FC<ProductListEntryProductsProps> = forwardRef(({
    setDeleteAlertMessage,
    setEditAlertMessage,
    rowCount,
    setCurrentPage,
    currentPage,
    loading,
    setLoading,
    searchText,
    selectedStartDate,
    selectedEndDate,
    navigation
}, ref) => {

    const { width } = useWindowDimensions()
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ProductInterface>()
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [delId, setDelId] = useState<number | undefined>()
    const [productList, setProductList] = useState<ProductInterface[]>([])
    const [productTotalCount, setProductTotalCount] = useState(0)
    const [productStartIndex, setProductStartIndex] = useState(0)
    const [statusMessage, setStatusMessage] = useState<string>('')

    const authContext = useContext(AuthContext);

    const { role, token } = authContext;

    useFocusEffect(
        React.useCallback(() => {

            if (token) {
                fetchProductList(0, rowCount, searchText, selectedStartDate, selectedEndDate);
            }
        }, [token, searchText])
    );

    const updateProductList = (date: DateRange, searchText: string) => {

        fetchProductList(0, rowCount, searchText, date.startDate, date.endDate);
    }


    useImperativeHandle(ref, () => ({
        updateProductList
    }))

    const updateProduct = (updatedProduct: ProductInterface) => {
        setProductList((prevProductList) =>
            prevProductList.map((product) =>
                product.productTypeID === updatedProduct.productTypeID ? updatedProduct : product
            )
        );
    };


    const showAlert = (message: string, id: number) => {
        setAlertMessage(message);
        setAlertVisible(true);
        setDelId(id)
    };

    const handleAlertClose = () => {
        setAlertVisible(false);
    };

    const handleDeleteWeb = () => {
        deleteProductList(delId)
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
                        onPress: () => deleteProductList(id)
                    }])
        }
    }


    const deleteProductList = async (id: number | undefined) => {
        setLoading(true)
        let jsonData = JSON.stringify({
        });

        let methodtype = 'DELETE';

        let DeleteProductUrl = `${DeleteProducts}${id}`

        const responseJson = await http.fetchURL(DeleteProductUrl, token, jsonData, methodtype);

        if (
            responseJson.hasOwnProperty('status') &&
            responseJson.status === 1
        ) {
            fetchProductList(0, rowCount, searchText, null, null);

            setModalVisible(false)
            setDeleteAlertMessage('Products Deleted Successfully')
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

    const fetchProductList = async (
        pageNum: number,
        count: number,
        searchValue: string | null,
        startDate: Date | null,
        endDate: Date | null
    ) => {
        setLoading(true)

        let jsonData = JSON.stringify({
            productStartIndex: pageNum,
            rowCount: count,
            searchString: searchValue,
            startDate: startDate,
            endDate: endDate
        });
        let methodtype = 'POST';
        const responseJson = await http.fetchURL(GetAllProducts, token, jsonData, methodtype);
        if (
            responseJson.hasOwnProperty('status') &&
            responseJson.status === 1
        ) {
            if (width > screenWidth) {
                setProductList(responseJson?.data?.productType)
                setProductTotalCount(responseJson?.data?.searchRowMatchNo);
            }
            else {
                let mergeStageDetails;
                if (pageNum === 0) {
                    mergeStageDetails = [...responseJson?.data?.productType]
                } else {
                    mergeStageDetails = [...productList, ...responseJson?.data?.productType]
                }
                setProductList(mergeStageDetails)
                setProductTotalCount(responseJson?.data?.searchRowMatchNo);
                setProductStartIndex(pageNum + rowCount);
            }
        }
        else if (responseJson.hasOwnProperty('status') && responseJson?.status === 0) {
            setStatusMessage(responseJson?.statusMessage)
            setProductList([]);
            setProductTotalCount(0);
        }
        else if (responseJson?.status === 2) {
            // debouncedHandleSessionExpiredAlert();
        }
        else {
            setStatusMessage('Some error occured')
            // debouncedErrorAlert()
        }
        setLoading(false)
    }

    const handleEditClick = (id: number) => {
        const selectedItem = productList.find(item => item.productTypeID === id);
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
            <View style={[styles.tableHeaderColumn, { width: '20%' }]}>
                <Text style={styles.tableHeaderColumnText}>
                    Date
                </Text>
            </View>
            <View style={[styles.tableHeaderColumn, { width: '20%' }]}>
                <Text style={styles.tableHeaderColumnText}>
                    Product Name
                </Text>
            </View>
            <View style={[styles.tableHeaderColumn, { width: '35%' }]}>
                <Text style={styles.tableHeaderColumnText}>
                    Description
                </Text>
            </View>
            {
                role === 1 &&
                <View style={[styles.tableHeaderColumn, { width: '15%' }]}>
                    <Text style={styles.tableHeaderColumnText}>
                        Action
                    </Text>
                </View>
            }
        </View>
    );

    const renderItem = ({ item, index }: any) => {
        return (
            <View style={styles.tableBodyContainer}>
                <View style={[styles.tableBodyColumn, { width: '10%' }]}>
                    <Text style={styles.tableBodyColumnText}>{item.productTypeID}</Text>
                </View>
                <View style={[styles.tableBodyColumn, { width: '20%' }]}>
                    <Text style={styles.tableBodyColumnText}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={[styles.tableBodyColumn, { width: '20%' }]}>
                    <Text style={styles.tableBodyColumnText}>{item.productName}</Text>
                </View>
                <View style={[styles.tableBodyColumn, { width: '35%' }]}>
                    <Text style={styles.tableBodyColumnText}>{item.description}</Text>
                </View>
                {
                    role === 1 &&
                    <View style={styles.tableActionColumn}>
                        <Pressable
                            style={styles.editButton}
                            onPress={() => handleEditClick(item.productTypeID)}
                        >
                            <Image source={{ uri: "/images/fe_edit.svg" }} style={{
                                height: 24,
                                width: 24
                            }} />
                        </Pressable>
                        <Pressable
                            style={styles.deleteButton}
                            onPress={() => deleteConfirm(item.productTypeID)}
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

    const onNext = () => {
        if (productStartIndex + rowCount < productTotalCount) {
            setProductStartIndex(productStartIndex + rowCount)
            fetchProductList(productStartIndex + rowCount, rowCount, searchText, selectedStartDate, selectedEndDate)
            setCurrentPage(currentPage + 1)
        }
    };

    const onPrev = () => {
        if (productStartIndex - rowCount >= 0) {
            setProductStartIndex(productStartIndex - rowCount)
            fetchProductList(productStartIndex - rowCount, rowCount, searchText, selectedStartDate, selectedEndDate)
            setCurrentPage(currentPage - 1)
        }
    };

    const handleLoadMore = () => {
        if (productList?.length < productTotalCount) {
            fetchProductList(productStartIndex, rowCount, searchText, selectedStartDate, selectedEndDate);
        }
    };

    const onPageClick = (pageNumber: number) => {
        const newStartIndex = (pageNumber - 1) * rowCount;
        setProductStartIndex(newStartIndex);
        fetchProductList(newStartIndex, rowCount, searchText, selectedStartDate, selectedEndDate);
        setCurrentPage(pageNumber);
    };

    const renderFooter = () => <FooterComponent loading={loading} />;

    const renderItemMobile = ({ item, index }: any) => {

        return (
            <View style={styles.mobileCardContainer}>
                <View style={styles.cardHeaderSection}>
                    <Text style={styles.mobileCardHeaderText}>
                        {item?.productName}
                    </Text>
                    {
                        role === 1 &&
                        <View style={styles.buttonContainer}>
                            <Pressable
                                onPress={() => handleEditClick(item.productTypeID)}
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
                            <Pressable style={{
                                height: 24,
                                width: 24,
                                marginHorizontal: 4
                            }}
                                onPress={() => deleteConfirm(item.productTypeID)}
                            >
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
                    <Text style={styles.mobileCardLeftTitle}>Description</Text>
                    <Text style={styles.mobileCardRightTitle}>{item.description}</Text>
                </View>
                <View style={styles.mobileCardItemSection}>
                    <Text style={styles.mobileCardLeftTitle}>Date</Text>
                    <Text style={styles.mobileCardRightTitle}>{formatDate(item.createdAt)}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            {width > screenWidth ?
                (
                    <View style={{ flex: 1 }}>
                        {loading ? (
                            <View style={{ flex: 1 }}>
                                <ProgressBar />
                            </View>
                        ) : (
                            <View style={{ flex: 1 }}>
                                <CustomAlert visible={alertVisible}
                                    message={alertMessage}
                                    onClose={handleAlertClose}
                                    handleDeleteWeb={handleDeleteWeb}
                                />
                                <FlatList
                                    persistentScrollbar={true}
                                    data={productList}
                                    ListHeaderComponent={tableHeader}
                                    stickyHeaderIndices={[0]}
                                    style={{ flex: 1, width: '100%' }}
                                    ListEmptyComponent={EmptyListView}
                                    renderItem={renderItem}
                                />
                                <AddProductDetailsModal
                                    modalVisible={modalVisible}
                                    setModalVisible={setModalVisible}
                                    selectedItem={selectedItem}
                                    fetchProductList={fetchProductList}
                                    setEditAlertMessage={setEditAlertMessage}
                                    // productStartIndex={productStartIndex}
                                    rowCount={rowCount}
                                    searchText={searchText}
                                    selectedStartDate={selectedStartDate}
                                    selectedEndDate={selectedEndDate}
                                    updateStates={(states: ProductInterface) => updateProduct(states)}
                                    refreshProdctList={() => { }}

                                />
                                {Platform.OS === 'web' && productList?.length > 0 && (
                                    <View style={styles.paginationContainer}>
                                        <PaginationBar currentPage={currentPage}
                                            totalPages={Math.ceil(productTotalCount / rowCount)} onNext={onNext} onPrev={onPrev}
                                            onPageClick={onPageClick}
                                        />
                                    </View>)}
                            </View>)}
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
                                data={productList}
                                style={{
                                    marginTop: 30,
                                }}
                                contentContainerStyle={{
                                }}
                                ListEmptyComponent={EmptyListView}
                                renderItem={renderItemMobile}
                                onEndReached={handleLoadMore}
                                onEndReachedThreshold={0}
                                ListFooterComponent={renderFooter}
                            />
                            <AddProductDetailsModal
                                modalVisible={modalVisible}
                                setModalVisible={setModalVisible}
                                selectedItem={selectedItem}
                                fetchProductList={fetchProductList}
                                // productStartIndex={productStartIndex}
                                rowCount={rowCount}
                                searchText={searchText}
                                selectedStartDate={selectedStartDate}
                                selectedEndDate={selectedEndDate}
                                updateStates={(states: ProductInterface) => updateProduct(states)}
                                refreshProdctList={() => { }}
                            />
                        </View>
                    </View>
                )}
        </View>
    )
});


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
        width: '15%',
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
    }
})

export default memo(ProductListEntryProducts) 